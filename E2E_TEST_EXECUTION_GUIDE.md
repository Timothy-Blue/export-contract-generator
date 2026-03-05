# E2E Test Execution Guide

## 🎯 Overview

This guide provides step-by-step instructions for running the complete E2E test suite for the Contract Import feature.

**Status**: All 10 test scenarios implemented (67 test cases total)
**Framework**: Cypress
**Estimated Execution Time**: 5-8 minutes (full suite)

---

## 📋 Prerequisites

### 1. Install Cypress

If not already installed, run:

```bash
npm install --save-dev cypress @testing-library/cypress
```

**Windows PowerShell Issues?** Try:
- Use Command Prompt (cmd.exe) instead
- Or: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### 2. Verify MongoDB is Running

```bash
mongosh --eval "db.version()"
```

If not running, start MongoDB service.

### 3. Start Application Servers

**Terminal 1: Backend Server**
```bash
npm run server
```
Wait for: "Server running on port 5000"

**Terminal 2: Frontend Server**
```bash
npm run client
```
Wait for: "Compiled successfully"

---

## 🚀 Running Tests

### Option 1: Interactive Mode (Recommended)

Best for development and debugging:

```bash
npm run test:e2e:open
```

This opens the Cypress Test Runner where you can:
- Select individual test files to run
- See tests execute in real-time
- Debug with browser DevTools
- Time-travel through test steps
- Re-run tests with live reload

**To run a specific test:**
1. Click on the test file (e.g., `01-happy-path.cy.js`)
2. Watch it execute in the browser
3. Click on any step to see DOM state at that moment

### Option 2: Headless Mode (CI/CD)

Run all tests without opening browser:

```bash
npm run test:e2e
```

This will:
- Run all 10 test files sequentially
- Generate video recordings
- Capture screenshots on failure
- Output results to terminal

### Option 3: Run Specific Test File

```bash
npm run test:e2e:spec cypress/e2e/01-happy-path.cy.js
```

### Option 4: Run with Visible Browser

```bash
npm run test:e2e:headed
```

Useful for debugging headless failures.

---

## 📊 Test Scenarios Overview

| # | Test File | Test Cases | Duration | Priority |
|---|-----------|------------|----------|----------|
| 1 | `01-happy-path.cy.js` | 3 | 45s | HIGH |
| 2 | `02-validation-errors.cy.js` | 3 | 30s | HIGH |
| 3 | `03-file-level-errors.cy.js` | 6 | 60s | HIGH |
| 4 | `04-partial-import.cy.js` | 6 | 90s | HIGH |
| 5 | `05-cancel-import.cy.js` | 7 | 70s | MEDIUM |
| 6 | `06-network-errors.cy.js` | 8 | 80s | MEDIUM |
| 7 | `07-duplicate-contracts.cy.js` | 8 | 90s | HIGH |
| 8 | `08-business-rules.cy.js` | 8 | 80s | HIGH |
| 9 | `09-reference-data.cy.js` | 6 | 90s | MEDIUM |
| 10 | `10-ui-navigation.cy.js` | 12 | 120s | LOW |

**Total**: 67 test cases, ~12 minutes (with overhead)

---

## 🔍 Understanding Test Results

### Successful Test Run

```
  Scenario 1: Complete Happy Path
    ✓ should successfully import 3 valid contracts from CSV (2345ms)
    ✓ should calculate derived fields correctly (1823ms)
    ✓ should link contracts to reference data correctly (1654ms)

  3 passing (6s)
```

### Failed Test Run

```
  Scenario 2: Validation Errors
    ✓ should display validation errors for invalid CSV data (2134ms)
    1) should allow user to upload another file after validation errors

  1 passing (3s)
  1 failing

  1) Scenario 2: Validation Errors
       should allow user to upload another file after validation errors:
     AssertionError: Timed out retrying after 10000ms: Expected to find element: `input[type="file"]`, but never found it.
```

---

## 🐛 Debugging Failed Tests

### Step 1: Check Screenshots

Failed tests automatically capture screenshots:

```
cypress/screenshots/
└── 02-validation-errors.cy.js/
    └── should allow user to upload another file -- (failed).png
```

### Step 2: Watch Video Recording

All test runs are recorded:

```
cypress/videos/
└── 02-validation-errors.cy.js.mp4
```

### Step 3: Run in Interactive Mode

```bash
npm run test:e2e:open
```

Click on the failing test and watch it execute. Use browser DevTools to inspect elements.

### Step 4: Add Debug Commands

Edit the test file and add:

```javascript
cy.debug(); // Pauses execution
cy.pause(); // Allows step-through
cy.screenshot('my-debug-screenshot');
cy.log('Current state:', someVariable);
```

### Step 5: Check Console Logs

In interactive mode, open browser DevTools Console to see:
- Cypress command logs
- Application console logs
- Network requests
- Errors and warnings

---

## 📝 Test Data Management

### Database State

Tests automatically:
- **Before each test**: Clean database and seed reference data
- **After each test**: Remove test contracts (E2E-* prefix)
- **After all tests**: Final cleanup

### Reference Data Seeded

