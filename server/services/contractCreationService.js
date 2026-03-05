const mongoose = require('mongoose');
const Contract = require('../models/Contract');

const DEFAULT_RELEASE_STATUS = 'PENDING';
const DEFAULT_STATUS = 'DRAFT';
const DEFAULT_RELEASE_TYPE = 'NOT_SPECIFIED';

/**
 * Inserts all resolved contract rows using insertMany.
 * Uses insertMany to bypass the pre('save') hook (min/max already handled by hook on save,
 * but we bypass it here per design decision to use raw insertMany).
 * Note: Without transactions, partial imports may occur if some documents fail.
 *
 * @param {Array} resolvedRows - ResolvedContractData[]
 * @param {string} userId
 * @returns {Array} ImportRowResult[]
 */
async function createAll(resolvedRows, userId) {
  try {
    const docs = resolvedRows.map(row => buildContractDoc(row, userId));
    const inserted = await Contract.insertMany(docs, { ordered: true });

    console.log(`[${new Date().toISOString()}] [INFO] [Unit3] Inserted ${inserted.length} contracts.`);

    return inserted.map((contract, i) => ({
      rowNumber: resolvedRows[i].rowNumber,
      contractNumber: resolvedRows[i].contractNumber,
      status: 'imported',
      contractId: contract._id.toString(),
      error: null
    }));
  } catch (err) {
    const failedRow = resolvedRows.find(r => err.message && err.message.includes(r.contractNumber));
    const rowInfo = failedRow ? ` (row ${failedRow.rowNumber})` : '';
    console.error(`[${new Date().toISOString()}] [ERROR] [Unit3] Insert failed${rowInfo}: ${err.message}`);

    return resolvedRows.map(row => ({
      rowNumber: row.rowNumber,
      contractNumber: row.contractNumber,
      status: 'failed',
      contractId: null,
      error: 'Import failed. No contracts were saved.'
    }));
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
