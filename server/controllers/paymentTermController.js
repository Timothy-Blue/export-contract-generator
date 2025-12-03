const PaymentTerm = require('../models/PaymentTerm');

/**
 * @desc    Get all payment terms
 * @route   GET /api/payment-terms
 * @access  Public
 */
exports.getAllPaymentTerms = async (req, res) => {
  try {
    const { isActive = true } = req.query;
    const paymentTerms = await PaymentTerm.find({ isActive }).sort({ name: 1 });
    res.json(paymentTerms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single payment term
 * @route   GET /api/payment-terms/:id
 * @access  Public
 */
exports.getPaymentTermById = async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findById(req.params.id);
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    res.json(paymentTerm);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new payment term
 * @route   POST /api/payment-terms
 * @access  Public
 */
exports.createPaymentTerm = async (req, res) => {
  try {
    const paymentTerm = new PaymentTerm(req.body);
    const savedPaymentTerm = await paymentTerm.save();
    res.status(201).json(savedPaymentTerm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update payment term
 * @route   PUT /api/payment-terms/:id
 * @access  Public
 */
exports.updatePaymentTerm = async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    
    res.json(paymentTerm);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete payment term (soft delete)
 * @route   DELETE /api/payment-terms/:id
 * @access  Public
 */
exports.deletePaymentTerm = async (req, res) => {
  try {
    const paymentTerm = await PaymentTerm.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!paymentTerm) {
      return res.status(404).json({ message: 'Payment term not found' });
    }
    
    res.json({ message: 'Payment term deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
