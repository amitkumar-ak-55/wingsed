// ===========================================
// UsersService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  // Mock user data
  const mockUser = {
    id: 'user-123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    role: Role.STUDENT,
    onboardingStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentProfile: null,
  };

  beforeEach(async () => {
    // Create deep mock of PrismaClient
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByClerkId', () => {
    it('should return a user when found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByClerkId('clerk_123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
        include: { studentProfile: true },
      });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByClerkId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: { studentProfile: true },
      });
    });

    it('should return null when email not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user with default STUDENT role', async () => {
      const createData = { clerkId: 'clerk_new', email: 'new@example.com' };
      prisma.user.create.mockResolvedValue({ ...mockUser, ...createData });

      const result = await service.create(createData);

      expect(result.clerkId).toBe('clerk_new');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          clerkId: 'clerk_new',
          email: 'new@example.com',
          role: Role.STUDENT,
          onboardingStep: 0,
        },
      });
    });

    it('should create a user with specified role', async () => {
      const createData = { clerkId: 'clerk_admin', email: 'admin@example.com', role: Role.ADMIN };
      prisma.user.create.mockResolvedValue({ ...mockUser, ...createData, role: Role.ADMIN });

      const result = await service.create(createData);

      expect(result.role).toBe(Role.ADMIN);
    });
  });

  describe('getOrCreate', () => {
    it('should return existing user if found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getOrCreate('clerk_123', 'test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should create new user if not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.getOrCreate('clerk_123', 'test@example.com');

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('updateOnboardingStep', () => {
    it('should update onboarding step successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ ...mockUser, onboardingStep: 3 });

      const result = await service.updateOnboardingStep('clerk_123', 3);

      expect(result.onboardingStep).toBe(3);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
        data: { onboardingStep: 3 },
        include: { studentProfile: true },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOnboardingStep('nonexistent', 3)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      prisma.user.delete.mockResolvedValue(mockUser);

      await service.delete('clerk_123');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
      });
    });
  });
});
