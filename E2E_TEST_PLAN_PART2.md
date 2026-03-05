## Estimated Effort

### Phase 1: Planning & Setup (6-8 hours)
- [ ] Review and finalize test plan with stakeholders (1-2 hours)
- [ ] Answer clarification questions and make decisions (1 hour)
- [ ] Install and configure E2E testing framework (2-3 hours)
- [ ] Set up database seeding and cleanup utilities (2 hours)
- [ ] Create test data factories and fixtures (1-2 hours)

### Phase 2: Infrastructure & Helpers (8-10 hours)
- [ ] Create page object classes (3-4 hours)
- [ ] Create API helper utilities (2 hours)
- [ ] Set up server management (start/stop) (1-2 hours)
- [ ] Add data-testid attributes to React components (2-3 hours)
- [ ] Create database setup/teardown helpers (1-2 hours)

### Phase 3: Core Test Implementation (16-20 hours)
- [ ] Scenario 1: Happy path - import valid contracts (2-3 hours)
- [ ] Scenario 2: Validation errors (2-3 hours)
- [ ] Scenario 3: File-level errors (2 hours)
- [ ] Scenario 4: Partial import (2-3 hours)
- [ ] Scenario 5: Cancel import (1 hour)
- [ ] Scenario 6: Network error handling (2 hours)
- [ ] Scenario 7: Duplicate contract numbers (2 hours)
- [ ] Scenario 8: Business rule validations (2-3 hours)
- [ ] Scenario 9: Reference data resolution (2-3 hours)
- [ ] Scenario 10: UI navigation (1-2 hours)

### Phase 4: Refinement & Documentation (4-6 hours)
- [ ] Debug and fix flaky tests (2-3 hours)
- [ ] Add test execution documentation (1 hour)
- [ ] Set up CI/CD integration (if required) (2-3 hours)
- [ ] Code review and refactoring (1-2 hours)

### Phase 5: Execution & Reporting (2-3 hours)
- [ ] Run full test suite and verify results (1 hour)
- [ ] Generate test execution report (30 minutes)
- [ ] Document known issues and limitations (30 minutes)
- [ ] Create summary report (1 hour)

**Total Estimated Effort: 36-47 hours**

---

## Success Criteria

### Test Coverage
✅ All 10 critical user scenarios covered
✅ Happy path, error handling, and edge cases tested
✅ Both UI and database state verified
✅ File upload, validation, and import flows complete

### Test Quality
✅ Tests run reliably without flakiness (< 5% failure rate)
✅ Tests are independent and can run in any order
✅ Tests clean up after themselves (no data pollution)
✅ Clear, descriptive test names and assertions
✅ Proper use of page objects and helpers

### Performance
✅ Full test suite completes in < 10 minutes
✅ Individual tests complete in < 60 seconds
✅ No unnecessary waits or delays
✅ Efficient database seeding/cleanup

### Documentation
✅ Test execution guide is complete
✅ Debugging guide is available
✅ Test data management is documented
✅ CI/CD integration is documented (if applicable)

### Deliverables
✅ E2E test suite with 10+ scenarios
✅ Page object classes
✅ API helper utilities
✅ Test data factories and fixtures
✅ Database setup/teardown scripts
✅ Test execution documentation
✅ Summary report with results

---

## Risk Assessment & Mitigation

### Risk 1: Flaky Tests Due to Timing Issues
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Use explicit waits for specific conditions
- Avoid hard-coded timeouts
- Wait for network requests to complete
- Use proper loading state indicators

### Risk 2: Database State Conflicts
**Impact**: High
**Probability**: Medium
**Mitigation**:
- Run tests sequentially (not in parallel)
- Clean up test data after each test
- Use unique identifiers (timestamps, UUIDs)
- Isolate test data with prefixes (E2E-, TEST-)

### Risk 3: Server Startup Delays
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Implement health check polling
- Set generous startup timeouts (120s)
- Reuse existing servers in development
- Use proper wait strategies

### Risk 4: File Upload Reliability
**Impact**: Medium
**Probability**: Low
**Mitigation**:
- Use absolute file paths
- Verify file exists before upload
- Handle file encoding correctly (UTF-8)
- Test with various file sizes

