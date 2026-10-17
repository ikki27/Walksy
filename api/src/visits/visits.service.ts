import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import { AssistantService } from '../assistant/assistant.service';
import type { AssistantContextDto } from '../assistant/dto/chat-request.dto';
import { ApiError } from '../common/api-error';
import type { Place, User, Visit } from '../generated/prisma/client';
import { VisitStatus } from '../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateVisitDto } from './dto/create-visit.dto';
import type { VisitFeedbackDto } from './dto/visit-feedback.dto';
import { getVisitSdgs } from './sdg';
import { readGuide, readReminders, toVisitResponse } from './visit.mapper';

const MAX_STATS_RANGE_DAYS = 366;

const MINUTE = 60 * 1000;
const VISIT_DURATION_MINUTES = 60; // until visits have a real end time
// a visit may start a little in the past (the screen was open for a while)
const START_TOLERANCE_MINUTES = 5;
const PLACE_PROVIDER = 'locationiq';

// which status a visit must have for each action
const TRANSITIONS = {
  start: { from: VisitStatus.scheduled, to: VisitStatus.active },
  end: { from: VisitStatus.active, to: VisitStatus.completed },
  cancel: { from: VisitStatus.scheduled, to: VisitStatus.cancelled },
} as const;

export type VisitAction = keyof typeof TRANSITIONS;

type VisitWithPlace = Visit & { place: Place };

@Injectable()
export class VisitsService {
  private readonly logger = new Logger(VisitsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assistant: AssistantService,
  ) {}

  async list(userId: string) {
    const visits = await this.prisma.visit.findMany({
      where: { userId },
      include: { place: true },
      orderBy: { startsAt: 'asc' },
    });
    return visits.map(toVisitResponse);
  }

  async create(userId: string, dto: CreateVisitDto) {
    const now = new Date();
    const startsAt = dto.start ? now : new Date(dto.startsAt);
    if (startsAt.getTime() < now.getTime() - START_TOLERANCE_MINUTES * MINUTE) {
      throw new ApiError('starts_in_past', HttpStatus.BAD_REQUEST);
    }

    // places are shared: reuse the stored one, refresh its details
    const { id: providerPlaceId, ...details } = dto.place;
    const place = await this.prisma.place.upsert({
      where: { provider_providerPlaceId: { provider: PLACE_PROVIDER, providerPlaceId } },
      create: { provider: PLACE_PROVIDER, providerPlaceId, ...details },
      update: details,
    });

    const visit = await this.prisma.visit.create({
      data: {
        userId,
        placeId: place.id,
        title: dto.title,
        startsAt,
        endsAt: new Date(startsAt.getTime() + VISIT_DURATION_MINUTES * MINUTE),
        status: dto.start ? VisitStatus.active : VisitStatus.scheduled,
        startedAt: dto.start ? now : null,
        notifyPlace: dto.notifyPlace,
        rideRequested: dto.rideRequested,
        guide: dto.guide ? { documents: dto.guide.documents, steps: dto.guide.steps } : undefined,
      },
      include: { place: true },
    });
    return toVisitResponse(visit);
  }

