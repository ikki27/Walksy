import type { VisitTiming } from '../types/visit';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

// a visit starting this soon counts as "now": the main button says "Start visit"
export const START_NOW_WINDOW_MINUTES = 15;
export const TIME_STEP_MINUTES = 15; // the time picker moves in quarter hours

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const endOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);

function atTime(date: Date, hours: number, minutes = 0) {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// next full quarter hour, e.g. 10:07 → 10:15
function nextQuarterHour(now: Date) {
  const step = TIME_STEP_MINUTES * MINUTE;
  return new Date(Math.ceil(now.getTime() / step) * step);
}

// which dates the picker allows for each answer
export function getTimingLimits(timing: VisitTiming, now: Date): { min: Date; max?: Date } {
  switch (timing) {
    case 'now':
    case 'today':
      return { min: now, max: endOfDay(now) };
    case 'thisWeek':
      return { min: now, max: endOfDay(new Date(now.getTime() + 6 * DAY)) };
    case 'later':
      return { min: startOfDay(new Date(now.getTime() + 7 * DAY)) };
  }
}

// a sensible starting point when the person picks an answer
export function getDefaultStart(timing: VisitTiming, now: Date): Date {
  switch (timing) {
    case 'now':
      return now;
    case 'today': {
      const soon = nextQuarterHour(new Date(now.getTime() + 30 * MINUTE));
      return soon <= endOfDay(now) ? soon : endOfDay(now);
    }
    case 'thisWeek':
      return atTime(new Date(now.getTime() + DAY), 10); // tomorrow 10:00
    case 'later':
      return atTime(new Date(now.getTime() + 7 * DAY), 10); // in a week, 10:00
  }
}

// keeps a picked date inside the allowed range
export function clampToLimits(date: Date, limits: { min: Date; max?: Date }): Date {
  if (date < limits.min) return limits.min;
  if (limits.max && date > limits.max) return limits.max;
  return date;
}

// "start" right away, or "schedule" for later
export function getVisitAction(startsAt: Date, now: Date): 'start' | 'schedule' {
  return startsAt.getTime() - now.getTime() <= START_NOW_WINDOW_MINUTES * MINUTE ? 'start' : 'schedule';
}
