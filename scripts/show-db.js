const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Contract = require('../server/models/Contract');
const Party = require('../server/models/Party');
const Commodity = require('../server/models/Commodity');
const PaymentTerm = require('../server/models/PaymentTerm');
const BankDetails = require('../server/models/BankDetails');

const showDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/export-contracts');
    console.log('Connected to MongoDB\n');

    // Get counts
    const contractCount = await Contract.countDocuments();
    const partyCount = await Party.countDocuments();
    const commodityCount = await Commodity.countDocuments();
    const paymentTermCount = await PaymentTerm.countDocuments();
    const bankDetailsCount = await BankDetails.countDocuments();

    console.log('=== DATABASE OVERVIEW ===');
    console.log(`Contracts: ${contractCount}`);
    console.log(`Parties (Buyers/Sellers): ${partyCount}`);
    console.log(`Commodities: ${commodityCount}`);
    console.log(`Payment Terms: ${paymentTermCount}`);
    console.log(`Bank Details: ${bankDetailsCount}`);
    console.log('\n');

    // Show sample contracts
    console.log('=== CONTRACTS (All) ===');
    const contracts = await Contract.find()
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .populate('commodity', 'name')
      .sort({ createdAt: -1 })
      .lean();
    
    if (contracts.length > 0) {
      contracts.forEach((contract, index) => {
        console.log(`\n${index + 1}. Contract #${contract.contractNumber}`);
        console.log(`   Buyer: ${contract.buyer?.name || 'N/A'}`);
        console.log(`   Seller: ${contract.seller?.name || 'N/A'}`);
        console.log(`   Commodity: ${contract.commodity?.name || 'N/A'}`);
        console.log(`   Quantity: ${contract.quantity} ${contract.unit || 'MT'}`);
        console.log(`   Unit Price: ${contract.currency || 'USD'} ${contract.unitPrice}`);
        console.log(`   Total Amount: ${contract.totalAmount}`);
        console.log(`   Status: ${contract.status || 'N/A'}`);
        console.log(`   Payment Term: ${contract.paymentTerm || 'N/A'}`);
        console.log(`   Shipment Date: ${contract.shipmentDate ? contract.shipmentDate.toISOString().split('T')[0] : 'N/A'}`);
        if (contract.releaseType) {
          console.log(`   Release Type: ${contract.releaseType}`);
          console.log(`   Release Status: ${contract.releaseStatus || 'N/A'}`);
          console.log(`   Debit Note #: ${contract.debitNoteNumber || 'N/A'}`);
        }
        console.log(`   Created: ${contract.createdAt ? contract.createdAt.toISOString().split('T')[0] : 'N/A'}`);
      });
    } else {
      console.log('No contracts found.');
    }

    // Show parties
    console.log('\n\n=== PARTIES (All) ===');
    const parties = await Party.find().lean();
    if (parties.length > 0) {
      const buyers = parties.filter(p => p.type === 'BUYER');
      const sellers = parties.filter(p => p.type === 'SELLER');
      
      console.log('\nBuyers:');
      buyers.forEach((party, index) => {
        console.log(`  ${index + 1}. ${party.name}`);
        console.log(`     Address: ${party.address || 'N/A'}`);
        console.log(`     Email: ${party.email || 'N/A'}`);
        console.log(`     Phone: ${party.phone || 'N/A'}`);
      });
      
      console.log('\nSellers:');
      sellers.forEach((party, index) => {
        console.log(`  ${index + 1}. ${party.name}`);
        console.log(`     Address: ${party.address || 'N/A'}`);
        console.log(`     Email: ${party.email || 'N/A'}`);
        console.log(`     Phone: ${party.phone || 'N/A'}`);
      });
    } else {
      console.log('No parties found.');
    }

    // Show commodities
    console.log('\n\n=== COMMODITIES (All) ===');
    const commodities = await Commodity.find().lean();
    if (commodities.length > 0) {
      commodities.forEach((commodity, index) => {
        console.log(`\n${index + 1}. ${commodity.name}`);
        console.log(`   Description: ${commodity.description || 'N/A'}`);
        console.log(`   HS Code: ${commodity.hsCode || 'N/A'}`);
      });
    } else {
      console.log('No commodities found.');
    }

    // Show payment terms
    console.log('\n\n=== PAYMENT TERMS (All) ===');
    const paymentTerms = await PaymentTerm.find().lean();
    if (paymentTerms.length > 0) {
      paymentTerms.forEach((term, index) => {
        console.log(`\n${index + 1}. ${term.name}`);
        console.log(`   Description: ${term.description || 'N/A'}`);
        console.log(`   Days from BL: ${term.daysFromBL || 'N/A'}`);
      });
    } else {
      console.log('No payment terms found.');
    }

    // Show bank details
    console.log('\n\n=== BANK DETAILS (All) ===');
    const bankDetails = await BankDetails.find().lean();
    if (bankDetails.length > 0) {
      bankDetails.forEach((bank, index) => {
        console.log(`\n${index + 1}. ${bank.bankName}`);
        console.log(`   Account Name: ${bank.accountName}`);
        console.log(`   Account Number: ${bank.accountNumber}`);
        console.log(`   SWIFT: ${bank.swiftCode || 'N/A'}`);
        console.log(`   Branch: ${bank.branch || 'N/A'}`);
        console.log(`   Default: ${bank.isDefault ? 'Yes' : 'No'}`);
      });
    } else {
      console.log('No bank details found.');
    }

    console.log('\n=== END OF DATABASE ===\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

showDatabase();
