import { Module } from '@nestjs/common';

import { AssistantModule } from '../assistant/assistant.module';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [AssistantModule], // Walksy writes the steps and the summary
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
