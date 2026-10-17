export { PLACE_CATEGORIES } from '../places/place.types';
export type { PlaceCategory } from '../places/place.types';

export const CHAT_ROLES = ['user', 'assistant'] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];

export type AssistantStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'done' }
  | { type: 'error'; code: AssistantErrorCode };

export type AssistantErrorCode = 'not_configured' | 'rate_limited' | 'unavailable';

export type VisitGuide = {
  documents: string[];
  steps: string[];
};

export type VisitSummary = {
  summary: string;
  reminders: string[];
};
