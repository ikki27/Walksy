import { Module } from '@nestjs/common';

import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';

@Module({
  controllers: [AssistantController],
  providers: [AssistantService],
  // the visits module uses it for the "Help Me" guide and the summary
  exports: [AssistantService],
})
export class AssistantModule {}
