'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fr } from '../i18n/fr';
import { en } from '../i18n/en';
import { br } from '../i18n/br';

const LanguageContext = createContext();

const translations = { fr, en, br };

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('urbateam-lang');
    if (savedLang && (savedLang === 'fr' || savedLang === 'en' || savedLang === 'br')) {
      setTimeout(() => {
        setLanguage(savedLang);
      }, 0);
    }
  }, []);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('urbateam-lang', lang);
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
