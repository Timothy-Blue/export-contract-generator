import React, { createContext, useState, useContext, useEffect } from 'react';
import { getTranslation } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('appLanguage') || 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('appLanguage', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'vi' : 'en');
  };

  const t = (key) => {
    return getTranslation(language, key);
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isVietnamese: language === 'vi',
    isEnglish: language === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
