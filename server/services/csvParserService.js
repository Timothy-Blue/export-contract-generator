const { parse } = require('csv-parse/sync');

const REQUIRED_HEADERS = [
  'contractNumber', 'contractDate', 'buyerName', 'sellerName',
  'commodityName', 'commodityDescription', 'quantity', 'unit',
  'tolerance', 'origin', 'packing', 'qualitySpec', 'unitPrice',
  'currency', 'incoterm', 'portLocation', 'paymentTermName',
  'bankName', 'accountName', 'accountNumber', 'swiftCode',
  'shipmentPeriod', 'additionalTerms', 'releaseType', 'status'
];

const MAX_ROWS = 20;

class FileLevelError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'FileLevelError';
    this.code = code;
  }
}

/**
 * Parses and file-level validates a multer file object.
 * Throws FileLevelError on first failure (fail-fast).
 * Returns ParsedCsvFile on success.
 *
 * @param {Object} fileObject - multer file { buffer, originalname, mimetype, size }
 * @returns {{ headers: string[], rows: Array<{rowNumber, fields}>, totalRows: number }}
 */
function parseFile(fileObject) {
  // F-001: extension + MIME check
  const ext = (fileObject.originalname || '').split('.').pop().toLowerCase();
  if (ext !== 'csv' || !fileObject.mimetype.includes('csv') && !fileObject.mimetype.includes('text')) {
    throw new FileLevelError('INVALID_FILE_FORMAT', 'Invalid file format. Please upload a CSV file.');
  }

  // F-003: UTF-8 encoding check (detect BOM or non-UTF8 bytes)
  const raw = fileObject.buffer;
  try {
    // Node buffers are UTF-8 by default; attempt decode and check for replacement char
    const text = raw.toString('utf8');
    if (text.includes('\uFFFD')) {
      throw new FileLevelError('INVALID_ENCODING', 'Invalid file encoding. Please ensure file is UTF-8 encoded.');
    }

    // Strip BOM if present
    const content = text.startsWith('\uFEFF') ? text.slice(1) : text;

    // Parse CSV
    let records;
    try {
      records = parse(content, { columns: true, skip_empty_lines: true, trim: false });
    } catch (parseErr) {
      throw new FileLevelError('INVALID_FILE_FORMAT', 'Invalid file format. Please upload a CSV file.');
    }

    // F-004: required headers
    if (records.length === 0) {
      // Try to parse headers only
      const headerLine = content.split('\n')[0] || '';
      const presentHeaders = headerLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const missing = REQUIRED_HEADERS.filter(h => !presentHeaders.includes(h));
      if (missing.length > 0) {
        throw new FileLevelError('MISSING_HEADERS', `Missing required header columns: ${missing.join(', ')}`);
      }
      throw new FileLevelError('FILE_EMPTY', 'File is empty. Please add at least one contract row.');
    }

    const presentHeaders = Object.keys(records[0]);
    const missing = REQUIRED_HEADERS.filter(h => !presentHeaders.includes(h));
    if (missing.length > 0) {
      throw new FileLevelError('MISSING_HEADERS', `Missing required header columns: ${missing.join(', ')}`);
    }

    // F-005: at least 1 data row
    if (records.length === 0) {
      throw new FileLevelError('FILE_EMPTY', 'File is empty. Please add at least one contract row.');
    }

    // F-002: max 20 rows
    if (records.length > MAX_ROWS) {
      throw new FileLevelError('FILE_TOO_LARGE', 'File exceeds maximum limit of 20 rows. Please split into multiple files.');
    }

    const rows = records.map((record, index) => ({
      rowNumber: index + 2, // header = row 1, first data row = row 2
      fields: record
    }));

    return {
      headers: REQUIRED_HEADERS,
      rows,
      totalRows: rows.length
    };
  } catch (err) {
    if (err instanceof FileLevelError) throw err;
    throw new FileLevelError('INVALID_FILE_FORMAT', 'Invalid file format. Please upload a CSV file.');
  }
}

module.exports = { parseFile, FileLevelError };
