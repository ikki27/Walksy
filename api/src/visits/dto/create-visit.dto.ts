import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { PlaceCategory } from '../../generated/prisma/enums';
import { VisitGuideDto } from './visit-guide.dto';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

// the place as the app got it from /places/search
export class VisitPlaceDto {
  // LocationIQ's id for the place
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  id: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @Transform(trim)
  @IsString()
  @MaxLength(300)
  address: string;

  @IsEnum(PlaceCategory)
  category: PlaceCategory;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}

export class CreateVisitDto {
  @ValidateNested()
  @Type(() => VisitPlaceDto)
  place: VisitPlaceDto;

  // what the visit is for, e.g. "Pay bills"
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsDateString()
  startsAt: string;

  @IsBoolean()
  notifyPlace: boolean;

  @IsBoolean()
  rideRequested: boolean;

  // true = "Start visit" (starts right away), false = "Done" (scheduled)
  @IsBoolean()
  start: boolean;

  // guide from the chat, if the person tapped a suggestion card (otherwise made on "Help Me")
  @IsOptional()
  @ValidateNested()
  @Type(() => VisitGuideDto)
  guide?: VisitGuideDto;
}
