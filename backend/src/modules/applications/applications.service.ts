import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Application, ApplicationStatus, University } from '@prisma/client';

export interface CreateApplicationDto {
  universityId: string;
  program?: string;
  intake?: string;
  notes?: string;
  deadline?: Date;
}

export interface UpdateApplicationDto {
  status?: ApplicationStatus;
  program?: string;
  intake?: string;
  notes?: string;
  deadline?: Date;
  appliedAt?: Date;
}

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all applications for a user
   */
  async getApplications(clerkId: string): Promise<(Application & { university: University })[]> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.application.findMany({
      where: { userId: user.id },
      include: { university: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get applications grouped by status (for Kanban view)
   */
  async getApplicationsByStatus(clerkId: string): Promise<Record<ApplicationStatus, (Application & { university: University })[]>> {
    const applications = await this.getApplications(clerkId);
    
    const grouped: Record<ApplicationStatus, (Application & { university: University })[]> = {
      RESEARCHING: [],
      PREPARING: [],
      APPLIED: [],
      ACCEPTED: [],
      REJECTED: [],
    };

    for (const app of applications) {
      grouped[app.status].push(app);
    }

    return grouped;
  }

  /**
   * Create a new application
   */
  async createApplication(clerkId: string, dto: CreateApplicationDto): Promise<Application> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if university exists
    const university = await this.prisma.university.findUnique({
      where: { id: dto.universityId },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    // Check if application already exists
    const existing = await this.prisma.application.findUnique({
      where: {
        userId_universityId: {
          userId: user.id,
          universityId: dto.universityId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Application already exists for this university');
    }

    return this.prisma.application.create({
      data: {
        userId: user.id,
        universityId: dto.universityId,
        program: dto.program,
        intake: dto.intake,
        notes: dto.notes,
        deadline: dto.deadline,
      },
    });
  }

  /**
   * Update an application
   */
  async updateApplication(
    clerkId: string,
    applicationId: string,
    dto: UpdateApplicationDto,
  ): Promise<Application> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // If status is changing to APPLIED, set appliedAt
    const updateData: Record<string, unknown> = { ...dto };
    if (dto.status === 'APPLIED' && !application.appliedAt) {
      updateData.appliedAt = new Date();
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: updateData,
    });
  }

  /**
   * Delete an application
   */
  async deleteApplication(clerkId: string, applicationId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const application = await this.prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    await this.prisma.application.delete({
      where: { id: applicationId },
    });
  }

  /**
   * Get application stats for dashboard
   */
  async getStats(clerkId: string): Promise<{
    total: number;
    byStatus: Record<ApplicationStatus, number>;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return {
        total: 0,
        byStatus: {
          RESEARCHING: 0,
          PREPARING: 0,
          APPLIED: 0,
          ACCEPTED: 0,
          REJECTED: 0,
        },
      };
    }

    const applications = await this.prisma.application.findMany({
      where: { userId: user.id },
      select: { status: true },
    });

    const byStatus: Record<ApplicationStatus, number> = {
      RESEARCHING: 0,
      PREPARING: 0,
      APPLIED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    };

    for (const app of applications) {
      byStatus[app.status]++;
    }

    return {
      total: applications.length,
      byStatus,
    };
  }
}
