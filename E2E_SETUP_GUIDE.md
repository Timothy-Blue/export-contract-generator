# E2E Test Setup Guide - Cypress

## Installation

### Step 1: Install Cypress and Dependencies

Run this command in your terminal (you may need to adjust PowerShell execution policy):

```bash
npm install --save-dev cypress @testing-library/cypress
```

If you encounter PowerShell execution policy errors, try one of these:

**Option A: Run in Command Prompt (cmd.exe) instead of PowerShell**
```cmd
npm install --save-dev cypress @testing-library/cypress
```

**Option B: Temporarily bypass PowerShell policy**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install --save-dev cypress @testing-library/cypress
```

**Option C: Use npx**
```bash
npx cypress install
```

### Step 2: Update package.json Scripts

The following scripts have been added to your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open",
    "test:e2e:headed": "cypress run --headed",
    "test:e2e:chrome": "cypress run --browser chrome",
    "test:e2e:spec": "cypress run --spec"
  }
}
```

### Step 3: Environment Setup

Create a `.env.test` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/test-db
NODE_ENV=test
PORT=5000
```

### Step 4: Verify MongoDB is Running

Make sure MongoDB is running on your local machine:

```bash
# Check if MongoDB is running
mongosh --eval "db.version()"

# Or start MongoDB if not running
# Windows: Start MongoDB service from Services
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

---

## Project Structure

The E2E test setup has created the following structure:

```
cypress/
├── e2e/                          # Test files
│   ├── 01-happy-path.cy.js      # ✅ Created
│   ├── 02-validation-errors.cy.js    # TODO
│   ├── 03-file-level-errors.cy.js    # TODO
│   ├── 04-partial-import.cy.js       # TODO
│   ├── 05-cancel-import.cy.js        # TODO
│   ├── 06-network-errors.cy.js       # TODO
│   ├── 07-duplicate-contracts.cy.js  # TODO
│   ├── 08-business-rules.cy.js       # TODO
│   ├── 09-reference-data.cy.js       # TODO
│   └── 10-ui-navigation.cy.js        # TODO
├── fixtures/                     # Test data files
│   ├── valid-contracts.csv      # ✅ Created
│   ├── invalid-contracts.csv    # ✅ Created
│   ├── mixed-contracts.csv      # ✅ Created
│   └── duplicate-contracts.csv  # ✅ Created
├── support/                      # Helper files
│   ├── commands.js              # ✅ Created - Custom commands
│   ├── e2e.js                   # ✅ Created - Global hooks
│   └── dbHelpers.js             # ✅ Created - Database utilities
├── screenshots/                  # Auto-generated on test failure
└── videos/                       # Auto-generated test recordings

cypress.config.js                 # ✅ Created - Cypress configuration
```

---

## Running Tests

### Prerequisites

Before running E2E tests, ensure:

1. ✅ MongoDB is running
2. ✅ Backend server is running (`npm run server`)
3. ✅ Frontend server is running (`npm run client`)

### Quick Start

**Option 1: Interactive Mode (Recommended for Development)**
```bash
npm run test:e2e:open
```
This opens the Cypress Test Runner where you can:
- Select and run individual tests
- See tests execute in real-time
- Debug with browser DevTools
- Time-travel through test steps

**Option 2: Headless Mode (CI/CD)**
```bash
npm run test:e2e
```
Runs all tests in headless mode and generates video recordings.

**Option 3: Headed Mode (See Browser)**
```bash
npm run test:e2e:headed
```
Runs tests with visible browser window.

**Option 4: Run Specific Test**
```bash
npm run test:e2e:spec cypress/e2e/01-happy-path.cy.js
```

### Running with Servers

If servers are not running, start them in separate terminals:

**Terminal 1: Backend**
```bash
npm run server
```

**Terminal 2: Frontend**
```bash
npm run client
```

**Terminal 3: E2E Tests**
```bash
npm run test:e2e:open
```

---

## Test Execution Workflow

### Automatic Setup (Before Each Test)

1. **Database Reset**: Cleans up test data and seeds reference data
2. **Browser State**: Clears cookies and local storage
3. **Viewport**: Sets to 1280x720

### Test Execution

1. Test runs with custom commands (defined in `commands.js`)
2. Database operations via Cypress tasks
3. API verification via HTTP requests

### Automatic Cleanup (After Each Test)

1. **Screenshot on Failure**: Automatically captures screenshot
2. **Database Cleanup**: Removes test data
3. **Video Recording**: Saves video of test execution

---

## Custom Commands Reference

### Navigation
- `cy.navigateToImportPage()` - Go to import page
- `cy.goBack()` - Click back button

