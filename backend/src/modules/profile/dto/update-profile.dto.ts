import {
  IsString,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';
import { TestTaken } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetMax?: number;

  @IsOptional()
  @IsString()
  targetField?: string;

  @IsOptional()
  @IsString()
  intake?: string;

  @IsOptional()
  @IsEnum(TestTaken)
  testTaken?: TestTaken;

  @IsOptional()
  @IsString()
  postWhatsAppStatus?: string;
}
