import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator';

import { AssistantContextDto } from './chat-request.dto';

export class GuideRequestDto {
  @ValidateNested()
  @Type(() => AssistantContextDto)
  context: AssistantContextDto;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  topic: string;
}
