import type { NewVisit, Visit, VisitFeedback } from '../types/visit';
import { apiRequest } from './apiClient';

export function fetchVisits() {
  return apiRequest<Visit[]>('/visits');
}

export function createVisit(visit: NewVisit) {
  return apiRequest<Visit>('/visits', { method: 'POST', body: visit });
}

export type VisitAction = 'start' | 'end' | 'cancel';

export function changeVisit(id: string, action: VisitAction) {
  return apiRequest<Visit>(`/visits/${id}/${action}`, { method: 'POST' });
}

// "Help Me": the visit with its steps (Walksy writes them if needed), started
export function prepareHelp(id: string) {
  return apiRequest<Visit>(`/visits/${id}/help`, { method: 'POST' });
}

export function saveProgress(id: string, completedSteps: number) {
  return apiRequest<Visit>(`/visits/${id}/progress`, { method: 'POST', body: { completedSteps } });
}

// last step done: ends the visit, Walksy adds the summary + reminders
export function completeVisit(id: string) {
  return apiRequest<Visit>(`/visits/${id}/complete`, { method: 'POST' });
}

export function saveFeedback(id: string, feedback: VisitFeedback) {
  return apiRequest<Visit>(`/visits/${id}/feedback`, { method: 'PATCH', body: feedback });
}
