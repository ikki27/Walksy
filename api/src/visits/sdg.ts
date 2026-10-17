import type { PlaceCategory } from '../generated/prisma/enums';

// UN Sustainable Development Goals (by number) that a completed visit contributes to.
// One place for the rules, so the numbers are always explainable.
export const PLACE_SDGS: Record<PlaceCategory, number[]> = {
  hospital: [3], // good health and well-being
  pharmacy: [3],
  bank: [8], // decent work and economic growth (financial inclusion)
  government: [16], // peace, justice and strong institutions
  shop: [2], // zero hunger
  post: [11], // sustainable cities and communities (access to public services)
  other: [11],
};

export const SDG_INCLUSION = 10; // reduced inequalities: a person with accessibility needs got where they needed
export const SDG_TRANSPORT = 11; // sustainable cities: accessible transport (a ride was arranged)
export const SDG_PARTNERSHIP = 17; // partnerships: the place was notified and could prepare

type VisitFacts = {
  category: PlaceCategory;
  rideRequested: boolean;
  notifyPlace: boolean;
  personHasAccessibilityNeeds: boolean;
};

export function getVisitSdgs(visit: VisitFacts): number[] {
  const goals = new Set(PLACE_SDGS[visit.category]);
  if (visit.personHasAccessibilityNeeds) goals.add(SDG_INCLUSION);
  if (visit.rideRequested) goals.add(SDG_TRANSPORT);
  if (visit.notifyPlace) goals.add(SDG_PARTNERSHIP);
  return [...goals];
}
