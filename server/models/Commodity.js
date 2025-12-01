const mongoose = require('mongoose');

const commoditySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  hsCode: {
    type: String,
    trim: true
  },
  defaultUnit: {
    type: String,
    default: 'MT',
    enum: ['MT', 'KG', 'TONS', 'BAGS', 'PIECES', 'CARTONS', 'CBM']
  },
  defaultOrigin: {
    type: String
  },
  defaultPacking: {
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
commoditySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Commodity', commoditySchema);
