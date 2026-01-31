import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';
import { TestTaken } from '@prisma/client';

export class CreateProfileDto {
  @IsString()
  country: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsString()
  targetField: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsEnum(TestTaken)
  testTaken: TestTaken;
}
