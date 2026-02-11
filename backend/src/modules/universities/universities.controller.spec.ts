// ===========================================
// UniversitiesController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UniversitiesController } from './universities.controller';
import { UniversitiesService } from './universities.service';

describe('UniversitiesController', () => {
  let controller: UniversitiesController;
  let universitiesService: jest.Mocked<UniversitiesService>;

  // Mock university data - matches Prisma schema exactly
  const mockUniversity = {
    id: 'uni-123',
    name: 'Test University',
    country: 'USA',
    city: 'Boston',
    tuitionFee: 35000,
    publicPrivate: 'Private',
    logoUrl: 'https://example.com/logo.png',
    imageUrl: null,
    websiteUrl: 'https://example.com',
    description: 'A test university',
    address: null,
    qsRanking: null,
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

  const mockPaginatedResult = {
    data: [mockUniversity],
    total: 1,
    page: 1,
    pageSize: 12,
    totalPages: 1,
  };

  beforeEach(async () => {
    const mockUniversitiesService = {
      findMany: jest.fn(),
      findById: jest.fn(),
      getCountries: jest.fn(),
      getCount: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UniversitiesController],
      providers: [
        {
          provide: UniversitiesService,
          useValue: mockUniversitiesService,
        },
      ],
    }).compile();

    controller = module.get<UniversitiesController>(UniversitiesController);
    universitiesService = module.get(UniversitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUniversities', () => {
    it('should return paginated universities', async () => {
      universitiesService.findMany.mockResolvedValue(mockPaginatedResult);

      const result = await controller.getUniversities({});

      expect(result).toEqual(mockPaginatedResult);
      expect(universitiesService.findMany).toHaveBeenCalled();
    });

    it('should pass filters to service', async () => {
      universitiesService.findMany.mockResolvedValue(mockPaginatedResult);
      const query = {
        country: 'USA',
        budgetMin: 20000,
        budgetMax: 50000,
        search: 'Test',
        page: 2,
        pageSize: 10,
      };

      await controller.getUniversities(query);

      expect(universitiesService.findMany).toHaveBeenCalledWith(
        {
          country: 'USA',
          budgetMin: 20000,
          budgetMax: 50000,
          search: 'Test',
        },
        2,
        10
      );
    });
  });

  describe('getCountries', () => {
    it('should return list of countries', async () => {
      universitiesService.getCountries.mockResolvedValue(['USA', 'Canada', 'UK']);

      const result = await controller.getCountries();

      expect(result.countries).toEqual(['USA', 'Canada', 'UK']);
    });
  });

  describe('getCount', () => {
    it('should return university count', async () => {
      universitiesService.getCount.mockResolvedValue(100);

      const result = await controller.getCount();

      expect(result.count).toBe(100);
    });
  });

  describe('getUniversity', () => {
    it('should return a university by ID', async () => {
      universitiesService.findById.mockResolvedValue(mockUniversity);

      const result = await controller.getUniversity('uni-123');

      expect(result.university).toEqual(mockUniversity);
    });

    it('should throw NotFoundException when university not found', async () => {
      universitiesService.findById.mockResolvedValue(null);

      await expect(controller.getUniversity('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
