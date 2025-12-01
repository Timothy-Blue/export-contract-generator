import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { exportAPI } from '../services/api';
import './BuyerModal.css';

const ReleaseModal = ({ isOpen, onClose, onSave, contract }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    releaseType: 'NOT_SPECIFIED',
    releaseStatus: 'PENDING',
    releaseDate: '',
    releaseRemarks: '',
    invoiceDate: '',
    dueDate: '',
    debitNoteNumber: ''
  });

  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (contract) {
      setFormData({
        releaseType: contract.releaseType || 'NOT_SPECIFIED',
        releaseStatus: contract.releaseStatus || 'PENDING',
        releaseDate: contract.releaseDate ? contract.releaseDate.split('T')[0] : '',
        releaseRemarks: contract.releaseRemarks || '',
        invoiceDate: contract.invoiceDate ? contract.invoiceDate.split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: contract.dueDate ? contract.dueDate.split('T')[0] : '',
        debitNoteNumber: contract.debitNoteNumber || `DN-${Date.now().toString().slice(-6)}`
      });
    }
  }, [contract]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setHasUnsavedChanges(false);
      alert('Release information saved successfully! You can now export the PDF.');
      // Don't close modal automatically, let user export or close manually
    } catch (error) {
      console.error('Error saving release info:', error);
      alert('Failed to save release information');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (hasUnsavedChanges) {
      alert('Please save your changes before exporting the PDF.');
      return;
    }
    window.open(exportAPI.downloadReleaseNote(contract._id), '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header">
          <h2>Release Document - {contract?.contractNumber}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        {hasUnsavedChanges && (
          <div style={{
            padding: '10px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            ⚠️ You have unsaved changes. Please save before exporting PDF.
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Debit Note Number</label>
            <input
              type="text"
              name="debitNoteNumber"
              value={formData.debitNoteNumber}
              onChange={handleChange}
              placeholder="DN-XXXXXX"
            />
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Invoice Date</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>{t('releaseType')}</label>
              <select name="releaseType" value={formData.releaseType} onChange={handleChange}>
                <option value="NOT_SPECIFIED">Not Specified</option>
                <option value="SWB">Sea Waybill (SWB)</option>
                <option value="TELEX_RELEASE">Telex Release</option>
                <option value="ORIGINAL_BL">Original B/L</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('releaseStatus')}</label>
              <select name="releaseStatus" value={formData.releaseStatus} onChange={handleChange}>
                <option value="PENDING">Pending</option>
                <option value="RELEASED">Released</option>
                <option value="NOT_APPLICABLE">Not Applicable</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Release Date</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Release Remarks / Additional Notes</label>
            <textarea
              name="releaseRemarks"
              value={formData.releaseRemarks}
              onChange={handleChange}
              rows="3"
              placeholder="Enter any additional notes about the release..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              {t('cancel')}
            </button>
            <button 
              type="button" 
              onClick={handleExportPDF}
              className="btn-export"
              style={{ 
                backgroundColor: '#17a2b8', 
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              📄 Export PDF
            </button>
            <button type="submit" disabled={saving} className="btn-save">
              {saving ? t('loading') + '...' : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReleaseModal;
