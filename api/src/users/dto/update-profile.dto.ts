import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { AccessibilityNeed } from '../../generated/prisma/enums';

// every field is optional: the app sends only what changed
export class UpdateProfileDto {
  @IsOptional()
  @Matches(/^[a-z]{2}(-[A-Za-z]+)?$/)
  language?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  companionName?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsEnum(AccessibilityNeed, { each: true })
  accessibilityNeeds?: AccessibilityNeed[];

  // GDPR consent for storing accessibility needs (health data); false = withdraw
  @IsOptional()
  @IsBoolean()
  healthDataConsent?: boolean;
}
