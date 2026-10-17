import type { VisitGuide } from '../assistant/assistant.types';
import type { Place, Visit } from '../generated/prisma/client';

export type VisitReminder = { text: string; enabled: boolean };

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string');

// JSON columns can hold anything: only accept the shapes we wrote
export function readGuide(value: unknown): VisitGuide | null {
  if (!value || typeof value !== 'object') return null;
  const { documents, steps } = value as Record<string, unknown>;
  return isStringList(documents) && isStringList(steps) && steps.length > 0 ? { documents, steps } : null;
}

export function readReminders(value: unknown): VisitReminder[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is VisitReminder =>
      !!item && typeof item === 'object' && typeof item.text === 'string' && typeof item.enabled === 'boolean',
  );
}

// what the app receives for a visit
export function toVisitResponse(visit: Visit & { place: Place }) {
  return {
    id: visit.id,
    title: visit.title,
    // the app knows places by the search provider's id, like in /places/search
    place: {
      id: visit.place.providerPlaceId,
      name: visit.place.name,
      address: visit.place.address,
      category: visit.place.category,
      lat: visit.place.lat,
      lng: visit.place.lng,
    },
    startsAt: visit.startsAt.toISOString(),
    endsAt: visit.endsAt.toISOString(),
    status: visit.status,
    startedAt: visit.startedAt?.toISOString() ?? null,
    endedAt: visit.endedAt?.toISOString() ?? null,
    cancelledAt: visit.cancelledAt?.toISOString() ?? null,
    notifyPlace: visit.notifyPlace,
    rideRequested: visit.rideRequested,
    guide: readGuide(visit.guide),
    completedSteps: visit.currentStep,
    summary: visit.summary,
    reminders: readReminders(visit.reminders),
    rating: visit.rating,
    createdAt: visit.createdAt.toISOString(),
  };
}
