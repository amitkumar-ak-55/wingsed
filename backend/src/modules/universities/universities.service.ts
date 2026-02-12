import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { University, Prisma } from '@prisma/client';

// INR to USD conversion rate
const INR_TO_USD_RATE = 83;

export interface UniversityFilters {
  country?: string;
  budgetMin?: number; // in INR
  budgetMax?: number; // in INR
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class UniversitiesService {
  constructor(private prisma: PrismaService) { }

  /**
   * Search universities with filters and pagination
   */
  async findMany(
    filters: UniversityFilters,
    page: number = 1,
    pageSize: number = 12,
  ): Promise<PaginatedResult<University>> {
    // When search term is present, use pg_trgm fuzzy matching via raw SQL
    if (filters.search && filters.search.trim().length > 0) {
      return this.fuzzySearch(filters, page, pageSize);
    }

    // Non-search queries use Prisma
    const where: Prisma.UniversityWhereInput = {};

    if (filters.country) {
      where.country = filters.country;
    }

    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      where.tuitionFee = {};
      if (filters.budgetMin !== undefined) {
        where.tuitionFee.gte = Math.floor(filters.budgetMin / INR_TO_USD_RATE);
      }
      if (filters.budgetMax !== undefined) {
        where.tuitionFee.lte = Math.ceil(filters.budgetMax / INR_TO_USD_RATE);
      }
    }

    const total = await this.prisma.university.count({ where });

    const data = await this.prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { programs: true },
    });

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Fuzzy search using pg_trgm for typo tolerance
   * Searches name, city, and description with similarity scoring
   */
  private async fuzzySearch(
    filters: UniversityFilters,
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<University>> {
    const searchTerm = filters.search!.trim();
    const offset = (page - 1) * pageSize;

    // Build dynamic WHERE conditions
    const conditions: string[] = [
      `(
        name % $1
        OR city % $1
        OR name ILIKE '%' || $1 || '%'
        OR city ILIKE '%' || $1 || '%'
        OR description ILIKE '%' || $1 || '%'
      )`,
    ];
    const params: (string | number)[] = [searchTerm];
    let paramIndex = 2;

    if (filters.country) {
      conditions.push(`country = $${paramIndex}`);
      params.push(filters.country);
      paramIndex++;
    }

    if (filters.budgetMin !== undefined) {
      const minUSD = Math.floor(filters.budgetMin / INR_TO_USD_RATE);
      conditions.push(`"tuitionFee" >= $${paramIndex}`);
      params.push(minUSD);
      paramIndex++;
    }

    if (filters.budgetMax !== undefined) {
      const maxUSD = Math.ceil(filters.budgetMax / INR_TO_USD_RATE);
      conditions.push(`"tuitionFee" <= $${paramIndex}`);
      params.push(maxUSD);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Count query
    const countResult = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM universities WHERE ${whereClause}`,
      ...params,
    );
    const total = Number(countResult[0].count);

    // Data query with similarity scoring for relevance ranking
    const data = await this.prisma.$queryRawUnsafe<University[]>(
      `SELECT *,
        GREATEST(
          similarity(name, $1),
          similarity(city, $1)
        ) as search_score
      FROM universities
      WHERE ${whereClause}
      ORDER BY search_score DESC, name ASC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      ...params,
      pageSize,
      offset,
    );

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single university by ID with programs
   */
  async findById(id: string) {
    return this.prisma.university.findUnique({
      where: { id },
      include: { programs: true },
    });
  }

  /**
   * Get all unique countries for filter dropdown
   */
  async getCountries(): Promise<string[]> {
    const result = await this.prisma.university.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });
    return result.map((r) => r.country);
  }

  /**
   * Get university count (for landing page stats)
   */
  async getCount(): Promise<number> {
    return this.prisma.university.count();
  }

  /**
   * Get personalized recommendations based on user profile
   */
  async getRecommendations(
    preferredCountry?: string,
    budgetMin?: number, // in INR
    budgetMax?: number, // in INR
    limit: number = 6,
  ): Promise<University[]> {
    const where: Prisma.UniversityWhereInput = {};

    // Filter by preferred country if provided
    if (preferredCountry) {
      where.country = preferredCountry;
    }

    // Budget range filter (convert INR to USD)
    if (budgetMin !== undefined || budgetMax !== undefined) {
      where.tuitionFee = {};
      if (budgetMin !== undefined) {
        where.tuitionFee.gte = Math.floor(budgetMin / INR_TO_USD_RATE);
      }
      if (budgetMax !== undefined) {
        where.tuitionFee.lte = Math.ceil(budgetMax / INR_TO_USD_RATE);
      }
    }

    // Get matching universities
    let recommendations = await this.prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
      take: limit,
    });

    // If not enough results, fill with random universities from other criteria
    if (recommendations.length < limit) {
      const existingIds = recommendations.map((u) => u.id);
      const additional = await this.prisma.university.findMany({
        where: {
          id: { notIn: existingIds },
        },
        orderBy: { tuitionFee: 'asc' }, // Prefer affordable options
        take: limit - recommendations.length,
      });
      recommendations = [...recommendations, ...additional];
    }

    return recommendations;
  }
}
