import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SavedUniversitiesService } from './saved-universities.service';
import { ClerkAuthGuard, ClerkUser } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('saved-universities')
@UseGuards(ClerkAuthGuard)
export class SavedUniversitiesController {
  constructor(private readonly savedUniversitiesService: SavedUniversitiesService) {}

  /**
   * Get all saved universities for the current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getSavedUniversities(@CurrentUser() user: ClerkUser) {
    const savedUniversities = await this.savedUniversitiesService.getSavedUniversities(user.id);
    return { savedUniversities };
  }

  /**
   * Get just the IDs of saved universities (for quick lookup on listing page)
   */
  @Get('ids')
  @HttpCode(HttpStatus.OK)
  async getSavedUniversityIds(@CurrentUser() user: ClerkUser) {
    const ids = await this.savedUniversitiesService.getSavedUniversityIds(user.id);
    return { ids };
  }

  /**
   * Save a university
   */
  @Post(':universityId')
  @HttpCode(HttpStatus.CREATED)
  async saveUniversity(
    @CurrentUser() user: ClerkUser,
    @Param('universityId') universityId: string,
  ) {
    const saved = await this.savedUniversitiesService.saveUniversity(user.id, universityId);
    return { saved };
  }

  /**
   * Unsave a university
   */
  @Delete(':universityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsaveUniversity(
    @CurrentUser() user: ClerkUser,
    @Param('universityId') universityId: string,
  ) {
    await this.savedUniversitiesService.unsaveUniversity(user.id, universityId);
  }

  /**
   * Check if a university is saved
   */
  @Get(':universityId/status')
  @HttpCode(HttpStatus.OK)
  async checkSaved(
    @CurrentUser() user: ClerkUser,
    @Param('universityId') universityId: string,
  ) {
    const isSaved = await this.savedUniversitiesService.isSaved(user.id, universityId);
    return { isSaved };
  }
}
