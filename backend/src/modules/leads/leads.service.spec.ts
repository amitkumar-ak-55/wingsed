// ===========================================
// LeadsService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: DeepMockProxy<PrismaClient>;
  let configService: ConfigService;

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
    messageText: 'Hi I am Test User. I want to study in USA. within a budget of ₹20,000 - ₹50,000. I\'m interested in Computer Science.',
    redirectedAt: new Date(),
    feedback: null,
    feedbackAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock user data
  const mockUser = {
    id: 'user-123',
    clerkId: 'clerk_123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'STUDENT',
    onboardingStep: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    studentProfile: {
      id: 'profile-123',
      userId: 'user-123',
      country: 'USA',
      budgetMin: 20000,
      budgetMax: 50000,
      targetField: 'Computer Science',
      intake: 'Fall 2025',
      testTaken: 'GRE',
      postWhatsAppStatus: null,
      whatsAppRedirectAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();
    const mockConfigService = {
      get: jest.fn().mockReturnValue('918658805653'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prisma = module.get(PrismaService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLead', () => {
    const createLeadDto = {
      name: 'Test User',
      country: 'USA',
      budgetMin: 20000,
      budgetMax: 50000,
      targetField: 'Computer Science',
    };

    it('should create a lead and return redirect URL', async () => {
      prisma.whatsAppLead.create.mockResolvedValue(mockLead as never);
      prisma.user.findUnique.mockResolvedValue(mockUser as never);
      prisma.studentProfile.update.mockResolvedValue(mockUser.studentProfile as never);

      const result = await service.createLead(
        'clerk_123',
        'test@example.com',
        createLeadDto
      );

      expect(result.lead).toEqual(mockLead);
      expect(result.redirectUrl).toContain('https://wa.me/918658805653');
      expect(result.redirectUrl).toContain('text=');
      expect(prisma.whatsAppLead.create).toHaveBeenCalled();
    });

    it('should build message with all fields when provided', async () => {
      prisma.whatsAppLead.create.mockResolvedValue(mockLead as never);
      prisma.user.findUnique.mockResolvedValue(mockUser as never);
      prisma.studentProfile.update.mockResolvedValue(mockUser.studentProfile as never);

      await service.createLead('clerk_123', 'test@example.com', createLeadDto);

      expect(prisma.whatsAppLead.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          clerkId: 'clerk_123',
          email: 'test@example.com',
          name: 'Test User',
          country: 'USA',
          budgetMin: 20000,
          budgetMax: 50000,
          targetField: 'Computer Science',
        }),
      });
    });

    it('should build message with just greeting when no fields provided', async () => {
      prisma.whatsAppLead.create.mockResolvedValue({
        ...mockLead,
        name: null,
        country: null,
        budgetMin: null,
        budgetMax: null,
        targetField: null,
        messageText: 'Hi.',
      } as never);
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.createLead('clerk_123', 'test@example.com', {});

      expect(result.redirectUrl).toContain('Hi');
    });

    it('should update student profile with redirect timestamp', async () => {
      prisma.whatsAppLead.create.mockResolvedValue(mockLead as never);
      prisma.user.findUnique.mockResolvedValue(mockUser as never);
      prisma.studentProfile.update.mockResolvedValue(mockUser.studentProfile as never);

      await service.createLead('clerk_123', 'test@example.com', createLeadDto);

      expect(prisma.studentProfile.update).toHaveBeenCalledWith({
        where: { id: 'profile-123' },
        data: { whatsAppRedirectAt: expect.any(Date) },
      });
    });
  });

  describe('updateFeedback', () => {
    it('should update lead with connected feedback', async () => {
      prisma.whatsAppLead.update.mockResolvedValue({
        ...mockLead,
        feedback: 'connected',
        feedbackAt: new Date(),
      } as never);

      const result = await service.updateFeedback('lead-123', 'connected');

      expect(result.feedback).toBe('connected');
      expect(prisma.whatsAppLead.update).toHaveBeenCalledWith({
        where: { id: 'lead-123' },
        data: {
          feedback: 'connected',
          feedbackAt: expect.any(Date),
        },
      });
    });

    it('should update lead with no_response feedback', async () => {
      prisma.whatsAppLead.update.mockResolvedValue({
        ...mockLead,
        feedback: 'no_response',
        feedbackAt: new Date(),
      } as never);

      const result = await service.updateFeedback('lead-123', 'no_response');

      expect(result.feedback).toBe('no_response');
    });
  });

  describe('getLeadsByUser', () => {
    it('should return leads for a user', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([mockLead] as never);

      const result = await service.getLeadsByUser('clerk_123');

      expect(result).toEqual([mockLead]);
      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_123' },
        orderBy: { redirectedAt: 'desc' },
      });
    });

    it('should return empty array when no leads found', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);

      const result = await service.getLeadsByUser('nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('getLeadsPendingFeedback', () => {
    it('should return leads older than 24 hours without feedback', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([mockLead] as never);

      const result = await service.getLeadsPendingFeedback();

      expect(result).toEqual([mockLead]);
      expect(prisma.whatsAppLead.findMany).toHaveBeenCalledWith({
        where: {
          redirectedAt: { lte: expect.any(Date) },
          feedback: null,
        },
      });
    });

    it('should return empty array when no pending leads', async () => {
      prisma.whatsAppLead.findMany.mockResolvedValue([]);

      const result = await service.getLeadsPendingFeedback();

      expect(result).toEqual([]);
    });
  });
});
