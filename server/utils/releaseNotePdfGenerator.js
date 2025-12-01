const PDFDocument = require('pdfkit');
const { formatContractDate } = require('../utils/calculations');

/**
 * Generate Release/Debit Note PDF document
 * @param {object} contract - Contract data with populated references
 * @returns {PDFDocument}
 */
const generateReleaseNotePDF = (contract) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  
  // Header with Debit Note Number
  doc.fontSize(18).font('Helvetica-Bold')
     .fillColor('#8B4513')
     .text(`Debit note # ${contract.debitNoteNumber || 'N/A'}`, { align: 'right' })
     .moveDown(2);
  
  // Invoice and Due Date
  doc.fontSize(10).font('Helvetica')
     .fillColor('#000000')
     .text(`Invoice Date: ${contract.invoiceDate ? formatContractDate(contract.invoiceDate) : 'N/A'}`, 50, 130)
     .fillColor('#8B4513')
     .font('Helvetica-Bold')
     .text(`Due Date: ${contract.dueDate ? formatContractDate(contract.dueDate) : 'N/A'}`, 50, 145);
  
  // Bill To Section
  doc.fillColor('#8B4513')
     .text('BILL TO', 400, 130)
     .fillColor('#000000')
     .font('Helvetica')
     .text(`${contract.buyer.companyName}`, 400, 145)
     .text(`${contract.buyer.address}`, 400, 160, { width: 150 });
  
  doc.moveDown(3);
  
  // Table Header
  const tableTop = 240;
  const descCol = 50;
  const qtyCol = 250;
  const priceCol = 300;
  const subtotalCol = 380;
  const taxCol = 480;
  
  doc.fillColor('#C8B896')
     .rect(descCol - 10, tableTop, 545, 25)
     .fill();
  
  doc.fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .fontSize(10)
     .text('DESCRIPTION', descCol, tableTop + 8)
     .text('QTY', qtyCol, tableTop + 8)
     .text('UNIT PRICE', priceCol, tableTop + 8)
     .text('SUBTOTAL', subtotalCol, tableTop + 8)
     .text('TAX', taxCol, tableTop + 8);
  
  // Table Content
  let currentY = tableTop + 35;
  
  doc.fillColor('#000000')
     .font('Helvetica')
     .text(contract.commodityDescription || contract.commodity?.name || 'Product/Service', descCol, currentY)
     .text(contract.quantity.toString(), qtyCol, currentY)
     .text(`${contract.unitPrice.toFixed(2)}`, priceCol, currentY)
     .text(`${(contract.quantity * contract.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, subtotalCol, currentY)
     .text(`${((contract.quantity * contract.unitPrice) * 0.0625).toFixed(2)} (6.25%)`, taxCol, currentY);
  
  currentY += 25;
  
  // Total Amount in Words
  if (contract.totalAmountText) {
    doc.fillColor('#8B4513')
       .font('Helvetica-Bold')
       .fontSize(9)
       .text(contract.totalAmountText.toUpperCase(), descCol, currentY + 10);
  }
  
  currentY += 50;
  
  // Summary Section
  doc.fillColor('#000000')
     .font('Helvetica-Bold')
     .fontSize(11)
     .text('SUBTOTAL', 400, currentY)
     .text('TAX', 400, currentY + 20)
     .text('Total', 400, currentY + 40);
  
  doc.font('Helvetica')
     .text(`$${contract.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, currentY, { align: 'right' })
     .text(`$${(contract.totalAmount * 0.0625).toFixed(2)}`, 480, currentY + 20, { align: 'right' })
     .text(`$${(contract.totalAmount * 1.0625).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 480, currentY + 40, { align: 'right' });
  
  currentY += 80;
  
  // Release Information Section
  if (contract.releaseType && contract.releaseType !== 'NOT_SPECIFIED') {
    doc.fontSize(11).font('Helvetica-Bold')
       .fillColor('#8B4513')
       .text('RELEASE INFORMATION', descCol, currentY)
       .moveDown(0.5);
    
    currentY += 25;
    
    const releaseTypeText = {
      'SWB': 'Sea Waybill (SWB)',
      'TELEX_RELEASE': 'Telex Release',
      'ORIGINAL_BL': 'Original Bill of Lading (B/L)'
    };
    
    doc.fillColor('#000000')
       .font('Helvetica')
       .fontSize(10)
       .text(`Release Type: ${releaseTypeText[contract.releaseType] || contract.releaseType}`, descCol, currentY);
    
    if (contract.releaseStatus && contract.releaseStatus !== 'NOT_APPLICABLE') {
      doc.text(`Status: ${contract.releaseStatus}`, descCol, currentY + 15);
    }
    
    if (contract.releaseDate) {
      doc.text(`Release Date: ${formatContractDate(contract.releaseDate)}`, descCol, currentY + 30);
    }
    
    if (contract.releaseRemarks) {
      doc.text(`Remarks: ${contract.releaseRemarks}`, descCol, currentY + 45, { width: 500 });
    }
    
    currentY += 80;
  }
  
  // Payment Details Section
  currentY += 20;
  doc.fillColor('#8B4513')
     .font('Helvetica-Bold')
     .fontSize(10)
     .text(`[${contract.seller.companyName}]`, descCol, currentY);
  
  currentY += 15;
  doc.fillColor('#8B4513')
     .font('Helvetica')
     .fontSize(9)
     .text('[payment details]', 400, currentY - 15)
     .text(`Bank account number: [payment details]`, 400, currentY - 5);
  
  doc.fillColor('#000000')
     .text(`${contract.seller.address}`, descCol, currentY);
  
  if (contract.seller.phone) {
    doc.text(`Phone: ${contract.seller.phone}`, descCol, currentY + 15);
  }
  
  // Bank Details
  if (contract.bankDetails) {
    currentY += 45;
    doc.fillColor('#8B4513')
       .font('Helvetica-Bold')
       .text('BANK DETAILS:', descCol, currentY);
    
    currentY += 15;
    doc.fillColor('#000000')
       .font('Helvetica')
       .text(`${contract.bankDetails.bankName}`, descCol, currentY)
       .text(`Account: ${contract.bankDetails.accountNumber}`, descCol, currentY + 12)
       .text(`SWIFT: ${contract.bankDetails.swiftCode}`, descCol, currentY + 24);
  }
  
  return doc;
};

module.exports = { generateReleaseNotePDF };