Each test starts with:
- 5 buyers (Test Buyer Inc, Another Buyer, etc.)
- 5 sellers (Test Seller Ltd, etc.)
- 10 commodities (Coffee Beans, Tea Leaves, Rice, etc.)
- 5 payment terms (LC at Sight, TT 30 Days, etc.)
- 3 bank details (Test Bank with USD, EUR, GBP)

### Test Fixtures

Located in `cypress/fixtures/`:
- `valid-contracts.csv` - 3 valid contracts
- `invalid-contracts.csv` - 3 invalid contracts
- `mixed-contracts.csv` - 5 contracts (3 valid, 2 invalid)
- `duplicate-contracts.csv` - 3 contracts with duplicates

---

## 🔧 Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution**:
```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Start MongoDB if needed
# Windows: Start MongoDB service
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Issue: "Cannot connect to http://localhost:3000"

**Solution**:
```bash
# Start frontend server
npm run client
```

### Issue: "Cannot connect to http://localhost:5000"

**Solution**:
```bash
# Start backend server
npm run server
```

### Issue: "Element not found" errors

**Possible causes**:
1. Selectors changed in UI components
2. Timing issues (element not loaded yet)
3. UI behavior changed

**Solutions**:
1. Update selectors in `cypress/support/commands.js`
2. Increase timeout: `cy.get('selector', { timeout: 15000 })`
3. Add explicit waits: `cy.wait(1000)`

### Issue: "Database cleanup fails"

**Solution**:
```bash
# Manually clean database
mongosh
use your-database-name
db.contracts.deleteMany({ contractNumber: /^E2E-/ })
db.parties.deleteMany({ name: /^E2E-|^Test |^Brand New/ })
```

### Issue: Tests pass individually but fail when run together

**Cause**: Database state conflicts or timing issues

**Solution**:
1. Ensure proper cleanup in `afterEach` hooks
2. Run tests sequentially (already configured)
3. Add longer waits between tests

### Issue: Flaky tests (pass sometimes, fail sometimes)

**Solutions**:
1. Increase timeouts in `cypress.config.js`
2. Add explicit waits for async operations
3. Use `cy.waitForProcessing()` custom command
4. Check for race conditions in application code

---

## 📊 Generating Test Reports

### HTML Report (Built-in)

After running tests, Cypress generates an HTML report:

```bash
npm run test:e2e
```

View results in terminal output.

### Custom Report

To generate a detailed report:

```bash
# Run tests and save results
npm run test:e2e > test-results.txt 2>&1

# View results
cat test-results.txt
```

### CI/CD Integration

For GitHub Actions or other CI/CD:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-results
    path: |
      cypress/videos/
      cypress/screenshots/
```

---

## ✅ Success Criteria

### All Tests Should Pass

```
  67 passing (12m)
  0 failing
```

### Database Verification

After tests complete:

```bash
mongosh
use your-database-name

# Should have no E2E test contracts remaining
db.contracts.find({ contractNumber: /^E2E-/ }).count()
# Expected: 0

# Should have reference data
db.parties.find().count()
# Expected: > 0
```

### No Errors in Console

Check application logs for:
- No uncaught exceptions
- No network errors (except intentional test cases)
- No database connection issues

---

## 🎯 Next Steps After Testing

### If All Tests Pass ✅

1. **Document Results**
   - Note execution time
   - Capture screenshots of passing tests
   - Save video recordings

2. **Code Review**
   - Review test code for improvements
   - Check for code duplication
   - Ensure best practices followed

3. **CI/CD Integration**
   - Set up automated test runs
   - Configure test reporting
   - Add to deployment pipeline

### If Tests Fail ❌

1. **Investigate Failures**
   - Check screenshots and videos
   - Review error messages
   - Run failing tests in interactive mode

2. **Fix Issues**
   - Update selectors if UI changed
   - Adjust timeouts if needed
   - Fix application bugs if found

3. **Re-run Tests**
   - Verify fixes work
   - Run full suite again
   - Document any known issues

---

## 📞 Support & Resources

### Documentation
- **Setup Guide**: `E2E_SETUP_GUIDE.md`
- **Test Plan**: `E2E_TEST_PLAN.md`
- **Implementation Status**: `E2E_IMPLEMENTATION_STATUS.md`
- **Cypress Docs**: https://docs.cypress.io

### Custom Commands Reference

See `cypress/support/commands.js` for:
- `cy.navigateToImportPage()`
- `cy.uploadCsvFile(filename)`
- `cy.clickUploadButton()`
- `cy.waitForProcessing()`
- `cy.confirmImport()`
- `cy.cancelImport()`
- `cy.verifyConfirmationDialog(count)`
- `cy.verifyResultsSummary(text)`
- `cy.verifyErrorMessage(pattern)`
- `cy.verifyContractsInDatabase(filter, count)`
- And more...

### Database Helpers

See `cypress/support/dbHelpers.js` for:
- `seedReferenceData()`
- `cleanupTestData()`
- Database query utilities

---

## 📈 Test Metrics

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

### Quality Metrics
- Test independence: ✅ Each test can run standalone
- Database cleanup: ✅ Automatic cleanup after each test
- Error handling: ✅ Screenshots and videos on failure
- Maintainability: ✅ Custom commands and page objects
- Documentation: ✅ Comprehensive guides and comments

---

**Last Updated**: March 5, 2026
**Version**: 1.0
**Status**: Ready for execution
