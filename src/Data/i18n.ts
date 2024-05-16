import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './lang/en.json';
import es from './lang/es.json';

export const languageResources = {
    en: {translation: en},
    es: {translation: es},
  };

  i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: languageResources,
    react: { useSuspense: false },
  });

export default i18n;
