import React, { useState, useEffect } from 'react';
import { contractAPI, exportAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import './ContractList.css';

const ContractList = ({ onEdit }) => {
  const { t } = useLanguage();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadContracts();
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
      alert('Failed to load contracts.\n\nError: ' + errorMsg + '\n\nPlease ensure MongoDB is running and the server is started.\nRun: npm run dev');
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
      alert('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) {
      return;
    }

    try {
      await contractAPI.delete(id);
      alert('Contract deleted successfully');
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      alert('Failed to delete contract');
    }
  };

  const handleExportPDF = (id) => {
    window.open(exportAPI.downloadPDF(id), '_blank');
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
        <h2>Contract Management</h2>
        <button className="btn btn-primary" onClick={() => onEdit(null)}>
          + New Contract
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by contract number or buyer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="btn btn-search" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="FINALIZED">Finalized</option>
            <option value="SENT">Sent</option>
            <option value="SIGNED">Signed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading contracts...</div>
      ) : (
        <>
          <div className="contracts-table">
            <table>
              <thead>
                <tr>
                  <th>Contract No.</th>
                  <th>Date</th>
                  <th>Buyer</th>
                  <th>Commodity</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">No contracts found</td>
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
                Previous
              </button>
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-page"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContractList;
