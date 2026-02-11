// ===========================================
// LeadsController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

describe('LeadsController', () => {
  let controller: LeadsController;
  let leadsService: jest.Mocked<LeadsService>;

  // Mock lead data
  const mockLead = {
    id: 'lead-123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    country: 'USA',
    budgetMin: 20000,
    budgetMax: 50000,
    targetField: 'Computer Science',
    messageText: 'Hi I am Test User.',
    redirectedAt: new Date(),
    feedback: null,
    feedbackAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock Clerk user
  const mockClerkUser = {
    id: 'clerk_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    const mockLeadsService = {
      createLead: jest.fn(),
      updateFeedback: jest.fn(),
      getLeadsByUser: jest.fn(),
      getLeadsPendingFeedback: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        {
          provide: LeadsService,
          useValue: mockLeadsService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LeadsController>(LeadsController);
    leadsService = module.get(LeadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWhatsAppLead', () => {
    it('should create a lead and return redirect URL', async () => {
      const createDto = {
        name: 'Test User',
        country: 'USA',
        budgetMin: 20000,
        budgetMax: 50000,
        targetField: 'Computer Science',
      };
      leadsService.createLead.mockResolvedValue({
        lead: mockLead,
        redirectUrl: 'https://wa.me/918658805653?text=Hi',
      });

      const result = await controller.createWhatsAppLead(mockClerkUser, createDto);

      expect(result.leadId).toBe('lead-123');
      expect(result.redirectUrl).toContain('https://wa.me/');
      expect(leadsService.createLead).toHaveBeenCalledWith(
        'clerk_123',
        'test@example.com',
        createDto
      );
    });
  });

  describe('updateFeedback', () => {
    it('should update lead feedback to connected', async () => {
      leadsService.updateFeedback.mockResolvedValue({
        ...mockLead,
        feedback: 'connected',
        feedbackAt: new Date(),
      });

      const result = await controller.updateFeedback('lead-123', { feedback: 'connected' });

      expect(result.lead.feedback).toBe('connected');
      expect(leadsService.updateFeedback).toHaveBeenCalledWith('lead-123', 'connected');
    });

    it('should update lead feedback to no_response', async () => {
      leadsService.updateFeedback.mockResolvedValue({
        ...mockLead,
        feedback: 'no_response',
        feedbackAt: new Date(),
      });

      const result = await controller.updateFeedback('lead-123', { feedback: 'no_response' });

      expect(result.lead.feedback).toBe('no_response');
    });
  });

  describe('getMyLeads', () => {
    it('should return user leads', async () => {
      leadsService.getLeadsByUser.mockResolvedValue([mockLead]);

      const result = await controller.getMyLeads(mockClerkUser);

      expect(result.leads).toEqual([mockLead]);
      expect(leadsService.getLeadsByUser).toHaveBeenCalledWith('clerk_123');
    });

    it('should return empty array when no leads exist', async () => {
      leadsService.getLeadsByUser.mockResolvedValue([]);

      const result = await controller.getMyLeads(mockClerkUser);

      expect(result.leads).toEqual([]);
    });
  });
});
