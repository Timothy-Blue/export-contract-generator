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
    required: true
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
