import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { University, Prisma } from '@prisma/client';

// INR to USD conversion rate
const INR_TO_USD_RATE = 83;
const DEFAULT_BUDGET_CAP_USD = 60000;

type UniversityWithPrograms = Prisma.UniversityGetPayload<{
  include: { programs: true };
}>;

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

export type AdmitBucket = 'Safe' | 'Target' | 'Reach';

export interface ScoredUniversity {
  university: UniversityWithPrograms;
  score: number;
  bucket: AdmitBucket;
  annualCostUsd: number;
  fit: {
    affordability: number;
    admit: number;
    quality: number;
    outcomes: number;
  };
}

export interface LiveRecommendationResult {
  recommendations: ScoredUniversity[];
  summary: {
    chance: number;
    profileStrength: 'Building' | 'Moderate' | 'Strong';
    safeCount: number;
    targetCount: number;
    reachCount: number;
  };
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
    const result = await this.getLiveRecommendations({
      country: preferredCountry,
      budgetMin,
      budgetMax,
      limit,
    });

    return result.recommendations.map((item) => item.university);
  }

  async getLiveRecommendations(options: {
    country?: string;
    budgetMin?: number;
    budgetMax?: number;
    gpa?: number;
    limit?: number;
  }): Promise<LiveRecommendationResult> {
    const limit = Math.min(Math.max(options.limit ?? 6, 1), 12);
    const where: Prisma.UniversityWhereInput = {};

    if (options.country) {
      where.country = options.country;
    }

    const universities = await this.prisma.university.findMany({
      where,
      orderBy: [{ qsRanking: 'asc' }, { name: 'asc' }],
      include: { programs: true },
    });

    const scored = universities
      .map((university) => this.scoreUniversity(university, options))
      .sort((a, b) => b.score - a.score || a.university.name.localeCompare(b.university.name));

    const recommendations = this.pickBalancedShortlist(scored, limit);
    const chance = recommendations.length > 0
      ? Math.round(
        recommendations.reduce((total, item) => total + item.score, 0) / recommendations.length,
      )
      : 0;

    const safeCount = scored.filter((item) => item.bucket === 'Safe').length;
    const targetCount = scored.filter((item) => item.bucket === 'Target').length;
    const reachCount = scored.filter((item) => item.bucket === 'Reach').length;

    return {
      recommendations,
      summary: {
        chance,
        profileStrength: chance >= 78 ? 'Strong' : chance >= 58 ? 'Moderate' : 'Building',
        safeCount,
        targetCount,
        reachCount,
      },
    };
  }

  private scoreUniversity(
    university: UniversityWithPrograms,
    options: { budgetMin?: number; budgetMax?: number; gpa?: number },
  ): ScoredUniversity {
    const annualCostUsd = this.getEstimatedAnnualCostUsd(university);
    const affordability = this.getAffordabilityScore(
      annualCostUsd,
      options.budgetMin,
      options.budgetMax,
    );
    const admit = this.getAdmitScore(university, options.gpa);
    const quality = this.getQualityScore(university);
    const outcomes = this.getOutcomeScore(university);
    const score = Math.round(
      affordability * 0.35 +
      admit * 0.35 +
      quality * 0.2 +
      outcomes * 0.1,
    );

    return {
      university,
      score,
      bucket: this.getBucket(score, admit, affordability),
      annualCostUsd,
      fit: {
        affordability: Math.round(affordability),
        admit: Math.round(admit),
        quality: Math.round(quality),
        outcomes: Math.round(outcomes),
      },
    };
  }

  private pickBalancedShortlist(scored: ScoredUniversity[], limit: number): ScoredUniversity[] {
    const shortlist: ScoredUniversity[] = [];
    const buckets: AdmitBucket[] = ['Safe', 'Target', 'Reach'];

    for (const bucket of buckets) {
      const match = scored.find((item) => item.bucket === bucket && !shortlist.includes(item));
      if (match) {
        shortlist.push(match);
      }
    }

    for (const item of scored) {
      if (shortlist.length >= limit) {
        break;
      }
      if (!shortlist.includes(item)) {
        shortlist.push(item);
      }
    }

    return shortlist
      .slice(0, limit)
      .sort((a, b) => this.bucketOrder(a.bucket) - this.bucketOrder(b.bucket) || b.score - a.score);
  }

  private getEstimatedAnnualCostUsd(university: UniversityWithPrograms): number {
    const housingCost = university.foodHousingCost ?? 0;
    const scholarship = university.avgScholarshipAmount ?? 0;
    return Math.max(0, university.tuitionFee + housingCost - scholarship);
  }

  private getAffordabilityScore(
    annualCostUsd: number,
    budgetMin?: number,
    budgetMax?: number,
  ): number {
    const budgetCapUsd = budgetMax !== undefined
      ? budgetMax / INR_TO_USD_RATE
      : budgetMin !== undefined
        ? (budgetMin / INR_TO_USD_RATE) * 1.25
        : DEFAULT_BUDGET_CAP_USD;

    if (annualCostUsd <= budgetCapUsd) {
      return 100;
    }

    const overage = annualCostUsd / budgetCapUsd;
    if (overage <= 1.15) return 84;
    if (overage <= 1.35) return 66;
    if (overage <= 1.6) return 48;
    return 30;
  }

  private getAdmitScore(university: UniversityWithPrograms, gpa?: number): number {
    const gpaScore = this.getGpaFitScore(university, gpa);
    const acceptanceScore = university.acceptanceRate == null
      ? 68
      : this.clamp(25 + university.acceptanceRate * 180, 25, 92);

    return gpa === undefined
      ? Math.round(acceptanceScore)
      : Math.round(gpaScore * 0.55 + acceptanceScore * 0.45);
  }

  private getGpaFitScore(university: UniversityWithPrograms, gpa?: number): number {
    if (gpa === undefined) {
      return 70;
    }

    const programMinimums = (university.programs ?? [])
      .map((program) => program.gpaMinScore)
      .filter((minimum): minimum is number => minimum != null);
    const gpaMinimum = programMinimums.length > 0 ? Math.min(...programMinimums) : 3.2;
    const delta = gpa - gpaMinimum;

    if (delta >= 0.35) return 96;
    if (delta >= 0.15) return 88;
    if (delta >= 0) return 78;
    if (delta >= -0.2) return 62;
    if (delta >= -0.45) return 45;
    return 28;
  }

  private getQualityScore(university: UniversityWithPrograms): number {
    const rankings = [
      university.qsRanking,
      university.timesRanking,
      university.usNewsRanking,
    ].filter((ranking): ranking is number => ranking != null);

    if (rankings.length === 0) {
      return 58;
    }

    const bestRanking = Math.min(...rankings);
    return this.clamp(100 - ((bestRanking - 1) / 500) * 70, 30, 100);
  }

  private getOutcomeScore(university: UniversityWithPrograms): number {
    const employment = university.employmentRate == null
      ? 68
      : this.clamp(university.employmentRate * 100, 35, 100);
    const internationalShare = university.internationalStudentPercent == null
      ? 65
      : this.clamp(55 + university.internationalStudentPercent * 100, 45, 95);

    return employment * 0.7 + internationalShare * 0.3;
  }

  private getBucket(score: number, admit: number, affordability: number): AdmitBucket {
    if (admit >= 80 && affordability >= 78 && score >= 78) {
      return 'Safe';
    }
    if (admit < 64 || score < 68) {
      return 'Reach';
    }
    return 'Target';
  }

  private bucketOrder(bucket: AdmitBucket): number {
    return ['Safe', 'Target', 'Reach'].indexOf(bucket);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
