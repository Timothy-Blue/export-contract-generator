import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './BuyerModal.css';

const BuyerModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    type: 'BUYER'
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
        companyName: '',
        address: '',
        contactPerson: '',
        email: '',
        phone: '',
        type: 'BUYER'
      });
      onClose();
    } catch (error) {
      console.error('Error saving buyer:', error);
      alert('Failed to save buyer');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('addBuyer')}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('companyName')} *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              required
              placeholder="e.g., FORMOSA SHYEN HORNG METAL SDN.BHD"
            />
          </div>
          <div className="form-group">
            <label>{t('address')} *</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              rows="3"
              placeholder="e.g., LOT 2-33, JALAN PERINDUSTRIAN MAHKOTA 2, TAMAN PERINDUSTRIAN MAHKOTA 43700 BERANANG, SELANGOR D.E., MALAYSIA"
            />
          </div>
          <div className="form-group">
            <label>{t('contactPerson')}</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder={t('contactPersonPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('emailPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+60 12 345 6789"
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              {t('cancel')}
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

export default BuyerModal;
