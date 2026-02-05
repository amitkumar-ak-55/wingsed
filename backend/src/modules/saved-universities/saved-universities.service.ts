import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SavedUniversity, University } from '@prisma/client';

@Injectable()
export class SavedUniversitiesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all saved universities for a user (by clerkId)
   */
  async getSavedUniversities(clerkId: string): Promise<(SavedUniversity & { university: University })[]> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.savedUniversity.findMany({
      where: { userId: user.id },
      include: { university: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get list of saved university IDs for a user (for quick lookup)
   */
  async getSavedUniversityIds(clerkId: string): Promise<string[]> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return [];
    }

    const saved = await this.prisma.savedUniversity.findMany({
      where: { userId: user.id },
      select: { universityId: true },
    });

    return saved.map((s) => s.universityId);
  }

  /**
   * Save a university for a user
   */
  async saveUniversity(clerkId: string, universityId: string): Promise<SavedUniversity> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if university exists
    const university = await this.prisma.university.findUnique({
      where: { id: universityId },
    });

    if (!university) {
      throw new NotFoundException('University not found');
    }

    // Check if already saved
    const existing = await this.prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: {
          userId: user.id,
          universityId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('University already saved');
    }

    return this.prisma.savedUniversity.create({
      data: {
        userId: user.id,
        universityId,
      },
    });
  }

  /**
   * Remove a saved university
   */
  async unsaveUniversity(clerkId: string, universityId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saved = await this.prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: {
          userId: user.id,
          universityId,
        },
      },
    });

    if (!saved) {
      throw new NotFoundException('Saved university not found');
    }

    await this.prisma.savedUniversity.delete({
      where: { id: saved.id },
    });
  }

  /**
   * Check if a university is saved by a user
   */
  async isSaved(clerkId: string, universityId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return false;
    }

    const saved = await this.prisma.savedUniversity.findUnique({
      where: {
        userId_universityId: {
          userId: user.id,
          universityId,
        },
      },
    });

    return !!saved;
  }
}
