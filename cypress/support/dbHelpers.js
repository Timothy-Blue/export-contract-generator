/**
 * Database helper functions for Cypress E2E tests
 * These functions are called from Cypress tasks
 */

const mongoose = require('mongoose');

// Import models
const Party = require('../../server/models/Party');
const Commodity = require('../../server/models/Commodity');
const PaymentTerm = require('../../server/models/PaymentTerm');
const BankDetails = require('../../server/models/BankDetails');
const Contract = require('../../server/models/Contract');

/**
 * Seed reference data for tests
 */
async function seedReferenceData() {
  console.log('[DB] Seeding reference data...');
  
  try {
    // Seed parties
    await Party.insertMany([
      { name: 'Test Buyer Inc', type: 'BUYER', isActive: true },
      { name: 'Test Seller Ltd', type: 'SELLER', isActive: true },
      { name: 'Another Buyer', type: 'BUYER', isActive: true },
      { name: 'Inactive Buyer', type: 'BUYER', isActive: false }
    ]);
    console.log('[DB] ✓ Parties seeded');

    // Seed commodities
    await Commodity.insertMany([
      { name: 'Coffee Beans', defaultUnit: 'MT', isActive: true },
      { name: 'Tea Leaves', defaultUnit: 'MT', isActive: true },
      { name: 'Rice', defaultUnit: 'MT', isActive: true },
      { name: 'Wheat', defaultUnit: 'MT', isActive: true },
      { name: 'Corn', defaultUnit: 'MT', isActive: true }
    ]);
    console.log('[DB] ✓ Commodities seeded');

    // Seed payment terms
    await PaymentTerm.insertMany([
      { name: 'LC at Sight', description: 'Letter of Credit at Sight', isActive: true },
      { name: 'TT 30 Days', description: 'Telegraphic Transfer 30 Days', isActive: true },
      { name: 'LC 60 Days', description: 'Letter of Credit 60 Days', isActive: true },
      { name: 'LC 30 Days', description: 'Letter of Credit 30 Days', isActive: true }
    ]);
    console.log('[DB] ✓ Payment terms seeded');

    // Seed bank details
    await BankDetails.insertMany([
      {
        bankName: 'Test Bank',
        accountName: 'Test Account',
        accountNumber: '1234567890',
        swiftCode: 'TESTUS33',
        currency: 'USD',
        isActive: true
      },
      {
        bankName: 'Euro Bank',
        accountName: 'Euro Account',
        accountNumber: '0987654321',
        swiftCode: 'EUROEU44',
        currency: 'EUR',
        isActive: true
      }
    ]);
    console.log('[DB] ✓ Bank details seeded');

    console.log('[DB] Reference data seeding complete');
  } catch (error) {
    console.error('[DB] Error seeding reference data:', error);
    throw error;
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  console.log('[DB] Cleaning up test data...');
  
  try {
    // Delete test contracts (prefixed with E2E- or TEST-)
    await Contract.deleteMany({ 
      contractNumber: { $regex: /^(E2E-|TEST-)/ } 
    });
    console.log('[DB] ✓ Test contracts deleted');

    // Delete test parties
    await Party.deleteMany({ 
      name: { $regex: /^(E2E-|TEST-|Brand New)/ } 
    });
    console.log('[DB] ✓ Test parties deleted');

    // Delete test commodities
    await Commodity.deleteMany({ 
      name: { $regex: /^(E2E-|TEST-|Exotic)/ } 
    });
    console.log('[DB] ✓ Test commodities deleted');

    // Delete test payment terms
    await PaymentTerm.deleteMany({ 
      name: { $regex: /^(E2E-|TEST-|Advance)/ } 
    });
    console.log('[DB] ✓ Test payment terms deleted');

    // Delete test bank details
    await BankDetails.deleteMany({ 
      bankName: { $regex: /^(E2E-|TEST-|New Bank)/ } 
    });
    console.log('[DB] ✓ Test bank details deleted');

    // Delete all reference data (for clean slate)
    await Party.deleteMany({});
    await Commodity.deleteMany({});
    await PaymentTerm.deleteMany({});
    await BankDetails.deleteMany({});
    console.log('[DB] ✓ All reference data deleted');

    console.log('[DB] Cleanup complete');
  } catch (error) {
    console.error('[DB] Error cleaning up test data:', error);
    throw error;
  }
}

module.exports = {
  seedReferenceData,
  cleanupTestData
};
