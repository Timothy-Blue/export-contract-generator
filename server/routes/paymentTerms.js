const express = require('express');
const router = express.Router();
const paymentTermController = require('../controllers/paymentTermController');

// @route   GET /api/payment-terms
// @desc    Get all payment terms
// @access  Public
router.get('/', paymentTermController.getAllPaymentTerms);

// @route   GET /api/payment-terms/:id
// @desc    Get single payment term
// @access  Public
router.get('/:id', paymentTermController.getPaymentTermById);

// @route   POST /api/payment-terms
// @desc    Create new payment term
// @access  Public
router.post('/', paymentTermController.createPaymentTerm);

// @route   PUT /api/payment-terms/:id
// @desc    Update payment term
// @access  Public
router.put('/:id', paymentTermController.updatePaymentTerm);

// @route   DELETE /api/payment-terms/:id
// @desc    Delete payment term (soft delete)
// @access  Public
router.delete('/:id', paymentTermController.deletePaymentTerm);

module.exports = router;
