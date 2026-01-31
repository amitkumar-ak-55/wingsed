import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Typesense from 'typesense';
import { PrismaService } from '../../prisma/prisma.service';

export interface UniversitySearchResult {
  id: string;
  name: string;
  country: string;
  city: string;
  tuitionFee: number;
  publicPrivate: string;
  description: string | null;
}

export interface SearchParams {
  query: string;
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class TypesenseService implements OnModuleInit {
  private client: InstanceType<typeof Typesense.Client>;
  private readonly collectionName = 'universities';

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: this.configService.get<string>('TYPESENSE_HOST', 'localhost'),
          port: parseInt(this.configService.get<string>('TYPESENSE_PORT', '8108')),
          protocol: this.configService.get<string>('TYPESENSE_PROTOCOL', 'http'),
        },
      ],
      apiKey: this.configService.get<string>('TYPESENSE_API_KEY', 'wingsed_typesense_dev_key'),
      connectionTimeoutSeconds: 5,
    });
  }

  async onModuleInit() {
    try {
      // Check if Typesense is available
      await this.client.health.retrieve();
      console.log('✅ Typesense connected');
    } catch (error) {
      console.warn('⚠️ Typesense not available - search will use database fallback');
    }
  }

  /**
   * Create or update the universities collection schema
   */
  async createCollection(): Promise<void> {
    const schema = {
      name: this.collectionName,
      fields: [
        { name: 'id', type: 'string' as const },
        { name: 'name', type: 'string' as const },
        { name: 'country', type: 'string' as const, facet: true },
        { name: 'city', type: 'string' as const },
        { name: 'tuitionFee', type: 'int32' as const },
        { name: 'publicPrivate', type: 'string' as const, facet: true },
        { name: 'description', type: 'string' as const, optional: true },
      ],
      default_sorting_field: 'tuitionFee',
    };

    try {
      // Try to delete existing collection
      await this.client.collections(this.collectionName).delete();
    } catch {
      // Collection doesn't exist, that's fine
    }

    await this.client.collections().create(schema);
    console.log(`✅ Created Typesense collection: ${this.collectionName}`);
  }

  /**
   * Sync all universities from PostgreSQL to Typesense
   */
  async syncUniversities(): Promise<number> {
    const universities = await this.prisma.university.findMany();

    const documents = universities.map((uni) => ({
      id: uni.id,
      name: uni.name,
      country: uni.country,
      city: uni.city,
      tuitionFee: uni.tuitionFee,
      publicPrivate: uni.publicPrivate,
      description: uni.description || '',
    }));

    await this.client
      .collections(this.collectionName)
      .documents()
      .import(documents, { action: 'upsert' });

    console.log(`✅ Synced ${documents.length} universities to Typesense`);
    return documents.length;
  }

  /**
   * Search universities with Typesense
   */
  async search(params: SearchParams): Promise<{
    hits: UniversitySearchResult[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;

    // Build filter string
    const filters: string[] = [];
    
    if (params.country) {
      filters.push(`country:=${params.country}`);
    }
    
    if (params.budgetMin !== undefined && params.budgetMax !== undefined) {
      filters.push(`tuitionFee:[${params.budgetMin}..${params.budgetMax}]`);
    } else if (params.budgetMin !== undefined) {
      filters.push(`tuitionFee:>=${params.budgetMin}`);
    } else if (params.budgetMax !== undefined) {
      filters.push(`tuitionFee:<=${params.budgetMax}`);
    }

    try {
      const result = await this.client
        .collections(this.collectionName)
        .documents()
        .search({
          q: params.query || '*',
          query_by: 'name,city,description',
          filter_by: filters.length > 0 ? filters.join(' && ') : undefined,
          page,
          per_page: pageSize,
          sort_by: 'tuitionFee:asc',
        });

      const hits: UniversitySearchResult[] = (result.hits || []).map((hit: any) => {
        const doc = hit.document as UniversitySearchResult;
        return {
          id: doc.id,
          name: doc.name,
          country: doc.country,
          city: doc.city,
          tuitionFee: doc.tuitionFee,
          publicPrivate: doc.publicPrivate,
          description: doc.description,
        };
      });

      return {
        hits,
        total: result.found || 0,
        page,
        totalPages: Math.ceil((result.found || 0) / pageSize),
      };
    } catch (error) {
      console.error('Typesense search error:', error);
      throw error;
    }
  }

  /**
   * Clear all documents from collection
   */
  async clearCollection(): Promise<void> {
    try {
      await this.client.collections(this.collectionName).delete();
      console.log(`🗑️ Deleted Typesense collection: ${this.collectionName}`);
    } catch {
      console.log('Collection does not exist');
    }
  }
}
