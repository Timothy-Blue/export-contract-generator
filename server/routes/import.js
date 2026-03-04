const express = require('express');
const router = express.Router();
const { authenticateAPIKey } = require('../middleware/auth');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const importController = require('../controllers/importController');

// @route   GET /api/import/template
// @desc    Download the CSV import template
// @access  Admin
router.get('/template', authenticateAPIKey, importController.downloadTemplate);

// @route   POST /api/import/upload
// @desc    Upload CSV, validate, and (on confirm) import contracts
// @access  Admin
router.post('/upload', authenticateAPIKey, uploadMiddleware, importController.uploadCsv);

module.exports = router;
