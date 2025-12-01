const express = require('express');
const router = express.Router();
const Party = require('../models/Party');

// @route   GET /api/parties
// @desc    Get all parties (buyers/sellers)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, isActive = true } = req.query;
    
    const query = { isActive };
    if (type) query.type = type;
    
    const parties = await Party.find(query).sort({ companyName: 1 });
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/parties/:id
// @desc    Get single party
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/parties
// @desc    Create new party
// @access  Public
router.post('/', async (req, res) => {
  try {
    const party = new Party(req.body);
    const savedParty = await party.save();
    res.status(201).json(savedParty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/parties/:id
// @desc    Update party
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    res.json(party);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/parties/:id
// @desc    Delete party (soft delete)
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const party = await Party.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    
    res.json({ message: 'Party deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
