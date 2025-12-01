import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { contractAPI, partyAPI, commodityAPI, paymentTermAPI, bankDetailsAPI } from '../services/api';
import { INCOTERMS, CURRENCIES, UNITS } from '../constants';
import BuyerModal from './BuyerModal';
import SellerModal from './SellerModal';
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
    status: 'DRAFT'
  });
  
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
    if (formData.quantity && formData.unitPrice) {
      calculateValues();
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
      alert('Failed to load master data.\n\nError: ' + errorMsg + '\n\nPlease ensure MongoDB is running and the database is seeded.\nRun: node server/seed.js');
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
        status: contract.status
      });
      
      setCalculations({
        totalAmount: contract.totalAmount,
        totalAmountText: contract.totalAmountText,
        quantityRange: { min: contract.minQuantity, max: contract.maxQuantity },
        amountRange: { min: contract.minTotalAmount, max: contract.maxTotalAmount }
      });
    } catch (error) {
      console.error('Error loading contract:', error);
      alert('Failed to load contract');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      alert('Buyer added successfully!');
    } catch (error) {
      console.error('Error creating buyer:', error);
      alert('Failed to create buyer: ' + (error.response?.data?.message || error.message));
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
      
      alert('Seller added successfully!');
    } catch (error) {
      console.error('Error creating seller:', error);
      alert('Failed to create seller: ' + (error.response?.data?.message || error.message));
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
      alert('Please select a buyer or add a new buyer');
      return;
    }
    if (!formData.seller) {
      alert('Please select a seller');
      return;
    }
    if (!formData.commodity) {
      alert('Please select a commodity');
      return;
    }
    if (!formData.paymentTerm) {
      alert('Please select payment terms');
      return;
    }
    if (!formData.bankDetails) {
      alert('Please select bank details');
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
        alert('Contract updated successfully!');
      } else {
        await contractAPI.create(submitData);
        alert('Contract created successfully!');
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving contract:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Failed to save contract.\n\nError: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="contract-form-container">
      <h2>{contractId ? t('edit') + ' ' + t('contractDetails') : t('newContract')}</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Parties Section */}
        <section className="form-section">
          <h3>Parties</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t('buyer')} *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <Select
                    options={buyers}
                    value={buyers.find(b => b.value === formData.buyer)}
                    onChange={(opt) => handleSelectChange('buyer', opt)}
                    placeholder={t('buyer')}
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
                    placeholder={t('seller')}
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
          <h3>Article 1: Commodity, Quality & Quantity</h3>
          <div className="form-group">
            <label>{t('commodity')} *</label>
            <Select
              options={commodities}
              value={commodities.find(c => c.value === formData.commodity)}
              onChange={(opt) => handleSelectChange('commodity', opt)}
              placeholder={t('commodity')}
              required
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
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
              <label>Quantity *</label>
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
              <label>Unit *</label>
              <Select
                options={UNITS}
                value={UNITS.find(u => u.value === formData.unit)}
                onChange={(opt) => handleSelectChange('unit', opt)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tolerance (%)</label>
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
              <strong>Quantity Range:</strong> {calculations.quantityRange.min} - {calculations.quantityRange.max} {formData.unit}
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label>Origin *</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Packing *</label>
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
            <label>Quality Specification</label>
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
          <h3>Article 2: Price</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Unit Price *</label>
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
              <label>Currency *</label>
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
              <strong>Total Amount:</strong>
              <span className="amount">{formData.currency} {calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {calculations.totalAmountText && (
              <div className="calc-item">
                <strong>In Words:</strong>
                <span className="amount-text">{calculations.totalAmountText}</span>
              </div>
            )}
            {formData.tolerance > 0 && (
              <div className="calc-item">
                <strong>Amount Range:</strong>
                <span className="amount-range">
                  {formData.currency} {calculations.amountRange.min?.toLocaleString('en-US', { minimumFractionDigits: 2 })} - {calculations.amountRange.max?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Incoterm *</label>
              <Select
                options={INCOTERMS}
                value={INCOTERMS.find(i => i.value === formData.incoterm)}
                onChange={(opt) => handleSelectChange('incoterm', opt)}
                required
              />
            </div>
            <div className="form-group">
              <label>Port/Location *</label>
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
          <h3>Article 3: Payment</h3>
          <div className="form-group">
            <label>Payment Terms *</label>
            <Select
              options={paymentTerms}
              value={paymentTerms.find(p => p.value === formData.paymentTerm)}
              onChange={(opt) => handleSelectChange('paymentTerm', opt)}
              placeholder="Select Payment Terms"
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Terms Text *</label>
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
          <h3>Seller's Bank Details</h3>
          <div className="form-group">
            <label>Bank Details *</label>
            <Select
              options={bankDetails}
              value={bankDetails.find(b => b.value === formData.bankDetails)}
              onChange={(opt) => handleSelectChange('bankDetails', opt)}
              placeholder="Select Bank Details"
              required
            />
          </div>
        </section>

        {/* Additional Information */}
        <section className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>Shipment Period</label>
            <input
              type="text"
              name="shipmentPeriod"
              value={formData.shipmentPeriod}
              onChange={handleChange}
              placeholder="e.g., Within 30 days from receipt of L/C"
            />
          </div>
          <div className="form-group">
            <label>Additional Terms & Conditions</label>
            <textarea
              name="additionalTerms"
              value={formData.additionalTerms}
              onChange={handleChange}
              rows="4"
              placeholder="Enter any additional terms and conditions..."
            />
          </div>
        </section>

        {/* Contract Status */}
        <section className="form-section">
          <h3>Contract Status</h3>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="DRAFT">Draft</option>
              <option value="FINALIZED">Finalized</option>
              <option value="SENT">Sent</option>
              <option value="SIGNED">Signed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('loading') + '...' : t('save')}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>
            {t('cancel')}
          </button>
        </div>
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
    </div>
  );
};

export default ContractForm;

