const Commodity = require('../models/Commodity');

/**
 * @desc    Get all commodities
 * @route   GET /api/commodities
 * @access  Public
 */
exports.getAllCommodities = async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const commodities = await Commodity.find({ isActive }).sort({ name: 1 });
    res.json(commodities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single commodity
 * @route   GET /api/commodities/:id
 * @access  Public
 */
exports.getCommodityById = async (req, res) => {
  try {
    const commodity = await Commodity.findById(req.params.id);
    if (!commodity) {
      return res.status(404).json({ message: 'Commodity not found' });
    }
    res.json(commodity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new commodity
 * @route   POST /api/commodities
 * @access  Public
 */
exports.createCommodity = async (req, res) => {
  try {
    const commodity = new Commodity(req.body);
    const savedCommodity = await commodity.save();
    res.status(201).json(savedCommodity);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update commodity
 * @route   PUT /api/commodities/:id
 * @access  Public
 */
exports.updateCommodity = async (req, res) => {
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
};

/**
 * @desc    Delete commodity (soft delete)
 * @route   DELETE /api/commodities/:id
 * @access  Public
 */
exports.deleteCommodity = async (req, res) => {
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
};
