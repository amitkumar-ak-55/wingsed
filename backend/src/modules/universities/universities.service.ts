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
  constructor(private prisma: PrismaService) {}

  /**
   * Search universities with filters and pagination
   */
  async findMany(
    filters: UniversityFilters,
    page: number = 1,
    pageSize: number = 12,
  ): Promise<PaginatedResult<University>> {
    const where: Prisma.UniversityWhereInput = {};

    // Country filter
    if (filters.country) {
      where.country = filters.country;
    }

    // Budget range filter (convert INR to USD since tuitionFee is stored in USD)
    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      where.tuitionFee = {};
      if (filters.budgetMin !== undefined) {
        // Convert INR to USD
        where.tuitionFee.gte = Math.floor(filters.budgetMin / INR_TO_USD_RATE);
      }
      if (filters.budgetMax !== undefined) {
        // Convert INR to USD
        where.tuitionFee.lte = Math.ceil(filters.budgetMax / INR_TO_USD_RATE);
      }
    }

    // Text search (name, city)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.university.count({ where });

    // Get paginated results
    const data = await this.prisma.university.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
   * Get a single university by ID
   */
  async findById(id: string): Promise<University | null> {
    return this.prisma.university.findUnique({
      where: { id },
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
