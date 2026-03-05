# Test Execution Checklist

## Pre-Execution Setup

### Environment Verification
- [ ] Node.js version 18+ installed
- [ ] MongoDB is running and accessible
- [ ] Backend server can start successfully
- [ ] Frontend server can start successfully
- [ ] Cypress is installed (`npm list cypress`)
- [ ] All dependencies are installed (`npm install`)

### Database Setup
- [ ] MongoDB connection string is configured
- [ ] Test database is created (separate from production)
- [ ] Database is seeded with reference data:
  - [ ] 5 Parties (buyers)
  - [ ] 5 Parties (sellers)
  - [ ] 10 Commodities
  - [ ] 5 Payment Terms
  - [ ] 3 Bank Details
- [ ] Seed contract "E2E-EXISTING" is created (for duplicate tests)

### Test Data Preparation
- [ ] All fixture files exist in `cypress/fixtures/`:
  - [ ] valid-contracts.csv
  - [ ] invalid-contracts.csv
  - [ ] mixed-contracts.csv
  - [ ] duplicate-contracts.csv
  - [ ] business-rule-violations.csv
  - [ ] new-reference-data.csv
  - [ ] large-file.csv (21 rows)
  - [ ] missing-headers.csv
  - [ ] empty-file.csv
  - [ ] max-contracts.csv (20 rows)
  - [ ] derived-fields-test.csv
  - [ ] special-characters.csv
  - [ ] invalid.txt

### Server Startup
- [ ] Start backend server: `npm run server`
- [ ] Verify backend is running: http://localhost:5000/api/health
- [ ] Start frontend server: `npm run client`
- [ ] Verify frontend is running: http://localhost:3000
- [ ] Verify proxy is working (frontend can reach backend)

### Cypress Configuration
- [ ] Cypress config file exists: `cypress.config.js`
- [ ] Base URL is set to http://localhost:3000
- [ ] Video recording is enabled
- [ ] Screenshot on failure is enabled
- [ ] Timeouts are configured appropriately

---

## Test Execution

### Smoke Test Suite (Quick Validation)
Run these 3 critical tests first:

```bash
npm run test:e2e -- --spec "cypress/e2e/01-happy-path/01-import-valid-contracts.cy.js"
npm run test:e2e -- --spec "cypress/e2e/02-validation/01-validation-errors.cy.js"
npm run test:e2e -- --spec "cypress/e2e/03-business-rules/01-duplicate-detection.cy.js"
```

**Estimated Time**: 70-80 seconds

- [ ] TC-001: Import valid contracts - PASSED
- [ ] TC-002: Validation errors - PASSED
- [ ] TC-007: Duplicate detection - PASSED

**If smoke tests fail, stop and investigate before proceeding.**

### Full Test Suite Execution

#### Category 1: Happy Path
```bash
npm run test:e2e -- --spec "cypress/e2e/01-happy-path/**"
```
- [ ] TC-001: Import valid contracts
- [ ] TC-011: Download template

#### Category 2: Validation
```bash
npm run test:e2e -- --spec "cypress/e2e/02-validation/**"
```
- [ ] TC-002: Validation errors
- [ ] TC-003: Invalid file formats
- [ ] TC-004: Mixed valid and invalid
- [ ] TC-012: Detailed validation results

#### Category 3: Business Rules
```bash
npm run test:e2e -- --spec "cypress/e2e/03-business-rules/**"
```
- [ ] TC-007: Duplicate detection
- [ ] TC-008: Business rules and warnings
- [ ] TC-014: Derived field calculations

#### Category 4: User Flows
```bash
npm run test:e2e -- --spec "cypress/e2e/04-user-flows/**"
```
- [ ] TC-005: Cancel import
- [ ] TC-010: Navigation and state management

#### Category 5: Data Handling
```bash
npm run test:e2e -- --spec "cypress/e2e/05-data-handling/**"
```
- [ ] TC-009: Create reference data
- [ ] TC-013: Large files
- [ ] TC-015: Special characters

#### Category 6: Error Handling
```bash
npm run test:e2e -- --spec "cypress/e2e/06-error-handling/**"
```
- [ ] TC-006: Network errors

### Run All Tests
```bash
npm run test:e2e
```

---

## During Execution

### Monitoring
- [ ] Watch console for errors
- [ ] Monitor server logs for backend errors
- [ ] Check database connections remain stable
- [ ] Verify no memory leaks (check process memory)
- [ ] Note any slow tests (> expected duration)

### Issue Tracking
For each failure, document:
- [ ] Test case ID
- [ ] Error message
- [ ] Screenshot path
- [ ] Video path
- [ ] Steps to reproduce
- [ ] Expected vs actual result

---

## Post-Execution

### Results Review
- [ ] Open Cypress test report
- [ ] Review all passed tests
- [ ] Investigate all failed tests
- [ ] Check for flaky tests (intermittent failures)
- [ ] Review screenshots for failures
- [ ] Watch videos for failed tests

### Artifact Collection
- [ ] Save HTML report: `cypress/reports/html/index.html`
- [ ] Save JSON report: `cypress/reports/json/results.json`
- [ ] Archive screenshots: `cypress/screenshots/`
- [ ] Archive videos: `cypress/videos/`
- [ ] Export test metrics (duration, pass rate)

### Database Cleanup
- [ ] Remove all test contracts (E2E-* prefix)
- [ ] Remove test parties created during tests
- [ ] Remove test commodities created during tests
- [ ] Verify reference data is intact
- [ ] Reset database to known state for next run

### Test Data Validation
- [ ] Verify all fixture files are unchanged
- [ ] Check for any corrupted test data
- [ ] Validate seed data is correct

### Documentation
- [ ] Update test execution history in each test case file
- [ ] Document any bugs found
- [ ] Note any test improvements needed
- [ ] Update test case status (passed/failed)

---

## Reporting

### Test Summary Report
Create a summary with:
- Total tests executed: ___
- Tests passed: ___
- Tests failed: ___
- Tests skipped: ___
- Pass rate: ___%
- Total execution time: ___
- Average test duration: ___

### Failed Tests Report
For each failure:
| Test ID | Test Name | Error | Screenshot | Priority |
|---------|-----------|-------|------------|----------|
| TC-XXX | ... | ... | link | High |

### Recommendations
- [ ] List any bugs to be fixed
- [ ] Suggest test improvements
- [ ] Note any flaky tests
- [ ] Recommend additional test coverage

---

## Troubleshooting

### Common Issues

**Issue**: Backend server not starting
- Check MongoDB is running
- Verify port 5000 is not in use
- Check environment variables

**Issue**: Frontend server not starting
- Verify port 3000 is not in use
- Check node_modules are installed
- Clear npm cache if needed

**Issue**: Tests timing out
- Increase timeout in cypress.config.js
- Check server performance
- Verify network connectivity

**Issue**: Database connection errors
- Verify MongoDB is running
- Check connection string
- Verify database permissions

**Issue**: Fixture files not found
- Verify files exist in cypress/fixtures/
- Check file paths in test code
- Verify file permissions

---

## Sign-Off

### Executed By
- Name: _______________
- Date: _______________
- Environment: _______________

### Reviewed By
- Name: _______________
- Date: _______________
- Approval: [ ] Approved [ ] Rejected

### Notes
_Add any additional notes or observations here_

---

## Next Steps
- [ ] Fix any failed tests
- [ ] Re-run failed tests
- [ ] Update test cases based on findings
- [ ] Schedule next test execution
- [ ] Archive test results
