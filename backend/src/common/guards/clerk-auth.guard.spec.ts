// ===========================================
// ClerkAuthGuard Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';

// jest.mock is hoisted, so we use inline jest.fn() in factory
// then retrieve references via require after mock is set up
jest.mock('@clerk/backend', () => {
  const mockGetUser = jest.fn();
  const mockVerifyToken = jest.fn();
  return {
    createClerkClient: jest.fn(() => ({
      users: {
        getUser: mockGetUser,
      },
    })),
    verifyToken: mockVerifyToken,
    __mockGetUser: mockGetUser,
    __mockVerifyToken: mockVerifyToken,
  };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const clerkMocks = require('@clerk/backend');
const mockGetUser = clerkMocks.__mockGetUser as jest.Mock;
const mockVerifyToken = clerkMocks.__mockVerifyToken as jest.Mock;

describe('ClerkAuthGuard', () => {
  let guard: ClerkAuthGuard;

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    const request = {
      headers: {
        authorization: authHeader,
      },
      user: undefined as any,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClerkAuthGuard,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'CLERK_SECRET_KEY') return 'sk_test_mock_key';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get<ClerkAuthGuard>(ClerkAuthGuard);
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException when no authorization header', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when header is not Bearer', async () => {
      const context = createMockExecutionContext('Basic abc123');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for empty Bearer token', async () => {
      const context = createMockExecutionContext('Bearer ');
      mockVerifyToken.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true and attach user on valid token', async () => {
      const context = createMockExecutionContext('Bearer valid_token_123');

      mockVerifyToken.mockResolvedValue({ sub: 'user_clerk_abc' });
      mockGetUser.mockResolvedValue({
        id: 'user_clerk_abc',
        emailAddresses: [{ emailAddress: 'test@example.com' }],
        firstName: 'John',
        lastName: 'Doe',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual({
        id: 'user_clerk_abc',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      const context = createMockExecutionContext('Bearer expired_token');
      mockVerifyToken.mockRejectedValue(new Error('Token expired'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when token has no sub claim', async () => {
      const context = createMockExecutionContext('Bearer no_sub_token');
      mockVerifyToken.mockResolvedValue({ sub: null });

      // The guard throws UnauthorizedException('Invalid token payload') inside try,
      // which is caught and re-thrown as 'Invalid or expired token'
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle user with no email address', async () => {
      const context = createMockExecutionContext('Bearer valid_token');

      mockVerifyToken.mockResolvedValue({ sub: 'user_no_email' });
      mockGetUser.mockResolvedValue({
        id: 'user_no_email',
        emailAddresses: [],
        firstName: null,
        lastName: null,
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const request = context.switchToHttp().getRequest();
      expect(request.user.email).toBe('');
      expect(request.user.firstName).toBeNull();
      expect(request.user.lastName).toBeNull();
    });
  });

  describe('constructor', () => {
    it('should throw error when CLERK_SECRET_KEY is not configured', () => {
      expect(
        () =>
          new ClerkAuthGuard({
            get: () => undefined,
          } as unknown as ConfigService),
      ).toThrow('CLERK_SECRET_KEY is not configured');
    });
  });
});
