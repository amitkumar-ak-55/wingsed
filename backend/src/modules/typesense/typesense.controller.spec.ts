// ===========================================
// TypesenseController Unit Tests
// ===========================================

import { Test, TestingModule } from '@nestjs/testing';
import { TypesenseController } from './typesense.controller';
import { TypesenseService } from './typesense.service';

describe('TypesenseController', () => {
  let controller: TypesenseController;
  let service: jest.Mocked<TypesenseService>;

  beforeEach(async () => {
    const mockService = {
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypesenseController],
      providers: [
        { provide: TypesenseService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<TypesenseController>(TypesenseController);
    service = module.get(TypesenseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('searchUniversities', () => {
    it('should search with default parameters', async () => {
      service.search.mockResolvedValue({
        hits: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      await controller.searchUniversities();

      expect(service.search).toHaveBeenCalledWith({
        query: '*',
        country: undefined,
        budgetMin: undefined,
        budgetMax: undefined,
        page: 1,
        pageSize: 12,
      });
    });

    it('should pass all query parameters', async () => {
      service.search.mockResolvedValue({
        hits: [{ id: '1', name: 'MIT', country: 'US', city: 'Cambridge', tuitionFee: 55000, publicPrivate: 'Private', description: null }],
        total: 1,
        page: 2,
        totalPages: 1,
      });

      const result = await controller.searchUniversities(
        'MIT',
        'United States',
        '20000',
        '60000',
        '2',
        '6',
      );

      expect(service.search).toHaveBeenCalledWith({
        query: 'MIT',
        country: 'United States',
        budgetMin: 20000,
        budgetMax: 60000,
        page: 2,
        pageSize: 6,
      });
      expect(result.hits).toHaveLength(1);
    });

    it('should handle empty query as wildcard', async () => {
      service.search.mockResolvedValue({
        hits: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });

      await controller.searchUniversities('');

      // The controller converts empty string to '' but the actual param defaults to query || '*'
      expect(service.search).toHaveBeenCalledWith(
        expect.objectContaining({ query: '*' }),
      );
    });
  });
});
