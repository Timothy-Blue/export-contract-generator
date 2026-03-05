# Cypress E2E Tests - Contract Import Feature

This directory contains end-to-end tests for the Contract Import feature of the Export Contract Generator application.

## 📊 Test Suite Overview

- **Total Test Files**: 10
- **Total Test Cases**: 67
- **Framework**: Cypress
- **Estimated Execution Time**: 12 minutes (full suite)

## 📂 Directory Structure

```
cypress/
├── e2e/                    # Test files
│   ├── 01-happy-path.cy.js
│   ├── 02-validation-errors.cy.js
│   ├── 03-file-level-errors.cy.js
│   ├── 04-partial-import.cy.js
│   ├── 05-cancel-import.cy.js
│   ├── 06-network-errors.cy.js
│   ├── 07-duplicate-contracts.cy.js
│   ├── 08-business-rules.cy.js
│   ├── 09-reference-data.cy.js
│   └── 10-ui-navigation.cy.js
├── fixtures/               # Test data files
│   ├── valid-contracts.csv
│   ├── invalid-contracts.csv
│   ├── mixed-contracts.csv
│   └── duplicate-contracts.csv
├── support/                # Helper files
│   ├── commands.js        # Custom Cypress commands
│   ├── e2e.js            # Global hooks
│   └── dbHelpers.js      # Database utilities
├── screenshots/           # Auto-generated on failure
├── videos/               # Auto-generated recordings
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites

1. MongoDB running
2. Backend server running (`npm run server`)
3. Frontend server running (`npm run client`)

### Run Tests

```bash
# Interactive mode (recommended for development)
npm run test:e2e:open

# Headless mode (CI/CD)
npm run test:e2e

# Run specific test
npm run test:e2e:spec cypress/e2e/01-happy-path.cy.js
```

## 📝 Test Scenarios

### 1. Happy Path (`01-happy-path.cy.js`)
Tests successful import of valid contracts.
- Upload valid CSV
- Confirm import
- Verify contracts created
- Verify derived fields calculated
- Verify references linked

### 2. Validation Errors (`02-validation-errors.cy.js`)
Tests handling of validation errors.
- Missing required fields
- Invalid data formats
- Business rule violations
- Error message display

### 3. File-Level Errors (`03-file-level-errors.cy.js`)
Tests file format validation.
- Invalid file format
- File size limits
- Missing headers
- Empty files

### 4. Partial Import (`04-partial-import.cy.js`)
Tests mixed valid/invalid rows.
- All-or-nothing validation
- Error identification
- Fix and retry workflow

### 5. Cancel Import (`05-cancel-import.cy.js`)
Tests cancel functionality.
- Cancel after validation
- No contracts created
- State reset

### 6. Network Errors (`06-network-errors.cy.js`)
Tests network error handling.
- Connection failures
- Timeouts
- Server errors
- Retry capability

### 7. Duplicate Contracts (`07-duplicate-contracts.cy.js`)
Tests duplicate detection.
- Within-file duplicates
- Database duplicates
- Case-insensitive matching

### 8. Business Rules (`08-business-rules.cy.js`)
Tests business logic validation.
- Buyer ≠ Seller
- Positive quantities
- Valid tolerance ranges
- Future date warnings
- Currency mismatch warnings

### 9. Reference Data (`09-reference-data.cy.js`)
Tests automatic entity creation.
- Create new parties
- Create new commodities
- Create new payment terms
- Create new bank details
- Reuse existing entities

### 10. UI Navigation (`10-ui-navigation.cy.js`)
Tests navigation and state management.
- Page navigation
- State persistence
- Browser back/forward
- Multiple imports
- Error state clearing

## 🛠️ Custom Commands

Located in `support/commands.js`:

### Navigation
- `cy.navigateToImportPage()` - Navigate to import page
- `cy.goBack()` - Click back button

### File Operations
- `cy.uploadCsvFile(filename)` - Upload CSV from fixtures
- `cy.clickUploadButton()` - Click upload/validate button
- `cy.downloadTemplate()` - Download CSV template

### Import Workflow
- `cy.waitForProcessing()` - Wait for loading spinner
- `cy.confirmImport()` - Confirm import in dialog
- `cy.cancelImport()` - Cancel import
- `cy.clickUploadAnother()` - Reset and upload another file

### Verification
- `cy.verifyConfirmationDialog(count)` - Check confirmation dialog
- `cy.verifyResultsSummary(text)` - Check results summary
- `cy.verifyErrorMessage(pattern)` - Check error message
- `cy.verifyFileInputExists()` - Check upload zone visible
- `cy.verifyContractsInDatabase(filter, count)` - Verify DB state

### Database
- `cy.getContractByNumber(number)` - Get contract from DB
- `cy.createContract(data)` - Create test contract
- `cy.seedReferenceData(type, data)` - Seed reference data
- `cy.cleanupTestContracts()` - Remove test data

## 📊 Test Fixtures

Located in `fixtures/`:

### valid-contracts.csv
3 valid contracts for happy path testing:
- E2E-001: Coffee Beans, 1000 MT, DRAFT
- E2E-002: Tea Leaves, 500 MT, ACTIVE
- E2E-003: Rice, 2000 MT, DRAFT

### invalid-contracts.csv
3 invalid contracts for error testing:
- Row 2: Missing contract number
- Row 3: Invalid date, negative quantity
- Row 4: Buyer equals seller

### mixed-contracts.csv
5 contracts (3 valid, 2 invalid):
- E2E-010, E2E-011, E2E-013: Valid
- Row 3: Missing contract number
- Row 5: Invalid date

### duplicate-contracts.csv
3 contracts with duplicates:
- E2E-020: Appears twice (within-file duplicate)
- E2E-EXISTING: Exists in database

## 🗄️ Database Management

### Automatic Seeding

Before each test, the database is seeded with:
- 5 buyers (Test Buyer Inc, Another Buyer, etc.)
- 5 sellers (Test Seller Ltd, etc.)
- 10 commodities (Coffee Beans, Tea Leaves, Rice, etc.)
- 5 payment terms (LC at Sight, TT 30 Days, etc.)
- 3 bank details (Test Bank with USD, EUR, GBP)

### Automatic Cleanup

After each test:
- Remove all contracts with E2E-* prefix
- Remove all parties with E2E-* or Test* prefix
- Keep reference data for next test

## 🐛 Debugging

### Screenshots
Failed tests automatically capture screenshots:
```
cypress/screenshots/
└── test-name.cy.js/
    └── test-case-name -- (failed).png
