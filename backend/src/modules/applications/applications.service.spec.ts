// ===========================================
// ApplicationsService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient, ApplicationStatus } from '@prisma/client';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
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
    logoUrl: null,
    websiteUrl: null,
    description: null,
    imageUrl: null,
    address: null,
    qsRanking: 1,
    timesRanking: null,
    usNewsRanking: null,
    acceptanceRate: null,
    applicationFee: null,
    campusType: null,
    totalStudents: null,
    internationalStudentPercent: null,
    foodHousingCost: null,
    avgScholarshipAmount: null,
    employmentRate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApplication = {
    id: 'app-123',
    userId: 'user-123',
    universityId: 'uni-123',
    status: 'RESEARCHING' as ApplicationStatus,
    program: 'Computer Science',
    intake: 'Fall 2026',
    notes: 'Need to submit GRE',
    deadline: new Date('2026-03-15'),
    appliedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------------------------
  // getApplications
  // -------------------------------------------
  describe('getApplications', () => {
    it('should return all applications for a user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findMany.mockResolvedValue([
        { ...mockApplication, university: mockUniversity },
      ] as any);

      const result = await service.getApplications('clerk_123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('app-123');
      expect(prisma.application.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: { university: true },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getApplications('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array when user has no applications', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findMany.mockResolvedValue([]);

      const result = await service.getApplications('clerk_123');
      expect(result).toEqual([]);
    });
  });

  // -------------------------------------------
  // getApplicationsByStatus (Kanban)
  // -------------------------------------------
  describe('getApplicationsByStatus', () => {
    it('should group applications by status', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findMany.mockResolvedValue([
        { ...mockApplication, status: 'RESEARCHING', university: mockUniversity },
        { ...mockApplication, id: 'app-456', status: 'APPLIED', university: mockUniversity },
        { ...mockApplication, id: 'app-789', status: 'ACCEPTED', university: mockUniversity },
      ] as any);

      const result = await service.getApplicationsByStatus('clerk_123');

      expect(result.RESEARCHING).toHaveLength(1);
      expect(result.APPLIED).toHaveLength(1);
      expect(result.ACCEPTED).toHaveLength(1);
      expect(result.PREPARING).toHaveLength(0);
      expect(result.REJECTED).toHaveLength(0);
    });
  });

  // -------------------------------------------
  // createApplication
  // -------------------------------------------
  describe('createApplication', () => {
    it('should create a new application', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.application.findUnique.mockResolvedValue(null);
      prisma.application.create.mockResolvedValue(mockApplication as any);

      const result = await service.createApplication('clerk_123', {
        universityId: 'uni-123',
        program: 'Computer Science',
        intake: 'Fall 2026',
      });

      expect(result.id).toBe('app-123');
      expect(prisma.application.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('nonexistent', { universityId: 'uni-123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when university not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(
        service.createApplication('clerk_123', { universityId: 'bad-uni' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when application already exists', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.application.findUnique.mockResolvedValue(mockApplication as any);

      await expect(
        service.createApplication('clerk_123', { universityId: 'uni-123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // -------------------------------------------
  // updateApplication
  // -------------------------------------------
  describe('updateApplication', () => {
    it('should update an application', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(mockApplication as any);
      prisma.application.update.mockResolvedValue({
        ...mockApplication,
        status: 'PREPARING',
      } as any);

      const result = await service.updateApplication('clerk_123', 'app-123', {
        status: 'PREPARING',
      });

      expect(result.status).toBe('PREPARING');
    });

    it('should auto-set appliedAt when status changes to APPLIED', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(mockApplication as any);
      prisma.application.update.mockResolvedValue({
        ...mockApplication,
        status: 'APPLIED',
        appliedAt: new Date(),
      } as any);

      await service.updateApplication('clerk_123', 'app-123', {
        status: 'APPLIED',
      });

      const updateCall = prisma.application.update.mock.calls[0][0];
      expect(updateCall.data).toHaveProperty('appliedAt');
    });

    it('should NOT overwrite appliedAt if already set', async () => {
      const appWithAppliedAt = {
        ...mockApplication,
        status: 'APPLIED' as ApplicationStatus,
        appliedAt: new Date('2026-01-15'),
      };
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(appWithAppliedAt as any);
      prisma.application.update.mockResolvedValue(appWithAppliedAt as any);

      await service.updateApplication('clerk_123', 'app-123', {
        status: 'APPLIED',
      });

      const updateCall = prisma.application.update.mock.calls[0][0];
      // Should NOT have appliedAt since it already existed
      expect(updateCall.data.appliedAt).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateApplication('nonexistent', 'app-123', { status: 'APPLIED' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when application not found or belongs to another user', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(
        service.updateApplication('clerk_123', 'bad-app', { status: 'APPLIED' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------
  // deleteApplication
  // -------------------------------------------
  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(mockApplication as any);
      prisma.application.delete.mockResolvedValue(mockApplication as any);

      await service.deleteApplication('clerk_123', 'app-123');

      expect(prisma.application.delete).toHaveBeenCalledWith({
        where: { id: 'app-123' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteApplication('nonexistent', 'app-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when application not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findFirst.mockResolvedValue(null);

      await expect(
        service.deleteApplication('clerk_123', 'bad-app'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // -------------------------------------------
  // getStats
  // -------------------------------------------
  describe('getStats', () => {
    it('should return stats with counts by status', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.application.findMany.mockResolvedValue([
        { status: 'RESEARCHING' },
        { status: 'RESEARCHING' },
        { status: 'APPLIED' },
        { status: 'ACCEPTED' },
      ] as any);

      const result = await service.getStats('clerk_123');

      expect(result.total).toBe(4);
      expect(result.byStatus.RESEARCHING).toBe(2);
      expect(result.byStatus.APPLIED).toBe(1);
      expect(result.byStatus.ACCEPTED).toBe(1);
      expect(result.byStatus.PREPARING).toBe(0);
      expect(result.byStatus.REJECTED).toBe(0);
    });

    it('should return zero stats when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getStats('nonexistent');

      expect(result.total).toBe(0);
      expect(result.byStatus.RESEARCHING).toBe(0);
    });
  });
});
