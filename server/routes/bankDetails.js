const express = require('express');
const router = express.Router();
const bankDetailsController = require('../controllers/bankDetailsController');

// @route   GET /api/bank-details
// @desc    Get all bank details
// @access  Public
router.get('/', bankDetailsController.getAllBankDetails);

// @route   GET /api/bank-details/default
// @desc    Get default bank details
// @access  Public
router.get('/default', bankDetailsController.getDefaultBankDetails);

// @route   GET /api/bank-details/:id
// @desc    Get single bank details
// @access  Public
router.get('/:id', bankDetailsController.getBankDetailsById);

// @route   POST /api/bank-details
// @desc    Create new bank details
// @access  Public
router.post('/', bankDetailsController.createBankDetails);

// @route   PUT /api/bank-details/:id
// @desc    Update bank details
// @access  Public
router.put('/:id', bankDetailsController.updateBankDetails);

// @route   DELETE /api/bank-details/:id
// @desc    Delete bank details (soft delete)
// @access  Public
router.delete('/:id', bankDetailsController.deleteBankDetails);

module.exports = router;
