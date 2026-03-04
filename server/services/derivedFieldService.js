const { numberToText } = require('../utils/calculations');

/**
 * Calculates derived fields for all validated rows and merges with resolved IDs.
 * min/max quantity and amount are skipped — the Contract model pre('save') hook handles them.
 *
 * @param {Array} validatedRows
 * @param {Object} resolutionMap - { buyers, sellers, commodities, paymentTerms, bankDetails }
 * @returns {Array} resolvedContractDataArray
 */
function calculateAll(validatedRows, resolutionMap) {
  return validatedRows.map(row => calculateForRow(row, resolutionMap));
}

function calculateForRow(row, resolutionMap) {
  const d = row.data;
  const bankKey = `${d.bankName}|${d.accountNumber}|${d.swiftCode}`;

  const totalAmount = d.quantity * d.unitPrice;
  const totalAmountText = numberToText(totalAmount, d.currency);

  return {
    rowNumber: row.rowNumber,
    contractNumber: d.contractNumber,
    contractDate: d.contractDate,
    buyerId: resolutionMap.buyers.get(d.buyerName),
    sellerId: resolutionMap.sellers.get(d.sellerName),
    commodityId: resolutionMap.commodities.get(d.commodityName),
    paymentTermId: resolutionMap.paymentTerms.get(d.paymentTermName),
    bankDetailsId: resolutionMap.bankDetails.get(bankKey),
    commodityDescription: d.commodityDescription,
    quantity: d.quantity,
    unit: d.unit,
    tolerance: d.tolerance,
    origin: d.origin,
    packing: d.packing,
    qualitySpec: d.qualitySpec,
    unitPrice: d.unitPrice,
    currency: d.currency,
    incoterm: d.incoterm,
    portLocation: d.portLocation,
    totalAmount,
    totalAmountText,
    paymentTermText: d.paymentTermName,
    shipmentPeriod: d.shipmentPeriod,
    additionalTerms: d.additionalTerms,
    releaseType: d.releaseType,
    status: d.status
  };
}

module.exports = { calculateAll };
