// ===========================================
// UniversitiesService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { UniversitiesService } from './universities.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('UniversitiesService', () => {
  let service: UniversitiesService;
  let prisma: DeepMockProxy<PrismaClient>;

  // Mock university data - matches Prisma schema exactly
  const mockUniversity = {
    id: 'uni-123',
    name: 'Test University',
    country: 'USA',
    city: 'Boston',
    tuitionFee: 35000,
    publicPrivate: 'Private',
    logoUrl: 'https://example.com/logo.png',
    websiteUrl: 'https://example.edu',
    description: 'A test university',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUniversities = [
    mockUniversity,
    {
      ...mockUniversity,
      id: 'uni-456',
      name: 'Another University',
      country: 'Canada',
      city: 'Toronto',
      tuitionFee: 25000,
    },
  ];

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UniversitiesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UniversitiesService>(UniversitiesService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMany', () => {
    it('should return paginated universities without filters', async () => {
      prisma.university.count.mockResolvedValue(2);
      prisma.university.findMany.mockResolvedValue(mockUniversities as never);

      const result = await service.findMany({}, 1, 12);

      expect(result.data).toEqual(mockUniversities);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(12);
      expect(result.totalPages).toBe(1);
    });

    it('should filter by country', async () => {
      prisma.university.count.mockResolvedValue(1);
      prisma.university.findMany.mockResolvedValue([mockUniversity] as never);

      const result = await service.findMany({ country: 'USA' }, 1, 12);

      expect(result.data).toHaveLength(1);
      expect(prisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ country: 'USA' }),
        })
      );
    });

    it('should filter by budget range', async () => {
      prisma.university.count.mockResolvedValue(1);
      prisma.university.findMany.mockResolvedValue([mockUniversity] as never);

      const result = await service.findMany(
        { budgetMin: 20000, budgetMax: 40000 },
        1,
        12
      );

      expect(result.data).toHaveLength(1);
      expect(prisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tuitionFee: { gte: 20000, lte: 40000 },
          }),
        })
      );
    });

    it('should filter by search term', async () => {
      prisma.university.count.mockResolvedValue(1);
      prisma.university.findMany.mockResolvedValue([mockUniversity] as never);

      const result = await service.findMany({ search: 'Test' }, 1, 12);

      expect(result.data).toHaveLength(1);
      expect(prisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'Test', mode: 'insensitive' } },
              { city: { contains: 'Test', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should calculate pagination correctly', async () => {
      prisma.university.count.mockResolvedValue(50);
      prisma.university.findMany.mockResolvedValue(mockUniversities as never);

      const result = await service.findMany({}, 3, 10);

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(5);
      expect(prisma.university.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should return empty array when no universities found', async () => {
      prisma.university.count.mockResolvedValue(0);
      prisma.university.findMany.mockResolvedValue([]);

      const result = await service.findMany({ country: 'NonExistent' }, 1, 12);

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findById', () => {
    it('should return a university when found', async () => {
      prisma.university.findUnique.mockResolvedValue(mockUniversity as never);

      const result = await service.findById('uni-123');

      expect(result).toEqual(mockUniversity);
      expect(prisma.university.findUnique).toHaveBeenCalledWith({
        where: { id: 'uni-123' },
      });
    });

    it('should return null when university not found', async () => {
      prisma.university.findUnique.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getCountries', () => {
    it('should return unique countries list', async () => {
      prisma.university.findMany.mockResolvedValue([
        { country: 'Canada' },
        { country: 'USA' },
        { country: 'UK' },
      ] as never);

      const result = await service.getCountries();

      expect(result).toEqual(['Canada', 'USA', 'UK']);
      expect(prisma.university.findMany).toHaveBeenCalledWith({
        select: { country: true },
        distinct: ['country'],
        orderBy: { country: 'asc' },
      });
    });

    it('should return empty array when no universities exist', async () => {
      prisma.university.findMany.mockResolvedValue([]);

      const result = await service.getCountries();

      expect(result).toEqual([]);
    });
  });

  describe('getCount', () => {
    it('should return total university count', async () => {
      prisma.university.count.mockResolvedValue(100);

      const result = await service.getCount();

      expect(result).toBe(100);
      expect(prisma.university.count).toHaveBeenCalled();
    });

    it('should return 0 when no universities exist', async () => {
      prisma.university.count.mockResolvedValue(0);

      const result = await service.getCount();

      expect(result).toBe(0);
    });
  });
});
