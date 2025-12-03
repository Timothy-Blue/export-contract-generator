const express = require('express');
const router = express.Router();
const partyController = require('../controllers/partyController');

// @route   GET /api/parties
// @desc    Get all parties (buyers/sellers)
// @access  Public
router.get('/', partyController.getAllParties);

// @route   GET /api/parties/:id
// @desc    Get single party
// @access  Public
router.get('/:id', partyController.getPartyById);

// @route   POST /api/parties
// @desc    Create new party
// @access  Public
router.post('/', partyController.createParty);

// @route   PUT /api/parties/:id
// @desc    Update party
// @access  Public
router.put('/:id', partyController.updateParty);

// @route   DELETE /api/parties/:id
// @desc    Delete party (soft delete)
// @access  Public
router.delete('/:id', partyController.deleteParty);

module.exports = router;
