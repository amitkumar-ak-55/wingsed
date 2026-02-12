import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { TestTaken } from '@prisma/client';

export class CreateProfileDto {
  @IsString()
  @MaxLength(100)
  country: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  customDestination?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000000)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000000)
  budgetMax?: number;

  @IsString()
  @MaxLength(255)
  targetField: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  intake?: string;

  @IsEnum(TestTaken)
  testTaken: TestTaken;
}
