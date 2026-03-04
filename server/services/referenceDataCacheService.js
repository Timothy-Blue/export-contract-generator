const Party = require('../models/Party');
const Commodity = require('../models/Commodity');
const PaymentTerm = require('../models/PaymentTerm');
const BankDetails = require('../models/BankDetails');
const Contract = require('../models/Contract');

/**
 * Loads all reference data needed for row validation in exactly 5 DB queries.
 * Returns a ReferenceDataCache object with Maps and Sets for O(1) lookup.
 *
 * @param {Object} parsedFile - { rows }
 * @returns {Object} ReferenceDataCache
 */
async function loadCache(parsedFile) {
  const rows = parsedFile.rows.map(r => r.fields);

  // Collect unique values per entity type
  const partyNames = [...new Set([
    ...rows.map(r => r.buyerName).filter(Boolean),
    ...rows.map(r => r.sellerName).filter(Boolean)
  ])];
  const commodityNames = [...new Set(rows.map(r => r.commodityName).filter(Boolean))];
  const paymentTermNames = [...new Set(rows.map(r => r.paymentTermName).filter(Boolean))];
  const contractNumbers = [...new Set(rows.map(r => r.contractNumber).filter(Boolean))];

  // Bank details: collect unique (bankName, accountNumber, swiftCode) tuples
  const bankKeys = [...new Set(
    rows
      .filter(r => r.bankName && r.accountNumber && r.swiftCode)
      .map(r => `${r.bankName}|${r.accountNumber}|${r.swiftCode}`)
  )];
  const bankNames = [...new Set(rows.map(r => r.bankName).filter(Boolean))];
  const accountNumbers = [...new Set(rows.map(r => r.accountNumber).filter(Boolean))];
  const swiftCodes = [...new Set(rows.map(r => r.swiftCode).filter(Boolean))];

  try {
    // Query 1: Parties (buyers + sellers)
    const parties = await Party.find({ companyName: { $in: partyNames } }).lean();
    const partiesMap = new Map(parties.map(p => [p.companyName, p]));

    // Query 2: Commodities
    const commodities = await Commodity.find({ name: { $in: commodityNames } }).lean();
    const commoditiesMap = new Map(commodities.map(c => [c.name, c]));

    // Query 3: Payment terms
    const paymentTerms = await PaymentTerm.find({ name: { $in: paymentTermNames } }).lean();
    const paymentTermsMap = new Map(paymentTerms.map(p => [p.name, p]));

    // Query 4: Bank details (broad query, filter to exact tuples in memory)
    const bankDetailsList = await BankDetails.find({
      bankName: { $in: bankNames },
      accountNumber: { $in: accountNumbers },
      swiftCode: { $in: swiftCodes }
    }).lean();
    const bankDetailsMap = new Map();
    for (const b of bankDetailsList) {
      const key = `${b.bankName}|${b.accountNumber}|${b.swiftCode}`;
      if (bankKeys.includes(key)) {
        bankDetailsMap.set(key, b);
      }
    }

    // Query 5: Existing contract numbers
    const existingContracts = await Contract.find(
      { contractNumber: { $in: contractNumbers } },
      { contractNumber: 1 }
    ).lean();
    const existingContractNumbers = new Set(existingContracts.map(c => c.contractNumber));

    return {
      parties: partiesMap,
      commodities: commoditiesMap,
      paymentTerms: paymentTermsMap,
      bankDetails: bankDetailsMap,
      existingContractNumbers
    };
  } catch (err) {
    console.error(`[${new Date().toISOString()}] [ERROR] [Unit2] Failed to load reference data cache: ${err.message}`);
    throw err;
  }
}

module.exports = { loadCache };
