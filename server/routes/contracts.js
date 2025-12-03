const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');

// @route   GET /api/contracts
// @desc    Get all contracts with optional filters
// @access  Public
router.get('/', contractController.getAllContracts);

// @route   GET /api/contracts/search
// @desc    Search contracts by contract number or buyer name
// @access  Public
router.get('/search', contractController.searchContracts);

// @route   GET /api/contracts/:id
// @desc    Get single contract by ID
// @access  Public
router.get('/:id', contractController.getContractById);

// @route   POST /api/contracts
// @desc    Create new contract
// @access  Public
router.post('/', contractController.createContract);

// @route   PUT /api/contracts/:id
// @desc    Update contract
// @access  Public
router.put('/:id', contractController.updateContract);

// @route   DELETE /api/contracts/:id
// @desc    Delete contract
// @access  Public
router.delete('/:id', contractController.deleteContract);

// @route   POST /api/contracts/calculate
// @desc    Calculate contract values (for real-time calculations)
// @access  Public
router.post('/calculate', contractController.calculateContractValues);

module.exports = router;
