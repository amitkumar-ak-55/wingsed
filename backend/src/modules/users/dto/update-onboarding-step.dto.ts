import { IsInt, Min, Max } from 'class-validator';

export class UpdateOnboardingStepDto {
  @IsInt()
  @Min(0)
  @Max(5)
  step: number;
}
