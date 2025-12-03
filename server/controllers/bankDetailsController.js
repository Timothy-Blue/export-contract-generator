const BankDetails = require('../models/BankDetails');

/**
 * @desc    Get all bank details
 * @route   GET /api/bank-details
 * @access  Public
 */
exports.getAllBankDetails = async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const bankDetails = await BankDetails.find({ isActive }).sort({ bankName: 1 });
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get default bank details
 * @route   GET /api/bank-details/default
 * @access  Public
 */
exports.getDefaultBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findOne({ isDefault: true, isActive: true });
    if (!bankDetails) {
      return res.status(404).json({ message: 'No default bank details found' });
    }
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single bank details
 * @route   GET /api/bank-details/:id
 * @access  Public
 */
exports.getBankDetailsById = async (req, res) => {
  try {
    // Prevent 'default' from being treated as an ID
    if (req.params.id === 'default') {
      return res.status(400).json({ message: 'Invalid ID. Use /api/bank-details/default route instead.' });
    }
    
    const bankDetails = await BankDetails.findById(req.params.id);
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    res.json(bankDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new bank details
 * @route   POST /api/bank-details
 * @access  Public
 */
exports.createBankDetails = async (req, res) => {
  try {
    // If setting as default, remove default from others
    if (req.body.isDefault) {
      await BankDetails.updateMany({}, { isDefault: false });
    }
    
    const bankDetails = new BankDetails(req.body);
    const savedBankDetails = await bankDetails.save();
    res.status(201).json(savedBankDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update bank details
 * @route   PUT /api/bank-details/:id
 * @access  Public
 */
exports.updateBankDetails = async (req, res) => {
  try {
    // If setting as default, remove default from others
    if (req.body.isDefault) {
      await BankDetails.updateMany({ _id: { $ne: req.params.id } }, { isDefault: false });
    }
    
    const bankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    
    res.json(bankDetails);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete bank details (soft delete)
 * @route   DELETE /api/bank-details/:id
 * @access  Public
 */
exports.deleteBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetails.findByIdAndUpdate(
      req.params.id,
      { isActive: false, isDefault: false },
      { new: true }
    );
    
    if (!bankDetails) {
      return res.status(404).json({ message: 'Bank details not found' });
    }
    
    res.json({ message: 'Bank details deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
