
export type Language = {
    code: string;
    name: string;
    isoCode: string;
};

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', isoCode: 'GB' },
  { code: 'ar', name: 'Arabic', isoCode: 'SA' },
  { code: 'zh-Hans', name: 'Mandarin Chinese', isoCode: 'CN' },
  { code: 'zh-Yue', name: 'Cantonese Chinese', isoCode: 'CN' },
  { code: 'fr', name: 'French', isoCode: 'FR' },
  { code: 'de', name: 'German', isoCode: 'DE' },
  { code: 'hi', name: 'Hindi', isoCode: 'IN' },
  { code: 'it', name: 'Italian', isoCode: 'IT' },
  { code: 'ja', name: 'Japanese', isoCode: 'JP' },
  { code: 'ko', name: 'Korean', isoCode: 'KR' },
  { code: 'pt', name: 'Portuguese', isoCode: 'PT' },
  { code: 'es', name: 'Spanish', isoCode: 'ES' },
  { code: 'ru', name: 'Russian', isoCode: 'RU' },
];