### Risk 5: Browser Compatibility Issues
**Impact**: Low (if testing single browser)
**Probability**: Low
**Mitigation**:
- Start with Chrome/Chromium only
- Add other browsers incrementally
- Use standard web APIs
- Test responsive design separately

---

## Debugging Guide

### Common Issues & Solutions

#### Issue: Test times out waiting for element
```javascript
// Check if selector is correct
await page.locator('[data-testid="results-summary"]').screenshot({ path: 'debug.png' });

// Check if element is hidden or covered
await page.locator('[data-testid="results-summary"]').evaluate(el => {
  console.log('Visible:', el.offsetParent !== null);
  console.log('Display:', window.getComputedStyle(el).display);
});

// Wait for network to be idle
await page.waitForLoadState('networkidle');
```

#### Issue: File upload fails
```javascript
// Verify file exists
const fs = require('fs');
console.log('File exists:', fs.existsSync(filePath));

// Check file input selector
await page.locator('input[type="file"]').screenshot({ path: 'file-input.png' });

// Use absolute path
const absolutePath = path.resolve(__dirname, '../fixtures/valid.csv');
await page.setInputFiles('input[type="file"]', absolutePath);
```

#### Issue: Database assertions fail
```javascript
// Add delay to allow async operations to complete
await page.waitForTimeout(1000);

// Verify API is accessible
const health = await apiHelper.healthCheck();
console.log('API healthy:', health);

// Check database connection
const contracts = await apiHelper.getContracts({});
console.log('Total contracts in DB:', contracts.length);
```

#### Issue: Tests pass locally but fail in CI
```javascript
// Increase timeouts for CI environment
test.setTimeout(process.env.CI ? 120000 : 60000);

// Use headless mode in CI
const headless = process.env.CI ? true : false;

// Add retries for CI
retries: process.env.CI ? 2 : 0
```

### Debug Mode Commands
```bash
# Run tests with visible browser
npm run test:e2e:headed

# Run tests with Playwright Inspector
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/tests/import.spec.js

# Run tests with trace
npx playwright test --trace on

# View test report
npm run test:e2e:report
```

---

## Test Execution Guide

### Running Tests Locally

#### Prerequisites
1. Install dependencies:
```bash
npm install
npm install --prefix client
npm install --save-dev @playwright/test  # or chosen framework
```

2. Start MongoDB:
```bash
# Option 1: Local MongoDB
mongod --dbpath /path/to/data

# Option 2: Docker
docker run -d -p 27017:27017 mongo:6

# Option 3: Tests will use mongodb-memory-server automatically
```

3. Set environment variables:
```bash
# Create .env.test file
MONGODB_URI=mongodb://localhost:27017/test-db
NODE_ENV=test
PORT=5000
```

#### Run All Tests
```bash
# Run full E2E test suite
npm run test:e2e

# Run with visible browser (debugging)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/tests/import.spec.js

# Run specific test by name
npx playwright test -g "happy path"
```

#### Run Tests in Watch Mode
```bash
# Playwright UI mode (interactive)
npm run test:e2e:ui

# Cypress interactive mode
npx cypress open
```

#### View Test Results
```bash
# View HTML report
npm run test:e2e:report

# View trace for failed tests
npx playwright show-trace trace.zip
```

### Running Tests in CI/CD

#### GitHub Actions
Tests run automatically on:
- Push to main/develop branches
- Pull requests to main/develop
- Manual workflow dispatch

View results:
- GitHub Actions tab → E2E Tests workflow
- Download artifacts (screenshots, videos, reports)

#### Local CI Simulation
```bash
# Run tests in CI mode (headless, with retries)
CI=true npm run test:e2e

# Generate JUnit report for CI
npx playwright test --reporter=junit
```

---

## Test Data Management

### Seeding Reference Data

