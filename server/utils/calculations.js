const numberToWords = require('number-to-words');

/**
 * Calculate total amount from quantity and unit price
 * @param {number} quantity 
 * @param {number} unitPrice 
 * @returns {number}
 */
const calculateTotalAmount = (quantity, unitPrice) => {
  if (!quantity || !unitPrice) return 0;
  return parseFloat((quantity * unitPrice).toFixed(2));
};

/**
 * Calculate tolerance range for quantity or amount
 * @param {number} baseValue 
 * @param {number} tolerancePercent 
 * @returns {object} { min, max }
 */
const calculateToleranceRange = (baseValue, tolerancePercent) => {
  if (!baseValue || !tolerancePercent) {
    return { min: baseValue, max: baseValue };
  }
  
  const toleranceAmount = (baseValue * tolerancePercent) / 100;
  return {
    min: parseFloat((baseValue - toleranceAmount).toFixed(2)),
    max: parseFloat((baseValue + toleranceAmount).toFixed(2))
  };
};

/**
 * Convert number to words with currency
 * @param {number} amount 
 * @param {string} currency 
 * @returns {string}
 */
const numberToText = (amount, currency = 'USD') => {
  if (!amount || amount === 0) return `${getCurrencyName(currency)} Zero only`;
  
  const currencyName = getCurrencyName(currency);
  
  // Split into whole and decimal parts
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  
  let text = currencyName + ' ';
  
  // Convert whole part
  if (wholePart > 0) {
    text += capitalizeFirstLetter(numberToWords.toWords(wholePart));
  }
  
  // Add decimal part if exists
  if (decimalPart > 0) {
    text += ' and ' + capitalizeFirstLetter(numberToWords.toWords(decimalPart)) + ' Cents';
  }
  
  text += ' only';
  
  return text;
};

/**
 * Get full currency name from code
 * @param {string} code 
 * @returns {string}
 */
const getCurrencyName = (code) => {
  const currencies = {
    'USD': 'US Dollars',
    'EUR': 'Euros',
    'GBP': 'British Pounds',
    'JPY': 'Japanese Yen',
    'CNY': 'Chinese Yuan',
    'INR': 'Indian Rupees',
    'AED': 'UAE Dirhams',
    'SGD': 'Singapore Dollars',
    'AUD': 'Australian Dollars',
    'CAD': 'Canadian Dollars'
  };
  
  return currencies[code] || code;
};

/**
 * Capitalize first letter of string
 * @param {string} str 
 * @returns {string}
 */
const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Generate unique contract number
 * @param {string} prefix 
 * @returns {string}
 */
const generateContractNumber = (prefix = 'CON') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  
  return `${prefix}-${year}${month}-${timestamp}`;
};

/**
 * Format date for contract
 * @param {Date} date 
 * @returns {string}
 */
const formatContractDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString('en-US', options);
};

/**
 * Validate contract data
 * @param {object} contractData 
 * @returns {object} { isValid, errors }
 */
const validateContractData = (contractData) => {
  const errors = [];
  
  if (!contractData.buyer) errors.push('Buyer is required');
  if (!contractData.seller) errors.push('Seller is required');
  if (!contractData.commodity) errors.push('Commodity is required');
  if (!contractData.quantity || contractData.quantity <= 0) {
    errors.push('Valid quantity is required');
  }
  if (!contractData.unitPrice || contractData.unitPrice <= 0) {
    errors.push('Valid unit price is required');
  }
  if (!contractData.incoterm) errors.push('Incoterm is required');
  if (!contractData.portLocation) errors.push('Port/Location is required');
  if (!contractData.paymentTerm) errors.push('Payment term is required');
  if (!contractData.bankDetails) errors.push('Bank details are required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  calculateTotalAmount,
  calculateToleranceRange,
  numberToText,
  generateContractNumber,
  formatContractDate,
  validateContractData,
  getCurrencyName
};
