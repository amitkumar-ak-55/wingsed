// ===========================================
// WebhooksController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebhooksController } from './webhooks.controller';
import { UsersService } from '../users/users.service';

// Mock svix
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn(),
  })),
}));

import { Webhook } from 'svix';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let usersService: jest.Mocked<UsersService>;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockUsersService = {
      create: jest.fn(),
      delete: jest.fn(),
      findByClerkId: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'CLERK_WEBHOOK_SECRET') return 'whsec_test_secret';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    usersService = module.get(UsersService);
    configService = module.get(ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  const createMockRequest = (body?: any) => ({
    rawBody: Buffer.from(JSON.stringify(body || {})),
  });

  // -------------------------------------------
  // user.created
  // -------------------------------------------
  describe('user.created webhook', () => {
    it('should create user on user.created event', async () => {
      usersService.create.mockResolvedValue({
        id: 'user-1',
        clerkId: 'clerk_new',
        email: 'new@example.com',
      } as any);

      const body = {
        type: 'user.created',
        data: {
          id: 'clerk_new',
          email_addresses: [{ email_address: 'new@example.com' }],
          first_name: 'John',
          last_name: 'Doe',
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id-1',
        '1234567890',
        'signature_1',
        body,
      );

      expect(result.received).toBe(true);
      expect(usersService.create).toHaveBeenCalledWith({
        clerkId: 'clerk_new',
        email: 'new@example.com',
      });
    });

    it('should handle user with no email gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const body = {
        type: 'user.created',
        data: {
          id: 'clerk_no_email',
          email_addresses: [],
          first_name: null,
          last_name: null,
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      expect(usersService.create).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle duplicate user creation gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      usersService.create.mockRejectedValue(new Error('Unique constraint'));

      const body = {
        type: 'user.created',
        data: {
          id: 'clerk_dup',
          email_addresses: [{ email_address: 'dup@test.com' }],
          first_name: 'Dup',
          last_name: null,
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // user.deleted
  // -------------------------------------------
  describe('user.deleted webhook', () => {
    it('should delete user on user.deleted event', async () => {
      usersService.delete.mockResolvedValue(undefined as any);

      const body = {
        type: 'user.deleted',
        data: {
          id: 'clerk_del',
          email_addresses: [],
          first_name: null,
          last_name: null,
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      expect(usersService.delete).toHaveBeenCalledWith('clerk_del');
    });

    it('should handle deletion of nonexistent user gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      usersService.delete.mockRejectedValue(new Error('Not found'));

      const body = {
        type: 'user.deleted',
        data: {
          id: 'clerk_gone',
          email_addresses: [],
          first_name: null,
          last_name: null,
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // user.updated
  // -------------------------------------------
  describe('user.updated webhook', () => {
    it('should log and acknowledge user.updated event', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const body = {
        type: 'user.updated',
        data: {
          id: 'clerk_upd',
          email_addresses: [{ email_address: 'upd@test.com' }],
          first_name: 'Updated',
          last_name: 'User',
        },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      expect(usersService.create).not.toHaveBeenCalled();
      expect(usersService.delete).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // Unknown event
  // -------------------------------------------
  describe('unknown webhook event', () => {
    it('should acknowledge unknown event types', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const body = {
        type: 'session.created',
        data: { id: 'sess_123', email_addresses: [], first_name: null, last_name: null },
      };

      const result = await controller.handleClerkWebhook(
        createMockRequest(body) as any,
        'svix-id',
        '123',
        'sig',
        body,
      );

      expect(result.received).toBe(true);
      consoleSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // Webhook signature verification
  // -------------------------------------------
  describe('signature verification', () => {
    it('should throw BadRequestException on invalid signature', async () => {
      const mockVerify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid signature');
      });
      (Webhook as jest.Mock).mockImplementation(() => ({
        verify: mockVerify,
      }));

      const body = {
        type: 'user.created',
        data: {
          id: 'clerk_bad_sig',
          email_addresses: [{ email_address: 'bad@test.com' }],
          first_name: null,
          last_name: null,
        },
      };

      // Need to re-create controller with fresh webhook mock
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        controller.handleClerkWebhook(
          createMockRequest(body) as any,
          'bad-svix-id',
          'bad-ts',
          'bad-sig',
          body,
        ),
      ).rejects.toThrow(BadRequestException);

      consoleSpy.mockRestore();
    });
  });
});
