// ***********************************************
// Custom Cypress commands for Contract Import E2E tests
// ***********************************************

/**
 * Navigate to the import page
 */
Cypress.Commands.add('navigateToImportPage', () => {
  cy.visit('/');
  cy.contains('Import Contracts').click();
  cy.url().should('include', '/import');
});

/**
 * Upload a CSV file
 * @param {string} fileName - Name of the file in cypress/fixtures
 */
Cypress.Commands.add('uploadCsvFile', (fileName) => {
  cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fileName}`, { force: true });
});

/**
 * Click the upload/validate button
 */
Cypress.Commands.add('clickUploadButton', () => {
  cy.contains('button', /upload|validate/i).click();
});

/**
 * Wait for loading spinner to appear and disappear
 */
Cypress.Commands.add('waitForProcessing', () => {
  // Wait for spinner to appear
  cy.get('[class*="spinner"], [class*="loading"]', { timeout: 2000 })
    .should('be.visible');
  
  // Wait for spinner to disappear
  cy.get('[class*="spinner"], [class*="loading"]', { timeout: 30000 })
    .should('not.exist');
});

/**
 * Confirm import in the confirmation dialog
 */
Cypress.Commands.add('confirmImport', () => {
  cy.contains('button', /confirm/i).click();
});

/**
 * Cancel import in the confirmation dialog
 */
Cypress.Commands.add('cancelImport', () => {
  cy.contains('button', /cancel/i).click();
});

/**
 * Download the CSV template
 */
Cypress.Commands.add('downloadTemplate', () => {
  cy.contains('button', /download.*template/i).click();
});

/**
 * Verify contracts in database via API
 * @param {object} filter - MongoDB filter object
 * @param {number} expectedCount - Expected number of contracts
 */
Cypress.Commands.add('verifyContractsInDatabase', (filter, expectedCount) => {
  const queryString = new URLSearchParams(filter).toString();
  cy.request('GET', `${Cypress.env('apiUrl')}/contracts?${queryString}`)
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.length(expectedCount);
      return response.body;
    });
});

/**
 * Get contract from database by contract number
 * @param {string} contractNumber
 */
Cypress.Commands.add('getContractByNumber', (contractNumber) => {
  cy.request('GET', `${Cypress.env('apiUrl')}/contracts?contractNumber=${contractNumber}`)
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.length.greaterThan(0);
      return response.body[0];
    });
});

/**
 * Verify results summary contains text
 * @param {string} text - Text to verify
 */
Cypress.Commands.add('verifyResultsSummary', (text) => {
  cy.contains(text).should('be.visible');
});

/**
 * Verify error message is displayed
 * @param {string} errorText - Error text to verify
 */
Cypress.Commands.add('verifyErrorMessage', (errorText) => {
  cy.contains(errorText).should('be.visible');
});

/**
 * Click "Upload Another File" or reset button
 */
Cypress.Commands.add('clickUploadAnother', () => {
  cy.contains('button', /upload.*another|reset|try.*again/i).click();
});

/**
 * Seed specific reference data via API
 * @param {string} type - Type of data (parties, commodities, etc.)
 * @param {object} data - Data to create
 */
Cypress.Commands.add('seedReferenceData', (type, data) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/${type}`, data);
});

/**
 * Create a contract in database (for testing duplicates)
 * @param {object} contractData
 */
Cypress.Commands.add('createContract', (contractData) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/contracts`, contractData);
});

/**
 * Delete all test contracts from database
 */
Cypress.Commands.add('cleanupTestContracts', () => {
  cy.task('cleanupDatabase');
});

/**
 * Verify confirmation dialog is visible
 * @param {number} rowCount - Expected row count in dialog
 */
Cypress.Commands.add('verifyConfirmationDialog', (rowCount) => {
  cy.contains(/ready.*import|confirm/i).should('be.visible');
  if (rowCount) {
    cy.contains(new RegExp(rowCount.toString())).should('be.visible');
  }
});

/**
 * Verify no confirmation dialog is shown
 */
Cypress.Commands.add('verifyNoConfirmationDialog', () => {
  cy.contains(/ready.*import|confirm.*import/i).should('not.exist');
});

/**
 * Wait for API request to complete
 * @param {string} urlPattern - URL pattern to match
 * @param {string} alias - Alias for the intercept
 */
Cypress.Commands.add('waitForApiRequest', (urlPattern, alias = 'apiRequest') => {
  cy.intercept('POST', urlPattern).as(alias);
  cy.wait(`@${alias}`);
});

/**
 * Verify file input accepts file
 */
Cypress.Commands.add('verifyFileInputExists', () => {
  cy.get('input[type="file"]').should('exist');
});

/**
 * Go back to previous page
 */
Cypress.Commands.add('goBack', () => {
  cy.contains('button', /back/i).click();
});
