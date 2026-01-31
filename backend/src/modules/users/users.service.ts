import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: { studentProfile: true },
    });
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { studentProfile: true },
    });
  }

  /**
   * Create a new user (typically from Clerk webhook)
   */
  async create(data: { clerkId: string; email: string; role?: Role }): Promise<User> {
    return this.prisma.user.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        role: data.role || Role.STUDENT,
        onboardingStep: 0,
      },
    });
  }

  /**
   * Get or create user by Clerk ID
   */
  async getOrCreate(clerkId: string, email: string): Promise<User> {
    const existingUser = await this.findByClerkId(clerkId);
    if (existingUser) {
      return existingUser;
    }
    return this.create({ clerkId, email });
  }

  /**
   * Update user's onboarding step
   */
  async updateOnboardingStep(clerkId: string, step: number): Promise<User> {
    const user = await this.findByClerkId(clerkId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { clerkId },
      data: { onboardingStep: step },
      include: { studentProfile: true },
    });
  }

  /**
   * Delete user (cascade deletes profile)
   */
  async delete(clerkId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { clerkId },
    });
  }
}
