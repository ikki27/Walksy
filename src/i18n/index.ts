import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en } from './locales/en';

const STORAGE_KEY = 'app-language';

// languages without a file here fall back to English
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }, // React already escapes output
});

// call once on app start, before showing any screen
export async function loadSavedLanguage() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) await i18n.changeLanguage(saved);
  } catch {
    // storage unavailable: keep the default language
  }
}

export async function setAppLanguage(code: string) {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch {
    // language still changes for this session
  }
}

export default i18n;
