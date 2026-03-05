/**
 * Unit tests for referenceDataCacheService
 * 
 * Tests the loading and caching of reference data from the database
 * for efficient validation during import operations.
 */

const { loadCache } = require('../referenceDataCacheService');
const Party = require('../../models/Party');
const Commodity = require('../../models/Commodity');
const PaymentTerm = require('../../models/PaymentTerm');
const BankDetails = require('../../models/BankDetails');
const Contract = require('../../models/Contract');

// Mock all models
jest.mock('../../models/Party');
jest.mock('../../models/Commodity');
jest.mock('../../models/PaymentTerm');
jest.mock('../../models/BankDetails');
jest.mock('../../models/Contract');

describe('referenceDataCacheService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadCache', () => {
    describe('Happy Path', () => {
      it('should load all reference data with 5 database queries', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            {
              fields: {
                contractNumber: 'TEST-001',
                buyerName: 'Buyer A',
                sellerName: 'Seller B',
                commodityName: 'Coffee',
                paymentTermName: 'LC at Sight',
                bankName: 'Bank A',
                accountNumber: '123456',
                swiftCode: 'TESTUS33'
              }
            }
          ]
        };

        const mockParties = [
          { _id: 'buyer1', companyName: 'Buyer A', isActive: true },
          { _id: 'seller1', companyName: 'Seller B', isActive: true }
        ];
        const mockCommodities = [
          { _id: 'comm1', name: 'Coffee', isActive: true, defaultUnit: 'MT' }
        ];
        const mockPaymentTerms = [
          { _id: 'pay1', name: 'LC at Sight', isActive: true }
        ];
        const mockBankDetails = [
          { 
            _id: 'bank1', 
            bankName: 'Bank A', 
            accountNumber: '123456',
            swiftCode: 'TESTUS33',
            currency: 'USD',
            isActive: true 
          }
        ];
        const mockContracts = [];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockParties) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCommodities) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockPaymentTerms) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBankDetails) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockContracts) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(Party.find).toHaveBeenCalledTimes(1);
        expect(Commodity.find).toHaveBeenCalledTimes(1);
        expect(PaymentTerm.find).toHaveBeenCalledTimes(1);
        expect(BankDetails.find).toHaveBeenCalledTimes(1);
        expect(Contract.find).toHaveBeenCalledTimes(1);

        expect(cache.parties).toBeInstanceOf(Map);
        expect(cache.commodities).toBeInstanceOf(Map);
        expect(cache.paymentTerms).toBeInstanceOf(Map);
        expect(cache.bankDetails).toBeInstanceOf(Map);
        expect(cache.existingContractNumbers).toBeInstanceOf(Set);
      });

      it('should create Maps with correct keys for parties', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { buyerName: 'Buyer A', sellerName: 'Seller B' } }
          ]
        };

        const mockParties = [
          { _id: 'buyer1', companyName: 'Buyer A', isActive: true },
          { _id: 'seller1', companyName: 'Seller B', isActive: true }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockParties) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.parties.size).toBe(2);
        expect(cache.parties.get('Buyer A')).toEqual(mockParties[0]);
        expect(cache.parties.get('Seller B')).toEqual(mockParties[1]);
      });

      it('should create Maps with correct keys for commodities', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { commodityName: 'Coffee' } },
            { fields: { commodityName: 'Tea' } }
          ]
        };

        const mockCommodities = [
          { _id: 'comm1', name: 'Coffee', isActive: true },
          { _id: 'comm2', name: 'Tea', isActive: true }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockCommodities) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.commodities.size).toBe(2);
        expect(cache.commodities.get('Coffee')).toEqual(mockCommodities[0]);
        expect(cache.commodities.get('Tea')).toEqual(mockCommodities[1]);
      });

      it('should create Maps with correct keys for payment terms', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { paymentTermName: 'LC at Sight' } },
            { fields: { paymentTermName: 'TT 30 Days' } }
          ]
        };

        const mockPaymentTerms = [
          { _id: 'pay1', name: 'LC at Sight', isActive: true },
          { _id: 'pay2', name: 'TT 30 Days', isActive: true }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockPaymentTerms) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.paymentTerms.size).toBe(2);
        expect(cache.paymentTerms.get('LC at Sight')).toEqual(mockPaymentTerms[0]);
        expect(cache.paymentTerms.get('TT 30 Days')).toEqual(mockPaymentTerms[1]);
      });

      it('should create Maps with composite keys for bank details', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { 
              fields: { 
                bankName: 'Bank A', 
                accountNumber: '123456',
                swiftCode: 'TESTUS33'
              } 
            },
            { 
              fields: { 
                bankName: 'Bank B', 
                accountNumber: '789012',
                swiftCode: 'TESTGB44'
              } 
            }
          ]
        };

        const mockBankDetails = [
          { 
            _id: 'bank1', 
            bankName: 'Bank A', 
            accountNumber: '123456',
            swiftCode: 'TESTUS33',
            isActive: true 
          },
          { 
            _id: 'bank2', 
            bankName: 'Bank B', 
            accountNumber: '789012',
            swiftCode: 'TESTGB44',
            isActive: true 
          }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBankDetails) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.bankDetails.size).toBe(2);
        expect(cache.bankDetails.get('Bank A|123456|TESTUS33')).toEqual(mockBankDetails[0]);
        expect(cache.bankDetails.get('Bank B|789012|TESTGB44')).toEqual(mockBankDetails[1]);
      });

      it('should create Set with existing contract numbers', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { contractNumber: 'TEST-001' } },
            { fields: { contractNumber: 'TEST-002' } }
          ]
        };

        const mockContracts = [
          { contractNumber: 'TEST-001' }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockContracts) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.existingContractNumbers.size).toBe(1);
        expect(cache.existingContractNumbers.has('TEST-001')).toBe(true);
        expect(cache.existingContractNumbers.has('TEST-002')).toBe(false);
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty rows array', async () => {
        // Arrange
        const parsedFile = { rows: [] };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(cache.parties.size).toBe(0);
        expect(cache.commodities.size).toBe(0);
        expect(cache.paymentTerms.size).toBe(0);
        expect(cache.bankDetails.size).toBe(0);
        expect(cache.existingContractNumbers.size).toBe(0);
      });

      it('should handle rows with missing optional fields', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { contractNumber: 'TEST-001' } },
            { fields: { buyerName: 'Buyer A' } }
          ]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert - should not throw, should handle gracefully
        expect(cache).toBeDefined();
        expect(cache.parties).toBeInstanceOf(Map);
      });

      it('should deduplicate party names from multiple rows', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { buyerName: 'Buyer A', sellerName: 'Seller B' } },
            { fields: { buyerName: 'Buyer A', sellerName: 'Seller C' } },
            { fields: { buyerName: 'Buyer B', sellerName: 'Seller B' } }
          ]
        };

        const mockParties = [
          { _id: 'buyer1', companyName: 'Buyer A' },
          { _id: 'buyer2', companyName: 'Buyer B' },
          { _id: 'seller1', companyName: 'Seller B' },
          { _id: 'seller2', companyName: 'Seller C' }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockParties) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert
        expect(Party.find).toHaveBeenCalledWith({
          companyName: { $in: expect.arrayContaining(['Buyer A', 'Buyer B', 'Seller B', 'Seller C']) }
        });
        expect(cache.parties.size).toBe(4);
      });

      it('should handle bank details with incomplete tuples', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { 
              fields: { 
                bankName: 'Bank A', 
                accountNumber: '123456',
                swiftCode: 'TESTUS33'
              } 
            },
            { 
              fields: { 
                bankName: 'Bank B', 
                accountNumber: '', // Missing account number
                swiftCode: 'TESTGB44'
              } 
            },
            { 
              fields: { 
                bankName: '', // Missing bank name
                accountNumber: '789012',
                swiftCode: 'TESTFR55'
              } 
            }
          ]
        };

        const mockBankDetails = [
          { 
            _id: 'bank1', 
            bankName: 'Bank A', 
            accountNumber: '123456',
            swiftCode: 'TESTUS33'
          }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBankDetails) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert - only complete tuples should be in cache
        expect(cache.bankDetails.size).toBe(1);
        expect(cache.bankDetails.get('Bank A|123456|TESTUS33')).toBeDefined();
      });

      it('should filter bank details to only requested tuples', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { 
              fields: { 
                bankName: 'Bank A', 
                accountNumber: '123456',
                swiftCode: 'TESTUS33'
              } 
            }
          ]
        };

        // Database returns more bank details than requested
        const mockBankDetails = [
          { 
            _id: 'bank1', 
            bankName: 'Bank A', 
            accountNumber: '123456',
            swiftCode: 'TESTUS33'
          },
          { 
            _id: 'bank2', 
            bankName: 'Bank A', 
            accountNumber: '999999', // Different account
            swiftCode: 'TESTUS33'
          }
        ];

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue(mockBankDetails) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert - only the requested tuple should be in cache
        expect(cache.bankDetails.size).toBe(1);
        expect(cache.bankDetails.get('Bank A|123456|TESTUS33')).toBeDefined();
        expect(cache.bankDetails.get('Bank A|999999|TESTUS33')).toBeUndefined();
      });

      it('should handle no matching reference data found', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { 
              fields: { 
                buyerName: 'Unknown Buyer',
                sellerName: 'Unknown Seller',
                commodityName: 'Unknown Commodity',
                paymentTermName: 'Unknown Payment',
                contractNumber: 'NEW-001'
              } 
            }
          ]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        const cache = await loadCache(parsedFile);

        // Assert - empty maps/sets are valid
        expect(cache.parties.size).toBe(0);
        expect(cache.commodities.size).toBe(0);
        expect(cache.paymentTerms.size).toBe(0);
        expect(cache.bankDetails.size).toBe(0);
        expect(cache.existingContractNumbers.size).toBe(0);
      });
    });

    describe('Error Handling', () => {
      it('should throw error when Party query fails', async () => {
        // Arrange
        const parsedFile = {
          rows: [{ fields: { buyerName: 'Buyer A' } }]
        };

        const dbError = new Error('Database connection failed');
        Party.find.mockReturnValue({ 
          lean: jest.fn().mockRejectedValue(dbError) 
        });

        // Act & Assert
        await expect(loadCache(parsedFile)).rejects.toThrow('Database connection failed');
      });

      it('should throw error when Commodity query fails', async () => {
        // Arrange
        const parsedFile = {
          rows: [{ fields: { commodityName: 'Coffee' } }]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        const dbError = new Error('Commodity query failed');
        Commodity.find.mockReturnValue({ 
          lean: jest.fn().mockRejectedValue(dbError) 
        });

        // Act & Assert
        await expect(loadCache(parsedFile)).rejects.toThrow('Commodity query failed');
      });

      it('should throw error when PaymentTerm query fails', async () => {
        // Arrange
        const parsedFile = {
          rows: [{ fields: { paymentTermName: 'LC at Sight' } }]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        const dbError = new Error('PaymentTerm query failed');
        PaymentTerm.find.mockReturnValue({ 
          lean: jest.fn().mockRejectedValue(dbError) 
        });

        // Act & Assert
        await expect(loadCache(parsedFile)).rejects.toThrow('PaymentTerm query failed');
      });

      it('should throw error when BankDetails query fails', async () => {
        // Arrange
        const parsedFile = {
          rows: [{ 
            fields: { 
              bankName: 'Bank A',
              accountNumber: '123456',
              swiftCode: 'TESTUS33'
            } 
          }]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        const dbError = new Error('BankDetails query failed');
        BankDetails.find.mockReturnValue({ 
          lean: jest.fn().mockRejectedValue(dbError) 
        });

        // Act & Assert
        await expect(loadCache(parsedFile)).rejects.toThrow('BankDetails query failed');
      });

      it('should throw error when Contract query fails', async () => {
        // Arrange
        const parsedFile = {
          rows: [{ fields: { contractNumber: 'TEST-001' } }]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        const dbError = new Error('Contract query failed');
        Contract.find.mockReturnValue({ 
          lean: jest.fn().mockRejectedValue(dbError) 
        });

        // Act & Assert
        await expect(loadCache(parsedFile)).rejects.toThrow('Contract query failed');
      });
    });

    describe('Performance Optimization', () => {
      it('should use lean() for all queries to improve performance', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { 
              fields: { 
                buyerName: 'Buyer A',
                commodityName: 'Coffee',
                paymentTermName: 'LC at Sight',
                bankName: 'Bank A',
                accountNumber: '123456',
                swiftCode: 'TESTUS33',
                contractNumber: 'TEST-001'
              } 
            }
          ]
        };

        const leanMock = jest.fn().mockResolvedValue([]);
        Party.find.mockReturnValue({ lean: leanMock });
        Commodity.find.mockReturnValue({ lean: leanMock });
        PaymentTerm.find.mockReturnValue({ lean: leanMock });
        BankDetails.find.mockReturnValue({ lean: leanMock });
        Contract.find.mockReturnValue({ lean: leanMock });

        // Act
        await loadCache(parsedFile);

        // Assert - lean() should be called 5 times (once per query)
        expect(leanMock).toHaveBeenCalledTimes(5);
      });

      it('should use $in operator for batch queries', async () => {
        // Arrange
        const parsedFile = {
          rows: [
            { fields: { buyerName: 'Buyer A', sellerName: 'Seller A' } },
            { fields: { buyerName: 'Buyer B', sellerName: 'Seller B' } }
          ]
        };

        Party.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Commodity.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        PaymentTerm.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        BankDetails.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
        Contract.find.mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });

        // Act
        await loadCache(parsedFile);

        // Assert
        expect(Party.find).toHaveBeenCalledWith({
          companyName: { $in: expect.any(Array) }
        });
      });
    });
  });
});
