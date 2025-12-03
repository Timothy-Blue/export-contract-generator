const express = require('express');
const router = express.Router();
const commodityController = require('../controllers/commodityController');

// @route   GET /api/commodities
// @desc    Get all commodities
// @access  Public
router.get('/', commodityController.getAllCommodities);

// @route   GET /api/commodities/:id
// @desc    Get single commodity
// @access  Public
router.get('/:id', commodityController.getCommodityById);

// @route   POST /api/commodities
// @desc    Create new commodity
// @access  Public
router.post('/', commodityController.createCommodity);

// @route   PUT /api/commodities/:id
// @desc    Update commodity
// @access  Public
router.put('/:id', commodityController.updateCommodity);

// @route   DELETE /api/commodities/:id
// @desc    Delete commodity (soft delete)
// @access  Public
router.delete('/:id', commodityController.deleteCommodity);

module.exports = router;
