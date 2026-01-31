import { IsIn } from 'class-validator';

export class UpdateFeedbackDto {
  @IsIn(['connected', 'no_response'])
  feedback: 'connected' | 'no_response';
}
