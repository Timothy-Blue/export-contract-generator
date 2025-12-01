const express = require('express');
const router = express.Router();
const PaymentTerm = require('../models/PaymentTerm');

// @route   GET /api/payment-terms
// @desc    Get all payment terms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const paymentTerms = await PaymentTerm.find({ isActive }).sort({ name: 1 });
    res.json(paymentTerms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payment-terms/:id
// @desc    Get single payment term
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findById(req.params.id);
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    res.json(paymentTerm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payment-terms
// @desc    Create new payment term
// @access  Public
router.post('/', async (req, res) => {
  try {
    const paymentTerm = new PaymentTerm(req.body);
    const savedPaymentTerm = await paymentTerm.save();
    res.status(201).json(savedPaymentTerm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/payment-terms/:id
// @desc    Update payment term
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    
    res.json(paymentTerm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/payment-terms/:id
// @desc    Delete payment term (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    
    res.json({ message: 'Payment term deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
