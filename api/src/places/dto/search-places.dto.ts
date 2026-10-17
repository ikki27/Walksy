import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const MIN_QUERY_LENGTH = 3;

export class SearchPlacesDto {
  // what the person typed, e.g. "lekarna tabor"
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(MIN_QUERY_LENGTH)
  @MaxLength(100)
  q: string;

  // app language code, e.g. "en" or "de"
  @IsOptional()
  @IsString()
  @Matches(/^[a-z]{2}(-[A-Za-z]+)?$/)
  lang?: string;
}
