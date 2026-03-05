// ***********************************************************
// This file is processed and loaded automatically before your test files.
// You can change the location of this file or turn off automatically serving
// support files with the 'supportFile' configuration option.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests in command log for cleaner output
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// Global before hook - runs once before all tests
before(() => {
  cy.log('Starting E2E Test Suite');
  
  // Verify servers are running
  cy.request('GET', `${Cypress.env('apiUrl')}/health`)
    .its('status')
    .should('eq', 200);
});

// Global beforeEach hook - runs before each test
beforeEach(() => {
  // Reset database before each test
  cy.task('resetDatabase');
  
  // Clear browser state
  cy.clearCookies();
  cy.clearLocalStorage();
  
  // Set viewport
  cy.viewport(1280, 720);
});

// Global afterEach hook - runs after each test
afterEach(function() {
  // Take screenshot on failure
  if (this.currentTest.state === 'failed') {
    cy.screenshot(`${this.currentTest.title} - FAILED`);
  }
});

// Global after hook - runs once after all tests
after(() => {
  cy.log('E2E Test Suite Complete');
  
  // Final cleanup
  cy.task('cleanupDatabase');
});
