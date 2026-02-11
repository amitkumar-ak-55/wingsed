// ===========================================
// AdminController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';
import { ConfigService } from '@nestjs/config';

describe('AdminController', () => {
  let controller: AdminController;
  let service: jest.Mocked<AdminService>;

  beforeEach(async () => {
    const mockService = {
      getDashboardStats: jest.fn(),
      getAllLeads: jest.fn(),
      getLeadById: jest.fn(),
      deleteLead: jest.fn(),
      getAllUniversities: jest.fn(),
      createUniversity: jest.fn(),
      updateUniversity: jest.fn(),
      deleteUniversity: jest.fn(),
      getUniversityById: jest.fn(),
      createProgram: jest.fn(),
      updateProgram: jest.fn(),
      deleteProgram: jest.fn(),
      getAllUsers: jest.fn(),
      updateUserRole: jest.fn(),
      updateLeadNotes: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get(AdminService);
  });

  afterEach(() => jest.clearAllMocks());

  // -------------------------------------------
  // Dashboard
  // -------------------------------------------
  describe('getDashboardStats', () => {
    it('should return dashboard stats', async () => {
      const stats = {
        totalLeads: 100,
        leadsToday: 5,
        leadsThisWeek: 25,
        totalUsers: 50,
        usersToday: 3,
        totalUniversities: 94,
        leadsByCountry: [],
        recentLeads: [],
      };
      service.getDashboardStats.mockResolvedValue(stats);

      const result = await controller.getDashboardStats();

      expect(result.stats.totalLeads).toBe(100);
    });
  });

  // -------------------------------------------
  // Leads
  // -------------------------------------------
  describe('getAllLeads', () => {
    it('should return leads with pagination', async () => {
      service.getAllLeads.mockResolvedValue({
        leads: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const result = await controller.getAllLeads('1', '20');

      expect(result.page).toBe(1);
      expect(service.getAllLeads).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        country: undefined,
        feedback: undefined,
        search: undefined,
      });
    });

    it('should pass filter parameters', async () => {
      service.getAllLeads.mockResolvedValue({
        leads: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      await controller.getAllLeads(undefined, undefined, 'India', 'pending', 'john');

      expect(service.getAllLeads).toHaveBeenCalledWith(
        expect.objectContaining({
          country: 'India',
          feedback: 'pending',
          search: 'john',
        }),
      );
    });
  });

  describe('getLeadById', () => {
    it('should return a specific lead', async () => {
      service.getLeadById.mockResolvedValue({ id: 'lead-1' } as any);

      const result = await controller.getLeadById('lead-1');

      expect(result.lead.id).toBe('lead-1');
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead', async () => {
      service.deleteLead.mockResolvedValue(undefined);

      await controller.deleteLead('lead-1');

      expect(service.deleteLead).toHaveBeenCalledWith('lead-1');
    });
  });

  // -------------------------------------------
  // Universities
  // -------------------------------------------
  describe('createUniversity', () => {
    it('should create a university', async () => {
      service.createUniversity.mockResolvedValue({
        id: 'uni-new',
        name: 'Oxford',
      } as any);

      const result = await controller.createUniversity({
        name: 'Oxford',
        country: 'United Kingdom',
        city: 'Oxford',
        tuitionFee: 40000,
        publicPrivate: 'Public',
      });

      expect(result.university.name).toBe('Oxford');
    });
  });

  describe('updateUniversity', () => {
    it('should update a university', async () => {
      service.updateUniversity.mockResolvedValue({
        id: 'uni-1',
        name: 'Updated',
      } as any);

      const result = await controller.updateUniversity('uni-1', {
        name: 'Updated',
      });

      expect(result.university.name).toBe('Updated');
    });
  });

  describe('deleteUniversity', () => {
    it('should delete a university', async () => {
      service.deleteUniversity.mockResolvedValue(undefined);

      await controller.deleteUniversity('uni-1');

      expect(service.deleteUniversity).toHaveBeenCalledWith('uni-1');
    });
  });

  // -------------------------------------------
  // Programs
  // -------------------------------------------
  describe('createProgram', () => {
    it('should create a program under a university', async () => {
      service.createProgram.mockResolvedValue({ id: 'prog-1', name: 'CS' } as any);

      const result = await controller.createProgram('uni-1', {
        name: 'CS',
        degreeType: 'MASTERS' as any,
      });

      expect(result.program.name).toBe('CS');
      expect(service.createProgram).toHaveBeenCalledWith('uni-1', {
        name: 'CS',
        degreeType: 'MASTERS',
      });
    });
  });

  describe('updateProgram', () => {
    it('should update a program', async () => {
      service.updateProgram.mockResolvedValue({ id: 'prog-1', name: 'AI' } as any);

      const result = await controller.updateProgram('prog-1', { name: 'AI' });

      expect(result.program.name).toBe('AI');
    });
  });

  describe('deleteProgram', () => {
    it('should delete a program', async () => {
      service.deleteProgram.mockResolvedValue(undefined);

      await controller.deleteProgram('prog-1');

      expect(service.deleteProgram).toHaveBeenCalledWith('prog-1');
    });
  });

  // -------------------------------------------
  // Users
  // -------------------------------------------
  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      service.getAllUsers.mockResolvedValue({
        users: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      const result = await controller.getAllUsers('1', '10');

      expect(result.page).toBe(1);
    });
  });

  describe('updateUserRole', () => {
    it('should update a user role', async () => {
      service.updateUserRole.mockResolvedValue({
        id: 'user-1',
        role: 'ADMIN',
      } as any);

      const result = await controller.updateUserRole('user-1', { role: 'ADMIN' } as any);

      expect(result.user.role).toBe('ADMIN');
    });
  });
});
