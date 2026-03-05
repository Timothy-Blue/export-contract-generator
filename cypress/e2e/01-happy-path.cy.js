/**
 * UI Test: Happy Path - Contract Import Flow
 * Tests the complete user journey for importing contracts through the UI
 */

describe('Happy Path: Contract Import UI Flow', () => {
  
  beforeEach(() => {
    // Reset database before each test
    cy.task('resetDatabase');
  });
  
  it('should complete the full contract import workflow', () => {
    // Step 1: Visit the application home page
    cy.visit('http://localhost:3000');
    cy.url().should('include', 'localhost:3000');
    
    // Step 2: Navigate to Import Contracts page
    cy.navigateToImportPage();
    cy.contains(/import.*contract/i).should('be.visible');
    
    // Step 3: Verify upload zone is visible
    cy.verifyFileInputExists();
    cy.get('[data-testid="upload-zone"]').should('be.visible');
    
    // Step 4: Upload a valid CSV file
    cy.uploadCsvFile('valid-contracts.csv');
    cy.get('[data-testid="file-name"]').should('contain', 'valid-contracts.csv');
    
    // Step 5: Click the upload button
    cy.clickUploadButton();
    
    // Step 6: Wait for file processing
    cy.waitForProcessing();
    
    // Step 7: Verify confirmation dialog appears with valid data
    cy.verifyConfirmationDialog(3);
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    cy.contains('3').should('be.visible');
    cy.contains(/valid|ready/i).should('be.visible');
    
    // Step 8: Confirm the import
    cy.confirmImport();
    
    // Step 9: Wait for import to complete
    cy.waitForProcessing();
    
    // Step 10: Verify success results are displayed
    cy.verifyResultsSummary('3');
    cy.verifyResultsSummary('imported');
    cy.contains(/success|complete/i).should('be.visible');
    
    // Step 11: Verify contracts appear in the database
    cy.verifyContractsInDatabase({ contractNumber: 'E2E-001' }, 1);
    cy.verifyContractsInDatabase({ contractNumber: 'E2E-002' }, 1);
    cy.verifyContractsInDatabase({ contractNumber: 'E2E-003' }, 1);
  });
});