  // start / end / cancel, only from the right status
  async transition(userId: string, visitId: string, action: VisitAction) {
    const visit = await this.findOwn(userId, visitId);

    const { from, to } = TRANSITIONS[action];
    if (visit.status !== from) throw new ApiError('invalid_visit_state', HttpStatus.CONFLICT);

    const now = new Date();
    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: to,
        ...(action === 'start' && { startedAt: now }),
        ...(action === 'end' && { endedAt: now }),
        ...(action === 'cancel' && { cancelledAt: now }),
      },
      include: { place: true },
    });
    return toVisitResponse(updated);
  }

  // "Help Me": makes sure the visit has its steps (Walksy writes them if needed) and is running
  async prepareHelp(userId: string, visitId: string) {
    const visit = await this.findOwn(userId, visitId);
    if (visit.status === VisitStatus.completed) return toVisitResponse(visit); // the app shows "All done!"
    if (visit.status === VisitStatus.cancelled) throw new ApiError('invalid_visit_state', HttpStatus.CONFLICT);

    const guide = readGuide(visit.guide) ?? (await this.assistantCall(async () => {
      const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
      return this.assistant.createGuide({ context: toAssistantContext(user, visit.place), topic: visit.title });
    }));

    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        guide,
        // getting help means the visit is happening now
        ...(visit.status === VisitStatus.scheduled && { status: VisitStatus.active, startedAt: new Date() }),
      },
      include: { place: true },
    });
    return toVisitResponse(updated);
  }

  // remembers how far the person got, so "Pause help" can continue later
  async saveProgress(userId: string, visitId: string, completedSteps: number) {
    const visit = await this.findOwn(userId, visitId);
    const guide = readGuide(visit.guide);
    if (visit.status !== VisitStatus.active || !guide) throw new ApiError('invalid_visit_state', HttpStatus.CONFLICT);

    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      // the last step is finished with "complete", not here
      data: { currentStep: Math.min(completedSteps, guide.steps.length - 1) },
      include: { place: true },
    });
    return toVisitResponse(updated);
  }

  // last step done: the visit ends, Walksy writes the summary + reminders
  async complete(userId: string, visitId: string) {
    const visit = await this.findOwn(userId, visitId);
    if (visit.status === VisitStatus.completed) return toVisitResponse(visit);
    if (visit.status !== VisitStatus.active) throw new ApiError('invalid_visit_state', HttpStatus.CONFLICT);

    const guide = readGuide(visit.guide);
    let summary: { summary: string; reminders: string[] } | null = null;
    if (guide) {
      try {
        const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
        summary = await this.assistant.createSummary(toAssistantContext(user, visit.place), visit.title, guide.steps);
      } catch (error) {
        // finishing must never fail because of the AI: the visit ends without a summary
        this.logger.warn(`Summary for visit ${visit.id} failed: ${this.assistant.toErrorCode(error)}`);
      }
    }

    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      data: {
        status: VisitStatus.completed,
        endedAt: new Date(),
        currentStep: guide?.steps.length ?? visit.currentStep,
        summary: summary?.summary ?? null,
        reminders: summary ? summary.reminders.map((text) => ({ text, enabled: true })) : undefined,
      },
      include: { place: true },
    });
    return toVisitResponse(updated);
  }

  // "All done!" page: stars and reminder switches
  async saveFeedback(userId: string, visitId: string, dto: VisitFeedbackDto) {
    const visit = await this.findOwn(userId, visitId);
    if (visit.status !== VisitStatus.completed) throw new ApiError('invalid_visit_state', HttpStatus.CONFLICT);

    const reminders = readReminders(visit.reminders).map((reminder, index) => ({
      ...reminder,
      enabled: dto.reminders?.[index] ?? reminder.enabled,
    }));

    const updated = await this.prisma.visit.update({
      where: { id: visit.id },
      data: { rating: dto.rating ?? visit.rating, reminders },
      include: { place: true },
    });
    return toVisitResponse(updated);
  }

  // Statistics: which SDGs the completed visits in a period contributed to
  async sdgStats(userId: string, from: Date, to: Date) {
    const rangeDays = (to.getTime() - from.getTime()) / (24 * 60 * MINUTE);
    if (rangeDays <= 0 || rangeDays > MAX_STATS_RANGE_DAYS) throw new ApiError('invalid_period', HttpStatus.BAD_REQUEST);

    const [user, visits] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.visit.findMany({
        where: { userId, status: VisitStatus.completed, endedAt: { gte: from, lt: to } },
        include: { place: true },
      }),
    ]);
    // needs only count when the person agreed to store them (GDPR consent)
    const hasNeeds = !!user.healthDataConsentAt && user.accessibilityNeeds.some((need) => need !== 'none');

    const goals = new Map<number, { visitIds: string[]; placeIds: Set<string>; lastActivity: Date }>();
    for (const visit of visits) {
      const endedAt = visit.endedAt ?? visit.endsAt;
      const sdgs = getVisitSdgs({
        category: visit.place.category,
        rideRequested: visit.rideRequested,
        notifyPlace: visit.notifyPlace,
        personHasAccessibilityNeeds: hasNeeds,
      });
      for (const goal of sdgs) {
        const entry = goals.get(goal) ?? { visitIds: [], placeIds: new Set<string>(), lastActivity: endedAt };
        entry.visitIds.push(visit.id);
        entry.placeIds.add(visit.placeId);
        if (endedAt > entry.lastActivity) entry.lastActivity = endedAt;
        goals.set(goal, entry);
      }
    }

    return {
      totalVisits: visits.length,
      goals: [...goals.entries()]
        .map(([goal, entry]) => ({
          goal,
          visits: entry.visitIds.length,
          locations: entry.placeIds.size,
          lastActivity: entry.lastActivity.toISOString(),
          visitIds: entry.visitIds,
        }))
        .sort((a, b) => b.visits - a.visits || a.goal - b.goal),
    };
  }

  // someone else's visit looks exactly like a missing one
  private async findOwn(userId: string, visitId: string): Promise<VisitWithPlace> {
    const visit = await this.prisma.visit.findFirst({ where: { id: visitId, userId }, include: { place: true } });
    if (!visit) throw new ApiError('visit_not_found', HttpStatus.NOT_FOUND);
    return visit;
  }

  // AI problems become the same codes the assistant endpoints use
  private async assistantCall<T>(call: () => Promise<T>): Promise<T> {
    try {
      return await call();
    } catch (error) {
      const code = this.assistant.toErrorCode(error);
      const status = code === 'rate_limited' ? HttpStatus.TOO_MANY_REQUESTS : code === 'not_configured' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.BAD_GATEWAY;
      throw new ApiError(code, status);
    }
  }
}

// what Walksy needs to know: who is asking and where they are
function toAssistantContext(user: User, place: Place): AssistantContextDto {
  return {
    placeName: place.name,
    category: place.category,
    address: place.address,
    accessibilityNeeds: user.healthDataConsentAt ? user.accessibilityNeeds : [],
    language: user.language,
    companionName: user.companionName,
  };
}
