import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ClerkAuthGuard, ClerkUser } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateWhatsAppStatusDto } from './dto/update-whatsapp-status.dto';

@Controller('profile')
@UseGuards(ClerkAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  /**
   * Get current user's profile
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: ClerkUser) {
    const profile = await this.profileService.findByClerkId(user.id);
    return { profile };
  }

  /**
   * Create a new profile
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @CurrentUser() user: ClerkUser,
    @Body() dto: CreateProfileDto,
  ) {
    const profile = await this.profileService.create(user.id, dto);
    return { profile };
  }

  /**
   * Update profile (partial updates allowed)
   */
  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: ClerkUser,
    @Body() dto: UpdateProfileDto,
  ) {
    const profile = await this.profileService.update(user.id, dto);
    return { profile };
  }

  /**
   * Update WhatsApp connection status
   */
  @Patch('whatsapp-status')
  @HttpCode(HttpStatus.OK)
  async updateWhatsAppStatus(
    @CurrentUser() user: ClerkUser,
    @Body() dto: UpdateWhatsAppStatusDto,
  ) {
    const profile = await this.profileService.updateWhatsAppStatus(
      user.id,
      dto.status,
    );
    return { profile };
  }
}
