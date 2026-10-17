import type { TFunction } from 'i18next';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

// picks "..._one" or "..._other" ourselves, so it works without Intl.PluralRules on every phone
function plural(t: TFunction, key: string, count: number) {
  return t(`${key}_${count === 1 ? 'one' : 'other'}`, { count });
}

// "In 15 minutes", "In 1 hour", "In 3 days" (or "Now" when it's about to start)
export function formatTimeUntil(target: Date, now: Date, t: TFunction): string {
  const diff = target.getTime() - now.getTime();
  if (diff < MINUTE) return t('time.now');
  if (diff < HOUR) return plural(t, 'time.inMinutes', Math.round(diff / MINUTE));
  if (diff < DAY) return plural(t, 'time.inHours', Math.round(diff / HOUR));
  return plural(t, 'time.inDays', Math.round(diff / DAY));
}

// "Just now", "5 minutes ago", "1 day ago"
export function formatTimeAgo(target: Date, now: Date, t: TFunction): string {
  const diff = now.getTime() - target.getTime();
  if (diff < MINUTE) return t('time.justNow');
  if (diff < HOUR) return plural(t, 'time.minutesAgo', Math.floor(diff / MINUTE));
  if (diff < DAY) return plural(t, 'time.hoursAgo', Math.floor(diff / HOUR));
  return plural(t, 'time.daysAgo', Math.floor(diff / DAY));
}
