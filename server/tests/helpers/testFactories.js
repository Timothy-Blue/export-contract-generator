/**
 * Test data factories for creating consistent test fixtures
 */

/**
 * Creates a valid CSV file buffer for testing
 */
function createValidCsvBuffer(rows = []) {
  const headers = [
    'contractNumber', 'contractDate', 'buyerName', 'sellerName',
    'commodityName', 'commodityDescription', 'quantity', 'unit',
    'tolerance', 'origin', 'packing', 'qualitySpec', 'unitPrice',
    'currency', 'incoterm', 'portLocation', 'paymentTermName',
    'bankName', 'accountName', 'accountNumber', 'swiftCode',
    'shipmentPeriod', 'additionalTerms', 'releaseType', 'status'
  ];

  const defaultRow = {
    contractNumber: 'TEST-001',
    contractDate: '2026-03-15',
    buyerName: 'Test Buyer Inc',
    sellerName: 'Test Seller Ltd',
    commodityName: 'Coffee Beans',
    commodityDescription: 'Arabica Grade A',
    quantity: '1000',
    unit: 'MT',
    tolerance: '5',
    origin: 'Brazil',
    packing: 'Jute Bags',
    qualitySpec: 'Premium Grade',
    unitPrice: '2500',
    currency: 'USD',
    incoterm: 'FOB',
    portLocation: 'Santos Port',
    paymentTermName: 'LC at Sight',
    bankName: 'Test Bank',
    accountName: 'Test Account',
    accountNumber: '1234567890',
    swiftCode: 'TESTUS33',
    shipmentPeriod: 'March 2026',
    additionalTerms: 'None',
    releaseType: 'ORIGINAL_BL',
    status: 'DRAFT'
  };

  const dataRows = rows.length > 0 ? rows : [defaultRow];
  const csvLines = [
    headers.join(','),
    ...dataRows.map(row => {
      const mergedRow = { ...defaultRow, ...row };
      return headers.map(h => mergedRow[h] || '').join(',');
    })
  ];

  return Buffer.from(csvLines.join('\n'), 'utf8');
}

/**
 * Creates a multer file object for testing
 */
function createMullerFile(options = {}) {
  const defaults = {
    fieldname: 'file',
    originalname: 'test.csv',
    encoding: '7bit',
    mimetype: 'text/csv',
    buffer: createValidCsvBuffer(),
    size: 1024
  };

  return { ...defaults, ...options };
}

/**
 * Creates a parsed CSV row for testing
 */
function createParsedRow(rowNumber = 2, fields = {}) {
  const defaultFields = {
    contractNumber: 'TEST-001',
    contractDate: '2026-03-15',
    buyerName: 'Test Buyer Inc',
    sellerName: 'Test Seller Ltd',
    commodityName: 'Coffee Beans',
    commodityDescription: 'Arabica Grade A',
    quantity: '1000',
    unit: 'MT',
    tolerance: '5',
    origin: 'Brazil',
    packing: 'Jute Bags',
    qualitySpec: 'Premium Grade',
    unitPrice: '2500',
    currency: 'USD',
    incoterm: 'FOB',
    portLocation: 'Santos Port',
    paymentTermName: 'LC at Sight',
    bankName: 'Test Bank',
    accountName: 'Test Account',
    accountNumber: '1234567890',
    swiftCode: 'TESTUS33',
    shipmentPeriod: 'March 2026',
    additionalTerms: 'None',
    releaseType: 'ORIGINAL_BL',
    status: 'DRAFT'
  };

  return {
    rowNumber,
    fields: { ...defaultFields, ...fields }
  };
}

/**
 * Creates a validated row for testing
 */
function createValidatedRow(overrides = {}) {
  const defaults = {
    rowNumber: 2,
    contractNumber: 'TEST-001',
    isValid: true,
    hasWarnings: false,
    data: {
      contractNumber: 'TEST-001',
      contractDate: new Date('2026-03-15'),
      buyerName: 'Test Buyer Inc',
      sellerName: 'Test Seller Ltd',
      commodityName: 'Coffee Beans',
      commodityDescription: 'Arabica Grade A',
      quantity: 1000,
      unit: 'MT',
      tolerance: 5,
      origin: 'Brazil',
      packing: 'Jute Bags',
      qualitySpec: 'Premium Grade',
      unitPrice: 2500,
      currency: 'USD',
      incoterm: 'FOB',
      portLocation: 'Santos Port',
      paymentTermName: 'LC at Sight',
      bankName: 'Test Bank',
      accountName: 'Test Account',
      accountNumber: '1234567890',
      swiftCode: 'TESTUS33',
      shipmentPeriod: 'March 2026',
      additionalTerms: 'None',
      releaseType: 'ORIGINAL_BL',
      status: 'DRAFT'
    },
    errors: [],
    warnings: []
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a reference data cache for testing
 */
function createReferenceCache(overrides = {}) {
  const defaults = {
    parties: new Map([
      ['Test Buyer Inc', { _id: 'buyer123', name: 'Test Buyer Inc', isActive: true }],
      ['Test Seller Ltd', { _id: 'seller123', name: 'Test Seller Ltd', isActive: true }]
    ]),
    commodities: new Map([
      ['Coffee Beans', { _id: 'commodity123', name: 'Coffee Beans', isActive: true, defaultUnit: 'MT' }]
    ]),
    paymentTerms: new Map([
      ['LC at Sight', { _id: 'payment123', name: 'LC at Sight', isActive: true }]
    ]),
    bankDetails: new Map([
      ['Test Bank|1234567890|TESTUS33', { 
        _id: 'bank123', 
        bankName: 'Test Bank', 
        accountNumber: '1234567890',
        swiftCode: 'TESTUS33',
        currency: 'USD',
        isActive: true 
      }]
    ]),
    existingContractNumbers: new Set()
  };

  return { ...defaults, ...overrides };
}

/**
 * Creates a mock Mongoose model instance
 */
function createMockModel(data = {}) {
  return {
    _id: 'mock-id-123',
    ...data,
    save: jest.fn().mockResolvedValue({ _id: 'mock-id-123', ...data }),
    toObject: jest.fn().mockReturnValue({ _id: 'mock-id-123', ...data })
  };
}

/**
 * Creates mock Express request object
 */
function createMockRequest(overrides = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    file: null,
    files: null,
    ...overrides
  };
}

/**
 * Creates mock Express response object
 */
function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis()
  };
  return res;
}

/**
 * Creates mock Express next function
 */
function createMockNext() {
  return jest.fn();
}

module.exports = {
  createValidCsvBuffer,
  createMullerFile,
  createParsedRow,
  createValidatedRow,
  createReferenceCache,
  createMockModel,
  createMockRequest,
  createMockResponse,
  createMockNext
};
