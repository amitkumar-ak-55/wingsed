// ===========================================
// AdminGuard Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let prisma: DeepMockProxy<PrismaClient>;

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    const request = { user };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException when no user on request', async () => {
      const context = createMockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException when user not found in database', async () => {
      const context = createMockExecutionContext({
        id: 'clerk_unknown',
        email: 'unknown@test.com',
      });

      prisma.user.findUnique.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not found in database',
      );
    });

    it('should throw ForbiddenException when user role is STUDENT', async () => {
      const context = createMockExecutionContext({
        id: 'clerk_student',
        email: 'student@test.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        role: 'STUDENT',
      } as any);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Admin access required',
      );
    });

    it('should return true when user role is ADMIN', async () => {
      const context = createMockExecutionContext({
        id: 'clerk_admin',
        email: 'admin@test.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        role: 'ADMIN',
      } as any);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_admin' },
        select: { role: true },
      });
    });

    it('should throw ForbiddenException when user role is COUNSELOR (not ADMIN)', async () => {
      const context = createMockExecutionContext({
        id: 'clerk_counselor',
        email: 'counselor@test.com',
      });

      prisma.user.findUnique.mockResolvedValue({
        role: 'COUNSELOR',
      } as any);

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
