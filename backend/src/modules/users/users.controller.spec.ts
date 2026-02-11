// ===========================================
// UsersController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { Role } from '@prisma/client';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

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

  // Mock Clerk user
  const mockClerkUser = {
    id: 'clerk_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    const mockUsersService = {
      getOrCreate: jest.fn(),
      updateOnboardingStep: jest.fn(),
      findByClerkId: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user with profile data', async () => {
      usersService.getOrCreate.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockClerkUser);

      expect(result.id).toBe('user-123');
      expect(result.clerkId).toBe('clerk_123');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
      expect(result.onboardingStep).toBe(0);
      expect(usersService.getOrCreate).toHaveBeenCalledWith('clerk_123', 'test@example.com');
    });

    it('should handle user with no name parts', async () => {
      usersService.getOrCreate.mockResolvedValue(mockUser);
      const clerkUserNoName = { ...mockClerkUser, firstName: '', lastName: '' };

      const result = await controller.getCurrentUser(clerkUserNoName);

      expect(result.name).toBeNull();
    });

    it('should include student profile when exists', async () => {
      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        country: 'USA',
      };
      usersService.getOrCreate.mockResolvedValue({
        ...mockUser,
        studentProfile: mockProfile,
      } as never);

      const result = await controller.getCurrentUser(mockClerkUser);

      expect(result.studentProfile).toEqual(mockProfile);
    });
  });

  describe('updateOnboardingStep', () => {
    it('should update onboarding step successfully', async () => {
      usersService.updateOnboardingStep.mockResolvedValue({
        ...mockUser,
        onboardingStep: 3,
      });

      const result = await controller.updateOnboardingStep(
        mockClerkUser,
        { step: 3 }
      );

      expect(result.onboardingStep).toBe(3);
      expect(usersService.updateOnboardingStep).toHaveBeenCalledWith('clerk_123', 3);
    });
  });
});
