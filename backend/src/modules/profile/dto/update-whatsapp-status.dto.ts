import { IsString, IsIn } from 'class-validator';

export class UpdateWhatsAppStatusDto {
  @IsString()
  @IsIn(['connected', 'no_response'])
  status: string;
}