### File Upload
- `cy.uploadCsvFile('filename.csv')` - Upload CSV from fixtures
- `cy.clickUploadButton()` - Click upload/validate button
- `cy.downloadTemplate()` - Download CSV template

### Import Flow
- `cy.waitForProcessing()` - Wait for loading spinner
- `cy.confirmImport()` - Confirm import in dialog
- `cy.cancelImport()` - Cancel import
- `cy.clickUploadAnother()` - Reset and upload another file

### Verification
- `cy.verifyConfirmationDialog(rowCount)` - Check confirmation dialog
- `cy.verifyResultsSummary('text')` - Check results summary
- `cy.verifyErrorMessage('error text')` - Check error message
- `cy.verifyContractsInDatabase(filter, count)` - Verify DB state
- `cy.getContractByNumber('E2E-001')` - Get contract from DB

### Database
- `cy.seedReferenceData(type, data)` - Create reference data
- `cy.createContract(data)` - Create contract for testing
- `cy.cleanupTestContracts()` - Remove test data

---

## Debugging Tests

### View Test in Browser
```bash
npm run test:e2e:open
```
Click on a test file to run it with live reload.

### View Screenshots
Failed tests automatically save screenshots to:
```
cypress/screenshots/
```

### View Videos
All test runs save videos to:
```
cypress/videos/
```

### Console Logs
Cypress logs appear in:
- Browser DevTools Console (interactive mode)
- Terminal output (headless mode)

### Time Travel
In interactive mode, click on any command in the left panel to:
- See DOM state at that moment
- View network requests
- Inspect elements

### Debugging Tips

**Add breakpoints:**
```javascript
cy.debug(); // Pauses test execution
cy.pause(); // Pauses and allows step-through
```

**Log values:**
```javascript
cy.getContractByNumber('E2E-001').then((contract) => {
  cy.log('Contract:', contract);
  console.log('Contract:', contract);
});
```

**Take manual screenshots:**
```javascript
cy.screenshot('my-screenshot');
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution**: Ensure MongoDB is running
```bash
mongosh --eval "db.version()"
```

### Issue: "Cannot connect to http://localhost:3000"
**Solution**: Start frontend server
```bash
npm run client
```

### Issue: "Cannot connect to http://localhost:5000"
**Solution**: Start backend server
```bash
npm run server
```

### Issue: "File not found: cypress/fixtures/..."
**Solution**: Ensure fixture files exist in `cypress/fixtures/`

### Issue: "Test times out waiting for element"
**Solution**: 
- Check if servers are running
- Verify element selector is correct
- Increase timeout in `cypress.config.js`

### Issue: "Database cleanup fails"
**Solution**: 
- Verify MongoDB connection string
- Check database permissions
- Manually clean database: `db.contracts.deleteMany({})`

---

## Next Steps

### Phase 2: Implement Remaining Tests

Create the following test files:

1. ✅ `01-happy-path.cy.js` - DONE
2. ⏳ `02-validation-errors.cy.js` - TODO
3. ⏳ `03-file-level-errors.cy.js` - TODO
4. ⏳ `04-partial-import.cy.js` - TODO
5. ⏳ `05-cancel-import.cy.js` - TODO
6. ⏳ `06-network-errors.cy.js` - TODO
7. ⏳ `07-duplicate-contracts.cy.js` - TODO
8. ⏳ `08-business-rules.cy.js` - TODO
9. ⏳ `09-reference-data.cy.js` - TODO
10. ⏳ `10-ui-navigation.cy.js` - TODO

### Run First Test

```bash
# Start servers
npm run server  # Terminal 1
npm run client  # Terminal 2

# Run test
npm run test:e2e:open  # Terminal 3
# Then click on "01-happy-path.cy.js"
```

---

## Configuration Reference

### cypress.config.js

Key settings:
- `baseUrl`: Frontend URL (http://localhost:3000)
- `env.apiUrl`: Backend API URL (http://localhost:5000/api)
- `env.mongoUri`: MongoDB connection string
- `defaultCommandTimeout`: 10 seconds
- `retries`: 2 retries in CI mode

### Timeouts

- Command timeout: 10 seconds
- Request timeout: 10 seconds
- Response timeout: 30 seconds
- Page load timeout: 60 seconds

### Video & Screenshots

- Videos: Enabled (saved to `cypress/videos/`)
- Screenshots: On failure (saved to `cypress/screenshots/`)
- Video compression: 32

---

## Support

For issues or questions:
1. Check Cypress documentation: https://docs.cypress.io
2. Review test plan: `E2E_TEST_PLAN.md`
3. Check configuration: `E2E_TEST_PLAN_SUMMARY.md`

---

**Status**: Phase 1 Complete ✅
**Next**: Implement remaining 9 test scenarios
