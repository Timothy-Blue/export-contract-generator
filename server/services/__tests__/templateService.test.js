/**
 * Unit tests for templateService
 * Tests template file path resolution
 */

const { getTemplatePath } = require('../templateService');
const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

describe('templateService', () => {
  describe('getTemplatePath', () => {
    const expectedPath = path.join(__dirname, '../../assets/contract_import_template.csv');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should return template path when file exists', () => {
      // Arrange
      fs.existsSync.mockReturnValue(true);

      // Act
      const result = getTemplatePath();

      // Assert
      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it('should throw error when template file does not exist', () => {
      // Arrange
      fs.existsSync.mockReturnValue(false);

      // Act & Assert
      expect(() => getTemplatePath()).toThrow('Template file not found');
    });

    it('should throw error with TEMPLATE_NOT_FOUND code when file missing', () => {
      // Arrange
      fs.existsSync.mockReturnValue(false);

      // Act & Assert
      try {
        getTemplatePath();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.code).toBe('TEMPLATE_NOT_FOUND');
      }
    });

    it('should return absolute path', () => {
      // Arrange
      fs.existsSync.mockReturnValue(true);

      // Act
      const result = getTemplatePath();

      // Assert
      expect(path.isAbsolute(result)).toBe(true);
    });
  });
});
