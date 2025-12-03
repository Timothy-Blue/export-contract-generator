const Party = require('../models/Party');

/**
 * @desc    Get all parties (buyers/sellers)
 * @route   GET /api/parties
 * @access  Public
 */
exports.getAllParties = async (req, res) => {
  try {
    const { type, isActive = true } = req.query;
    
    const query = { isActive };
    if (type) query.type = type;
    
    const parties = await Party.find(query).sort({ companyName: 1 });
    res.json(parties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single party
 * @route   GET /api/parties/:id
 * @access  Public
 */
exports.getPartyById = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) {
      return res.status(404).json({ message: 'Party not found' });
    }
    res.json(party);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new party
 * @route   POST /api/parties
 * @access  Public
 */
exports.createParty = async (req, res) => {
  try {
    const party = new Party(req.body);
    const savedParty = await party.save();
    res.status(201).json(savedParty);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update party
 * @route   PUT /api/parties/:id
 * @access  Public
 */
exports.updateParty = async (req, res) => {
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
};

/**
 * @desc    Delete party (soft delete)
 * @route   DELETE /api/parties/:id
 * @access  Public
 */
exports.deleteParty = async (req, res) => {
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
};
