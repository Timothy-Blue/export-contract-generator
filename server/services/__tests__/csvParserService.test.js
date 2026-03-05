/**
 * Unit tests for csvParserService
 * Tests CSV parsing and file-level validation
 */

const { parseFile, FileLevelError } = require('../csvParserService');
const { createMullerFile, createValidCsvBuffer } = require('../../tests/helpers/testFactories');

describe('csvParserService', () => {
  describe('parseFile', () => {
    // ─── Happy Path Tests ───────────────────────────────────────────────────

    describe('Happy Path', () => {
      it('should parse valid CSV file with all required headers', () => {
        // Arrange
        const file = createMullerFile();

        // Act
        const result = parseFile(file);

        // Assert
        expect(result).toHaveProperty('headers');
        expect(result).toHaveProperty('rows');
        expect(result).toHaveProperty('totalRows');
        expect(result.headers).toHaveLength(25);
        expect(result.rows).toHaveLength(1);
        expect(result.totalRows).toBe(1);
        expect(result.rows[0].rowNumber).toBe(2); // First data row
        expect(result.rows[0].fields).toHaveProperty('contractNumber');
      });

      it('should parse CSV with optional fields (tolerance, qualitySpec, etc.)', () => {
        // Arrange
        const csvBuffer = createValidCsvBuffer([{
          contractNumber: 'TEST-001',
          tolerance: '',
          qualitySpec: '',
          shipmentPeriod: '',
          additionalTerms: ''
        }]);
        const file = createMullerFile({ buffer: csvBuffer });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].fields.tolerance).toBe('');
        expect(result.rows[0].fields.qualitySpec).toBe('');
      });

      it('should parse CSV with exactly 20 rows (max limit)', () => {
        // Arrange
        const rows = Array.from({ length: 20 }, (_, i) => ({
          contractNumber: `TEST-${String(i + 1).padStart(3, '0')}`
        }));
        const csvBuffer = createValidCsvBuffer(rows);
        const file = createMullerFile({ buffer: csvBuffer });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(20);
        expect(result.totalRows).toBe(20);
      });

      it('should handle UTF-8 encoded files correctly', () => {
        // Arrange
        const csvBuffer = createValidCsvBuffer([{
          contractNumber: 'TEST-001',
          commodityDescription: 'Café Premium'
        }]);
        const file = createMullerFile({ buffer: csvBuffer });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows[0].fields.commodityDescription).toBe('Café Premium');
      });

      it('should strip BOM from UTF-8 files', () => {
        // Arrange
        const csvBuffer = createValidCsvBuffer();
        const bomBuffer = Buffer.concat([Buffer.from('\uFEFF', 'utf8'), csvBuffer]);
        const file = createMullerFile({ buffer: bomBuffer });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].fields.contractNumber).toBe('TEST-001');
      });
    });

    // ─── Edge Cases ─────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
      it('should parse CSV with 1 row (minimum valid)', () => {
        // Arrange
        const file = createMullerFile();

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(1);
        expect(result.totalRows).toBe(1);
      });

      it('should handle files with trailing newlines', () => {
        // Arrange
        const csvBuffer = createValidCsvBuffer();
        const bufferWithNewlines = Buffer.from(csvBuffer.toString() + '\n\n\n', 'utf8');
        const file = createMullerFile({ buffer: bufferWithNewlines });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(1);
      });

      it('should handle files with CRLF line endings', () => {
        // Arrange
        const csvBuffer = createValidCsvBuffer();
        const crlfBuffer = Buffer.from(csvBuffer.toString().replace(/\n/g, '\r\n'), 'utf8');
        const file = createMullerFile({ buffer: crlfBuffer });

        // Act
        const result = parseFile(file);

        // Assert
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].fields.contractNumber).toBe('TEST-001');
      });
    });

    // ─── Error Handling ─────────────────────────────────────────────────────

    describe('Error Handling', () => {
      it('should reject non-CSV file extensions (F-001)', () => {
        // Arrange
        const file = createMullerFile({ originalname: 'test.txt' });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('Invalid file format');
      });

      it('should reject invalid MIME types (F-001)', () => {
        // Arrange
        const file = createMullerFile({ mimetype: 'application/pdf' });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('Invalid file format');
      });

      it('should reject files with > 20 rows (F-002)', () => {
        // Arrange
        const rows = Array.from({ length: 21 }, (_, i) => ({
          contractNumber: `TEST-${String(i + 1).padStart(3, '0')}`
        }));
        const csvBuffer = createValidCsvBuffer(rows);
        const file = createMullerFile({ buffer: csvBuffer });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('exceeds maximum limit of 20 rows');
      });

      it('should reject files with missing required headers (F-004)', () => {
        // Arrange
        const invalidCsv = 'contractNumber,contractDate\nTEST-001,2026-03-15';
        const file = createMullerFile({ buffer: Buffer.from(invalidCsv, 'utf8') });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('Missing required header columns');
      });

      it('should reject empty files (F-005)', () => {
        // Arrange
        const headers = [
          'contractNumber', 'contractDate', 'buyerName', 'sellerName',
          'commodityName', 'commodityDescription', 'quantity', 'unit',
          'tolerance', 'origin', 'packing', 'qualitySpec', 'unitPrice',
          'currency', 'incoterm', 'portLocation', 'paymentTermName',
          'bankName', 'accountName', 'accountNumber', 'swiftCode',
          'shipmentPeriod', 'additionalTerms', 'releaseType', 'status'
        ].join(',');
        const file = createMullerFile({ buffer: Buffer.from(headers, 'utf8') });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('File is empty');
      });

      it('should reject files with invalid encoding (F-003)', () => {
        // Arrange
        const invalidBuffer = Buffer.from([0xFF, 0xFE, 0x00, 0x00]); // Invalid UTF-8
        const file = createMullerFile({ buffer: invalidBuffer });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
      });

      it('should reject malformed CSV structure', () => {
        // Arrange
        const malformedCsv = 'contractNumber,contractDate\n"unclosed quote,value';
        const file = createMullerFile({ buffer: Buffer.from(malformedCsv, 'utf8') });

        // Act & Assert
        expect(() => parseFile(file)).toThrow(FileLevelError);
        expect(() => parseFile(file)).toThrow('Invalid file format');
      });
    });

    // ─── FileLevelError Class ───────────────────────────────────────────────

    describe('FileLevelError', () => {
      it('should create error with code and message', () => {
        // Arrange & Act
        const error = new FileLevelError('TEST_CODE', 'Test message');

        // Assert
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(FileLevelError);
        expect(error.code).toBe('TEST_CODE');
        expect(error.message).toBe('Test message');
        expect(error.name).toBe('FileLevelError');
      });
    });
  });
});
