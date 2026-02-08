import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Webhook } from 'svix';
import { Request } from 'express';

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses: { email_address: string }[];
    first_name: string | null;
    last_name: string | null;
  };
}

@Controller('webhooks')
@SkipThrottle()
export class WebhooksController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Clerk webhook endpoint for user sync
   * Handles: user.created, user.updated, user.deleted
   */
  @Post('clerk')
  @HttpCode(HttpStatus.OK)
  async handleClerkWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Body() body: ClerkWebhookEvent,
  ) {
    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET');

    // Webhook signature verification is MANDATORY
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET is not configured - rejecting webhook call');
      throw new BadRequestException('Webhook verification failed');
    }
    try {
      const wh = new Webhook(webhookSecret);
      const rawBody = req.rawBody?.toString() || JSON.stringify(body);

      wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    const { type, data } = body;

    switch (type) {
      case 'user.created':
        await this.handleUserCreated(data);
        break;

      case 'user.updated':
        // For updates, we rely on JWT data, so minimal action needed
        console.log(`User updated: ${data.id}`);
        break;

      case 'user.deleted':
        await this.handleUserDeleted(data.id);
        break;

      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    return { received: true };
  }

  private async handleUserCreated(data: ClerkWebhookEvent['data']) {
    const email = data.email_addresses[0]?.email_address;
    if (!email) {
      console.error('User created without email:', data.id);
      return;
    }

    try {
      await this.usersService.create({
        clerkId: data.id,
        email,
      });
      console.log(`User created: ${data.id} (${email})`);
    } catch (err) {
      // User might already exist if created via API
      console.log(`User already exists or error: ${data.id}`, err);
    }
  }

  private async handleUserDeleted(clerkId: string) {
    try {
      await this.usersService.delete(clerkId);
      console.log(`User deleted: ${clerkId}`);
    } catch (err) {
      console.log(`User not found or error deleting: ${clerkId}`, err);
    }
  }
}
