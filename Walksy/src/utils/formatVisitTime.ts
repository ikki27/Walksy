import type { TFunction } from 'i18next';

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// some app language codes (e.g. "zh-Yue") aren't valid date locales, so fall back to English
export function safeLocale(locale: string) {
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locale).length > 0 ? locale : 'en';
  } catch {
    return 'en';
  }
}

// "Today, 10:00 AM" / "Tomorrow, 9:30 AM" / "Fri, 14 Nov, 9:30 AM"
export function formatVisitTime(date: Date, now: Date, locale: string, t: TFunction): string {
  const loc = safeLocale(locale);
  const time = date.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' });

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (isSameDay(date, now)) return t('home.today', { time });
  if (isSameDay(date, tomorrow)) return t('home.tomorrow', { time });

  const day = date.toLocaleDateString(loc, { weekday: 'short', day: 'numeric', month: 'short' });
  return `${day}, ${time}`;
}
