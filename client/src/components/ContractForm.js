import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { contractAPI, partyAPI, commodityAPI, paymentTermAPI, bankDetailsAPI } from '../services/api';
import { INCOTERMS, CURRENCIES, UNITS } from '../constants';
import BuyerModal from './BuyerModal';
import SellerModal from './SellerModal';
import CommodityModal from './CommodityModal';
import BankDetailsModal from './BankDetailsModal';
import { useLanguage } from '../contexts/LanguageContext';
import './ContractForm.css';

const ContractForm = ({ contractId, onSuccess }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [bankDetails, setBankDetails] = useState([]);
  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [showCommodityModal, setShowCommodityModal] = useState(false);
  const [showBankDetailsModal, setShowBankDetailsModal] = useState(false);
  
  const [formData, setFormData] = useState({
    buyer: '',
    seller: '',
    commodity: '',
    commodityDescription: '',
    quantity: 100,
    unit: 'MT',
    tolerance: 10,
    origin: '',
    packing: '',
    qualitySpec: '',
    unitPrice: 1161,
    currency: 'USD',
    incoterm: 'CIF',
    portLocation: 'Port Klang, Malaysia',
    paymentTerm: '',
    paymentTermText: '',
    bankDetails: '',
    shipmentPeriod: '',
    additionalTerms: '',
    buyerTerms: '',
    sellerTerms: '',
    status: 'DRAFT'
  });
  
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const [calculations, setCalculations] = useState({
    totalAmount: 0,
    totalAmountText: '',
    quantityRange: { min: 0, max: 0 },
    amountRange: { min: 0, max: 0 }
  });

  useEffect(() => {
    loadMasterData();
    if (contractId) {
      loadContract(contractId);
    }
  }, [contractId]);

  const calculateValues = useCallback(async () => {
    try {
      const response = await contractAPI.calculate({
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        tolerance: parseFloat(formData.tolerance),
        currency: formData.currency
      });
      
      setCalculations(response.data);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  }, [formData.quantity, formData.unitPrice, formData.tolerance, formData.currency]);

  useEffect(() => {
    // Real-time calculation
    if (formData.quantity && formData.unitPrice && formData.unitPrice > 0) {
      calculateValues();
    } else if (formData.unitPrice === 0 || formData.unitPrice === '0') {
      // Reset calculations to 0 when price is 0
      setCalculations({
        totalAmount: 0,
        totalAmountText: '',
        quantityRange: { min: 0, max: 0 },
        amountRange: { min: 0, max: 0 }
      });
    }
  }, [formData.quantity, formData.unitPrice, formData.tolerance, formData.currency, calculateValues]);

  const loadMasterData = async () => {
    try {
      const [buyersRes, sellersRes, commoditiesRes, paymentTermsRes, bankDetailsRes] = await Promise.all([
        partyAPI.getAll({ type: 'BUYER' }),
        partyAPI.getAll({ type: 'SELLER' }),
        commodityAPI.getAll(),
        paymentTermAPI.getAll(),
        bankDetailsAPI.getAll()
      ]);

      const buyerOptions = buyersRes.data.map(b => ({ value: b._id, label: b.companyName, data: b }));
      const sellerOptions = sellersRes.data.map(s => ({ value: s._id, label: s.companyName, data: s }));
      const commodityOptions = commoditiesRes.data.map(c => ({ value: c._id, label: c.name, data: c }));
      const paymentTermOptions = paymentTermsRes.data.map(p => ({ value: p._id, label: p.name, data: p }));
      const bankDetailOptions = bankDetailsRes.data.map(b => ({ value: b._id, label: b.bankName, data: b }));

      setBuyers(buyerOptions);
      setSellers(sellerOptions);
      setCommodities(commodityOptions);
      setPaymentTerms(paymentTermOptions);
      setBankDetails(bankDetailOptions);

      // Set default seller and bank if available
      if (sellersRes.data.length > 0) {
        setFormData(prev => ({ ...prev, seller: sellersRes.data[0]._id }));
      }
      if (bankDetailsRes.data.length > 0) {
        const defaultBank = bankDetailsRes.data.find(b => b.isDefault) || bankDetailsRes.data[0];
        setFormData(prev => ({ ...prev, bankDetails: defaultBank._id }));
      }

      console.log('Master data loaded successfully:', {
        buyers: buyerOptions.length,
        sellers: sellerOptions.length,
        commodities: commodityOptions.length,
        paymentTerms: paymentTermOptions.length,
        bankDetails: bankDetailOptions.length
      });
    } catch (error) {
      console.error('Error loading master data:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(t('failedToLoadMasterData') + '\n\nError: ' + errorMsg + '\n\n' + t('ensureMongoDBRunning'));
    }
  };  const loadContract = async (id) => {
    try {
      setLoading(true);
      const response = await contractAPI.getById(id);
      const contract = response.data;
      
      setFormData({
        buyer: contract.buyer._id,
        seller: contract.seller._id,
        commodity: contract.commodity._id,
        commodityDescription: contract.commodityDescription,
        quantity: contract.quantity,
        unit: contract.unit,
        tolerance: contract.tolerance,
        origin: contract.origin,
        packing: contract.packing,
        qualitySpec: contract.qualitySpec || '',
        unitPrice: contract.unitPrice,
        currency: contract.currency,
        incoterm: contract.incoterm,
        portLocation: contract.portLocation,
        paymentTerm: contract.paymentTerm._id,
        paymentTermText: contract.paymentTermText,
        bankDetails: contract.bankDetails._id,
        shipmentPeriod: contract.shipmentPeriod || '',
        additionalTerms: contract.additionalTerms || '',
        buyerTerms: contract.buyerTerms || '',
        sellerTerms: contract.sellerTerms || '',
        status: contract.status
      });
      
      setCalculations({
        totalAmount: contract.totalAmount,
        totalAmountText: contract.totalAmountText,
        quantityRange: { min: contract.minQuantity, max: contract.maxQuantity },
        amountRange: { min: contract.minTotalAmount, max: contract.maxTotalAmount }
      });
      
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading contract:', error);
      alert(t('failedToLoadContract'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset to 0 if price field is cleared
    if ((name === 'unitPrice' || name === 'quantity') && value === '') {
      setFormData(prev => ({ ...prev, [name]: 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setHasUnsavedChanges(true);
  };

  const handleSaveBuyer = async (buyerData) => {
    try {
      const response = await partyAPI.create(buyerData);
      const newBuyer = response.data;
      
      // Reload buyers list
      const buyersRes = await partyAPI.getAll({ type: 'BUYER' });
      setBuyers(buyersRes.data.map(b => ({ value: b._id, label: b.companyName, data: b })));
      
      // Select the newly created buyer
      setFormData(prev => ({ ...prev, buyer: newBuyer._id }));
      
      // Close modal
      setShowBuyerModal(false);
      
      alert(t('buyerAddedSuccess'));
    } catch (error) {
      console.error('Error creating buyer:', error);
      alert(t('failedToCreateBuyer') + ': ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveSeller = async (sellerData) => {
    try {
      const response = await partyAPI.create(sellerData);
      const newSeller = response.data;
      
      // Reload sellers list
      const sellersRes = await partyAPI.getAll({ type: 'SELLER' });
      setSellers(sellersRes.data.map(s => ({ value: s._id, label: s.companyName, data: s })));
      
      // Select the newly created seller
      setFormData(prev => ({ ...prev, seller: newSeller._id }));
      
      // Close modal
      setShowSellerModal(false);
      
      alert(t('sellerAddedSuccess'));
    } catch (error) {
      console.error('Error creating seller:', error);
      alert(t('failedToCreateSeller') + ': ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveCommodity = async (commodityData) => {
    try {
      const response = await commodityAPI.create(commodityData);
      const newCommodity = response.data;
      
      // Reload commodities list
      const commoditiesRes = await commodityAPI.getAll();
      setCommodities(commoditiesRes.data.map(c => ({ value: c._id, label: c.name, data: c })));
      
      // Select the newly created commodity
      setFormData(prev => ({ ...prev, commodity: newCommodity._id }));
      
      // Close modal
      setShowCommodityModal(false);
      
      alert(t('commodityAddedSuccess'));
    } catch (error) {
      console.error('Error creating commodity:', error);
      alert(t('failedToCreateCommodity') + ': ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSaveBankDetails = async (bankDetailsData) => {
    try {
      const response = await bankDetailsAPI.create(bankDetailsData);
      const newBankDetails = response.data;
      
      // Reload bank details list
      const bankDetailsRes = await bankDetailsAPI.getAll();
      setBankDetails(bankDetailsRes.data.map(b => ({ value: b._id, label: b.bankName, data: b })));
      
      // Select the newly created bank details
      setFormData(prev => ({ ...prev, bankDetails: newBankDetails._id }));
      
      // Close modal
      setShowBankDetailsModal(false);
      
      alert(t('bankDetailsAddedSuccess'));
    } catch (error) {
      console.error('Error creating bank details:', error);
      alert(t('failedToCreateBankDetails') + ': ' + (error.response?.data?.message || error.message));
      throw error;
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption?.value || '' }));
    
    // Auto-populate fields based on selection
    if (name === 'commodity' && selectedOption?.data) {
      const commodity = selectedOption.data;
      setFormData(prev => ({
        ...prev,
        commodityDescription: commodity.description,
        unit: commodity.defaultUnit,
        origin: commodity.defaultOrigin || prev.origin,
        packing: commodity.defaultPacking || prev.packing
      }));
    }
    
    if (name === 'paymentTerm' && selectedOption?.data) {
      setFormData(prev => ({
        ...prev,
        paymentTermText: selectedOption.data.terms
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.buyer) {
      alert(t('pleaseSelectBuyer'));
      return;
    }
    if (!formData.seller) {
      alert(t('pleaseSelectSeller'));
      return;
    }
    if (!formData.commodity) {
      alert(t('pleaseSelectCommodityAlert'));
      return;
    }
    if (!formData.paymentTerm) {
      alert(t('pleaseSelectPaymentTermAlert'));
      return;
    }
    if (!formData.bankDetails) {
      alert(t('pleaseSelectBankAlert'));
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        unitPrice: parseFloat(formData.unitPrice),
        tolerance: parseFloat(formData.tolerance) || 0
      };

      if (contractId) {
        await contractAPI.update(contractId, submitData);
        alert(t('contractUpdatedSuccess'));
      } else {
        await contractAPI.create(submitData);
        alert(t('contractCreatedSuccess'));
      }

      setHasUnsavedChanges(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving contract:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert(t('failedToSaveContract') + '.\n\nError: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      window.history.back();
    }
  };

  const handleConfirmDialogAction = (action) => {
    setShowConfirmDialog(false);
    if (action === 'save') {
      handleSubmit({ preventDefault: () => {} });
    } else if (action === 'discard') {
      setHasUnsavedChanges(false);
      window.history.back();
    }
  };

  return (
    <div className="contract-form-container">
      <h2>{contractId ? t('edit') + ' ' + t('contractDetails') : t('newContract')}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Parties Section */}
        <section className="form-section">
          <h3>{t('parties')}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t('buyer')} *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={buyers}
                    value={buyers.find(b => b.value === formData.buyer)}
                    onChange={(opt) => handleSelectChange('buyer', opt)}
                    placeholder={t('selectBuyerPlaceholder')}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBuyerModal(true)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t('addNewBuyer')}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>{t('seller')} *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={sellers}
                    value={sellers.find(s => s.value === formData.seller)}
                    onChange={(opt) => handleSelectChange('seller', opt)}
                    placeholder={t('selectSellerPlaceholder')}
                    required
                  />
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSellerModal(true)}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {t('addNewSeller')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Article 1: Commodity */}
        <section className="form-section">
          <h3>{t('article1')}</h3>
          <div className="form-group">
            <label>{t('commodity')} *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Select
                  options={commodities}
                  value={commodities.find(c => c.value === formData.commodity)}
                  onChange={(opt) => handleSelectChange('commodity', opt)}
                  placeholder={t('selectCommodityPlaceholder')}
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCommodityModal(true)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('addNewCommodity')}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>{t('description')} *</label>
            <textarea
              name="commodityDescription"
              value={formData.commodityDescription}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>{t('quantity')} *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('unit')} *</label>
              <Select
                options={UNITS}
                value={UNITS.find(u => u.value === formData.unit)}
                onChange={(opt) => handleSelectChange('unit', opt)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('tolerance')}</label>
              <input
                type="number"
                name="tolerance"
                value={formData.tolerance}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
          
          {formData.tolerance > 0 && (
            <div className="info-box">
              <strong>{t('quantityRange')}:</strong> {calculations.quantityRange.min} - {calculations.quantityRange.max} {formData.unit}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('origin')} *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('packing')} *</label>
              <input
                type="text"
                name="packing"
                value={formData.packing}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>{t('qualitySpec')}</label>
            <textarea
              name="qualitySpec"
              value={formData.qualitySpec}
              onChange={handleChange}
              rows="2"
            />
          </div>
        </section>

        {/* Article 2: Price */}
        <section className="form-section">
          <h3>{t('article2')}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t('unitPrice')} *</label>
              <input
                type="number"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>{t('currency')} *</label>
              <Select
                options={CURRENCIES}
                value={CURRENCIES.find(c => c.value === formData.currency)}
                onChange={(opt) => handleSelectChange('currency', opt)}
                required
              />
            </div>
          </div>
          
          <div className="calculation-display">
            <div className="calc-item">
              <strong>{t('totalAmountLabel')}:</strong>
              <span className="amount">{formData.currency} {calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {calculations.totalAmountText && (
              <div className="calc-item">
                <strong>{t('inWords')}:</strong>
                <span className="amount-text">{calculations.totalAmountText}</span>
              </div>
            )}
            {formData.tolerance > 0 && (
              <div className="calc-item">
                <strong>{t('amountRange')}:</strong>
                <span className="amount-range">
                  {formData.currency} {calculations.amountRange.min?.toLocaleString('en-US', { minimumFractionDigits: 2 })} - {calculations.amountRange.max?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>{t('incoterm')} *</label>
              <Select
                options={INCOTERMS}
                value={INCOTERMS.find(i => i.value === formData.incoterm)}
                onChange={(opt) => handleSelectChange('incoterm', opt)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('portLocation')} *</label>
              <input
                type="text"
                name="portLocation"
                value={formData.portLocation}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Article 3: Payment */}
        <section className="form-section">
          <h3>{t('article3')}</h3>
          <div className="form-group">
            <label>{t('paymentTerm')} *</label>
            <Select
              options={paymentTerms}
              value={paymentTerms.find(p => p.value === formData.paymentTerm)}
              onChange={(opt) => handleSelectChange('paymentTerm', opt)}
              placeholder={t('selectPaymentTermPlaceholder')}
              required
            />
          </div>
          <div className="form-group">
            <label>{t('paymentTermText')} *</label>
            <textarea
              name="paymentTermText"
              value={formData.paymentTermText}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
        </section>

        {/* Bank Details */}
        <section className="form-section">
          <h3>{t('sellerBankDetails')}</h3>
          <div className="form-group">
            <label>{t('bankDetails')} *</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <Select
                  options={bankDetails}
                  value={bankDetails.find(b => b.value === formData.bankDetails)}
                  onChange={(opt) => handleSelectChange('bankDetails', opt)}
                  placeholder={t('selectBankPlaceholder')}
                  required
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowBankDetailsModal(true)}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('addNewBank')}
              </button>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="form-section">
          <h3>{t('additionalInformation')}</h3>
          <div className="form-group">
            <label>{t('shipmentPeriod')}</label>
            <input
              type="text"
              name="shipmentPeriod"
              value={formData.shipmentPeriod}
              onChange={handleChange}
              placeholder={t('shipmentPeriodPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('additionalTerms')}</label>
            <textarea
              name="additionalTerms"
              value={formData.additionalTerms}
              onChange={handleChange}
              rows="4"
              placeholder={t('additionalTermsPlaceholder')}
            />
          </div>
        </section>

        {/* Buyer and Seller Terms */}
        <section className="form-section">
          <h3>{t('contractTerms')}</h3>
          <div className="form-group">
            <label>{t('buyerTerms')}</label>
            <textarea
              name="buyerTerms"
              value={formData.buyerTerms}
              onChange={handleChange}
              rows="6"
              placeholder={t('buyerTermsPlaceholder')}
            />
          </div>
          <div className="form-group">
            <label>{t('sellerTerms')}</label>
            <textarea
              name="sellerTerms"
              value={formData.sellerTerms}
              onChange={handleChange}
              rows="6"
              placeholder={t('sellerTermsPlaceholder')}
            />
          </div>
        </section>

        {/* Contract Status */}
        <section className="form-section">
          <h3>{t('contractStatus')}</h3>
          <div className="form-group">
            <label>{t('status')}</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="DRAFT">{t('DRAFT')}</option>
              <option value="FINALIZED">{t('FINALIZED')}</option>
              <option value="SENT">{t('SENT')}</option>
              <option value="SIGNED">{t('SIGNED')}</option>
              <option value="CANCELLED">{t('CANCELLED')}</option>
            </select>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') + '...' : t('save')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={handleCancelClick}>
            {t('cancel')}
          </button>
        </div>

        {showConfirmDialog && (
          <div className="confirmation-dialog-overlay">
            <div className="confirmation-dialog">
              <h3>{t('unsavedChanges')}</h3>
              <p>{t('unsavedChangesMessage')}</p>
              <div className="dialog-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => handleConfirmDialogAction('save')}
                  disabled={loading}
                >
                  {t('save')}
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleConfirmDialogAction('discard')}
                >
                  {t('discardChanges')}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowConfirmDialog(false)}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {showBuyerModal && (
        <BuyerModal
          isOpen={showBuyerModal}
          onClose={() => setShowBuyerModal(false)}
          onSave={handleSaveBuyer}
        />
      )}

      {showSellerModal && (
        <SellerModal
          isOpen={showSellerModal}
          onClose={() => setShowSellerModal(false)}
          onSave={handleSaveSeller}
        />
      )}

      {showCommodityModal && (
        <CommodityModal
          isOpen={showCommodityModal}
          onClose={() => setShowCommodityModal(false)}
          onSave={handleSaveCommodity}
        />
      )}

      {showBankDetailsModal && (
        <BankDetailsModal
          isOpen={showBankDetailsModal}
          onClose={() => setShowBankDetailsModal(false)}
          onSave={handleSaveBankDetails}
        />
      )}
    </div>
  );
};

export default ContractForm;

