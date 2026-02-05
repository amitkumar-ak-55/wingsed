import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { University, WhatsAppLead, User } from '@prisma/client';

// DTOs
export interface CreateUniversityDto {
  name: string;
  country: string;
  city: string;
  tuitionFee: number;
  publicPrivate: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface UpdateUniversityDto {
  name?: string;
  country?: string;
  city?: string;
  tuitionFee?: number;
  publicPrivate?: string;
  logoUrl?: string;
  websiteUrl?: string;
  description?: string;
}

export interface DashboardStats {
  totalLeads: number;
  leadsToday: number;
  leadsThisWeek: number;
  totalUsers: number;
  usersToday: number;
  totalUniversities: number;
  leadsByCountry: { country: string; count: number }[];
  recentLeads: WhatsAppLead[];
}

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // ===========================================
  // Dashboard Stats
  // ===========================================

  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalLeads,
      leadsToday,
      leadsThisWeek,
      totalUsers,
      usersToday,
      totalUniversities,
      leadsByCountry,
      recentLeads,
    ] = await Promise.all([
      this.prisma.whatsAppLead.count(),
      this.prisma.whatsAppLead.count({
        where: { redirectedAt: { gte: startOfDay } },
      }),
      this.prisma.whatsAppLead.count({
        where: { redirectedAt: { gte: startOfWeek } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      this.prisma.university.count(),
      this.prisma.whatsAppLead.groupBy({
        by: ['country'],
        _count: { country: true },
        orderBy: { _count: { country: 'desc' } },
        take: 10,
      }),
      this.prisma.whatsAppLead.findMany({
        orderBy: { redirectedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalLeads,
      leadsToday,
      leadsThisWeek,
      totalUsers,
      usersToday,
      totalUniversities,
      leadsByCountry: leadsByCountry.map((item) => ({
        country: item.country || 'Unknown',
        count: item._count.country,
      })),
      recentLeads,
    };
  }

  // ===========================================
  // Leads Management
  // ===========================================

  async getAllLeads(options?: {
    page?: number;
    limit?: number;
    country?: string;
    feedback?: string;
    search?: string;
  }): Promise<{ leads: WhatsAppLead[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.country) {
      where.country = options.country;
    }

    if (options?.feedback) {
      if (options.feedback === 'pending') {
        where.feedback = null;
      } else {
        where.feedback = options.feedback;
      }
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      this.prisma.whatsAppLead.findMany({
        where,
        orderBy: { redirectedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.whatsAppLead.count({ where }),
    ]);

    return {
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getLeadById(id: string): Promise<WhatsAppLead> {
    const lead = await this.prisma.whatsAppLead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }

  async updateLeadNotes(id: string, notes: string): Promise<WhatsAppLead> {
    // First check if lead exists
    await this.getLeadById(id);

    // Note: We'd need to add a 'notes' field to the schema
    // For now, using feedback field for status updates
    return this.prisma.whatsAppLead.update({
      where: { id },
      data: {
        // We'll need to add adminNotes field - for now just update feedback
        feedback: notes as any,
        feedbackAt: new Date(),
      },
    });
  }

  async deleteLead(id: string): Promise<void> {
    await this.getLeadById(id);
    await this.prisma.whatsAppLead.delete({ where: { id } });
  }

  // ===========================================
  // Universities Management
  // ===========================================

  async createUniversity(data: CreateUniversityDto): Promise<University> {
    return this.prisma.university.create({ data });
  }

  async updateUniversity(id: string, data: UpdateUniversityDto): Promise<University> {
    const existing = await this.prisma.university.findUnique({ where: { id } });
    
    if (!existing) {
      throw new NotFoundException('University not found');
    }

    return this.prisma.university.update({
      where: { id },
      data,
    });
  }

  async deleteUniversity(id: string): Promise<void> {
    const existing = await this.prisma.university.findUnique({ where: { id } });
    
    if (!existing) {
      throw new NotFoundException('University not found');
    }

    // Delete related records first (saved universities, applications)
    await this.prisma.savedUniversity.deleteMany({ where: { universityId: id } });
    await this.prisma.application.deleteMany({ where: { universityId: id } });
    
    await this.prisma.university.delete({ where: { id } });
  }

  async getAllUniversities(options?: {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
  }): Promise<{ universities: University[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { city: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    if (options?.country) {
      where.country = options.country;
    }

    const [universities, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.university.count({ where }),
    ]);

    return {
      universities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ===========================================
  // Users Management
  // ===========================================

  async getAllUsers(options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (options?.search) {
      where.email = { contains: options.search, mode: 'insensitive' };
    }

    if (options?.role) {
      where.role = options.role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { studentProfile: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserRole(userId: string, role: 'STUDENT' | 'ADMIN' | 'COUNSELOR'): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  }
}
