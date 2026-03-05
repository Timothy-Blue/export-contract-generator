/**
 * Unit tests for importResponseService
 * Tests response formatting for import pipeline
 */

const {
  buildValidationOnlyResponse,
  buildConfirmResponse,
  buildImportCompleteResponse,
  buildFileLevelErrorResponse
} = require('../importResponseService');
const { createValidatedRow } = require('../../tests/helpers/testFactories');

describe('importResponseService', () => {
  describe('buildValidationOnlyResponse', () => {
    it('should build response when validation has errors', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          isValid: false,
          errors: [{ ruleId: 'CN-001', field: 'contractNumber', message: 'Required', severity: 'error' }]
        })
      ];

      // Act
      const result = buildValidationOnlyResponse(validatedRows);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Validation failed');
      expect(result.summary.invalidRows).toBe(1);
      expect(result.validationResults).toHaveLength(1);
      expect(result.importResults).toBeNull();
      expect(result.errorReport).not.toBeNull();
    });

    it('should include error report with all errors', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          rowNumber: 2,
          contractNumber: 'TEST-001',
          isValid: false,
          errors: [
            { ruleId: 'CN-001', field: 'contractNumber', message: 'Required', severity: 'error' },
            { ruleId: 'CD-001', field: 'contractDate', message: 'Required', severity: 'error' }
          ]
        })
      ];

      // Act
      const result = buildValidationOnlyResponse(validatedRows);

      // Assert
      expect(result.errorReport.rows).toHaveLength(2);
      expect(result.errorReport.rows[0]).toMatchObject({
        rowNumber: 2,
        contractNumber: 'TEST-001',
        field: 'contractNumber'
      });
    });
  });


  describe('buildConfirmResponse', () => {
    it('should build response when all rows are valid', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({ isValid: true }),
        createValidatedRow({ isValid: true, rowNumber: 3 })
      ];

      // Act
      const result = buildConfirmResponse(validatedRows);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('All 2 rows are valid');
      expect(result.message).toContain('confirm to import');
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.invalidRows).toBe(0);
      expect(result.importResults).toBeNull();
      expect(result.errorReport).toBeNull();
    });

    it('should include validation results with warnings', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          isValid: true,
          hasWarnings: true,
          warnings: [{ ruleId: 'BL-004', field: 'contractDate', message: 'Future date', severity: 'warning' }]
        })
      ];

      // Act
      const result = buildConfirmResponse(validatedRows);

      // Assert
      expect(result.validationResults[0].status).toBe('warning');
      expect(result.validationResults[0].warnings).toHaveLength(1);
    });
  });

  describe('buildImportCompleteResponse', () => {
    it('should build success response when all rows imported', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow(),
        createValidatedRow({ rowNumber: 3 })
      ];
      const importResults = [
        { rowNumber: 2, status: 'imported', contractId: 'id1' },
        { rowNumber: 3, status: 'imported', contractId: 'id2' }
      ];

      // Act
      const result = buildImportCompleteResponse(validatedRows, importResults);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('completed successfully');
      expect(result.summary.importedRows).toBe(2);
      expect(result.importResults).toEqual(importResults);
    });

    it('should build partial success response when some rows failed', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow(),
        createValidatedRow({ rowNumber: 3 })
      ];
      const importResults = [
        { rowNumber: 2, status: 'imported', contractId: 'id1' },
        { rowNumber: 3, status: 'failed', error: 'Database error' }
      ];

      // Act
      const result = buildImportCompleteResponse(validatedRows, importResults);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('completed with some failures');
      expect(result.summary.importedRows).toBe(1);
    });
  });

  describe('buildFileLevelErrorResponse', () => {
    it('should build error response for file-level failures', () => {
      // Arrange
      const fileLevelError = {
        code: 'INVALID_FILE_FORMAT',
        message: 'Invalid file format. Please upload a CSV file.'
      };

      // Act
      const result = buildFileLevelErrorResponse(fileLevelError);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid file format. Please upload a CSV file.');
      expect(result.code).toBe('INVALID_FILE_FORMAT');
    });
  });

  describe('CSV injection prevention', () => {
    it('should sanitize formula characters in error report', () => {
      // Arrange
      const validatedRows = [
        createValidatedRow({
          contractNumber: '=MALICIOUS()',
          isValid: false,
          errors: [{ ruleId: 'TEST', field: 'test', message: '=FORMULA', severity: 'error' }]
        })
      ];

      // Act
      const result = buildValidationOnlyResponse(validatedRows);

      // Assert
      expect(result.errorReport.rows[0].contractNumber).not.toMatch(/^=/);
      expect(result.errorReport.rows[0].errorMessage).not.toMatch(/^=/);
    });

    it('should sanitize all formula prefix characters', () => {
      // Arrange
      const testCases = ['=test', '+test', '-test', '@test'];
      
      testCases.forEach(testValue => {
        const validatedRows = [
          createValidatedRow({
            contractNumber: testValue,
            isValid: false,
            errors: [{ ruleId: 'TEST', field: 'test', message: 'Error', severity: 'error' }]
          })
        ];

        // Act
        const result = buildValidationOnlyResponse(validatedRows);

        // Assert
        expect(result.errorReport.rows[0].contractNumber).toMatch(/^'/);
      });
    });
  });
});
