'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../i18n/fr';
import { en } from '../i18n/en';
import { br } from '../i18n/br';

const LanguageContext = createContext();

const translations = { fr, en, br };

export function LanguageProvider({ children, defaultLanguage = 'fr', initialTexts = [] }) {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const customTexts = React.useMemo(() => {
    const dict = { fr: {}, en: {}, br: {} };
    initialTexts.forEach(item => {
      dict.fr[item.key] = item.fr;
      dict.en[item.key] = item.en;
      dict.br[item.key] = item.br;
    });
    return dict;
  }, [initialTexts]);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('urbateam-lang', lang);
    
    // Mémoriser dans le cookie pour que le serveur Next.js soit au courant dès le prochain chargement
    document.cookie = `urbateam-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;

    // Rediriger vers l'URL correspondante (ex: de /apropos à /en/apropos ou inversement)
    const pathname = window.location.pathname;
    const cleanPath = pathname.replace(/^\/(en|br)/, '');
    const targetPath = lang === 'fr' ? (cleanPath || '/') : `/${lang}${cleanPath}`;
    const search = window.location.search;
    
    window.location.href = targetPath + search;
  };

  const t = (keypath) => {
    // 1. Check custom overrides for the current language
    if (customTexts[language] && customTexts[language][keypath] !== undefined && customTexts[language][keypath] !== null) {
      const val = customTexts[language][keypath];
      if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
      return val;
    }

    // 2. Fallback to French custom override if other language is missing
    if (language !== 'fr') {
      if (customTexts['fr'] && customTexts['fr'][keypath] !== undefined && customTexts['fr'][keypath] !== null) {
        const val = customTexts['fr'][keypath];
        if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        }
        return val;
      }
    }

    // 3. Fallback to static translation file
    const keys = keypath.split('.');
    let value = translations[language];
    let found = true;
    
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        found = false;
        break;
      }
    }

    if (found) {
      return value;
    }

    // 4. Fallback to static French translation
    if (language !== 'fr') {
      let frValue = translations['fr'];
      let frFound = true;
      for (const key of keys) {
        if (frValue && frValue[key] !== undefined) {
          frValue = frValue[key];
        } else {
          frFound = false;
          break;
        }
      }
      if (frFound) {
        return frValue;
      }
    }

    return keypath; // Fallback to key name
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
