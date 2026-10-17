import { IsDateString } from 'class-validator';

// the period to count, in the app's local time (e.g. the start and end of "This month")
export class SdgStatsQueryDto {
  @IsDateString()
  from: string;

  @IsDateString()
  to: string;
}
