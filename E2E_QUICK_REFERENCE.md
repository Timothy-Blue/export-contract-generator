# E2E Testing Quick Reference

## 🚀 Quick Start

```bash
# 1. Install (first time only)
npm install --save-dev cypress @testing-library/cypress

# 2. Start servers (2 terminals)
npm run server  # Terminal 1
npm run client  # Terminal 2

# 3. Run tests (Terminal 3)
npm run test:e2e:open  # Interactive
npm run test:e2e       # Headless
```

---

## 📝 Test Scripts

```bash
npm run test:e2e              # Run all tests (headless)
npm run test:e2e:open         # Open Cypress UI (interactive)
npm run test:e2e:headed       # Run with visible browser
npm run test:e2e:chrome       # Run in Chrome specifically
npm run test:e2e:spec <file>  # Run specific test file
```

---

## 📂 Test Files

| File | Description | Tests |
|------|-------------|-------|
| `01-happy-path.cy.js` | Successful import workflow | 3 |
| `02-validation-errors.cy.js` | Validation error handling | 3 |
| `03-file-level-errors.cy.js` | File format errors | 6 |
| `04-partial-import.cy.js` | Mixed valid/invalid rows | 6 |
| `05-cancel-import.cy.js` | Cancel import flow | 7 |
| `06-network-errors.cy.js` | Network error handling | 8 |
| `07-duplicate-contracts.cy.js` | Duplicate detection | 8 |
| `08-business-rules.cy.js` | Business rule validations | 8 |
| `09-reference-data.cy.js` | Auto-create entities | 6 |
| `10-ui-navigation.cy.js` | Navigation and state | 12 |

**Total**: 67 test cases

---

## 🛠️ Custom Commands

### Navigation
```javascript
cy.navigateToImportPage()  // Go to import page
cy.goBack()                // Click back button
```

### File Operations
```javascript
cy.uploadCsvFile('valid-contracts.csv')  // Upload from fixtures
cy.clickUploadButton()                   // Click upload/validate
cy.downloadTemplate()                    // Download CSV template
```

### Import Workflow
```javascript
cy.waitForProcessing()     // Wait for loading spinner
cy.confirmImport()         // Confirm import in dialog
cy.cancelImport()          // Cancel import
cy.clickUploadAnother()    // Reset and upload another
```

### Verification
```javascript
cy.verifyConfirmationDialog(3)           // Check dialog shows 3 rows
cy.verifyResultsSummary('imported')      // Check results text
cy.verifyErrorMessage(/invalid/i)        // Check error message
cy.verifyFileInputExists()               // Check upload zone visible
cy.verifyContractsInDatabase(filter, 1)  // Check DB has 1 contract
```

### Database
```javascript
cy.getContractByNumber('E2E-001')        // Get contract from DB
cy.createContract(data)                  // Create test contract
cy.seedReferenceData('parties', data)    // Seed reference data
cy.cleanupTestContracts()                // Remove test data
```

---

## 📊 Test Fixtures

Located in `cypress/fixtures/`:

```javascript
cy.uploadCsvFile('valid-contracts.csv')      // 3 valid contracts
cy.uploadCsvFile('invalid-contracts.csv')    // 3 invalid contracts
cy.uploadCsvFile('mixed-contracts.csv')      // 3 valid + 2 invalid
cy.uploadCsvFile('duplicate-contracts.csv')  // 3 with duplicates
```

---

## 🐛 Debugging

### View Results
```bash
# Screenshots (on failure)
cypress/screenshots/

# Videos (all runs)
cypress/videos/
```

### Debug Commands
```javascript
cy.debug()                    // Pause execution
cy.pause()                    // Step through
cy.screenshot('my-debug')     // Take screenshot
cy.log('Debug info:', data)   // Log to console
```

### Interactive Mode
```bash
npm run test:e2e:open
```
- Click on test file
- Watch execution in real-time
- Click commands to time-travel
- Use browser DevTools

---

## 🔧 Common Issues

### MongoDB not running
```bash
mongosh --eval "db.version()"
```

### Backend not running
```bash
npm run server  # Port 5000
```

### Frontend not running
```bash
npm run client  # Port 3000
```

### Element not found
```javascript
// Increase timeout
cy.get('selector', { timeout: 15000 })

// Add explicit wait
cy.wait(1000)

// Use custom command
cy.waitForProcessing()
```

### Database cleanup fails
```bash
mongosh
use your-database-name
db.contracts.deleteMany({ contractNumber: /^E2E-/ })
```

---

## 📁 File Structure

```
cypress/
├── e2e/              # Test files (10 files)
├── fixtures/         # Test data (4 CSV files)
├── support/
│   ├── commands.js   # Custom commands (20+)
│   ├── e2e.js        # Global hooks
│   └── dbHelpers.js  # Database utilities
├── screenshots/      # Auto-generated
└── videos/           # Auto-generated
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `E2E_SETUP_GUIDE.md` | Installation and setup |
| `E2E_TEST_EXECUTION_GUIDE.md` | How to run tests |
| `E2E_TEST_PLAN.md` | Detailed test scenarios |
| `E2E_COMPLETION_SUMMARY.md` | What was delivered |
| `E2E_QUICK_REFERENCE.md` | This document |

---

## ⏱️ Execution Time

- **Single test**: 15-120 seconds
- **Full suite**: ~12 minutes
- **Target**: < 10 minutes

---

## ✅ Before Running Tests

- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 3000)
- [ ] Cypress is installed
- [ ] Database has reference data (auto-seeded)

---

## 🎯 Test Pattern

```javascript
describe('Test Scenario', () => {
  it('should do something', () => {
    // Arrange
    cy.navigateToImportPage();
    
    // Act
    cy.uploadCsvFile('test.csv');
    cy.clickUploadButton();
    cy.waitForProcessing();
    
    // Assert
    cy.verifyResultsSummary('success');
    cy.verifyContractsInDatabase({ contractNumber: 'E2E-001' }, 1);
  });
});
```

---

## 🔍 Useful Selectors

```javascript
// File input
'input[type="file"]'

// Upload button
'button:contains("Upload")'

// Confirm button
'button:contains("Confirm")'

// Cancel button
'button:contains("Cancel")'

// Loading spinner
'[class*="loading"], [class*="spinner"]'

// Error message
'[class*="error"]'

// Results summary
'[class*="results"], [class*="summary"]'
```

---

## 💡 Tips

1. **Run in interactive mode** for development
2. **Use custom commands** for common operations
3. **Check screenshots** when tests fail
4. **Watch videos** to see what happened
5. **Add explicit waits** for async operations
6. **Clean database** if tests behave strangely
7. **Restart servers** if connection issues occur
8. **Update selectors** if UI changes

---

## 📞 Need Help?

1. Check `E2E_SETUP_GUIDE.md`
2. Check `E2E_TEST_EXECUTION_GUIDE.md`
3. Review test code for examples
4. Run in interactive mode
5. Check screenshots and videos

---

**Last Updated**: March 5, 2026
**Version**: 1.0
