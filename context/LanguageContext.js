'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../i18n/fr';
import { en } from '../i18n/en';
import { br } from '../i18n/br';

const LanguageContext = createContext();

const translations = { fr, en, br };

export function LanguageProvider({ children, defaultLanguage = 'fr' }) {
  const [language, setLanguage] = useState(defaultLanguage);

  useEffect(() => {
    setLanguage(defaultLanguage);
  }, [defaultLanguage]);

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
    const keys = keypath.split('.');
    let value = translations[language];
    
    for (const key of keys) {
      if (value && value[key]) {
        value = value[key];
      } else {
        return keypath; // Fallback to key name
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
