import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './BuyerModal.css';

const SellerModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: '',
    taxId: '',
    type: 'SELLER'
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
        country: '',
        taxId: '',
        type: 'SELLER'
      });
      onClose();
    } catch (error) {
      console.error('Error saving seller:', error);
      alert('Failed to save seller');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('addSeller')}</h2>
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
              placeholder="e.g., HOMI METAL CO., LTD"
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
              placeholder="e.g., NO. 236, XINJIN RD., XINYING DIST., TAINAN CITY 730, TAIWAN (R.O.C)"
            />
          </div>
          <div className="form-group">
            <label>{t('contactPerson')}</label>
            <input
              type="text"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleChange}
              placeholder="Contact person name"
            />
          </div>
          <div className="form-group">
            <label>{t('email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seller@example.com"
            />
          </div>
          <div className="form-group">
            <label>{t('phone')}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+886 6 633 5566"
            />
          </div>
          <div className="form-group">
            <label>{t('country')}</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="e.g., Taiwan, Vietnam"
            />
          </div>
          <div className="form-group">
            <label>{t('taxId')}</label>
            <input
              type="text"
              name="taxId"
              value={formData.taxId}
              onChange={handleChange}
              placeholder="Tax ID / Business Registration Number"
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

export default SellerModal;
