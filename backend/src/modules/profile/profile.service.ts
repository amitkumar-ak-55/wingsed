import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StudentProfile, TestTaken } from '@prisma/client';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get profile by user's Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<StudentProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    });

    return user?.studentProfile || null;
  }

  /**
   * Create a new student profile
   */
  async create(clerkId: string, dto: CreateProfileDto): Promise<StudentProfile> {
    // Find user by Clerk ID
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.studentProfile) {
      throw new ConflictException('Profile already exists');
    }

    // Create profile
    return this.prisma.studentProfile.create({
      data: {
        userId: user.id,
        country: dto.country,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        targetField: dto.targetField,
        intake: dto.intake,
        testTaken: dto.testTaken,
      },
    });
  }

  /**
   * Update existing profile (partial update supported)
   */
  async update(clerkId: string, dto: UpdateProfileDto): Promise<StudentProfile> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // If profile doesn't exist, create it
    if (!user.studentProfile) {
      // For update with partial data, we need minimum required fields
      const createData: CreateProfileDto = {
        country: dto.country || 'Undecided',
        targetField: dto.targetField || 'Undecided',
        testTaken: dto.testTaken || TestTaken.NONE,
        budgetMin: dto.budgetMin,
        budgetMax: dto.budgetMax,
        intake: dto.intake,
      };

      return this.prisma.studentProfile.create({
        data: {
          userId: user.id,
          ...createData,
        },
      });
    }

    // Update existing profile
    return this.prisma.studentProfile.update({
      where: { userId: user.id },
      data: {
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.budgetMin !== undefined && { budgetMin: dto.budgetMin }),
        ...(dto.budgetMax !== undefined && { budgetMax: dto.budgetMax }),
        ...(dto.targetField !== undefined && { targetField: dto.targetField }),
        ...(dto.intake !== undefined && { intake: dto.intake }),
        ...(dto.testTaken !== undefined && { testTaken: dto.testTaken }),
        ...(dto.postWhatsAppStatus !== undefined && { postWhatsAppStatus: dto.postWhatsAppStatus }),
      },
    });
  }

  /**
   * Update WhatsApp status
   */
  async updateWhatsAppStatus(
    clerkId: string,
    status: string,
  ): Promise<StudentProfile> {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    });

    if (!user?.studentProfile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.studentProfile.update({
      where: { userId: user.id },
      data: { postWhatsAppStatus: status },
    });
  }
}
