const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BUYER', 'SELLER'],
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: {
    type: String
  },
  country: {
    type: String
  },
  taxId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster searches
partySchema.index({ companyName: 'text' });
partySchema.index({ type: 1, isActive: 1 });

module.exports = mongoose.model('Party', partySchema);
