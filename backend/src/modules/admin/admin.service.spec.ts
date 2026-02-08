// ===========================================
// AdminService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: DeepMockProxy<PrismaClient>;

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
    programs: [],
  };

  const mockLead = {
    id: 'lead-123',
    clerkId: 'clerk_123',
    name: 'Test Lead',
    email: 'lead@test.com',
    phone: '+919876543210',
    country: 'India',
    university: 'MIT',
    message: null,
    feedback: null,
    feedbackAt: null,
    redirectedAt: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT',
    onboardingStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentProfile: null,
  };

  const mockProgram = {
    id: 'prog-123',
    universityId: 'uni-123',
    name: 'Computer Science',
    degreeType: 'MASTERS',
    department: 'Engineering',
    duration: '2 years',
    tuitionFee: 55000,
    description: null,
    applicationDeadline: null,
    intakes: ['Fall', 'Spring'],
    greRequired: true,
    greMinScore: 310,
    gmatRequired: false,
    gmatMinScore: null,
    ieltsMinScore: 7.0,
    toeflMinScore: 100,
    gpaMinScore: 3.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  // ===========================================
  // Dashboard Stats
  // ===========================================
  describe('getDashboardStats', () => {
    it('should return all dashboard statistics', async () => {
      prisma.whatsAppLead.count
        .mockResolvedValueOnce(100)   // totalLeads
        .mockResolvedValueOnce(5)     // leadsToday
        .mockResolvedValueOnce(25);   // leadsThisWeek
      prisma.user.count
        .mockResolvedValueOnce(50)    // totalUsers
        .mockResolvedValueOnce(3);    // usersToday
      prisma.university.count.mockResolvedValue(94);
      prisma.whatsAppLead.groupBy.mockResolvedValue([
        { country: 'India', _count: { country: 45 } },
        { country: 'USA', _count: { country: 20 } },
      ] as any);
      prisma.whatsAppLead.findMany.mockResolvedValue([mockLead] as any);

      const result = await service.getDashboardStats();

      expect(result.totalLeads).toBe(100);
      expect(result.leadsToday).toBe(5);
      expect(result.leadsThisWeek).toBe(25);
      expect(result.totalUsers).toBe(50);
      expect(result.usersToday).toBe(3);
      expect(result.totalUniversities).toBe(94);
      expect(result.leadsByCountry).toHaveLength(2);
      expect(result.recentLeads).toHaveLength(1);
    });

    it('should handle null country in groupBy', async () => {
      prisma.whatsAppLead.count.mockResolvedValue(0);
      prisma.user.count.mockResolvedValue(0);
      prisma.university.count.mockResolvedValue(0);
      prisma.whatsAppLead.groupBy.mockResolvedValue([
        { country: null, _count: { country: 5 } },
      ] as any);
      prisma.whatsAppLead.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats();

      expect(result.leadsByCountry[0].country).toBe('Unknown');
    });
  });

  // ===========================================
  // Leads Management
  // ===========================================
  describe('getAllLeads', () => {
    it('should return paginated leads with defaults', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([mockLead] as any);
      prisma.whatsAppLead.count.mockResolvedValue(1);

      const result = await service.getAllLeads();

      expect(result.leads).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should filter by country', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);
      prisma.whatsAppLead.count.mockResolvedValue(0);

      await service.getAllLeads({ country: 'India' });

      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ country: 'India' }),
        }),
      );
    });

    it('should filter pending feedback', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);
      prisma.whatsAppLead.count.mockResolvedValue(0);

      await service.getAllLeads({ feedback: 'pending' });

      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ feedback: null }),
        }),
      );
    });

    it('should search by name or email', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);
      prisma.whatsAppLead.count.mockResolvedValue(0);

      await service.getAllLeads({ search: 'test' });

      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'test', mode: 'insensitive' } },
              { email: { contains: 'test', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should handle custom pagination', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);
      prisma.whatsAppLead.count.mockResolvedValue(50);

      const result = await service.getAllLeads({ page: 3, limit: 10 });

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  describe('getLeadById', () => {
    it('should return a lead by id', async () => {
      prisma.whatsAppLead.findUnique.mockResolvedValue(mockLead as any);

      const result = await service.getLeadById('lead-123');

      expect(result.id).toBe('lead-123');
    });

    it('should throw NotFoundException when lead not found', async () => {
      prisma.whatsAppLead.findUnique.mockResolvedValue(null);

      await expect(service.getLeadById('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead', async () => {
      prisma.whatsAppLead.findUnique.mockResolvedValue(mockLead as any);
      prisma.whatsAppLead.delete.mockResolvedValue(mockLead as any);

      await service.deleteLead('lead-123');

      expect(prisma.whatsAppLead.delete).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
      });
    });

    it('should throw NotFoundException when lead not found', async () => {
      prisma.whatsAppLead.findUnique.mockResolvedValue(null);

      await expect(service.deleteLead('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // Universities Management
  // ===========================================
  describe('createUniversity', () => {
    it('should create a university', async () => {
      prisma.university.create.mockResolvedValue(mockUniversity as any);

      const result = await service.createUniversity({
        name: 'MIT',
        country: 'United States',
        city: 'Cambridge',
        tuitionFee: 55000,
        publicPrivate: 'Private',
      });

      expect(result.name).toBe('MIT');
      expect(prisma.university.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'MIT' }),
        include: { programs: true },
      });
    });
  });

  describe('updateUniversity', () => {
    it('should update a university', async () => {
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.university.update.mockResolvedValue({
        ...mockUniversity,
        name: 'MIT Updated',
      } as any);

      const result = await service.updateUniversity('uni-123', {
        name: 'MIT Updated',
      });

      expect(result.name).toBe('MIT Updated');
    });

    it('should throw NotFoundException when university not found', async () => {
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUniversity('bad-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUniversity', () => {
    it('should delete university and related records', async () => {
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.program.deleteMany.mockResolvedValue({ count: 2 } as any);
      prisma.savedUniversity.deleteMany.mockResolvedValue({ count: 1 } as any);
      prisma.application.deleteMany.mockResolvedValue({ count: 0 } as any);
      prisma.university.delete.mockResolvedValue(mockUniversity as any);

      await service.deleteUniversity('uni-123');

      expect(prisma.program.deleteMany).toHaveBeenCalledWith({
        where: { universityId: 'uni-123' },
      });
      expect(prisma.savedUniversity.deleteMany).toHaveBeenCalledWith({
        where: { universityId: 'uni-123' },
      });
      expect(prisma.application.deleteMany).toHaveBeenCalledWith({
        where: { universityId: 'uni-123' },
      });
      expect(prisma.university.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when university not found', async () => {
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(service.deleteUniversity('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUniversities', () => {
    it('should return paginated universities', async () => {
      prisma.university.findMany.mockResolvedValue([mockUniversity] as any);
      prisma.university.count.mockResolvedValue(1);

      const result = await service.getAllUniversities();

      expect(result.universities).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it('should filter by search and country', async () => {
      prisma.university.findMany.mockResolvedValue([]);
      prisma.university.count.mockResolvedValue(0);

      await service.getAllUniversities({
        search: 'MIT',
        country: 'United States',
      });

      expect(prisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            country: 'United States',
            OR: [
              { name: { contains: 'MIT', mode: 'insensitive' } },
              { city: { contains: 'MIT', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });
  });

  // ===========================================
  // Programs Management
  // ===========================================
  describe('createProgram', () => {
    it('should create a program for a university', async () => {
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.program.create.mockResolvedValue(mockProgram as any);

      const result = await service.createProgram('uni-123', {
        name: 'Computer Science',
        degreeType: 'MASTERS' as any,
        department: 'Engineering',
      });

      expect(result.name).toBe('Computer Science');
    });

    it('should throw NotFoundException if university does not exist', async () => {
      prisma.university.findUnique.mockResolvedValue(null);

      await expect(
        service.createProgram('bad-uni', {
          name: 'CS',
          degreeType: 'MASTERS' as any,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should parse applicationDeadline as Date', async () => {
      prisma.university.findUnique.mockResolvedValue(mockUniversity as any);
      prisma.program.create.mockResolvedValue(mockProgram as any);

      await service.createProgram('uni-123', {
        name: 'CS',
        degreeType: 'MASTERS' as any,
        applicationDeadline: '2026-03-15',
      });

      const createCall = prisma.program.create.mock.calls[0][0];
      expect(createCall.data.applicationDeadline).toEqual(new Date('2026-03-15'));
    });
  });

  describe('updateProgram', () => {
    it('should update a program', async () => {
      prisma.program.findUnique.mockResolvedValue(mockProgram as any);
      prisma.program.update.mockResolvedValue({
        ...mockProgram,
        name: 'AI',
      } as any);

      const result = await service.updateProgram('prog-123', { name: 'AI' });

      expect(result.name).toBe('AI');
    });

    it('should throw NotFoundException when program not found', async () => {
      prisma.program.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProgram('bad-id', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteProgram', () => {
    it('should delete a program', async () => {
      prisma.program.findUnique.mockResolvedValue(mockProgram as any);
      prisma.program.delete.mockResolvedValue(mockProgram as any);

      await service.deleteProgram('prog-123');

      expect(prisma.program.delete).toHaveBeenCalledWith({
        where: { id: 'prog-123' },
      });
    });

    it('should throw NotFoundException when program not found', async () => {
      prisma.program.findUnique.mockResolvedValue(null);

      await expect(service.deleteProgram('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ===========================================
  // Users Management
  // ===========================================
  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      prisma.user.findMany.mockResolvedValue([mockUser] as any);
      prisma.user.count.mockResolvedValue(1);

      const result = await service.getAllUsers();

      expect(result.users).toHaveLength(1);
      expect(result.page).toBe(1);
    });

    it('should filter by role', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.getAllUsers({ role: 'ADMIN' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'ADMIN' }),
        }),
      );
    });

    it('should search by email', async () => {
      prisma.user.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      await service.getAllUsers({ search: 'admin@' });

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: { contains: 'admin@', mode: 'insensitive' },
          }),
        }),
      );
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser as any);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        role: 'ADMIN',
      } as any);

      const result = await service.updateUserRole('user-123', 'ADMIN');

      expect(result.role).toBe('ADMIN');
    });

    it('should throw NotFoundException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserRole('bad-id', 'ADMIN'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
