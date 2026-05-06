'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-dark-mode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem('admin-dark-mode', String(newVal));
  };

  const theme = {
    darkMode,
    toggleDarkMode,
    colors: darkMode ? {
      bg: '#1e2124',
      card: '#282b30',
      text: '#f5f5f5',
      textMuted: '#a0a0a0',
      border: '#36393e',
      input: '#2f3136',
      sidebar: '#1e2124'
    } : {
      bg: '#f8fafc',
      card: '#ffffff',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      input: '#ffffff',
      sidebar: '#0f172a'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={darkMode ? 'admin-dark' : 'admin-light'}>
        {children}
      </div>
      <style jsx global>{`
        .admin-dark ::placeholder {
          color: #72767d;
        }
        .admin-dark input, .admin-dark textarea, .admin-dark select {
          background-color: #2f3136 !important;
          color: #f5f5f5 !important;
          border-color: #36393e !important;
        }
        .admin-dark .btn:not(.btn-primary) {
          color: #f5f5f5 !important;
          border-color: #36393e !important;
        }
      `}</style>
    </ThemeContext.Provider>
  );
};
