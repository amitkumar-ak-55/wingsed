import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard, ClerkUser } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current authenticated user
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@CurrentUser() user: ClerkUser) {
    // Get or create user in our database
    const dbUser = await this.usersService.getOrCreate(user.id, user.email);
    return {
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      role: dbUser.role,
      onboardingStep: dbUser.onboardingStep,
      name: [user.firstName, user.lastName].filter(Boolean).join(' ') || null,
      studentProfile: (dbUser as any).studentProfile || null,
    };
  }

  /**
   * Update onboarding step
   */
  @Patch('onboarding-step')
  @HttpCode(HttpStatus.OK)
  async updateOnboardingStep(
    @CurrentUser() user: ClerkUser,
    @Body() dto: UpdateOnboardingStepDto,
  ) {
    const updatedUser = await this.usersService.updateOnboardingStep(user.id, dto.step);
    return {
      id: updatedUser.id,
      onboardingStep: updatedUser.onboardingStep,
    };
  }
}
