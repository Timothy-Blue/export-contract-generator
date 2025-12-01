const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  swiftCode: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'SWIFT code must be 8 or 11 characters']
  },
  bankAddress: {
    type: String
  },
  iban: {
    type: String
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BankDetails', bankDetailsSchema);
