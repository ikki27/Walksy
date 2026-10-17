import type { PlaceCategory } from './place';

export type ChatRole = 'user' | 'assistant';

// answer to a suggestion card: shown as "Documents needed" + "Step-by-step preview"
export type VisitGuide = {
  documents: string[];
  steps: string[];
};

export type ChatMessage = {
  id: string;
  role: ChatRole;
  // plain text; for guides a text version, so follow-up questions have the context
  content: string;
  guide?: VisitGuide;
};

// what the backend needs to know about this conversation
export type AssistantContext = {
  placeName: string;
  category: PlaceCategory;
  address?: string;
  accessibilityNeeds: string[];
  language: string;
  companionName: string;
};

export type AssistantErrorCode = 'not_configured' | 'rate_limited' | 'unavailable' | 'network';

// one line of the backend's NDJSON stream
export type AssistantStreamEvent =
  | { type: 'text'; text: string }
  | { type: 'done' }
  | { type: 'error'; code: Exclude<AssistantErrorCode, 'network'> };
