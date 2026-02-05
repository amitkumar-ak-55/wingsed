import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApplicationsService, CreateApplicationDto, UpdateApplicationDto } from './applications.service';
import { ClerkAuthGuard, ClerkUser } from '../../common/guards/clerk-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('applications')
@UseGuards(ClerkAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  /**
   * Get all applications for the current user
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getApplications(@CurrentUser() user: ClerkUser) {
    const applications = await this.applicationsService.getApplications(user.id);
    return { applications };
  }

  /**
   * Get applications grouped by status (for Kanban view)
   */
  @Get('by-status')
  @HttpCode(HttpStatus.OK)
  async getApplicationsByStatus(@CurrentUser() user: ClerkUser) {
    const grouped = await this.applicationsService.getApplicationsByStatus(user.id);
    return { grouped };
  }

  /**
   * Get application stats for dashboard
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStats(@CurrentUser() user: ClerkUser) {
    const stats = await this.applicationsService.getStats(user.id);
    return { stats };
  }

  /**
   * Create a new application
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @CurrentUser() user: ClerkUser,
    @Body() dto: CreateApplicationDto,
  ) {
    const application = await this.applicationsService.createApplication(user.id, dto);
    return { application };
  }

  /**
   * Update an application
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateApplication(
    @CurrentUser() user: ClerkUser,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    const application = await this.applicationsService.updateApplication(user.id, id, dto);
    return { application };
  }

  /**
   * Delete an application
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteApplication(
    @CurrentUser() user: ClerkUser,
    @Param('id') id: string,
  ) {
    await this.applicationsService.deleteApplication(user.id, id);
  }
}
