/**
 * i18n Configuration and initialization
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { ru } from './locales/ru';
import { en } from './locales/en';

/**
 * Get device language
 */
const getDeviceLanguage = (): string => {
  try {
    const locales = getLocales();
    if (locales && locales.length > 0) {
      const lang = locales[0].languageCode;
      return lang.startsWith('ru') ? 'ru' : 'en';
    }
  } catch (error) {
    console.error('Error getting device language:', error);
  }
  return 'en';
};

// Initialize i18n
i18next
  .use(initReactI18next)
  .init({
    defaultNS: 'translation',
    ns: ['translation'],
    fallbackLng: 'en',
    lng: getDeviceLanguage(),

    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },

    interpolation: {
      escapeValue: false, // React already handles XSS
    },

    react: {
      useSuspense: false, // Disable suspense for RN compatibility
    },
  });

export default i18next;
