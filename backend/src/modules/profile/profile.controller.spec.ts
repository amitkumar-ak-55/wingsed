// ===========================================
// ProfileController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { TestTaken } from '@prisma/client';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;

  // Mock profile data - matches Prisma schema exactly
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
    whatsAppRedirectAt: null,
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
    const mockProfileService = {
      findByClerkId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateWhatsAppStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get(ProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      profileService.findByClerkId.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockClerkUser);

      expect(result.profile).toEqual(mockProfile);
      expect(profileService.findByClerkId).toHaveBeenCalledWith('clerk_123');
    });

    it('should return null when no profile exists', async () => {
      profileService.findByClerkId.mockResolvedValue(null);

      const result = await controller.getProfile(mockClerkUser);

      expect(result.profile).toBeNull();
    });
  });

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const createDto = {
        country: 'USA',
        budgetMin: 20000,
        budgetMax: 50000,
        targetField: 'Computer Science',
        intake: 'Fall 2025',
        testTaken: TestTaken.GRE,
      };
      profileService.create.mockResolvedValue(mockProfile);

      const result = await controller.createProfile(mockClerkUser, createDto);

      expect(result.profile).toEqual(mockProfile);
      expect(profileService.create).toHaveBeenCalledWith('clerk_123', createDto);
    });
  });

  describe('updateProfile', () => {
    it('should update profile with partial data', async () => {
      const updateDto = { country: 'Canada' };
      profileService.update.mockResolvedValue({
        ...mockProfile,
        country: 'Canada',
      });

      const result = await controller.updateProfile(mockClerkUser, updateDto);

      expect(result.profile.country).toBe('Canada');
      expect(profileService.update).toHaveBeenCalledWith('clerk_123', updateDto);
    });
  });

  describe('updateWhatsAppStatus', () => {
    it('should update WhatsApp status', async () => {
      const statusDto = { status: 'joined' };
      profileService.updateWhatsAppStatus.mockResolvedValue({
        ...mockProfile,
        postWhatsAppStatus: 'joined',
      });

      const result = await controller.updateWhatsAppStatus(mockClerkUser, statusDto);

      expect(result.profile.postWhatsAppStatus).toBe('joined');
      expect(profileService.updateWhatsAppStatus).toHaveBeenCalledWith('clerk_123', 'joined');
    });
  });
});
