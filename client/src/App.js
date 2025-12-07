import React, { useState } from 'react';
import ContractForm from './components/ContractForm';
import ContractList from './components/ContractList';
import LanguageSwitcher from './components/LanguageSwitcher';
import { useLanguage } from './contexts/LanguageContext';
import './App.css';

function App() {
  const { t } = useLanguage();
  const [editingContractId, setEditingContractId] = useState(null);
  const [currentView, setCurrentView] = useState('list');

  const handleEditContract = (contractId) => {
    setEditingContractId(contractId);
    setCurrentView('form');
  };

  const handleFormSuccess = () => {
    setEditingContractId(null);
    setCurrentView('list');
  };

  const handleReturnToList = () => {
    setEditingContractId(null);
    setCurrentView('list');
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <button 
            className="logo-btn"
            onClick={handleReturnToList}
            title="Return to Contract List"
          >
            📄 {t('appTitle')}
          </button>
          <nav className="nav-menu">
            {currentView === 'form' && (
              <button 
                className="nav-btn"
                onClick={handleReturnToList}
              >
                ← {t('contractList')}
              </button>
            )}
            {currentView === 'list' && (
              <button 
                className="nav-btn"
                onClick={() => { setEditingContractId(null); setCurrentView('form'); }}
              >
                + {t('newContract')}
              </button>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="app-main">
        {currentView === 'list' ? (
          <ContractList onEdit={handleEditContract} />
        ) : (
          <ContractForm 
            contractId={editingContractId} 
            onSuccess={handleFormSuccess}
            onCancel={handleReturnToList}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>{t('footerText')}</p>
      </footer>
    </div>
  );
}

export default App;
