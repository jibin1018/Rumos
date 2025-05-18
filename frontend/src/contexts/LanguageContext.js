import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from 'i18next';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'ko', name: '한국어' }
  ];

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        availableLanguages
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
