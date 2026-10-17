import { IsInt, Max, Min } from 'class-validator';

export class VisitProgressDto {
  // how many steps are done (0 = on the first step)
  @IsInt()
  @Min(0)
  @Max(10)
  completedSteps: number;
}
