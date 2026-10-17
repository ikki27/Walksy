import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

// "All done!" page: the stars and which suggested reminders stay switched on
export class VisitFeedbackDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  // one value per suggested reminder, in the same order
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsBoolean({ each: true })
  reminders?: boolean[];
}
