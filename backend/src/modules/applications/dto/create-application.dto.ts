import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @MaxLength(100)
  universityId: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  program?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  intake?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsDateString()
  deadline?: Date;
}
