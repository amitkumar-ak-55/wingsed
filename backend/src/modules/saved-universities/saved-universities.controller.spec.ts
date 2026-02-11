// ===========================================
// SavedUniversitiesController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { SavedUniversitiesController } from './saved-universities.controller';
import { SavedUniversitiesService } from './saved-universities.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';

describe('SavedUniversitiesController', () => {
  let controller: SavedUniversitiesController;
  let service: jest.Mocked<SavedUniversitiesService>;

  const mockClerkUser = {
    id: 'clerk_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  beforeEach(async () => {
    const mockService = {
      getSavedUniversities: jest.fn(),
      getSavedUniversityIds: jest.fn(),
      saveUniversity: jest.fn(),
      unsaveUniversity: jest.fn(),
      isSaved: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedUniversitiesController],
      providers: [
        { provide: SavedUniversitiesService, useValue: mockService },
      ],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SavedUniversitiesController>(SavedUniversitiesController);
    service = module.get(SavedUniversitiesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSavedUniversities', () => {
    it('should return saved universities', async () => {
      service.getSavedUniversities.mockResolvedValue([
        { id: 'saved-1', universityId: 'uni-1', university: { name: 'MIT' } },
      ] as any);

      const result = await controller.getSavedUniversities(mockClerkUser);

      expect(result.savedUniversities).toHaveLength(1);
    });
  });

  describe('getSavedUniversityIds', () => {
    it('should return list of IDs', async () => {
      service.getSavedUniversityIds.mockResolvedValue(['uni-1', 'uni-2']);

      const result = await controller.getSavedUniversityIds(mockClerkUser);

      expect(result.ids).toEqual(['uni-1', 'uni-2']);
    });
  });

  describe('saveUniversity', () => {
    it('should save a university', async () => {
      service.saveUniversity.mockResolvedValue({ id: 'saved-1' } as any);

      const result = await controller.saveUniversity(mockClerkUser, 'uni-123');

      expect(service.saveUniversity).toHaveBeenCalledWith('clerk_123', 'uni-123');
      expect(result.saved.id).toBe('saved-1');
    });
  });

  describe('unsaveUniversity', () => {
    it('should unsave a university', async () => {
      service.unsaveUniversity.mockResolvedValue(undefined);

      await controller.unsaveUniversity(mockClerkUser, 'uni-123');

      expect(service.unsaveUniversity).toHaveBeenCalledWith('clerk_123', 'uni-123');
    });
  });

  describe('checkSaved', () => {
    it('should return isSaved true', async () => {
      service.isSaved.mockResolvedValue(true);

      const result = await controller.checkSaved(mockClerkUser, 'uni-123');

      expect(result.isSaved).toBe(true);
    });

    it('should return isSaved false', async () => {
      service.isSaved.mockResolvedValue(false);

      const result = await controller.checkSaved(mockClerkUser, 'uni-999');

      expect(result.isSaved).toBe(false);
    });
  });
});
