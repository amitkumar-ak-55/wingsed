import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService, CreateUniversityDto, UpdateUniversityDto } from './admin.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { AdminGuard } from '../../common/guards/admin.guard';

@Controller('admin')
@UseGuards(ClerkAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===========================================
  // Dashboard
  // ===========================================

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getDashboardStats() {
    const stats = await this.adminService.getDashboardStats();
    return { stats };
  }

  // ===========================================
  // Leads
  // ===========================================

  @Get('leads')
  @HttpCode(HttpStatus.OK)
  async getAllLeads(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('country') country?: string,
    @Query('feedback') feedback?: string,
    @Query('search') search?: string,
  ) {
    const result = await this.adminService.getAllLeads({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      country,
      feedback,
      search,
    });
    return result;
  }

  @Get('leads/:id')
  @HttpCode(HttpStatus.OK)
  async getLeadById(@Param('id') id: string) {
    const lead = await this.adminService.getLeadById(id);
    return { lead };
  }

  @Delete('leads/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLead(@Param('id') id: string) {
    await this.adminService.deleteLead(id);
  }

  // ===========================================
  // Universities
  // ===========================================

  @Get('universities')
  @HttpCode(HttpStatus.OK)
  async getAllUniversities(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('country') country?: string,
  ) {
    const result = await this.adminService.getAllUniversities({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      country,
    });
    return result;
  }

  @Post('universities')
  @HttpCode(HttpStatus.CREATED)
  async createUniversity(@Body() dto: CreateUniversityDto) {
    const university = await this.adminService.createUniversity(dto);
    return { university };
  }

  @Patch('universities/:id')
  @HttpCode(HttpStatus.OK)
  async updateUniversity(
    @Param('id') id: string,
    @Body() dto: UpdateUniversityDto,
  ) {
    const university = await this.adminService.updateUniversity(id, dto);
    return { university };
  }

  @Delete('universities/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUniversity(@Param('id') id: string) {
    await this.adminService.deleteUniversity(id);
  }

  // ===========================================
  // Users
  // ===========================================

  @Get('users')
  @HttpCode(HttpStatus.OK)
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    const result = await this.adminService.getAllUsers({
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      role,
    });
    return result;
  }

  @Patch('users/:id/role')
  @HttpCode(HttpStatus.OK)
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: 'STUDENT' | 'ADMIN' | 'COUNSELOR',
  ) {
    const user = await this.adminService.updateUserRole(id, role);
    return { user };
  }
}
