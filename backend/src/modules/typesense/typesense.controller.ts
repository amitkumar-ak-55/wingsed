import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TypesenseService, SearchParams } from './typesense.service';

@Controller('search')
export class TypesenseController {
  constructor(private readonly typesenseService: TypesenseService) {}

  /**
   * Search universities using Typesense (public endpoint)
   */
  @Get('universities')
  @HttpCode(HttpStatus.OK)
  async searchUniversities(
    @Query('q') query?: string,
    @Query('country') country?: string,
    @Query('budgetMin') budgetMin?: string,
    @Query('budgetMax') budgetMax?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: SearchParams = {
      query: query || '*',
      country,
      budgetMin: budgetMin ? parseInt(budgetMin) : undefined,
      budgetMax: budgetMax ? parseInt(budgetMax) : undefined,
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 12,
    };

    return this.typesenseService.search(params);
  }
}
