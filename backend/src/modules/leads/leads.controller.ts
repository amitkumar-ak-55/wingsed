import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { ClerkAuthGuard, ClerkUser } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateWhatsAppLeadDto } from './dto/create-whatsapp-lead.dto';
import { UpdateFeedbackDto } from './dto/update-feedback.dto';

@Controller('leads')
@UseGuards(ClerkAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  /**
   * Create a WhatsApp lead and get redirect URL
   * This is called right before redirecting user to WhatsApp
   */
  @Post('whatsapp-redirect')
  @HttpCode(HttpStatus.CREATED)
  async createWhatsAppLead(
    @CurrentUser() user: ClerkUser,
    @Body() dto: CreateWhatsAppLeadDto,
  ) {
    const result = await this.leadsService.createLead(
      user.id,
      user.email,
      dto,
    );
    return {
      leadId: result.lead.id,
      redirectUrl: result.redirectUrl,
    };
  }

  /**
   * Update lead with feedback (connected or no_response)
   */
  @Patch(':id/feedback')
  @HttpCode(HttpStatus.OK)
  async updateFeedback(
    @Param('id') id: string,
    @Body() dto: UpdateFeedbackDto,
  ) {
    const lead = await this.leadsService.updateFeedback(id, dto.feedback);
    return { lead };
  }

  /**
   * Get user's lead history
   */
  @Get('my-leads')
  @HttpCode(HttpStatus.OK)
  async getMyLeads(@CurrentUser() user: ClerkUser) {
    const leads = await this.leadsService.getLeadsByUser(user.id);
    return { leads };
  }
}
