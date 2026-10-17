import { Transform } from 'class-transformer';
import { Equals, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { UserType } from '../../generated/prisma/enums';

export const MIN_PASSWORD_LENGTH = 8;

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(128)
  password: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @IsEnum(UserType)
  userType: UserType;

  // app language at sign-up, e.g. "en" or "de"
  @IsOptional()
  @Matches(/^[a-z]{2}(-[A-Za-z]+)?$/)
  language?: string;

  // the Terms of Use checkbox must be ticked
  @Equals(true)
  termsAccepted: boolean;
}
