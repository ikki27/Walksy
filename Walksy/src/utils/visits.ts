import type { Place } from '../types/place';
import type { Visit, VisitTab } from '../types/visit';

const MINUTE = 60 * 1000;
// an upcoming visit this close counts as "soon": Help Me works, Cancel is hidden
export const STARTING_SOON_MINUTES = 30;
const MAX_RECENT_PLACES = 8;

// which overview tab a visit belongs to
export function getVisitTab(visit: Visit, now: Date): VisitTab {
  if (visit.status === 'active') return 'active';
  if (visit.status === 'scheduled' && Date.parse(visit.endsAt) > now.getTime()) return 'upcoming';
  // completed, cancelled, or planned but never started and already over
  return 'past';
}

// when a past visit happened: ended, cancelled, or (never started) its planned end
export function getPastDate(visit: Visit): Date {
  return new Date(visit.endedAt ?? visit.cancelledAt ?? visit.endsAt);
}

export function isStartingSoon(visit: Visit, now: Date): boolean {
  return Date.parse(visit.startsAt) - now.getTime() <= STARTING_SOON_MINUTES * MINUTE;
}

// an active visit whose planned time is over, waiting for "End Visit"
export function isOverdue(visit: Visit, now: Date): boolean {
  return visit.status === 'active' && Date.parse(visit.endsAt) <= now.getTime();
}

// active and upcoming: soonest first; past: most recent first
export function groupVisitsByTab(visits: Visit[], now: Date): Record<VisitTab, Visit[]> {
  const groups: Record<VisitTab, Visit[]> = { active: [], upcoming: [], past: [] };
  for (const visit of visits) groups[getVisitTab(visit, now)].push(visit);

  const byStart = (a: Visit, b: Visit) => Date.parse(a.startsAt) - Date.parse(b.startsAt);
  groups.active.sort(byStart);
  groups.upcoming.sort(byStart);
  groups.past.sort((a, b) => getPastDate(b).getTime() - getPastDate(a).getTime());
  return groups;
}

export type FeaturedState = 'inProgress' | 'upcoming';

// The visit to highlight on the home screen: an active one, otherwise the next upcoming one.
export function getFeaturedVisit(visits: Visit[], now: Date): { visit: Visit; state: FeaturedState } | null {
  const groups = groupVisitsByTab(visits, now);
  if (groups.active[0]) return { visit: groups.active[0], state: 'inProgress' };
  if (groups.upcoming[0]) return { visit: groups.upcoming[0], state: 'upcoming' };
  return null;
}

// "Recently visited locations": places of the latest visits, each place once
export function getRecentPlaces(visits: Visit[]): Place[] {
  const newestFirst = [...visits].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const seen = new Set<string>();
  const places: Place[] = [];
  for (const visit of newestFirst) {
    if (seen.has(visit.place.id)) continue;
    seen.add(visit.place.id);
    places.push(visit.place);
    if (places.length === MAX_RECENT_PLACES) break;
  }
  return places;
}
