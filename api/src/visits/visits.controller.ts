import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/current-user.decorator';
import { CreateVisitDto } from './dto/create-visit.dto';
import { SdgStatsQueryDto } from './dto/sdg-stats-query.dto';
import { VisitFeedbackDto } from './dto/visit-feedback.dto';
import { VisitProgressDto } from './dto/visit-progress.dto';
import { VisitsService } from './visits.service';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  // GET /visits → all visits of the logged-in user, earliest first
  @Get()
  list(@CurrentUser() user: AuthUser) {
    return this.visitsService.list(user.id);
  }

  // GET /visits/sdg-stats?from=...&to=... → SDG contributions of completed visits in that period
  @Get('sdg-stats')
  sdgStats(@CurrentUser() user: AuthUser, @Query() query: SdgStatsQueryDto) {
    return this.visitsService.sdgStats(user.id, new Date(query.from), new Date(query.to));
  }

  // POST /visits → create (and optionally start) a visit
  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateVisitDto) {
    return this.visitsService.create(user.id, dto);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  start(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.transition(user.id, id, 'start');
  }

  @Post(':id/end')
  @HttpCode(HttpStatus.OK)
  end(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.transition(user.id, id, 'end');
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.transition(user.id, id, 'cancel');
  }

  // POST /visits/:id/help → the visit with its step-by-step guide, started
  @Post(':id/help')
  @HttpCode(HttpStatus.OK)
  help(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.prepareHelp(user.id, id);
  }

  // POST /visits/:id/progress { completedSteps } → remember the current step
  @Post(':id/progress')
  @HttpCode(HttpStatus.OK)
  progress(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: VisitProgressDto) {
    return this.visitsService.saveProgress(user.id, id, dto.completedSteps);
  }

  // POST /visits/:id/complete → last step done: ends the visit, adds summary + reminders
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.visitsService.complete(user.id, id);
  }

  // PATCH /visits/:id/feedback { rating?, reminders? } → "All done!" page choices
  @Patch(':id/feedback')
  feedback(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: VisitFeedbackDto) {
    return this.visitsService.saveFeedback(user.id, id, dto);
  }
}
