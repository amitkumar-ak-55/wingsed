// ===========================================
// ApplicationsController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: jest.Mocked<ApplicationsService>;

  const mockClerkUser = {
    id: 'clerk_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockApplication = {
    id: 'app-123',
    userId: 'user-123',
    universityId: 'uni-123',
    status: 'RESEARCHING' as const,
    program: 'CS',
    intake: 'Fall 2026',
    notes: null,
    deadline: null,
    appliedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    university: {
      id: 'uni-123',
      name: 'MIT',
      country: 'United States',
      city: 'Cambridge',
      tuitionFee: 55000,
      publicPrivate: 'Private',
    },
  };

  beforeEach(async () => {
    const mockService = {
      getApplications: jest.fn(),
      getApplicationsByStatus: jest.fn(),
      getStats: jest.fn(),
      createApplication: jest.fn(),
      updateApplication: jest.fn(),
      deleteApplication: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        { provide: ApplicationsService, useValue: mockService },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get(ApplicationsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getApplications', () => {
    it('should return applications for current user', async () => {
      service.getApplications.mockResolvedValue([mockApplication] as any);

      const result = await controller.getApplications(mockClerkUser);

      expect(result.applications).toHaveLength(1);
      expect(service.getApplications).toHaveBeenCalledWith('clerk_123');
    });
  });

  describe('getApplicationsByStatus', () => {
    it('should return grouped applications', async () => {
      const grouped = {
        RESEARCHING: [mockApplication],
        PREPARING: [],
        APPLIED: [],
        ACCEPTED: [],
        REJECTED: [],
      };
      service.getApplicationsByStatus.mockResolvedValue(grouped as any);

      const result = await controller.getApplicationsByStatus(mockClerkUser);

      expect(result.grouped.RESEARCHING).toHaveLength(1);
    });
  });

  describe('getStats', () => {
    it('should return application stats', async () => {
      service.getStats.mockResolvedValue({
        total: 3,
        byStatus: { RESEARCHING: 1, PREPARING: 1, APPLIED: 1, ACCEPTED: 0, REJECTED: 0 },
      });

      const result = await controller.getStats(mockClerkUser);

      expect(result.stats.total).toBe(3);
    });
  });

  describe('createApplication', () => {
    it('should create and return application', async () => {
      service.createApplication.mockResolvedValue(mockApplication as any);

      const result = await controller.createApplication(mockClerkUser, {
        universityId: 'uni-123',
        program: 'CS',
      });

      expect(result.application.id).toBe('app-123');
      expect(service.createApplication).toHaveBeenCalledWith('clerk_123', {
        universityId: 'uni-123',
        program: 'CS',
      });
    });
  });

  describe('updateApplication', () => {
    it('should update and return application', async () => {
      service.updateApplication.mockResolvedValue({
        ...mockApplication,
        status: 'APPLIED',
      } as any);

      const result = await controller.updateApplication(
        mockClerkUser,
        'app-123',
        { status: 'APPLIED' },
      );

      expect(result.application.status).toBe('APPLIED');
    });
  });

  describe('deleteApplication', () => {
    it('should delete application', async () => {
      service.deleteApplication.mockResolvedValue(undefined);

      await controller.deleteApplication(mockClerkUser, 'app-123');

      expect(service.deleteApplication).toHaveBeenCalledWith('clerk_123', 'app-123');
    });
  });
});
