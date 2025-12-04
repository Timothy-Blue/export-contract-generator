import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './BuyerModal.css';

const CommodityModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    hsCode: '',
    origin: '',
    packing: '',
    qualitySpec: ''
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setFormData({
        name: '',
        description: '',
        hsCode: '',
        origin: '',
        packing: '',
        qualitySpec: ''
      });
      onClose();
    } catch (error) {
      console.error('Error saving commodity:', error);
      alert('Failed to save commodity');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('addCommodity')}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('commodityName')} *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., Aluminium Ingot ADC-12"
            />
          </div>
          <div className="form-group">
            <label>{t('description')}</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              placeholder="Additional details about the commodity"
            />
          </div>
          <div className="form-group">
            <label>{t('hsCode')}</label>
            <input
              type="text"
              name="hsCode"
              value={formData.hsCode}
              onChange={handleChange}
              placeholder="e.g., 7601.20.00"
            />
          </div>
          <div className="form-group">
            <label>{t('origin')}</label>
            <input
              type="text"
              name="origin"
              value={formData.origin}
              onChange={handleChange}
              placeholder="e.g., Thailand"
            />
          </div>
          <div className="form-group">
            <label>{t('packing')}</label>
            <input
              type="text"
              name="packing"
              value={formData.packing}
              onChange={handleChange}
              placeholder="e.g., In Bundle"
            />
          </div>
          <div className="form-group">
            <label>{t('qualitySpec')}</label>
            <textarea
              name="qualitySpec"
              value={formData.qualitySpec}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., According to standard specifications"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={saving}>
              {t('cancel')}
            </button>
            <button type="submit" className="btn-save" disabled={saving}>
              {saving ? t('loading') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommodityModal;
