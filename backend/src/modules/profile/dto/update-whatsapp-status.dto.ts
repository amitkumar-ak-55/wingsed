import { IsString, IsIn, MaxLength } from 'class-validator';

export class UpdateWhatsAppStatusDto {
  @IsString()
  @MaxLength(100)
  @IsIn(['connected', 'no_response'])
  status: string;
}
