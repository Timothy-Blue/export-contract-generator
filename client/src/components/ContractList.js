import React, { useState, useEffect } from 'react';
import { contractAPI, exportAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import ReleaseModal from './ReleaseModal';
import './ContractList.css';

const ContractList = ({ onEdit }) => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, filterStatus]);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      if (filterStatus) params.status = filterStatus;

      const response = await contractAPI.getAll(params);
      setContracts(response.data.contracts || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error loading contracts:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(t('failedToLoadContracts') + '\n\nError: ' + errorMsg + '\n\n' + t('ensureServerRunning'));
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadContracts();
      return;
    }

    try {
      setLoading(true);
      const response = await contractAPI.search(searchQuery);
      setContracts(response.data);
      setTotalPages(1);
    } catch (error) {
      console.error('Error searching contracts:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(t('search') + ' failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      await contractAPI.delete(id);
      alert(t('deleteSuccess'));
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert(t('deleteError'));
    }
  };

  const handleExportPDF = (id) => {
    window.open(exportAPI.downloadPDF(id), '_blank');
  };

  const handleOpenRelease = (contract) => {
    setSelectedContract(contract);
    setShowReleaseModal(true);
  };

  const handleSaveRelease = async (releaseData) => {
    try {
      await contractAPI.update(selectedContract._id, releaseData);
      loadContracts();
      // Update the selected contract with new data
      const updatedContract = { ...selectedContract, ...releaseData };
      setSelectedContract(updatedContract);
    } catch (error) {
      console.error('Error saving release:', error);
      throw error;
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'DRAFT': '#808080',
      'FINALIZED': '#0066cc',
      'SENT': '#ff9900',
      'SIGNED': '#00cc00',
      'CANCELLED': '#cc0000'
    };

    return (
      <span className="status-badge" style={{ backgroundColor: statusColors[status] }}>
        {status}
      </span>
    );
  };

  return (
    <div className="contract-list-container">
      <div className="list-header">
        <h2>{t('contractList')}</h2>
        <button className="btn btn-primary" onClick={() => onEdit(null)}>
          + {t('newContract')}
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-search" onClick={handleSearch}>
            {t('search')}
          </button>
        </div>

        <div className="filter-group">
          <label>{t('status')}:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">{t('all')}</option>
            <option value="DRAFT">{t('DRAFT')}</option>
            <option value="FINALIZED">{t('FINALIZED')}</option>
            <option value="SENT">{t('SENT')}</option>
            <option value="SIGNED">{t('SIGNED')}</option>
            <option value="CANCELLED">{t('CANCELLED')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">{t('loadingContracts')}</div>
      ) : (
        <>
          <div className="contracts-table">
            <table>
              <thead>
                <tr>
                  <th>{t('contractNoHeader')}</th>
                  <th>{t('dateHeader')}</th>
                  <th>{t('buyerHeader')}</th>
                  <th>{t('commodityHeader')}</th>
                  <th>{t('totalAmountHeader')}</th>
                  <th>{t('releaseHeader')}</th>
                  <th>{t('statusHeader')}</th>
                  <th>{t('actionsHeader')}</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-data">{t('noContractsFound')}</td>
                  </tr>
                ) : (
                  contracts.map((contract) => (
                    <tr key={contract._id}>
                      <td className="contract-number">{contract.contractNumber}</td>
                      <td>{new Date(contract.contractDate).toLocaleDateString()}</td>
                      <td>{contract.buyer?.companyName || 'N/A'}</td>
                      <td>{contract.commodity?.name || 'N/A'}</td>
                      <td className="amount">
                        {contract.currency} {contract.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`release-badge release-${contract.releaseStatus?.toLowerCase() || 'pending'}`}>
                          {contract.releaseType !== 'NOT_SPECIFIED' ? contract.releaseType : '-'}
                        </span>
                        {contract.debitNoteNumber && (
                          <button
                            className="btn-mini-export"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(exportAPI.downloadReleaseNote(contract._id), '_blank');
                            }}
                            title="Export Release Note PDF"
                            style={{
                              marginLeft: '5px',
                              fontSize: '0.8em',
                              padding: '2px 6px',
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            📄
                          </button>
                        )}
                      </td>
                      <td>{getStatusBadge(contract.status)}</td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => onEdit(contract._id)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-icon btn-pdf"
                          onClick={() => handleExportPDF(contract._id)}
                          title="Export PDF"
                        >
                          📄
                        </button>
                        <button
                          className="btn-icon btn-release"
                          onClick={() => handleOpenRelease(contract)}
                          title="Release Document"
                        >
                          📋
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(contract._id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-page"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                {t('previous')}
              </button>
              <span className="page-info">
                {t('pageOf')} {currentPage} {t('of')} {totalPages}
              </span>
              <button
                className="btn btn-page"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                {t('next')}
              </button>
            </div>
          )}
        </>
      )}

      {showReleaseModal && selectedContract && (
        <ReleaseModal
          isOpen={showReleaseModal}
          onClose={() => setShowReleaseModal(false)}
          onSave={handleSaveRelease}
          contract={selectedContract}
        />
      )}
    </div>
  );
};

export default ContractList;