```javascript
// e2e/helpers/dbSetup.js
const mongoose = require('mongoose');
const Party = require('../../server/models/Party');
const Commodity = require('../../server/models/Commodity');
const PaymentTerm = require('../../server/models/PaymentTerm');
const BankDetails = require('../../server/models/BankDetails');

async function seedDatabase() {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db');

  // Seed parties
  await Party.insertMany([
    { name: 'Test Buyer Inc', type: 'BUYER', isActive: true },
    { name: 'Test Seller Ltd', type: 'SELLER', isActive: true },
    { name: 'Another Buyer', type: 'BUYER', isActive: true },
    { name: 'Inactive Buyer', type: 'BUYER', isActive: false }
  ]);

  // Seed commodities
  await Commodity.insertMany([
    { name: 'Coffee Beans', defaultUnit: 'MT', isActive: true },
    { name: 'Tea Leaves', defaultUnit: 'MT', isActive: true },
    { name: 'Rice', defaultUnit: 'MT', isActive: true },
    { name: 'Wheat', defaultUnit: 'MT', isActive: true }
  ]);

  // Seed payment terms
  await PaymentTerm.insertMany([
    { name: 'LC at Sight', description: 'Letter of Credit at Sight', isActive: true },
    { name: 'TT 30 Days', description: 'Telegraphic Transfer 30 Days', isActive: true },
    { name: 'LC 60 Days', description: 'Letter of Credit 60 Days', isActive: true }
  ]);

  // Seed bank details
  await BankDetails.insertMany([
    {
      bankName: 'Test Bank',
      accountName: 'Test Account',
      accountNumber: '1234567890',
      swiftCode: 'TESTUS33',
      currency: 'USD',
      isActive: true
    }
  ]);

  console.log('✅ Database seeded successfully');
}

async function cleanupDatabase() {
  // Remove all test data
  await Contract.deleteMany({ contractNumber: /^E2E-|^TEST-/ });
  await Party.deleteMany({ name: /^E2E-|^TEST-|^Brand New/ });
  await Commodity.deleteMany({ name: /^E2E-|^TEST-|^Exotic/ });
  await PaymentTerm.deleteMany({ name: /^E2E-|^TEST-|^Advance/ });
  await BankDetails.deleteMany({ bankName: /^E2E-|^TEST-|^New Bank/ });

  console.log('✅ Database cleaned up successfully');
}

async function resetDatabase() {
  await cleanupDatabase();
  await seedDatabase();
}

module.exports = { seedDatabase, cleanupDatabase, resetDatabase };
```

### Test Data Fixtures

```javascript
// e2e/fixtures/referenceData.js
module.exports = {
  parties: [
    { name: 'Test Buyer Inc', type: 'BUYER', isActive: true },
    { name: 'Test Seller Ltd', type: 'SELLER', isActive: true }
  ],
  
  commodities: [
    { name: 'Coffee Beans', defaultUnit: 'MT', isActive: true },
    { name: 'Tea Leaves', defaultUnit: 'MT', isActive: true }
  ],
  
  paymentTerms: [
    { name: 'LC at Sight', description: 'Letter of Credit at Sight', isActive: true }
  ],
  
  bankDetails: [
    {
      bankName: 'Test Bank',
      accountName: 'Test Account',
      accountNumber: '1234567890',
      swiftCode: 'TESTUS33',
      currency: 'USD',
      isActive: true
    }
  ]
};
```

---

## Known Issues & Limitations

### Current Limitations
1. **Authentication**: Tests assume no authentication is required. If auth is enabled, tests will need to be updated.
2. **Single Browser**: Tests are configured for Chrome/Chromium only. Multi-browser testing requires additional configuration.
3. **Sequential Execution**: Tests run sequentially to avoid database conflicts. This increases total execution time.
4. **File Size**: Tests use small CSV files (< 20 rows). Large file testing is not covered.
5. **Network Conditions**: Tests assume stable network. Slow network or offline scenarios are not tested.

### Known Issues
1. **Timing Sensitivity**: Some tests may be sensitive to slow machines or high CPU load. Increase timeouts if needed.
2. **Port Conflicts**: If ports 3000 or 5000 are in use, tests will fail. Ensure ports are available.
3. **Database Cleanup**: If tests are interrupted, database may contain stale test data. Run cleanup manually.

### Future Enhancements
- [ ] Add visual regression testing (screenshot comparison)
- [ ] Add accessibility testing (axe-core integration)
- [ ] Add performance testing (Lighthouse integration)
- [ ] Add mobile/responsive testing
- [ ] Add multi-browser testing (Firefox, Safari)
- [ ] Add API-level E2E tests (without UI)
- [ ] Add load testing for concurrent imports