```

### Videos
All test runs are recorded:
```
cypress/videos/
└── test-name.cy.js.mp4
```

### Interactive Mode
```bash
npm run test:e2e:open
```
- Click on test file to run
- See real-time execution
- Time-travel through steps
- Use browser DevTools

### Debug Commands
```javascript
cy.debug()                    // Pause execution
cy.pause()                    // Step through
cy.screenshot('my-debug')     // Take screenshot
cy.log('Debug info:', data)   // Log to console
```

## 🔧 Configuration

Configuration is in `../cypress.config.js`:

```javascript
{
  baseUrl: 'http://localhost:3000',
  env: {
    apiUrl: 'http://localhost:5000/api',
    mongoUri: 'mongodb://localhost:27017/your-db'
  },
  defaultCommandTimeout: 10000,
  retries: { runMode: 2, openMode: 0 },
  video: true,
  screenshotOnRunFailure: true
}
```

## 📚 Documentation

For more detailed information, see:

- `../E2E_SETUP_GUIDE.md` - Installation and setup
- `../E2E_TEST_EXECUTION_GUIDE.md` - How to run tests
- `../E2E_TEST_PLAN.md` - Detailed test scenarios
- `../E2E_QUICK_REFERENCE.md` - Quick reference card
- `../E2E_COMPLETION_SUMMARY.md` - What was delivered

## ✅ Best Practices

### Writing Tests

1. **Use AAA Pattern**: Arrange, Act, Assert
2. **Use Custom Commands**: Reusable and maintainable
3. **Verify Database State**: Don't just check UI
4. **Clean Up**: Remove test data after each test
5. **Be Specific**: Use descriptive test names
6. **Add Comments**: Explain complex logic

### Example Test

```javascript
describe('Feature Name', () => {
  it('should do something specific', () => {
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

## 🚨 Common Issues

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"
```

### Server Not Running
```bash
# Start backend
npm run server

# Start frontend
npm run client
```

### Element Not Found
```javascript
// Increase timeout
cy.get('selector', { timeout: 15000 })

// Use custom command with built-in waits
cy.waitForProcessing()
```

### Database Cleanup Fails
```bash
# Manually clean database
mongosh
use your-database-name
db.contracts.deleteMany({ contractNumber: /^E2E-/ })
```

## 📊 Test Metrics

### Coverage
- ✅ Happy path workflow
- ✅ Validation error handling
- ✅ File format errors
- ✅ Partial imports
- ✅ Cancel operations
- ✅ Network errors
- ✅ Duplicate detection
- ✅ Business rules
- ✅ Reference data creation
- ✅ UI navigation

### Quality
- ✅ Test independence
- ✅ Automatic cleanup
- ✅ Error handling
- ✅ Maintainability
- ✅ Documentation

## 🎯 Success Criteria

Tests should:
- ✅ Run independently
- ✅ Clean up after themselves
- ✅ Verify both UI and database
- ✅ Handle async operations correctly
- ✅ Provide clear error messages
- ✅ Complete in reasonable time

## 📞 Support

For help:
1. Check documentation files
2. Review test code for examples
3. Run in interactive mode
4. Check screenshots and videos
5. Review custom commands in `support/commands.js`

---

**Last Updated**: March 5, 2026
**Version**: 1.0
**Status**: Ready for execution
