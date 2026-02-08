import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class CreateWhatsAppLeadDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(255)
  targetField?: string;
}
