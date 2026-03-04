const Party = require('../models/Party');
const Commodity = require('../models/Commodity');
const PaymentTerm = require('../models/PaymentTerm');
const BankDetails = require('../models/BankDetails');

const IMPORT_PLACEHOLDER = 'Imported';
const PARTY_ADDRESS_PLACEHOLDER = 'To be updated';
const DEFAULT_DAYS_FROM_BL = 0;

/**
 * Resolves all reference data for all validated rows.
 * Returns a resolutionMap keyed by entity type and name.
 * Throws ResolutionError on inactive record or buyer=seller conflict.
 *
 * @param {Array} validatedRows
 * @returns {Object} resolutionMap
 */
async function resolveAll(validatedRows) {
  const buyerNames = [...new Set(validatedRows.map(r => r.data.buyerName))];
  const sellerNames = [...new Set(validatedRows.map(r => r.data.sellerName))];
  const commodityNames = [...new Set(validatedRows.map(r => r.data.commodityName))];
  const paymentTermNames = [...new Set(validatedRows.map(r => r.data.paymentTermName))];

  const bankTuples = [...new Map(
    validatedRows.map(r => {
      const key = `${r.data.bankName}|${r.data.accountNumber}|${r.data.swiftCode}`;
      return [key, r.data];
    })
  ).values()];

  // Check buyer/seller name collision before any DB writes
  const buyerSet = new Set(buyerNames);
  const collision = sellerNames.find(n => buyerSet.has(n));
  if (collision) {
    throw new ResolutionError(
      `'${collision}' cannot be used as both buyer and seller`,
      validatedRows.filter(r => r.data.buyerName === collision || r.data.sellerName === collision).map(r => r.rowNumber),
      'Party', collision
    );
  }

  // Build rowsByName for commodity (need first-row field values on create)
  const rowsByCommodity = {};
  for (const row of validatedRows) {
    if (!rowsByCommodity[row.data.commodityName]) rowsByCommodity[row.data.commodityName] = row.data;
  }

  const buyers = await resolveBuyers(buyerNames);
  const sellers = await resolveSellers(sellerNames);
  const commodities = await resolveCommodities(commodityNames, rowsByCommodity);
  const paymentTerms = await resolvePaymentTerms(paymentTermNames);
  const bankDetailsMap = await resolveBankDetails(bankTuples);

  return { buyers, sellers, commodities, paymentTerms, bankDetails: bankDetailsMap };
}

async function resolveBuyers(uniqueNames) {
  const found = await Party.find({ companyName: { $in: uniqueNames }, type: 'BUYER' });
  const map = new Map(found.map(p => [p.companyName, p]));
  const result = new Map();

  for (const name of uniqueNames) {
    const existing = map.get(name);
    if (existing) {
      if (!existing.isActive) {
        throw new ResolutionError(`'${name}' exists but is inactive`, [], 'Party', name);
      }
      result.set(name, existing._id);
    } else {
      const created = await Party.create({ companyName: name, type: 'BUYER', address: PARTY_ADDRESS_PLACEHOLDER, isActive: true });
      console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Created new BUYER party: ${name}`);
      result.set(name, created._id);
    }
  }
  return result;
}

async function resolveSellers(uniqueNames) {
  const found = await Party.find({ companyName: { $in: uniqueNames }, type: 'SELLER' });
  const map = new Map(found.map(p => [p.companyName, p]));
  const result = new Map();

  for (const name of uniqueNames) {
    const existing = map.get(name);
    if (existing) {
      if (!existing.isActive) {
        throw new ResolutionError(`'${name}' exists but is inactive`, [], 'Party', name);
      }
      result.set(name, existing._id);
    } else {
      const created = await Party.create({ companyName: name, type: 'SELLER', address: PARTY_ADDRESS_PLACEHOLDER, isActive: true });
      console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Created new SELLER party: ${name}`);
      result.set(name, created._id);
    }
  }
  return result;
}

async function resolveCommodities(uniqueNames, rowsByCommodity) {
  const found = await Commodity.find({ name: { $in: uniqueNames } });
  const map = new Map(found.map(c => [c.name, c]));
  const result = new Map();

  for (const name of uniqueNames) {
    const existing = map.get(name);
    if (existing) {
      if (!existing.isActive) {
        throw new ResolutionError(`'${name}' exists but is inactive`, [], 'Commodity', name);
      }
      result.set(name, existing._id);
    } else {
      const row = rowsByCommodity[name];
      const created = await Commodity.create({
        name,
        description: row.commodityDescription,
        defaultUnit: row.unit,
        defaultOrigin: row.origin,
        defaultPacking: row.packing,
        isActive: true
      });
      console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Created new commodity: ${name}`);
      result.set(name, created._id);
    }
  }
  return result;
}

async function resolvePaymentTerms(uniqueNames) {
  const found = await PaymentTerm.find({ name: { $in: uniqueNames } });
  const map = new Map(found.map(p => [p.name, p]));
  const result = new Map();

  for (const name of uniqueNames) {
    const existing = map.get(name);
    if (existing) {
      if (!existing.isActive) {
        throw new ResolutionError(`'${name}' exists but is inactive`, [], 'PaymentTerm', name);
      }
      result.set(name, existing._id);
    } else {
      const created = await PaymentTerm.create({
        name,
        description: IMPORT_PLACEHOLDER,
        terms: IMPORT_PLACEHOLDER,
        daysFromBL: DEFAULT_DAYS_FROM_BL,
        isActive: true
      });
      console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Created new payment term: ${name}`);
      result.set(name, created._id);
    }
  }
  return result;
}

async function resolveBankDetails(uniqueTuples) {
  const bankNames = uniqueTuples.map(t => t.bankName);
  const accountNumbers = uniqueTuples.map(t => t.accountNumber);
  const swiftCodes = uniqueTuples.map(t => t.swiftCode);

  const found = await BankDetails.find({
    bankName: { $in: bankNames },
    accountNumber: { $in: accountNumbers },
    swiftCode: { $in: swiftCodes }
  });

  // Filter to exact tuple matches in memory
  const foundMap = new Map(
    found.map(b => [`${b.bankName}|${b.accountNumber}|${b.swiftCode}`, b])
  );
  const result = new Map();

  for (const row of uniqueTuples) {
    const key = `${row.bankName}|${row.accountNumber}|${row.swiftCode}`;
    const existing = foundMap.get(key);
    if (existing) {
      if (!existing.isActive) {
        throw new ResolutionError(`'${row.bankName}' exists but is inactive`, [], 'BankDetails', row.bankName);
      }
      result.set(key, existing._id);
    } else {
      const created = await BankDetails.create({
        bankName: row.bankName,
        accountName: row.accountName,
        accountNumber: row.accountNumber,
        swiftCode: row.swiftCode,
        currency: row.currency,
        isActive: true,
        isDefault: false
      });
      console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Created new bank details: ${row.bankName}`);
      result.set(key, created._id);
    }
  }
  return result;
}

class ResolutionError extends Error {
  constructor(message, affectedRows, entityType, entityName) {
    super(message);
    this.name = 'ResolutionError';
    this.affectedRows = affectedRows;
    this.entityType = entityType;
    this.entityName = entityName;
  }
}

module.exports = { resolveAll, ResolutionError };
