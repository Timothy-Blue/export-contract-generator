const templateService = require('../services/templateService');
const { parseFile, FileLevelError } = require('../services/csvParserService');
const { loadCache } = require('../services/referenceDataCacheService');
const ValidationService = require('../services/validationService');
const {
  buildValidationOnlyResponse,
  buildConfirmResponse,
  buildImportCompleteResponse,
  buildFileLevelErrorResponse
} = require('../services/importResponseService');
const { executeImport } = require('../services/importExecutionService');

const TEMPLATE_FILENAME = 'contract_import_template.csv';

/**
 * GET /api/import/template
 * Streams the CSV template file to the client.
 */
exports.downloadTemplate = (req, res) => {
  const timestamp = new Date().toISOString();
  try {
    const filePath = templateService.getTemplatePath();
    console.log(`[${timestamp}] [INFO] [Unit1] Template download requested`);
    res.download(filePath, TEMPLATE_FILENAME, (err) => {
      if (err) {
        console.error(`[${timestamp}] [ERROR] [Unit1] Failed to stream template: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Template file not available. Please contact your administrator.' });
        }
      } else {
        console.log(`[${timestamp}] [INFO] [Unit1] Template downloaded successfully`);
      }
    });
  } catch (err) {
    console.error(`[${timestamp}] [ERROR] [Unit1] Template file not found: ${err.message}`);
    res.status(500).json({ message: 'Template file not available. Please contact your administrator.' });
  }
};

/**
 * POST /api/import/upload
 * Orchestrates: parse → cache → validate → (confirm) → import → respond.
 */
exports.uploadCsv = async (req, res) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const userId = 'import'; // placeholder until auth is active

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.', code: 'INVALID_FILE_FORMAT' });
    }

    console.log(`[${timestamp}] [INFO] [Unit2] Upload started — file=${req.file.originalname}, size=${req.file.size}`);

    // Step 1: Parse + file-level validation
    let parsedFile;
    try {
      parsedFile = parseFile(req.file);
    } catch (err) {
      if (err instanceof FileLevelError) {
        console.log(`[${timestamp}] [INFO] [Unit2] File-level error: ${err.code}`);
        return res.status(400).json(buildFileLevelErrorResponse(err));
      }
      throw err;
    }

    // Step 2: Load reference data cache (5 DB queries)
    const cache = await loadCache(parsedFile);

    // Step 3: Validate all rows
    const validator = new ValidationService();
    const validatedRows = validator.validateAll(parsedFile, cache);
    const invalidRows = validatedRows.filter(r => !r.isValid);

    const isConfirm = req.body && req.body.confirm === 'true';

    // Step 4a: Validation errors — return without importing
    if (invalidRows.length > 0) {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] [INFO] [Unit2] Validation failed — invalid=${invalidRows.length}/${validatedRows.length}, duration=${duration}ms`);
      return res.status(200).json(buildValidationOnlyResponse(validatedRows));
    }

    // Step 4b: All valid, not yet confirmed — prompt user
    if (!isConfirm) {
      const duration = Date.now() - start;
      console.log(`[${timestamp}] [INFO] [Unit2] All rows valid, awaiting confirmation — rows=${validatedRows.length}, duration=${duration}ms`);
      return res.status(200).json(buildConfirmResponse(validatedRows));
    }

    // Step 5: User confirmed — execute import (Unit 3)
    const executionResult = await executeImport(validatedRows, userId);
    const duration = Date.now() - start;
    console.log(`[${timestamp}] [INFO] [Unit2] Import complete — imported=${executionResult.summary.importedRows}/${validatedRows.length}, duration=${duration}ms`);

    return res.status(200).json(buildImportCompleteResponse(validatedRows, executionResult.importResults));

  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[${timestamp}] [ERROR] [Unit2] Unhandled error after ${duration}ms: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Import failed due to a server error. Please contact your administrator.',
      code: 'SERVER_ERROR'
    });
  }
};
