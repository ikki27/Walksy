import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { CHAT_ROLES, PLACE_CATEGORIES } from '../assistant.types';
import type { ChatRole, PlaceCategory } from '../assistant.types';

export const MAX_MESSAGE_LENGTH = 1000;
export const MAX_HISTORY_MESSAGES = 20;

export class ChatMessageDto {
  @IsIn(CHAT_ROLES)
  role: ChatRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_MESSAGE_LENGTH)
  content: string;
}

export class AssistantContextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  placeName: string;

  @IsIn(PLACE_CATEGORIES)
  category: PlaceCategory;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  accessibilityNeeds: string[];

  @IsString()
  @MaxLength(10)
  language: string;

  @IsString()
  @MaxLength(20)
  companionName: string;
}

export class ChatRequestDto {
  @ValidateNested()
  @Type(() => AssistantContextDto)
  context: AssistantContextDto;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_HISTORY_MESSAGES)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
