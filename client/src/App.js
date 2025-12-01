import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ContractForm from './components/ContractForm';
import ContractList from './components/ContractList';
import './App.css';

function App() {
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

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>📄 Export Contract Generator</h1>
          <nav className="nav-menu">
            <button 
              className={`nav-btn ${currentView === 'list' ? 'active' : ''}`}
              onClick={() => setCurrentView('list')}
            >
              Contracts
            </button>
            <button 
              className={`nav-btn ${currentView === 'form' ? 'active' : ''}`}
              onClick={() => { setEditingContractId(null); setCurrentView('form'); }}
            >
              New Contract
            </button>
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
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Export Contract Generator &copy; 2025 | Automated Commercial Contract Management</p>
      </footer>
    </div>
  );
}

export default App;
