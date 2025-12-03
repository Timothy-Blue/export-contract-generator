const Contract = require('../models/Contract');
const Party = require('../models/Party');
const { 
  calculateTotalAmount, 
  calculateToleranceRange, 
  numberToText,
  generateContractNumber,
  validateContractData
} = require('../utils/calculations');

/**
 * @desc    Get all contracts with optional filters
 * @route   GET /api/contracts
 * @access  Public
 */
exports.getAllContracts = async (req, res) => {
  try {
    const { status, buyer, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (status) query.status = status;
    if (buyer) query.buyer = buyer;
    if (search) {
      query.contractNumber = { $regex: search, $options: 'i' };
    }
    
    const contracts = await Contract.find(query)
      .populate('buyer', 'companyName address email')
      .populate('seller', 'companyName address email')
      .populate('commodity', 'name description')
      .populate('paymentTerm', 'name terms')
      .populate('bankDetails')
      .sort({ contractDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Contract.countDocuments(query);
    
    res.json({
      contracts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Search contracts by contract number or buyer name
 * @route   GET /api/contracts/search
 * @access  Public
 */
exports.searchContracts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // First, find buyers matching the query
    const matchingBuyers = await Party.find({
      companyName: { $regex: query, $options: 'i' },
      type: 'BUYER'
    }).select('_id');
    
    const buyerIds = matchingBuyers.map(b => b._id);
    
    // Search by contract number OR buyer IDs
    const searchQuery = {
      $or: [
        { contractNumber: { $regex: query, $options: 'i' } },
        { buyer: { $in: buyerIds } }
      ]
    };
    
    const contracts = await Contract.find(searchQuery)
      .populate('buyer', 'companyName address email')
      .populate('seller', 'companyName address email')
      .populate('commodity', 'name description')
      .populate('paymentTerm', 'name terms')
      .populate('bankDetails')
      .sort({ contractDate: -1 })
      .limit(50); // Limit results for performance
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single contract by ID
 * @route   GET /api/contracts/:id
 * @access  Public
 */
exports.getContractById = async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('buyer')
      .populate('seller')
      .populate('commodity')
      .populate('paymentTerm')
      .populate('bankDetails');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new contract
 * @route   POST /api/contracts
 * @access  Public
 */
exports.createContract = async (req, res) => {
  try {
    const contractData = req.body;
    
    // Validate contract data
    const validation = validateContractData(contractData);
    if (!validation.isValid) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validation.errors 
      });
    }
    
    // Generate contract number if not provided
    if (!contractData.contractNumber) {
      contractData.contractNumber = generateContractNumber();
    }
    
    // Calculate total amount
    contractData.totalAmount = calculateTotalAmount(
      contractData.quantity, 
      contractData.unitPrice
    );
    
    // Convert total amount to text
    contractData.totalAmountText = numberToText(
      contractData.totalAmount, 
      contractData.currency
    );
    
    // Calculate tolerance ranges
    if (contractData.tolerance) {
      const quantityRange = calculateToleranceRange(
        contractData.quantity, 
        contractData.tolerance
      );
      const amountRange = calculateToleranceRange(
        contractData.totalAmount, 
        contractData.tolerance
      );
      
      contractData.minQuantity = quantityRange.min;
      contractData.maxQuantity = quantityRange.max;
      contractData.minTotalAmount = amountRange.min;
      contractData.maxTotalAmount = amountRange.max;
    }
    
    const contract = new Contract(contractData);
    const savedContract = await contract.save();
    
    // Populate references before sending response
    await savedContract.populate('buyer seller commodity paymentTerm bankDetails');
    
    res.status(201).json(savedContract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Update contract
 * @route   PUT /api/contracts/:id
 * @access  Public
 */
exports.updateContract = async (req, res) => {
  try {
    const contractData = req.body;
    
    // Recalculate total amount if quantity or price changed
    if (contractData.quantity || contractData.unitPrice) {
      const contract = await Contract.findById(req.params.id);
      const quantity = contractData.quantity || contract.quantity;
      const unitPrice = contractData.unitPrice || contract.unitPrice;
      
      contractData.totalAmount = calculateTotalAmount(quantity, unitPrice);
      contractData.totalAmountText = numberToText(
        contractData.totalAmount, 
        contractData.currency || contract.currency
      );
      
      // Recalculate tolerance ranges
      if (contractData.tolerance !== undefined || contract.tolerance) {
        const tolerance = contractData.tolerance !== undefined 
          ? contractData.tolerance 
          : contract.tolerance;
        
        const quantityRange = calculateToleranceRange(quantity, tolerance);
        const amountRange = calculateToleranceRange(contractData.totalAmount, tolerance);
        
        contractData.minQuantity = quantityRange.min;
        contractData.maxQuantity = quantityRange.max;
        contractData.minTotalAmount = amountRange.min;
        contractData.maxTotalAmount = amountRange.max;
      }
    }
    
    contractData.lastModifiedBy = contractData.lastModifiedBy || 'system';
    
    const contract = await Contract.findByIdAndUpdate(
      req.params.id,
      contractData,
      { new: true, runValidators: true }
    )
      .populate('buyer seller commodity paymentTerm bankDetails');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json(contract);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @desc    Delete contract
 * @route   DELETE /api/contracts/:id
 * @access  Public
 */
exports.deleteContract = async (req, res) => {
  try {
    const contract = await Contract.findByIdAndDelete(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Calculate contract values (for real-time calculations)
 * @route   POST /api/contracts/calculate
 * @access  Public
 */
exports.calculateContractValues = async (req, res) => {
  try {
    const { quantity, unitPrice, tolerance, currency } = req.body;
    
    const totalAmount = calculateTotalAmount(quantity, unitPrice);
    const quantityRange = calculateToleranceRange(quantity, tolerance);
    const amountRange = calculateToleranceRange(totalAmount, tolerance);
    const totalAmountText = numberToText(totalAmount, currency);
    
    res.json({
      totalAmount,
      totalAmountText,
      quantityRange,
      amountRange
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