---

## Summary Report Template

After implementation, provide a summary report using this template:

---

# E2E Test Execution Summary Report

**Project**: Export Contract Generator - Contract Import Feature
**Date**: [Date]
**Tester**: [Name]
**Framework**: [Playwright/Cypress/Puppeteer]
**Environment**: [Local/CI/Staging]

## Test Execution Results

### Overall Statistics
- **Total Scenarios**: 10
- **Scenarios Passed**: X
- **Scenarios Failed**: X
- **Scenarios Skipped**: X
- **Pass Rate**: X%
- **Total Execution Time**: X minutes

### Scenario Results

| Scenario | Status | Duration | Notes |
|----------|--------|----------|-------|
| 1. Happy path - import valid contracts | ✅ Pass | 45s | All assertions passed |
| 2. Validation errors | ✅ Pass | 30s | Error messages verified |
| 3. File-level errors | ✅ Pass | 20s | All error types tested |
| 4. Partial import | ✅ Pass | 50s | All-or-nothing verified |
| 5. Cancel import | ✅ Pass | 20s | No data created |
| 6. Network error handling | ⚠️ Flaky | 30s | Intermittent timeout |
| 7. Duplicate contract numbers | ✅ Pass | 25s | Both types detected |
| 8. Business rule validations | ✅ Pass | 30s | Errors and warnings |
| 9. Reference data resolution | ✅ Pass | 40s | New entities created |
| 10. UI navigation | ✅ Pass | 35s | State management OK |

### Coverage Analysis

#### Features Tested
- ✅ CSV template download
- ✅ File upload (drag-and-drop and file picker)
- ✅ File-level validation
- ✅ Row-level validation
- ✅ Business rule validation
- ✅ Reference data resolution
- ✅ Import confirmation dialog
- ✅ Import execution
- ✅ Results display
- ✅ Error handling
- ✅ UI navigation

#### Database Verification
- ✅ Contract creation
- ✅ Reference data linking
- ✅ Derived field calculations
- ✅ Timestamp setting
- ✅ Data integrity

### Issues Found

#### Critical Issues
None

#### Major Issues
None

#### Minor Issues
1. **Flaky network error test**: Scenario 6 occasionally times out when stopping/starting server. Needs more robust server management.

#### Cosmetic Issues
1. Loading spinner sometimes flashes too quickly to see on fast connections.

### Test Environment

#### Configuration
- **Backend**: Express 4.18.2 on Node.js 18
- **Frontend**: React 18.2.0
- **Database**: MongoDB 6.0 (mongodb-memory-server)
- **Browser**: Chrome 120
- **OS**: Windows 11

#### Test Data
- Reference data: 4 parties, 4 commodities, 3 payment terms, 1 bank
- Test contracts: 25+ CSV files with various scenarios
- All test data prefixed with "E2E-" for easy identification

### Deviations from Plan

#### Changes Made
1. Added extra scenario for reference data resolution (not in original plan)
2. Simplified network error test due to server management complexity
3. Added more assertions for database state verification

#### Scope Adjustments
1. Skipped multi-browser testing (Chrome only for now)
2. Deferred responsive design testing to future iteration
3. Simplified file download testing (verification only, no content check)

### Recommendations

#### Immediate Actions
1. Fix flaky network error test by improving server lifecycle management
2. Add retry logic for timing-sensitive assertions
3. Document test data cleanup procedures

#### Future Improvements
1. Add visual regression testing for UI consistency
2. Add accessibility testing (WCAG compliance)
3. Add performance benchmarks (import speed, validation time)
4. Expand to multi-browser testing (Firefox, Safari)
5. Add mobile/responsive design testing
6. Add API-level E2E tests (without UI)

### Conclusion

The E2E test suite successfully validates the Contract Import feature across 10 critical user scenarios. All major workflows are covered, including happy paths, error handling, and edge cases. The tests verify both UI behavior and database state, ensuring end-to-end correctness.

**Overall Assessment**: ✅ Ready for Production

The test suite provides confidence that the Contract Import feature works correctly and handles errors gracefully. Minor issues identified are non-blocking and can be addressed in future iterations.

---

**Approved By**: [Name]
**Date**: [Date]

---

