/**
 * Assembles all API response shapes for the import pipeline.
 * No external dependencies — pure data assembly.
 */

/**
 * 200 response when validation found errors (no import triggered).
 */
function buildValidationOnlyResponse(validatedRows) {
  const summary = buildSummary(validatedRows, 0);
  return {
    success: false,
    message: 'Validation failed. Please fix all errors and re-upload.',
    summary,
    validationResults: buildValidationResults(validatedRows),
    importResults: null,
    errorReport: buildErrorReport(validatedRows)
  };
}

/**
 * 200 response when all rows are valid but user has not yet confirmed import.
 */
function buildConfirmResponse(validatedRows) {
  const summary = buildSummary(validatedRows, 0);
  return {
    success: false,
    message: `All ${summary.validRows} rows are valid. Please confirm to import.`,
    summary,
    validationResults: buildValidationResults(validatedRows),
    importResults: null,
    errorReport: null
  };
}

/**
 * 200 response after import execution completes.
 */
function buildImportCompleteResponse(validatedRows, importResults) {
  const importedCount = importResults.filter(r => r.status === 'imported').length;
  const summary = buildSummary(validatedRows, importedCount);
  const success = importedCount === validatedRows.length;

  return {
    success,
    message: success ? 'Import completed successfully!' : 'Import completed with some failures.',
    summary,
    validationResults: buildValidationResults(validatedRows),
    importResults,
    errorReport: buildErrorReport(validatedRows)
  };
}

/**
 * 400 response for file-level failures.
 */
function buildFileLevelErrorResponse(fileLevelError) {
  return {
    success: false,
    message: fileLevelError.message,
    code: fileLevelError.code
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildSummary(validatedRows, importedRows) {
  const validRows = validatedRows.filter(r => r.isValid).length;
  return {
    totalRows: validatedRows.length,
    validRows,
    invalidRows: validatedRows.length - validRows,
    importedRows
  };
}

function buildValidationResults(validatedRows) {
  return validatedRows.map(row => ({
    rowNumber: row.rowNumber,
    contractNumber: row.contractNumber,
    status: row.errors.length > 0 ? 'invalid' : row.warnings.length > 0 ? 'warning' : 'valid',
    errors: row.errors,
    warnings: row.warnings
  }));
}

function buildErrorReport(validatedRows) {
  const errorRows = validatedRows.filter(r => r.errors.length > 0);
  if (errorRows.length === 0) return null;

  const rows = [];
  for (const row of errorRows) {
    for (const e of row.errors) {
      // Sanitize values that could cause CSV injection
      rows.push({
        rowNumber: row.rowNumber,
        contractNumber: sanitizeCsvValue(row.contractNumber),
        field: e.field,
        errorMessage: sanitizeCsvValue(e.message)
      });
    }
  }
  return { available: true, rows };
}

function sanitizeCsvValue(value) {
  if (typeof value !== 'string') return value;
  // SEC2-006: strip leading formula characters
  return value.replace(/^[=+\-@]/, "'$&");
}

module.exports = {
  buildValidationOnlyResponse,
  buildConfirmResponse,
  buildImportCompleteResponse,
  buildFileLevelErrorResponse
};
