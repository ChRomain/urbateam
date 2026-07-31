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

  const parseVal = (val) => {
    if (typeof val === 'string' && (val.trim().startsWith('[') || val.trim().startsWith('{'))) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return val;
  };

  const getStaticTranslation = (lang, keypath) => {
    const keys = keypath.split('.');
    let value = translations[lang];
    for (const key of keys) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    return value;
  };

  const setNestedProp = (obj, pathString, val) => {
    const parts = pathString.split('.');
    let curr = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const key = parts[i];
      if (!curr[key] || typeof curr[key] !== 'object') {
        curr[key] = {};
      } else {
        curr[key] = Array.isArray(curr[key]) ? [...curr[key]] : { ...curr[key] };
      }
      curr = curr[key];
    }
    const lastKey = parts[parts.length - 1];
    curr[lastKey] = parseVal(val);
  };

  const t = (keypath) => {
    // 1. Direct match in current language customTexts
    if (customTexts[language] && customTexts[language][keypath] !== undefined && customTexts[language][keypath] !== null) {
      return parseVal(customTexts[language][keypath]);
    }

    // 2. Direct match in French customTexts fallback
    if (language !== 'fr' && customTexts['fr'] && customTexts['fr'][keypath] !== undefined && customTexts['fr'][keypath] !== null) {
      return parseVal(customTexts['fr'][keypath]);
    }

    // 3. Get static translation if available
    let staticVal = getStaticTranslation(language, keypath);
    if (staticVal === undefined && language !== 'fr') {
      staticVal = getStaticTranslation('fr', keypath);
    }

    // 4. Check for subkey overrides in customTexts starting with keypath + '.'
    const prefix = keypath + '.';
    const langCustom = customTexts[language] || {};
    const frCustom = customTexts['fr'] || {};

    const matchingKeys = new Set([
      ...Object.keys(langCustom).filter(k => k.startsWith(prefix)),
      ...Object.keys(frCustom).filter(k => k.startsWith(prefix))
    ]);

    if (matchingKeys.size > 0) {
      let result = staticVal !== undefined && typeof staticVal === 'object' && staticVal !== null
        ? (Array.isArray(staticVal) ? [...staticVal] : { ...staticVal })
        : {};

      matchingKeys.forEach(fullKey => {
        const subPath = fullKey.slice(prefix.length);
        const val = langCustom[fullKey] !== undefined && langCustom[fullKey] !== null
          ? langCustom[fullKey]
          : frCustom[fullKey];

        if (val !== undefined && val !== null) {
          setNestedProp(result, subPath, val);
        }
      });

      return result;
    }

    if (staticVal !== undefined) {
      return staticVal;
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
