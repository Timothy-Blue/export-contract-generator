/**
 * Unit tests for referenceResolutionService
 * 
 * Tests the resolution and creation of reference data during import operations.
 */

const { resolveAll, ResolutionError } = require('../referenceResolutionService');
const Party = require('../../models/Party');
const Commodity = require('../../models/Commodity');
const PaymentTerm = require('../../models/PaymentTerm');
const BankDetails = require('../../models/BankDetails');

// Mock all models
jest.mock('../../models/Party');
jest.mock('../../models/Commodity');
jest.mock('../../models/PaymentTerm');
jest.mock('../../models/BankDetails');

describe('referenceResolutionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.log in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('resolveAll', () => {
    describe('Happy Path - Existing Records', () => {
      it('should resolve all existing active reference data', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountName: 'Account A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(result.buyers.get('Buyer A')).toBe('buyer1');
        expect(result.sellers.get('Seller A')).toBe('seller1');
        expect(result.commodities.get('Coffee')).toBe('comm1');
        expect(result.paymentTerms.get('LC at Sight')).toBe('pay1');
        expect(result.bankDetails.get('Bank A|123456|TESTUS33')).toBe('bank1');
        
        // Should not create any new records
        expect(Party.create).not.toHaveBeenCalled();
        expect(Commodity.create).not.toHaveBeenCalled();
        expect(PaymentTerm.create).not.toHaveBeenCalled();
        expect(BankDetails.create).not.toHaveBeenCalled();
      });

      it('should deduplicate names across multiple rows', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          },
          {
            rowNumber: 3,
            data: {
              buyerName: 'Buyer A', // Same buyer
              sellerName: 'Seller B', // Different seller
              commodityName: 'Coffee', // Same commodity
              paymentTermName: 'TT 30 Days', // Different payment term
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller1 = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockSeller2 = { _id: 'seller2', companyName: 'Seller B', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm1 = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockPaymentTerm2 = { _id: 'pay2', name: 'TT 30 Days', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller1, mockSeller2]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm1, mockPaymentTerm2]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(result.buyers.size).toBe(1);
        expect(result.sellers.size).toBe(2);
        expect(result.commodities.size).toBe(1);
        expect(result.paymentTerms.size).toBe(2);
        expect(result.bankDetails.size).toBe(1);
      });
    });

    describe('Happy Path - Creating New Records', () => {
      it('should create new buyer when not found', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'New Buyer',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([]); // No buyer found
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Party.create.mockResolvedValue({ _id: 'newbuyer1', companyName: 'New Buyer', type: 'BUYER' });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(Party.create).toHaveBeenCalledWith({
          companyName: 'New Buyer',
          type: 'BUYER',
          address: 'To be updated',
          isActive: true
        });
        expect(result.buyers.get('New Buyer')).toBe('newbuyer1');
      });

      it('should create new seller when not found', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'New Seller',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([]); // No seller found
          return Promise.resolve([]);
        });
        Party.create.mockResolvedValue({ _id: 'newseller1', companyName: 'New Seller', type: 'SELLER' });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(Party.create).toHaveBeenCalledWith({
          companyName: 'New Seller',
          type: 'SELLER',
          address: 'To be updated',
          isActive: true
        });
        expect(result.sellers.get('New Seller')).toBe('newseller1');
      });

      it('should create new commodity with row data when not found', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'New Commodity',
              commodityDescription: 'Test Description',
              unit: 'MT',
              origin: 'Brazil',
              packing: 'Jute Bags',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([]); // No commodity found
        Commodity.create.mockResolvedValue({ _id: 'newcomm1', name: 'New Commodity' });
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(Commodity.create).toHaveBeenCalledWith({
          name: 'New Commodity',
          description: 'Test Description',
          defaultUnit: 'MT',
          defaultOrigin: 'Brazil',
          defaultPacking: 'Jute Bags',
          isActive: true
        });
        expect(result.commodities.get('New Commodity')).toBe('newcomm1');
      });

      it('should create new payment term when not found', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'New Payment Term',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([]); // No payment term found
        PaymentTerm.create.mockResolvedValue({ _id: 'newpay1', name: 'New Payment Term' });
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(PaymentTerm.create).toHaveBeenCalledWith({
          name: 'New Payment Term',
          description: 'Imported',
          terms: 'Imported',
          daysFromBL: 0,
          isActive: true
        });
        expect(result.paymentTerms.get('New Payment Term')).toBe('newpay1');
      });

      it('should create new bank details when not found', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'New Bank',
              accountName: 'New Account',
              accountNumber: '999999',
              swiftCode: 'NEWUS44',
              currency: 'EUR'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([]); // No bank details found
        BankDetails.create.mockResolvedValue({ _id: 'newbank1', bankName: 'New Bank' });

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(BankDetails.create).toHaveBeenCalledWith({
          bankName: 'New Bank',
          accountName: 'New Account',
          accountNumber: '999999',
          swiftCode: 'NEWUS44',
          currency: 'EUR',
          isActive: true,
          isDefault: false
        });
        expect(result.bankDetails.get('New Bank|999999|NEWUS44')).toBe('newbank1');
      });
    });

    describe('Error Handling - Inactive Records', () => {
      it('should throw ResolutionError when buyer is inactive', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Inactive Buyer',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockInactiveBuyer = { _id: 'buyer1', companyName: 'Inactive Buyer', type: 'BUYER', isActive: false };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockInactiveBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Inactive Buyer' exists but is inactive");
      });

      it('should throw ResolutionError when seller is inactive', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Inactive Seller',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockInactiveSeller = { _id: 'seller1', companyName: 'Inactive Seller', type: 'SELLER', isActive: false };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockInactiveSeller]);
          return Promise.resolve([]);
        });

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Inactive Seller' exists but is inactive");
      });

      it('should throw ResolutionError when commodity is inactive', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Inactive Commodity',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockInactiveCommodity = { _id: 'comm1', name: 'Inactive Commodity', isActive: false };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockInactiveCommodity]);

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Inactive Commodity' exists but is inactive");
      });

      it('should throw ResolutionError when payment term is inactive', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'Inactive Payment',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockInactivePayment = { _id: 'pay1', name: 'Inactive Payment', isActive: false };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockInactivePayment]);

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Inactive Payment' exists but is inactive");
      });

      it('should throw ResolutionError when bank details are inactive', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Inactive Bank',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockInactiveBank = { 
          _id: 'bank1', 
          bankName: 'Inactive Bank', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: false 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockInactiveBank]);

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Inactive Bank' exists but is inactive");
      });
    });

    describe('Error Handling - Buyer/Seller Collision', () => {
      it('should throw ResolutionError when same name used as buyer and seller', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Company A',
              sellerName: 'Seller B',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          },
          {
            rowNumber: 3,
            data: {
              buyerName: 'Buyer C',
              sellerName: 'Company A', // Same as buyer in row 2
              commodityName: 'Tea',
              paymentTermName: 'TT 30 Days',
              bankName: 'Bank B',
              accountNumber: '789012',
              swiftCode: 'TESTGB44',
              currency: 'GBP'
            }
          }
        ];

        // Act & Assert
        await expect(resolveAll(validatedRows)).rejects.toThrow(ResolutionError);
        await expect(resolveAll(validatedRows)).rejects.toThrow("'Company A' cannot be used as both buyer and seller");
      });

      it('should include affected row numbers in ResolutionError for collision', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Company A',
              sellerName: 'Seller B',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          },
          {
            rowNumber: 3,
            data: {
              buyerName: 'Buyer C',
              sellerName: 'Company A',
              commodityName: 'Tea',
              paymentTermName: 'TT 30 Days',
              bankName: 'Bank B',
              accountNumber: '789012',
              swiftCode: 'TESTGB44',
              currency: 'GBP'
            }
          }
        ];

        // Act & Assert
        try {
          await resolveAll(validatedRows);
          fail('Should have thrown ResolutionError');
        } catch (error) {
          expect(error).toBeInstanceOf(ResolutionError);
          expect(error.affectedRows).toEqual([2, 3]);
          expect(error.entityType).toBe('Party');
          expect(error.entityName).toBe('Company A');
        }
      });
    });

    describe('Edge Cases', () => {
      it('should handle multiple bank details with different tuples', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          },
          {
            rowNumber: 3,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'Coffee',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '789012', // Different account
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockCommodity = { _id: 'comm1', name: 'Coffee', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails1 = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };
        const mockBankDetails2 = { 
          _id: 'bank2', 
          bankName: 'Bank A', 
          accountNumber: '789012',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([mockCommodity]);
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails1, mockBankDetails2]);

        // Act
        const result = await resolveAll(validatedRows);

        // Assert
        expect(result.bankDetails.size).toBe(2);
        expect(result.bankDetails.get('Bank A|123456|TESTUS33')).toBe('bank1');
        expect(result.bankDetails.get('Bank A|789012|TESTUS33')).toBe('bank2');
      });

      it('should use first row data when creating commodity from multiple rows', async () => {
        // Arrange
        const validatedRows = [
          {
            rowNumber: 2,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'New Commodity',
              commodityDescription: 'First Description',
              unit: 'MT',
              origin: 'Brazil',
              packing: 'Jute Bags',
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          },
          {
            rowNumber: 3,
            data: {
              buyerName: 'Buyer A',
              sellerName: 'Seller A',
              commodityName: 'New Commodity', // Same commodity
              commodityDescription: 'Second Description', // Different description
              unit: 'KG', // Different unit
              origin: 'Colombia', // Different origin
              packing: 'Plastic Bags', // Different packing
              paymentTermName: 'LC at Sight',
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33',
              currency: 'USD'
            }
          }
        ];

        const mockBuyer = { _id: 'buyer1', companyName: 'Buyer A', type: 'BUYER', isActive: true };
        const mockSeller = { _id: 'seller1', companyName: 'Seller A', type: 'SELLER', isActive: true };
        const mockPaymentTerm = { _id: 'pay1', name: 'LC at Sight', isActive: true };
        const mockBankDetails = { 
          _id: 'bank1', 
          bankName: 'Bank A', 
          accountNumber: '123456',
          swiftCode: 'TESTUS33',
          isActive: true 
        };

        Party.find.mockImplementation(({ type }) => {
          if (type === 'BUYER') return Promise.resolve([mockBuyer]);
          if (type === 'SELLER') return Promise.resolve([mockSeller]);
          return Promise.resolve([]);
        });
        Commodity.find.mockResolvedValue([]);
        Commodity.create.mockResolvedValue({ _id: 'newcomm1', name: 'New Commodity' });
        PaymentTerm.find.mockResolvedValue([mockPaymentTerm]);
        BankDetails.find.mockResolvedValue([mockBankDetails]);

        // Act
        await resolveAll(validatedRows);

        // Assert - should use first row's data
        expect(Commodity.create).toHaveBeenCalledWith({
          name: 'New Commodity',
          description: 'First Description',
          defaultUnit: 'MT',
          defaultOrigin: 'Brazil',
          defaultPacking: 'Jute Bags',
          isActive: true
        });
      });
    });

    describe('ResolutionError Class', () => {
      it('should create ResolutionError with correct properties', () => {
        // Arrange & Act
        const error = new ResolutionError(
          'Test error message',
          [2, 3, 4],
          'Party',
          'Test Company'
        );

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ResolutionError);
        expect(error.name).toBe('ResolutionError');
        expect(error.message).toBe('Test error message');
        expect(error.affectedRows).toEqual([2, 3, 4]);
        expect(error.entityType).toBe('Party');
        expect(error.entityName).toBe('Test Company');
      });

      it('should have proper error stack trace', () => {
        // Arrange & Act
        const error = new ResolutionError('Test error', [], 'Party', 'Test');

        // Assert
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ResolutionError');
      });
    });
  });
});
