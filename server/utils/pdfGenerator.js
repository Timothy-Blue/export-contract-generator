const PDFDocument = require('pdfkit');
const { formatContractDate } = require('../utils/calculations');

/**
 * Generate PDF contract document
 * @param {object} contract - Contract data with populated references
 * @returns {PDFDocument}
 */
const generateContractPDF = (contract) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  // Title
  doc.fontSize(16).font('Helvetica-Bold')
     .text('SALES CONTRACT', { align: 'center' })
     .moveDown();
  
  // Contract Header
  doc.fontSize(10).font('Helvetica')
     .text(`Contract No: ${contract.contractNumber}`, { align: 'left' })
     .text(`Date: ${formatContractDate(contract.contractDate)}`, { align: 'left' })
     .moveDown();
  
  // Parties
  doc.fontSize(12).font('Helvetica-Bold')
     .text('SELLER:', { underline: true })
     .fontSize(10).font('Helvetica')
     .text(contract.seller.companyName)
     .text(contract.seller.address)
     .text(`Email: ${contract.seller.email || 'N/A'}`)
     .text(`Phone: ${contract.seller.phone || 'N/A'}`)
     .moveDown();
  
  doc.fontSize(12).font('Helvetica-Bold')
     .text('BUYER:', { underline: true })
     .fontSize(10).font('Helvetica')
     .text(contract.buyer.companyName)
     .text(contract.buyer.address)
     .text(`Email: ${contract.buyer.email || 'N/A'}`)
     .text(`Phone: ${contract.buyer.phone || 'N/A'}`)
     .moveDown(1.5);
  
  // Article 1: Commodity
  doc.fontSize(11).font('Helvetica-Bold')
     .text('ARTICLE 1: COMMODITY, QUALITY & QUANTITY', { underline: true })
     .moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica')
     .text(`1.1 Commodity: ${contract.commodityDescription}`)
     .text(`1.2 Quantity: ${contract.quantity} ${contract.unit} ${contract.tolerance ? `(± ${contract.tolerance}%)` : ''}`)
     .text(`1.3 Origin: ${contract.origin}`)
     .text(`1.4 Packing: ${contract.packing}`);
  
  if (contract.qualitySpec) {
    doc.text(`1.5 Quality Specification: ${contract.qualitySpec}`);
  }
  
  if (contract.tolerance) {
    doc.text(`    Tolerance Range: ${contract.minQuantity} - ${contract.maxQuantity} ${contract.unit}`);
  }
  
  doc.moveDown(1.5);
  
  // Article 2: Price
  doc.fontSize(11).font('Helvetica-Bold')
     .text('ARTICLE 2: PRICE', { underline: true })
     .moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica')
     .text(`2.1 Unit Price: ${contract.currency} ${contract.unitPrice.toFixed(2)} per ${contract.unit}`)
     .text(`2.2 Total Amount: ${contract.currency} ${contract.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
  
  if (contract.totalAmountText) {
    doc.text(`    Say: ${contract.totalAmountText}`);
  }
  
  if (contract.tolerance) {
    doc.text(`    Amount Range: ${contract.currency} ${contract.minTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} - ${contract.maxTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  }
  
  doc.text(`2.3 Price Terms: ${contract.incoterm} ${contract.portLocation}`);
  
  doc.moveDown(1.5);
  
  // Article 3: Payment
  doc.fontSize(11).font('Helvetica-Bold')
     .text('ARTICLE 3: PAYMENT', { underline: true })
     .moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica')
     .text(`3.1 Payment Terms: ${contract.paymentTermText}`)
     .moveDown();
  
  // Bank Details
  doc.fontSize(11).font('Helvetica-Bold')
     .text("SELLER'S BANK DETAILS:", { underline: true })
     .moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica')
     .text(`Bank Name: ${contract.bankDetails.bankName}`)
     .text(`Account Name: ${contract.bankDetails.accountName}`)
     .text(`Account Number: ${contract.bankDetails.accountNumber}`)
     .text(`SWIFT Code: ${contract.bankDetails.swiftCode}`);
  
  if (contract.bankDetails.bankAddress) {
    doc.text(`Bank Address: ${contract.bankDetails.bankAddress}`);
  }
  
  if (contract.bankDetails.iban) {
    doc.text(`IBAN: ${contract.bankDetails.iban}`);
  }
  
  doc.moveDown(1.5);
  
  // Shipment Period
  if (contract.shipmentPeriod) {
    doc.fontSize(11).font('Helvetica-Bold')
       .text('ARTICLE 4: SHIPMENT', { underline: true })
       .moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica')
       .text(`4.1 Shipment Period: ${contract.shipmentPeriod}`)
       .moveDown(1.5);
  }
  
  // Additional Terms
  if (contract.additionalTerms) {
    doc.fontSize(11).font('Helvetica-Bold')
       .text('ADDITIONAL TERMS & CONDITIONS:', { underline: true })
       .moveDown(0.5);
    
    doc.fontSize(10).font('Helvetica')
       .text(contract.additionalTerms)
       .moveDown(1.5);
  }
  
  // Signatures
  doc.moveDown(2);
  
  const signatureY = doc.y;
  doc.fontSize(10).font('Helvetica-Bold')
     .text('FOR SELLER', 50, signatureY)
     .text('FOR BUYER', 350, signatureY);
  
  doc.moveDown(3);
  doc.fontSize(9).font('Helvetica')
     .text('_____________________', 50, doc.y)
     .text('_____________________', 350, doc.y - 12);
  
  doc.moveDown();
  doc.text('Signature & Stamp', 50, doc.y)
     .text('Signature & Stamp', 350, doc.y - 12);
  
  return doc;
};

module.exports = { generateContractPDF };
