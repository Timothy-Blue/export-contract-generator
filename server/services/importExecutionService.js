const { resolveAll, ResolutionError } = require('./referenceResolutionService');
const { calculateAll } = require('./derivedFieldService');
const { createAll } = require('./contractCreationService');

/**
 * Orchestrates the full import pipeline for Unit 3.
 * Called internally by Unit 2's controller after user confirms.
 *
 * @param {Array} validatedRows - ValidatedRow[] (all isValid === true)
 * @param {string} userId
 * @returns {Object} ImportExecutionResult
 */
async function executeImport(validatedRows, userId) {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const totalRows = validatedRows.length;

  console.log(`[${timestamp}] [INFO] [Unit3] executeImport started — userId=${userId}, rows=${totalRows}`);

  if (!userId) {
    console.error(`[${timestamp}] [ERROR] [Unit3] userId is required`);
    return buildAllFailedResult(validatedRows, 'Import failed: user identity is missing.');
  }

  // Phase 1: Resolve reference data
  let resolutionMap;
  try {
    resolutionMap = await resolveAll(validatedRows);
  } catch (err) {
    const level = err instanceof ResolutionError ? 'WARN' : 'ERROR';
    console[level === 'WARN' ? 'warn' : 'error'](
      `[${new Date().toISOString()}] [${level}] [Unit3] Resolution failed: ${err.message}`
    );
    return buildAllFailedResult(validatedRows, err.message);
  }

  // Phase 2: Calculate derived fields
  const resolvedRows = calculateAll(validatedRows, resolutionMap);

  // Phase 3: Create contracts in a single transaction
  const importResults = await createAll(resolvedRows, userId);

  const importedCount = importResults.filter(r => r.status === 'imported').length;
  const success = importedCount === totalRows;
  const duration = Date.now() - start;

  console.log(
    `[${new Date().toISOString()}] [INFO] [Unit3] executeImport complete — ` +
    `imported=${importedCount}/${totalRows}, duration=${duration}ms, ` +
    `contractIds=${importResults.filter(r => r.contractId).map(r => r.contractId).join(',')}`
  );

  return {
    success,
    message: success ? 'Import completed successfully.' : 'Import failed. No contracts were saved.',
    summary: {
      totalRows,
      validRows: totalRows,
      invalidRows: 0,
      importedRows: importedCount
    },
    importResults
  };
}

function buildAllFailedResult(validatedRows, message) {
  return {
    success: false,
    message,
    summary: {
      totalRows: validatedRows.length,
      validRows: validatedRows.length,
      invalidRows: 0,
      importedRows: 0
    },
    importResults: validatedRows.map(row => ({
      rowNumber: row.rowNumber,
      contractNumber: row.contractNumber || '',
      status: 'failed',
      contractId: null,
      error: message
    }))
  };
}

module.exports = { executeImport };
