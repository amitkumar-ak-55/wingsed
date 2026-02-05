import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { GetUniversitiesDto } from './dto/get-universities.dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  /**
   * Get universities with filters (public endpoint)
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUniversities(@Query() query: GetUniversitiesDto) {
    const result = await this.universitiesService.findMany(
      {
        country: query.country,
        budgetMin: query.budgetMin,
        budgetMax: query.budgetMax,
        search: query.search,
      },
      query.page,
      query.pageSize,
    );
    return result;
  }

  /**
   * Get list of countries for filter dropdown (public endpoint)
   */
  @Get('countries')
  @HttpCode(HttpStatus.OK)
  async getCountries() {
    const countries = await this.universitiesService.getCountries();
    return { countries };
  }

  /**
   * Get university count (public endpoint for stats)
   */
  @Get('count')
  @HttpCode(HttpStatus.OK)
  async getCount() {
    const count = await this.universitiesService.getCount();
    return { count };
  }

  /**
   * Get personalized recommendations (public endpoint)
   * Uses query params for preferences (can be from profile or URL)
   */
  @Get('recommendations')
  @HttpCode(HttpStatus.OK)
  async getRecommendations(
    @Query('country') country?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('limit') limit?: string,
  ) {
    const recommendations = await this.universitiesService.getRecommendations(
      country,
      budgetMin ? parseInt(budgetMin, 10) : undefined,
      budgetMax ? parseInt(budgetMax, 10) : undefined,
      limit ? parseInt(limit, 10) : 6,
    );
    return { recommendations };
  }

  /**
   * Get single university by ID (public endpoint)
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUniversity(@Param('id') id: string) {
    const university = await this.universitiesService.findById(id);
    if (!university) {
      throw new NotFoundException('University not found');
    }
    return { university };
  }
}
