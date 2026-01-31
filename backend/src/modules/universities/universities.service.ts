import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { University, Prisma } from '@prisma/client';

export interface UniversityFilters {
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
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

    // Budget range filter
    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      where.tuitionFee = {};
      if (filters.budgetMin !== undefined) {
        where.tuitionFee.gte = filters.budgetMin;
      }
      if (filters.budgetMax !== undefined) {
        where.tuitionFee.lte = filters.budgetMax;
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
}
