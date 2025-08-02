
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';
import ptTranslations from '../locales/pt.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      },
      pt: {
        translation: ptTranslations
      }
    },
    fallbackLng: 'pt',
    lng: 'pt', // Set Portuguese as default
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'preferredLanguage',
      caches: ['localStorage'],
      checkWhitelist: true,
    },
    whitelist: ['en', 'es', 'pt'],
    load: 'languageOnly',
  });

export default i18n;
