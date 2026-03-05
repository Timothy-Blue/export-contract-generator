/**
 * Unit tests for validationService
 * Tests multi-level validation logic (Field, Business, Reference, Cross-field)
 */

const ValidationService = require('../validationService');
const { createParsedRow, createReferenceCache } = require('../../tests/helpers/testFactories');

describe('validationService', () => {
  let validationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  // ─── validateAll ────────────────────────────────────────────────────────

  describe('validateAll', () => {
    it('should validate all rows and return ValidatedRow array', () => {
      // Arrange
      const parsedFile = {
        rows: [createParsedRow(2), createParsedRow(3, { contractNumber: 'TEST-002' })],
        totalRows: 2
      };
      const cache = createReferenceCache();

      // Act
      const result = validationService.validateAll(parsedFile, cache);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('rowNumber', 2);
      expect(result[0]).toHaveProperty('isValid');
      expect(result[0]).toHaveProperty('hasWarnings');
      expect(result[0]).toHaveProperty('data');
      expect(result[0]).toHaveProperty('errors');
      expect(result[0]).toHaveProperty('warnings');
    });

    it('should collect all errors per row without stopping early', () => {
      // Arrange
      const parsedFile = {
        rows: [createParsedRow(2, {
          contractNumber: '',
          contractDate: 'invalid',
          quantity: 'not-a-number'
        })],
        totalRows: 1
      };
      const cache = createReferenceCache();

      // Act
      const result = validationService.validateAll(parsedFile, cache);

      // Assert
      expect(result[0].errors.length).toBeGreaterThan(1);
      expect(result[0].isValid).toBe(false);
    });
  });


  // ─── Level 2: Field-Level Validation ───────────────────────────────────

  describe('validateFieldLevel', () => {
    describe('contractNumber validation', () => {
      it('should accept valid contract number', () => {
        const row = createParsedRow(2, { contractNumber: 'TEST-001' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.contractNumber).toBe('TEST-001');
        expect(result.errors).toHaveLength(0);
      });

      it('should reject missing contract number (CN-001)', () => {
        const row = createParsedRow(2, { contractNumber: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CN-001', field: 'contractNumber' })
        );
      });

      it('should reject contract number with whitespace (CN-004)', () => {
        const row = createParsedRow(2, { contractNumber: ' TEST-001 ' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CN-004', field: 'contractNumber' })
        );
      });

      it('should detect duplicate contract numbers within file (CN-003)', () => {
        const cnFrequency = { 'TEST-001': [2, 3] };
        const row = createParsedRow(3, { contractNumber: 'TEST-001' });
        const result = validationService.validateFieldLevel(row, cnFrequency);
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CN-003', field: 'contractNumber' })
        );
      });
    });


    describe('contractDate validation', () => {
      it('should accept valid date in YYYY-MM-DD format', () => {
        const row = createParsedRow(2, { contractDate: '2026-03-15' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.contractDate).toBeInstanceOf(Date);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject missing contract date (CD-001)', () => {
        const row = createParsedRow(2, { contractDate: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CD-001', field: 'contractDate' })
        );
      });

      it('should reject invalid date format (CD-002)', () => {
        const row = createParsedRow(2, { contractDate: '15/03/2026' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CD-002', field: 'contractDate' })
        );
      });

      it('should reject invalid date value (CD-003)', () => {
        const row = createParsedRow(2, { contractDate: '2026-13-45' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CD-003', field: 'contractDate' })
        );
      });
    });


    describe('quantity validation', () => {
      it('should accept valid positive quantity', () => {
        const row = createParsedRow(2, { quantity: '1000' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.quantity).toBe(1000);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject missing quantity (QT-001)', () => {
        const row = createParsedRow(2, { quantity: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'QT-001', field: 'quantity' })
        );
      });

      it('should reject non-numeric quantity (QT-002)', () => {
        const row = createParsedRow(2, { quantity: 'abc' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'QT-002', field: 'quantity' })
        );
      });

      it('should reject zero or negative quantity (QT-003)', () => {
        const row = createParsedRow(2, { quantity: '0' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'QT-003', field: 'quantity' })
        );
      });
    });

    describe('unit validation', () => {
      it('should accept valid unit', () => {
        const row = createParsedRow(2, { unit: 'MT' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.unit).toBe('MT');
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid unit (UN-002)', () => {
        const row = createParsedRow(2, { unit: 'INVALID' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'UN-002', field: 'unit' })
        );
      });
    });


    describe('tolerance validation', () => {
      it('should default to 0 if missing', () => {
        const row = createParsedRow(2, { tolerance: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.tolerance).toBe(0);
        expect(result.errors).toHaveLength(0);
      });

      it('should accept valid tolerance percentage', () => {
        const row = createParsedRow(2, { tolerance: '5' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.tolerance).toBe(5);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject tolerance > 100 (TL-003)', () => {
        const row = createParsedRow(2, { tolerance: '150' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'TL-003', field: 'tolerance' })
        );
      });

      it('should reject negative tolerance (TL-003)', () => {
        const row = createParsedRow(2, { tolerance: '-5' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'TL-003', field: 'tolerance' })
        );
      });
    });

    describe('SWIFT code validation', () => {
      it('should accept valid 8-character SWIFT code', () => {
        const row = createParsedRow(2, { swiftCode: 'TESTUS33' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.swiftCode).toBe('TESTUS33');
        expect(result.errors).toHaveLength(0);
      });

      it('should accept valid 11-character SWIFT code', () => {
        const row = createParsedRow(2, { swiftCode: 'TESTUS33XXX' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.swiftCode).toBe('TESTUS33XXX');
        expect(result.errors).toHaveLength(0);
      });

      it('should reject non-uppercase SWIFT code (SW-004)', () => {
        const row = createParsedRow(2, { swiftCode: 'testus33' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'SW-004', field: 'swiftCode' })
        );
      });

      it('should reject invalid length SWIFT code (SW-002)', () => {
        const row = createParsedRow(2, { swiftCode: 'TEST' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'SW-002', field: 'swiftCode' })
        );
      });
    });


    describe('currency validation', () => {
      it('should accept valid 3-letter currency code', () => {
        const row = createParsedRow(2, { currency: 'USD' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.currency).toBe('USD');
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid currency format (CU-002)', () => {
        const row = createParsedRow(2, { currency: 'US' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'CU-002', field: 'currency' })
        );
      });
    });

    describe('incoterm validation', () => {
      it('should accept valid incoterm', () => {
        const row = createParsedRow(2, { incoterm: 'FOB' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.incoterm).toBe('FOB');
        expect(result.errors).toHaveLength(0);
      });

      it('should reject invalid incoterm (IC-002)', () => {
        const row = createParsedRow(2, { incoterm: 'INVALID' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.errors).toContainEqual(
          expect.objectContaining({ ruleId: 'IC-002', field: 'incoterm' })
        );
      });
    });

    describe('status and releaseType defaults', () => {
      it('should default status to DRAFT if missing', () => {
        const row = createParsedRow(2, { status: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.status).toBe('DRAFT');
      });

      it('should default releaseType to NOT_SPECIFIED if missing', () => {
        const row = createParsedRow(2, { releaseType: '' });
        const result = validationService.validateFieldLevel(row, {});
        
        expect(result.data.releaseType).toBe('NOT_SPECIFIED');
      });
    });
  });


  // ─── Level 3: Business Logic Validation ────────────────────────────────

  describe('validateBusinessLogic', () => {
    it('should reject when buyer equals seller (BL-001)', () => {
      const data = {
        buyerName: 'Same Company',
        sellerName: 'Same Company',
        quantity: 1000,
        unitPrice: 2500
      };
      const result = validationService.validateBusinessLogic(data, []);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'BL-001', field: 'buyerName' })
      );
    });

    it('should accept when buyer differs from seller', () => {
      const data = {
        buyerName: 'Buyer Company',
        sellerName: 'Seller Company',
        quantity: 1000,
        unitPrice: 2500
      };
      const result = validationService.validateBusinessLogic(data, []);
      
      expect(result.errors).toHaveLength(0);
    });

    it('should validate quantity × unitPrice calculation (BL-002)', () => {
      const data = {
        buyerName: 'Buyer',
        sellerName: 'Seller',
        quantity: 1000,
        unitPrice: 2500
      };
      const result = validationService.validateBusinessLogic(data, []);
      
      expect(result.errors).toHaveLength(0);
    });

    it('should warn on future dates > 365 days (BL-004)', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 400);
      
      const data = {
        buyerName: 'Buyer',
        sellerName: 'Seller',
        contractDate: futureDate,
        quantity: 1000,
        unitPrice: 2500
      };
      const result = validationService.validateBusinessLogic(data, []);
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ ruleId: 'BL-004', field: 'contractDate' })
      );
    });

    it('should validate tolerance range calculation (BL-003)', () => {
      const data = {
        buyerName: 'Buyer',
        sellerName: 'Seller',
        quantity: 1000,
        unitPrice: 2500,
        tolerance: 5
      };
      const result = validationService.validateBusinessLogic(data, []);
      
      expect(result.errors).toHaveLength(0);
    });
  });


  // ─── Level 4: Reference Data Validation ────────────────────────────────

  describe('validateReferenceData', () => {
    it('should pass when buyer exists and is active', () => {
      const data = { buyerName: 'Test Buyer Inc' };
      const cache = createReferenceCache();
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toHaveLength(0);
    });

    it('should error when buyer exists but is inactive (RD-001)', () => {
      const data = { buyerName: 'Inactive Buyer' };
      const cache = createReferenceCache({
        parties: new Map([
          ['Inactive Buyer', { _id: 'buyer123', name: 'Inactive Buyer', isActive: false }]
        ])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'RD-001', field: 'buyerName' })
      );
    });

    it('should error when seller exists but is inactive (RD-002)', () => {
      const data = { sellerName: 'Inactive Seller' };
      const cache = createReferenceCache({
        parties: new Map([
          ['Inactive Seller', { _id: 'seller123', name: 'Inactive Seller', isActive: false }]
        ])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'RD-002', field: 'sellerName' })
      );
    });

    it('should error when commodity exists but is inactive (RD-003)', () => {
      const data = { commodityName: 'Inactive Commodity' };
      const cache = createReferenceCache({
        commodities: new Map([
          ['Inactive Commodity', { _id: 'comm123', name: 'Inactive Commodity', isActive: false }]
        ])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'RD-003', field: 'commodityName' })
      );
    });

    it('should error when payment term exists but is inactive (RD-004)', () => {
      const data = { paymentTermName: 'Inactive Term' };
      const cache = createReferenceCache({
        paymentTerms: new Map([
          ['Inactive Term', { _id: 'term123', name: 'Inactive Term', isActive: false }]
        ])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'RD-004', field: 'paymentTermName' })
      );
    });

    it('should error when bank details exist but are inactive (RD-005)', () => {
      const data = {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        swiftCode: 'TESTUS33'
      };
      const cache = createReferenceCache({
        bankDetails: new Map([
          ['Test Bank|1234567890|TESTUS33', { 
            _id: 'bank123', 
            bankName: 'Test Bank',
            isActive: false 
          }]
        ])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'RD-005', field: 'bankName' })
      );
    });

    it('should error when contract number already exists in DB (CN-002)', () => {
      const data = { contractNumber: 'EXISTING-001' };
      const cache = createReferenceCache({
        existingContractNumbers: new Set(['EXISTING-001'])
      });
      
      const result = validationService.validateReferenceData(data, cache);
      
      expect(result.errors).toContainEqual(
        expect.objectContaining({ ruleId: 'CN-002', field: 'contractNumber' })
      );
    });
  });


  // ─── Level 5: Cross-Field Validation ───────────────────────────────────

  describe('validateCrossField', () => {
    it('should warn when currency differs from bank currency (CF-001)', () => {
      const data = {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        swiftCode: 'TESTUS33',
        currency: 'EUR'
      };
      const cache = createReferenceCache({
        bankDetails: new Map([
          ['Test Bank|1234567890|TESTUS33', { 
            _id: 'bank123',
            bankName: 'Test Bank',
            currency: 'USD',
            isActive: true
          }]
        ])
      });
      
      const result = validationService.validateCrossField(data, cache);
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ ruleId: 'CF-001', field: 'currency' })
      );
    });

    it('should not warn when currency matches bank currency', () => {
      const data = {
        bankName: 'Test Bank',
        accountNumber: '1234567890',
        swiftCode: 'TESTUS33',
        currency: 'USD'
      };
      const cache = createReferenceCache();
      
      const result = validationService.validateCrossField(data, cache);
      
      expect(result.warnings).toHaveLength(0);
    });

    it('should warn when unit differs from commodity default unit (CF-002)', () => {
      const data = {
        commodityName: 'Coffee Beans',
        unit: 'KG'
      };
      const cache = createReferenceCache({
        commodities: new Map([
          ['Coffee Beans', { 
            _id: 'comm123',
            name: 'Coffee Beans',
            defaultUnit: 'MT',
            isActive: true
          }]
        ])
      });
      
      const result = validationService.validateCrossField(data, cache);
      
      expect(result.warnings).toContainEqual(
        expect.objectContaining({ ruleId: 'CF-002', field: 'unit' })
      );
    });

    it('should not warn when unit matches commodity default unit', () => {
      const data = {
        commodityName: 'Coffee Beans',
        unit: 'MT'
      };
      const cache = createReferenceCache();
      
      const result = validationService.validateCrossField(data, cache);
      
      expect(result.warnings).toHaveLength(0);
    });
  });
});
