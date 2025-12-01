import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="language-switcher">
      <button 
        onClick={toggleLanguage}
        className="language-toggle-btn"
        title={t('language')}
      >
        <span className="language-icon">🌐</span>
        <span className="language-text">
          {language === 'en' ? 'EN' : 'VI'}
        </span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
