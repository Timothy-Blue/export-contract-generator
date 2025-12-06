const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  contractNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contractDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Parties
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party',
    required: true
  },
  
  // Article 1: Commodity, Quality & Quantity
  commodity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commodity',
    required: true
  },
  commodityDescription: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'MT'
  },
  tolerance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  origin: {
    type: String,
    required: true
  },
  packing: {
    type: String,
    required: true
  },
  qualitySpec: {
    type: String
  },
  
  // Article 2: Price
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  incoterm: {
    type: String,
    required: true,
    enum: ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
  },
  portLocation: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  totalAmountText: {
    type: String
  },
  
  // Article 3: Payment
  paymentTerm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentTerm',
    required: true
  },
  paymentTermText: {
    type: String,
    required: true
  },
  
  // Bank Details
  bankDetails: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankDetails',
    required: true
  },
  
  // Calculated fields
  minQuantity: {
    type: Number
  },
  maxQuantity: {
    type: Number
  },
  minTotalAmount: {
    type: Number
  },
  maxTotalAmount: {
    type: Number
  },
  
  // Additional Terms
  shipmentPeriod: {
    type: String
  },
  additionalTerms: {
    type: String
  },
  
  // Buyer and Seller Terms
  buyerTerms: {
    type: String,
    default: () => {
      const { getDefaultBuyerTerms } = require('../utils/defaultTerms');
      return getDefaultBuyerTerms();
    }
  },
  sellerTerms: {
    type: String,
    default: () => {
      const { getDefaultSellerTerms } = require('../utils/defaultTerms');
      return getDefaultSellerTerms();
    }
  },
  
  // Release SWB / Telex Release
  releaseType: {
    type: String,
    enum: ['SWB', 'TELEX_RELEASE', 'ORIGINAL_BL', 'NOT_SPECIFIED'],
    default: 'NOT_SPECIFIED'
  },
  releaseStatus: {
    type: String,
    enum: ['PENDING', 'RELEASED', 'NOT_APPLICABLE'],
    default: 'PENDING'
  },
  releaseDate: {
    type: Date
  },
  releaseRemarks: {
    type: String
  },
  
  // Invoice/Debit Note Information
  debitNoteNumber: {
    type: String
  },
  invoiceDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['DRAFT', 'FINALIZED', 'SENT', 'SIGNED', 'CANCELLED'],
    default: 'DRAFT'
  },
  
  // Metadata
  createdBy: {
    type: String
  },
  lastModifiedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient searching
contractSchema.index({ contractNumber: 1 });
contractSchema.index({ contractDate: -1 });
contractSchema.index({ buyer: 1 });
contractSchema.index({ status: 1 });

// Pre-save middleware to calculate tolerance ranges
contractSchema.pre('save', function(next) {
  if (this.quantity && this.tolerance) {
    const toleranceAmount = (this.quantity * this.tolerance) / 100;
    this.minQuantity = this.quantity - toleranceAmount;
    this.maxQuantity = this.quantity + toleranceAmount;
  }
  
  if (this.totalAmount && this.tolerance) {
    const toleranceAmount = (this.totalAmount * this.tolerance) / 100;
    this.minTotalAmount = this.totalAmount - toleranceAmount;
    this.maxTotalAmount = this.totalAmount + toleranceAmount;
  }
  
  next();
});

module.exports = mongoose.model('Contract', contractSchema);
