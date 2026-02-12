// ===========================================
// ProfileService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, TestTaken } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: DeepMockProxy<PrismaClient>;

  // Mock profile data
  const mockProfile = {
    id: 'profile-123',
    userId: 'user-123',
    country: 'USA',
    customDestination: null,
    budgetMin: 20000,
    budgetMax: 50000,
    targetField: 'Computer Science',
    intake: 'Fall 2025',
    testTaken: TestTaken.GRE,
    postWhatsAppStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockUserWithProfile = {
    ...mockUser,
    studentProfile: mockProfile,
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByClerkId', () => {
    it('should return profile when user has one', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithProfile as never);

      const result = await service.findByClerkId('clerk_123');

      expect(result).toEqual(mockProfile);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
        include: { studentProfile: true },
      });
    });

    it('should return null when user has no profile', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as never);

      const result = await service.findByClerkId('clerk_123');

      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.findByClerkId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createProfileDto = {
      country: 'USA',
      budgetMin: 20000,
      budgetMax: 50000,
      targetField: 'Computer Science',
      intake: 'Fall 2025',
      testTaken: TestTaken.GRE,
    };

    it('should create a new profile successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as never);
      prisma.studentProfile.create.mockResolvedValue(mockProfile as never);

      const result = await service.create('clerk_123', createProfileDto);

      expect(result).toEqual(mockProfile);
      expect(prisma.studentProfile.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          country: 'USA',
          customDestination: undefined,
          budgetMin: 20000,
          budgetMax: 50000,
          targetField: 'Computer Science',
          intake: 'Fall 2025',
          testTaken: TestTaken.GRE,
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.create('nonexistent', createProfileDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when profile already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithProfile as never);

      await expect(
        service.create('clerk_123', createProfileDto)
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateProfileDto = {
      country: 'Canada',
      budgetMax: 60000,
    };

    it('should update existing profile successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithProfile as never);
      prisma.studentProfile.update.mockResolvedValue({
        ...mockProfile,
        country: 'Canada',
        budgetMax: 60000,
      } as never);

      const result = await service.update('clerk_123', updateProfileDto);

      expect(result.country).toBe('Canada');
      expect(result.budgetMax).toBe(60000);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateProfileDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should create profile if it does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as never);
      prisma.studentProfile.create.mockResolvedValue(mockProfile as never);

      const result = await service.update('clerk_123', updateProfileDto);

      expect(prisma.studentProfile.create).toHaveBeenCalled();
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateWhatsAppStatus', () => {
    it('should update WhatsApp status successfully', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUserWithProfile as never);
      prisma.studentProfile.update.mockResolvedValue({
        ...mockProfile,
        postWhatsAppStatus: 'joined',
      } as never);

      const result = await service.updateWhatsAppStatus('clerk_123', 'joined');

      expect(result.postWhatsAppStatus).toBe('joined');
      expect(prisma.studentProfile.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: { postWhatsAppStatus: 'joined' },
      });
    });

    it('should throw NotFoundException when profile not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as never);

      await expect(
        service.updateWhatsAppStatus('clerk_123', 'joined')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateWhatsAppStatus('nonexistent', 'joined')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
