const mongoose = require('mongoose');

const paymentTermSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  // Example: "10% TT in advance, 90% against copy of shipping documents"
  terms: {
    type: String,
    required: true
  },
  depositPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  daysFromBL: {
    type: Number,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentTerm', paymentTermSchema);
