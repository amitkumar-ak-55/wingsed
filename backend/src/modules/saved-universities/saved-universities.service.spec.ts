// ===========================================
// SavedUniversitiesService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SavedUniversitiesService } from './saved-universities.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('SavedUniversitiesService', () => {
  let service: SavedUniversitiesService;
  let prisma: DeepMockProxy<PrismaClient>;

  const mockUser = {
    id: 'user-123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT' as const,
    onboardingStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUniversity = {
    id: 'uni-123',
    name: 'MIT',
    country: 'United States',
    city: 'Cambridge',
    tuitionFee: 55000,
    publicPrivate: 'Private',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSaved = {
    id: 'saved-123',
    userId: 'user-123',
    universityId: 'uni-123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedUniversitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SavedUniversitiesService>(SavedUniversitiesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // -------------------------------------------
  // getSavedUniversities
  // -------------------------------------------
  describe('getSavedUniversities', () => {
    it('should return saved universities for a user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findMany.mockResolvedValue([
        { ...mockSaved, university: mockUniversity },
      ] as any);

      const result = await service.getSavedUniversities('clerk_123');

      expect(result).toHaveLength(1);
      expect(prisma.savedUniversity.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { university: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getSavedUniversities('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // -------------------------------------------
  // getSavedUniversityIds
  // -------------------------------------------
  describe('getSavedUniversityIds', () => {
    it('should return array of university IDs', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findMany.mockResolvedValue([
        { universityId: 'uni-1' },
        { universityId: 'uni-2' },
      ] as any);

      const result = await service.getSavedUniversityIds('clerk_123');

      expect(result).toEqual(['uni-1', 'uni-2']);
    });

    it('should return empty array when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getSavedUniversityIds('nonexistent');

      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------
  // saveUniversity
  // -------------------------------------------
  describe('saveUniversity', () => {
    it('should save a university for a user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(null);
      prisma.savedUniversity.create.mockResolvedValue(mockSaved as any);

      const result = await service.saveUniversity('clerk_123', 'uni-123');

      expect(result.id).toBe('saved-123');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.saveUniversity('nonexistent', 'uni-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when university not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(
        service.saveUniversity('clerk_123', 'bad-uni'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already saved', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(mockSaved as any);

      await expect(
        service.saveUniversity('clerk_123', 'uni-123'),
      ).rejects.toThrow(ConflictException);
    });
  });

  // -------------------------------------------
  // unsaveUniversity
  // -------------------------------------------
  describe('unsaveUniversity', () => {
    it('should remove a saved university', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(mockSaved as any);
      prisma.savedUniversity.delete.mockResolvedValue(mockSaved as any);

      await service.unsaveUniversity('clerk_123', 'uni-123');

      expect(prisma.savedUniversity.delete).toHaveBeenCalledWith({
        where: { id: 'saved-123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.unsaveUniversity('nonexistent', 'uni-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when saved university not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(null);

      await expect(
        service.unsaveUniversity('clerk_123', 'uni-123'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------
  // isSaved
  // -------------------------------------------
  describe('isSaved', () => {
    it('should return true when university is saved', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(mockSaved as any);

      const result = await service.isSaved('clerk_123', 'uni-123');

      expect(result).toBe(true);
    });

    it('should return false when university is not saved', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.savedUniversity.findUnique.mockResolvedValue(null);

      const result = await service.isSaved('clerk_123', 'uni-123');

      expect(result).toBe(false);
    });

    it('should return false when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.isSaved('nonexistent', 'uni-123');

      expect(result).toBe(false);
    });
  });
});
