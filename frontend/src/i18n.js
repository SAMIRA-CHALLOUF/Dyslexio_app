// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import fr from './locales/fr.json';
import en from './locales/en.json';
import de from './locales/de.json';
import it from './locales/it.json';
import es from './locales/es.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      de: { translation: de },
      it: { translation: it },
      es: { translation: es },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

export default i18n;