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
