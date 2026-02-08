// ===========================================
// TypesenseService Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TypesenseService } from './typesense.service';
import { PrismaService } from '../../prisma/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

// Mock Typesense client
const mockSearch = jest.fn();
const mockImport = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockHealthRetrieve = jest.fn();

jest.mock('typesense', () => {
  return {
    __esModule: true,
    default: {
      Client: jest.fn().mockImplementation(() => ({
        health: { retrieve: mockHealthRetrieve },
        collections: jest.fn((name?: string) => {
          if (name) {
            return {
              documents: () => ({
                search: mockSearch,
                import: mockImport,
              }),
              delete: mockDelete,
            };
          }
          return {
            create: mockCreate,
          };
        }),
      })),
    },
  };
});

describe('TypesenseService', () => {
  let service: TypesenseService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypesenseService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: string) => {
              const config: Record<string, string> = {
                TYPESENSE_HOST: 'localhost',
                TYPESENSE_PORT: '8108',
                TYPESENSE_PROTOCOL: 'http',
                TYPESENSE_API_KEY: 'test_key',
              };
              return config[key] || defaultVal;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TypesenseService>(TypesenseService);
    prisma = module.get(PrismaService);
  });

  // -------------------------------------------
  // onModuleInit
  // -------------------------------------------
  describe('onModuleInit', () => {
    it('should log success when Typesense is available', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockHealthRetrieve.mockResolvedValue({ ok: true });

      await service.onModuleInit();

      expect(mockHealthRetrieve).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should warn when Typesense is not available', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      mockHealthRetrieve.mockRejectedValue(new Error('Connection refused'));

      await service.onModuleInit();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Typesense not available'),
      );
      consoleWarnSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // syncUniversities
  // -------------------------------------------
  describe('syncUniversities', () => {
    it('should sync universities from database to Typesense', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      prisma.university.findMany.mockResolvedValue([
        {
          id: 'uni-1',
          name: 'MIT',
          country: 'United States',
          city: 'Cambridge',
          tuitionFee: 55000,
          publicPrivate: 'Private',
          description: 'Top university',
        },
        {
          id: 'uni-2',
          name: 'Oxford',
          country: 'United Kingdom',
          city: 'Oxford',
          tuitionFee: 40000,
          publicPrivate: 'Public',
          description: null,
        },
      ] as any);
      mockImport.mockResolvedValue([]);

      const count = await service.syncUniversities();

      expect(count).toBe(2);
      expect(mockImport).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: 'uni-1', name: 'MIT' }),
          expect.objectContaining({ id: 'uni-2', description: '' }),
        ]),
        { action: 'upsert' },
      );
      consoleSpy.mockRestore();
    });
  });

  // -------------------------------------------
  // search
  // -------------------------------------------
  describe('search', () => {
    it('should search with default parameters', async () => {
      mockSearch.mockResolvedValue({
        hits: [
          {
            document: {
              id: 'uni-1',
              name: 'MIT',
              country: 'United States',
              city: 'Cambridge',
              tuitionFee: 55000,
              publicPrivate: 'Private',
              description: 'Top university',
            },
          },
        ],
        found: 1,
      });

      const result = await service.search({ query: 'MIT' });

      expect(result.hits).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should apply country filter', async () => {
      mockSearch.mockResolvedValue({ hits: [], found: 0 });

      await service.search({ query: '*', country: 'India' });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter_by: 'country:=India',
        }),
      );
    });

    it('should apply budget range filter', async () => {
      mockSearch.mockResolvedValue({ hits: [], found: 0 });

      await service.search({
        query: '*',
        budgetMin: 20000,
        budgetMax: 50000,
      });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter_by: 'tuitionFee:[20000..50000]',
        }),
      );
    });

    it('should combine multiple filters', async () => {
      mockSearch.mockResolvedValue({ hits: [], found: 0 });

      await service.search({
        query: '*',
        country: 'USA',
        budgetMin: 10000,
        budgetMax: 60000,
      });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          filter_by: 'country:=USA && tuitionFee:[10000..60000]',
        }),
      );
    });

    it('should handle search errors', async () => {
      mockSearch.mockRejectedValue(new Error('Search failed'));

      await expect(service.search({ query: 'test' })).rejects.toThrow(
        'Search failed',
      );
    });

    it('should handle empty results', async () => {
      mockSearch.mockResolvedValue({ hits: [], found: 0 });

      const result = await service.search({ query: 'nonexistent' });

      expect(result.hits).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should paginate correctly', async () => {
      mockSearch.mockResolvedValue({ hits: [], found: 50 });

      const result = await service.search({
        query: '*',
        page: 3,
        pageSize: 10,
      });

      expect(mockSearch).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 3,
          per_page: 10,
        }),
      );
      expect(result.totalPages).toBe(5);
    });
  });

  // -------------------------------------------
  // clearCollection
  // -------------------------------------------
  describe('clearCollection', () => {
    it('should delete the collection', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockDelete.mockResolvedValue({});

      await service.clearCollection();

      expect(mockDelete).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle non-existent collection gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockDelete.mockRejectedValue(new Error('Not found'));

      await service.clearCollection();

      expect(consoleSpy).toHaveBeenCalledWith('Collection does not exist');
      consoleSpy.mockRestore();
    });
  });
});
