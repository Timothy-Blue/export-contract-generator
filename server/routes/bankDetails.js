const express = require('express');
const router = express.Router();
const BankDetails = require('../models/BankDetails');

// @route   GET /api/bank-details
// @desc    Get all bank details
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const bankDetails = await BankDetails.find({ isActive }).sort({ bankName: 1 });
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bank-details/default
// @desc    Get default bank details
// @access  Public
router.get('/default', async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({ isDefault: true, isActive: true });
    if (!bankDetails) {
      return res.status(404).json({ message: 'No default bank details found' });
    }
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bank-details/:id
// @desc    Get single bank details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Prevent 'default' from being treated as an ID
    if (req.params.id === 'default') {
      return res.status(400).json({ message: 'Invalid ID. Use /api/bank-details/default route instead.' });
    }
    
    const bankDetails = await BankDetails.findById(req.params.id);
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/bank-details
// @desc    Create new bank details
// @access  Public
router.post('/', async (req, res) => {
  try {
    // If setting as default, remove default from others
    if (req.body.isDefault) {
      await BankDetails.updateMany({}, { isDefault: false });
    }
    
    const bankDetails = new BankDetails(req.body);
    const savedBankDetails = await bankDetails.save();
    res.status(201).json(savedBankDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/bank-details/:id
// @desc    Update bank details
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    // If setting as default, remove default from others
    if (req.body.isDefault) {
      await BankDetails.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }
    
    const bankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    
    res.json(bankDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/bank-details/:id
// @desc    Delete bank details (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const bankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isDefault: false },
      { new: true }
    );
    
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    
    res.json({ message: 'Bank details deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
