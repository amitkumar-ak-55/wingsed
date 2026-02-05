import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedRequest } from './clerk-auth.guard';

/**
 * Guard that checks if the authenticated user has ADMIN role.
 * Must be used AFTER ClerkAuthGuard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    if (!request.user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Find user in database and check role
    const user = await this.prisma.user.findUnique({
      where: { clerkId: request.user.id },
      select: { role: true },
    });

    if (!user) {
      throw new ForbiddenException('User not found in database');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
