/**
 * Unit tests for derivedFieldService
 * Tests derived field calculations and data transformation
 */

const { calculateAll } = require('../derivedFieldService');
const { createValidatedRow } = require('../../tests/helpers/testFactories');

// Mock the calculations utility
jest.mock('../../utils/calculations', () => ({
  numberToText: jest.fn((amount, currency) => `${amount} ${currency} in words`)
}));

describe('derivedFieldService', () => {
  describe('calculateAll', () => {
    it('should calculate derived fields for all validated rows', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({ rowNumber: 2 }),
        createValidatedRow({ rowNumber: 3, data: { ...createValidatedRow().data, contractNumber: 'TEST-002' } })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id-123']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id-456']]),
        commodities: new Map([['Coffee Beans', 'commodity-id-789']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id-101']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id-202']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('rowNumber', 2);
      expect(result[0]).toHaveProperty('totalAmount');
      expect(result[0]).toHaveProperty('totalAmountText');
    });

    it('should calculate totalAmount correctly (quantity × unitPrice)', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            quantity: 1000,
            unitPrice: 2500
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].totalAmount).toBe(2500000);
    });


    it('should map resolved IDs correctly', () => {
      // Arrange
      const validatedRows = [createValidatedRow()];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id-123']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id-456']]),
        commodities: new Map([['Coffee Beans', 'commodity-id-789']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id-101']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id-202']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].buyerId).toBe('buyer-id-123');
      expect(result[0].sellerId).toBe('seller-id-456');
      expect(result[0].commodityId).toBe('commodity-id-789');
      expect(result[0].paymentTermId).toBe('payment-id-101');
      expect(result[0].bankDetailsId).toBe('bank-id-202');
    });

    it('should call numberToText with correct parameters', () => {
      // Arrange
      const { numberToText } = require('../../utils/calculations');
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            quantity: 100,
            unitPrice: 50,
            currency: 'USD'
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(numberToText).toHaveBeenCalledWith(5000, 'USD');
    });

    it('should handle decimal quantities correctly', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            quantity: 100.5,
            unitPrice: 10.25
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].totalAmount).toBeCloseTo(1030.125, 3);
    });

    it('should handle very large quantities', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            quantity: 1000000,
            unitPrice: 1000
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].totalAmount).toBe(1000000000);
    });

    it('should preserve all original data fields', () => {
      // Arrange
      const validatedRows = [createValidatedRow()];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0]).toMatchObject({
        contractNumber: 'TEST-001',
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
        shipmentPeriod: 'March 2026',
        additionalTerms: 'None',
        releaseType: 'ORIGINAL_BL',
        status: 'DRAFT'
      });
    });

    it('should handle zero tolerance', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            tolerance: 0
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].tolerance).toBe(0);
    });

    it('should handle different currencies', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          data: {
            ...createValidatedRow().data,
            currency: 'EUR',
            quantity: 100,
            unitPrice: 50
          }
        })
      ];
      
      const resolutionMap = {
        buyers: new Map([['Test Buyer Inc', 'buyer-id']]),
        sellers: new Map([['Test Seller Ltd', 'seller-id']]),
        commodities: new Map([['Coffee Beans', 'commodity-id']]),
        paymentTerms: new Map([['LC at Sight', 'payment-id']]),
        bankDetails: new Map([['Test Bank|1234567890|TESTUS33', 'bank-id']])
      };

      // Act
      const result = calculateAll(validatedRows, resolutionMap);

      // Assert
      expect(result[0].currency).toBe('EUR');
      expect(result[0].totalAmountText).toBeDefined();
      expect(typeof result[0].totalAmountText).toBe('string');
    });
  });
});
