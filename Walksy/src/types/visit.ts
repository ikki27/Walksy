import type { VisitGuide } from './assistant';
import type { Place } from './place';

// keep in sync with the backend (prisma VisitStatus)
export type VisitStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

// a visit as the backend sends it
export type Visit = {
  id: string;
  // what the visit is for, e.g. "Pay bills" (falls back to the place name)
  title: string;
  place: Place;
  startsAt: string; // ISO date
  endsAt: string; // ISO date
  status: VisitStatus;
  startedAt: string | null;
  endedAt: string | null;
  cancelledAt: string | null;
  notifyPlace: boolean; // let the place know the person is coming
  rideRequested: boolean; // the person asked for a ride there
  // "Help Me": Walksy's steps (null until the first "Help Me", unless it came from the chat)
  guide: VisitGuide | null;
  completedSteps: number;
  // "All done!" page
  summary: string | null;
  reminders: VisitReminder[];
  rating: number | null; // 1 to 5 stars
  createdAt: string;
};

export type VisitReminder = { text: string; enabled: boolean };

export type NewVisit = {
  place: Place;
  title: string;
  startsAt: string;
  notifyPlace: boolean;
  rideRequested: boolean;
  start: boolean; // "Start visit" = starts right away
  guide?: VisitGuide; // the steps from Walksy's chat, if there were any
};

export type VisitFeedback = { rating?: number; reminders?: boolean[] };

// how the person answered "When is your visit?"
export type VisitTiming = 'now' | 'today' | 'thisWeek' | 'later';

// the three tabs of the visits overview
export type VisitTab = 'active' | 'upcoming' | 'past';
