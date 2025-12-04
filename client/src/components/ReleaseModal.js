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
      alert(t('releaseInfoSaved'));
      // Don't close modal automatically, let user export or close manually
    } catch (error) {
      console.error('Error saving release info:', error);
      alert(t('failedToSaveRelease'));
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    if (hasUnsavedChanges) {
      alert(t('saveBeforeExport'));
      return;
    }
    window.open(exportAPI.downloadReleaseNote(contract._id), '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
        <div className="modal-header">
          <h2>{t('releaseDocument')} - {contract?.contractNumber}</h2>
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
            {t('unsavedChangesWarning')}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('debitNoteNumber')}</label>
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
              <label>{t('invoiceDate')}</label>
              <input
                type="date"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t('dueDate')}</label>
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
                <option value="NOT_SPECIFIED">{t('NOT_SPECIFIED')}</option>
                <option value="SWB">{t('SWB')}</option>
                <option value="TELEX_RELEASE">{t('TELEX_RELEASE')}</option>
                <option value="ORIGINAL_BL">{t('ORIGINAL_BL')}</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t('releaseStatus')}</label>
              <select name="releaseStatus" value={formData.releaseStatus} onChange={handleChange}>
                <option value="PENDING">{t('PENDING')}</option>
                <option value="RELEASED">{t('RELEASED')}</option>
                <option value="NOT_APPLICABLE">{t('NOT_APPLICABLE')}</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>{t('releaseDate')}</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t('releaseRemarks')}</label>
            <textarea
              name="releaseRemarks"
              value={formData.releaseRemarks}
              onChange={handleChange}
              rows="3"
              placeholder={t('releaseRemarksPlaceholder')}
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
              📄 {t('exportPDF')}
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
