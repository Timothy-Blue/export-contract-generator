import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './BuyerModal.css';

const BankDetailsModal = ({ isOpen, onClose, onSave }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
    bankAddress: '',
    isDefault: false
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      setFormData({
        bankName: '',
        accountName: '',
        accountNumber: '',
        swiftCode: '',
        bankAddress: '',
        isDefault: false
      });
      onClose();
    } catch (error) {
      console.error('Error saving bank details:', error);
      alert('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t('addBankDetails')}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('bankName')} *</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              required
              placeholder="e.g., VIETCOMBANK"
            />
          </div>
          <div className="form-group">
            <label>{t('accountName')} *</label>
            <input
              type="text"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              required
              placeholder="e.g., BINH DUONG IMPORT EXPORT PRODUCTION TRADING COMPANY LIMITED"
            />
          </div>
          <div className="form-group">
            <label>{t('accountNumber')} *</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              placeholder="e.g., 0481000354262"
            />
          </div>
          <div className="form-group">
            <label>{t('swiftCode')} *</label>
            <input
              type="text"
              name="swiftCode"
              value={formData.swiftCode}
              onChange={handleChange}
              required
              placeholder="e.g., ICBVVNVX048"
            />
          </div>
          <div className="form-group">
            <label>{t('bankAddress')} *</label>
            <textarea
              name="bankAddress"
              value={formData.bankAddress}
              onChange={handleChange}
              required
              rows="3"
              placeholder="e.g., BINH DUONG BRANCH, 34 LAI HUNG, TAN BINH WARD, DI AN TOWN, BINH DUONG, VIETNAM"
            />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
                style={{ width: 'auto', margin: 0 }}
              />
              {t('setAsDefault')}
            </label>
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

export default BankDetailsModal;
