const express = require('express');
const router = express.Router();
const Commodity = require('../models/Commodity');

// @route   GET /api/commodities
// @desc    Get all commodities
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const commodities = await Commodity.find({ isActive }).sort({ name: 1 });
    res.json(commodities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/commodities/:id
// @desc    Get single commodity
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const commodity = await Commodity.findById(req.params.id);
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    res.json(commodity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/commodities
// @desc    Create new commodity
// @access  Public
router.post('/', async (req, res) => {
  try {
    const commodity = new Commodity(req.body);
    const savedCommodity = await commodity.save();
    res.status(201).json(savedCommodity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/commodities/:id
// @desc    Update commodity
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const commodity = await Commodity.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    
    res.json(commodity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/commodities/:id
// @desc    Delete commodity (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const commodity = await Commodity.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    
    res.json({ message: 'Commodity deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
