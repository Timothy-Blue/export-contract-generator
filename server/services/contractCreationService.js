const mongoose = require('mongoose');
const Contract = require('../models/Contract');

const DEFAULT_RELEASE_STATUS = 'PENDING';
const DEFAULT_STATUS = 'DRAFT';
const DEFAULT_RELEASE_TYPE = 'NOT_SPECIFIED';

/**
 * Inserts all resolved contract rows in a single MongoDB transaction.
 * Uses insertMany to bypass the pre('save') hook (min/max already handled by hook on save,
 * but we bypass it here per design decision to use raw insertMany).
 * All-or-nothing: rolls back on any failure.
 *
 * @param {Array} resolvedRows - ResolvedContractData[]
 * @param {string} userId
 * @returns {Array} ImportRowResult[]
 */
async function createAll(resolvedRows, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const docs = resolvedRows.map(row => buildContractDoc(row, userId));
    const inserted = await Contract.insertMany(docs, { session, ordered: true });

    await session.commitTransaction();
    console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Transaction committed. Inserted ${inserted.length} contracts.`);

    return inserted.map((contract, i) => ({
      rowNumber: resolvedRows[i].rowNumber,
      contractNumber: resolvedRows[i].contractNumber,
      status: 'imported',
      contractId: contract._id.toString(),
      error: null
    }));
  } catch (err) {
    await session.abortTransaction();
    const failedRow = resolvedRows.find(r => err.message && err.message.includes(r.contractNumber));
    const rowInfo = failedRow ? ` (row ${failedRow.rowNumber})` : '';
    console.error(`[${new Date().toISOString()}] [ERROR] [Unit3] Transaction aborted${rowInfo}: ${err.message}`);

    return resolvedRows.map(row => ({
      rowNumber: row.rowNumber,
      contractNumber: row.contractNumber,
      status: 'failed',
      contractId: null,
      error: 'Import failed. No contracts were saved.'
    }));
  } finally {
    session.endSession();
  }
}

function buildContractDoc(row, userId) {
  return {
    contractNumber: row.contractNumber,
    contractDate: row.contractDate,
    buyer: row.buyerId,
    seller: row.sellerId,
    commodity: row.commodityId,
    commodityDescription: row.commodityDescription,
    quantity: row.quantity,
    unit: row.unit,
    tolerance: row.tolerance,
    origin: row.origin,
    packing: row.packing,
    qualitySpec: row.qualitySpec,
    unitPrice: row.unitPrice,
    currency: row.currency,
    incoterm: row.incoterm,
    portLocation: row.portLocation,
    totalAmount: row.totalAmount,
    totalAmountText: row.totalAmountText,
    paymentTerm: row.paymentTermId,
    paymentTermText: row.paymentTermText,
    bankDetails: row.bankDetailsId,
    shipmentPeriod: row.shipmentPeriod,
    additionalTerms: row.additionalTerms,
    releaseType: row.releaseType || DEFAULT_RELEASE_TYPE,
    releaseStatus: DEFAULT_RELEASE_STATUS,
    status: row.status || DEFAULT_STATUS,
    createdBy: userId
  };
}

module.exports = { createAll };
