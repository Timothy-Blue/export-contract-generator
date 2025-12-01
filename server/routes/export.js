const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const { generateContractPDF } = require('../utils/pdfGenerator');
const { generateReleaseNotePDF } = require('../utils/releaseNotePdfGenerator');

// @route   GET /api/export/pdf/:id
// @desc    Export contract as PDF
// @access  Public
router.get('/pdf/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('buyer')
      .populate('seller')
      .populate('commodity')
      .populate('paymentTerm')
      .populate('bankDetails');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Generate PDF
    const doc = generateContractPDF(contract);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Contract_${contract.contractNumber}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/export/release-note/:id
// @desc    Export release note/debit note as PDF
// @access  Public
router.get('/release-note/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('buyer')
      .populate('seller')
      .populate('commodity')
      .populate('paymentTerm')
      .populate('bankDetails');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // Generate Release Note PDF
    const doc = generateReleaseNotePDF(contract);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=DebitNote_${contract.debitNoteNumber || contract.contractNumber}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error('Release note PDF generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/export/docx/:id
// @desc    Export contract as DOCX
// @access  Public
router.get('/docx/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('buyer')
      .populate('seller')
      .populate('commodity')
      .populate('paymentTerm')
      .populate('bankDetails');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    
    // For DOCX generation, you would typically use a template
    // This is a placeholder - implement with docxtemplater in production
    res.status(501).json({ 
      message: 'DOCX export will be implemented with docxtemplater',
      data: contract 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
