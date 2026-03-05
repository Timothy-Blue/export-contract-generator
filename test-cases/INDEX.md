# Test Cases Index

## Quick Navigation

### By Category
- [Happy Path Tests](#happy-path-tests) - 2 test cases
- [Validation Tests](#validation-tests) - 4 test cases
- [Business Rules Tests](#business-rules-tests) - 3 test cases
- [User Flow Tests](#user-flow-tests) - 2 test cases
- [Data Handling Tests](#data-handling-tests) - 3 test cases
- [Error Handling Tests](#error-handling-tests) - 1 test case

### By Priority
- [High Priority](#high-priority-tests) - 9 test cases
- [Medium Priority](#medium-priority-tests) - 6 test cases

### Resources
- [Execution Checklist](test-execution/execution-checklist.md)
- [Error Code Reference](test-execution/error-codes.md)
- [Test Data Summary](test-execution/test-data-summary.md)

---

## Happy Path Tests

### TC-001: Successfully Import Three Valid Contracts
**File**: [01-happy-path/TC-001-import-valid-contracts.md](01-happy-path/TC-001-import-valid-contracts.md)  
**Priority**: High  
**Duration**: 30-45 seconds  
**Status**: ⏳ Pending

Verify successful upload, validation, and import of 3 valid contracts with correct derived field calculations.

### TC-011: Download CSV Template
**File**: [01-happy-path/TC-011-download-template.md](01-happy-path/TC-011-download-template.md)  
**Priority**: Medium  
**Duration**: 10-15 seconds  
**Status**: ⏳ Pending

Verify template download functionality and content correctness.

---

## Validation Tests

### TC-002: Reject CSV File with Validation Errors
**File**: [02-validation/TC-002-validation-errors.md](02-validation/TC-002-validation-errors.md)  
**Priority**: High  
**Duration**: 20-30 seconds  
**Status**: ⏳ Pending

Verify system correctly identifies and reports validation errors for invalid data.

### TC-003: Reject Invalid File Formats
**File**: [02-validation/TC-003-invalid-file-formats.md](02-validation/TC-003-invalid-file-formats.md)  
**Priority**: High  
**Duration**: 15-20 seconds  
**Status**: ⏳ Pending

Verify rejection of files with wrong format, size, or structure.

### TC-004: Handle Mixed Valid and Invalid Rows
**File**: [02-validation/TC-004-mixed-valid-invalid.md](02-validation/TC-004-mixed-valid-invalid.md)  
**Priority**: High  
**Duration**: 40-50 seconds  
**Status**: ⏳ Pending

Verify all-or-nothing validation with mixed valid/invalid rows.

### TC-012: Display Detailed Validation Results
**File**: 02-validation/TC-012-detailed-validation-results.md  
**Priority**: Medium  
**Duration**: 20-25 seconds  
**Status**: ⏳ Pending

Verify detailed error display with row numbers and error codes.

---

## Business Rules Tests

### TC-007: Detect Duplicate Contract Numbers
**File**: [03-business-rules/TC-007-duplicate-detection.md](03-business-rules/TC-007-duplicate-detection.md)  
**Priority**: High  
**Duration**: 20-25 seconds  
**Status**: ⏳ Pending

Verify duplicate detection within file and against database.

### TC-008: Validate Business Rules and Show Warnings
**File**: 03-business-rules/TC-008-business-rules-warnings.md  
**Priority**: High  
**Duration**: 25-30 seconds  
**Status**: ⏳ Pending

Verify business logic validation and warning display.

### TC-014: Verify Derived Field Calculations
**File**: 03-business-rules/TC-014-derived-field-calculations.md  
**Priority**: High  
**Duration**: 20-25 seconds  
**Status**: ⏳ Pending

Verify correct calculation of totalAmount, quantityMin, quantityMax.

---

## User Flow Tests

### TC-005: Cancel Import After Validation
**File**: [04-user-flows/TC-005-cancel-import.md](04-user-flows/TC-005-cancel-import.md)  
**Priority**: Medium  
**Duration**: 15-20 seconds  
**Status**: ⏳ Pending

Verify user can cancel import and no contracts are created.

### TC-010: Navigate Between Pages and Reset State
**File**: 04-user-flows/TC-010-navigation-state-management.md  
**Priority**: Medium  
**Duration**: 30-40 seconds  
**Status**: ⏳ Pending

Verify navigation, state management, and UI reset functionality.

---

## Data Handling Tests

### TC-009: Automatically Create New Reference Data
**File**: 05-data-handling/TC-009-create-reference-data.md  
**Priority**: High  
**Duration**: 30-40 seconds  
**Status**: ⏳ Pending

Verify automatic creation of new parties, commodities, payment terms.

### TC-013: Handle Large Files Within Limit
**File**: 05-data-handling/TC-013-large-files.md  
**Priority**: Medium  
**Duration**: 45-60 seconds  
**Status**: ⏳ Pending

Verify processing of maximum allowed file size (20 rows).

### TC-015: Handle Special Characters in Data
**File**: 05-data-handling/TC-015-special-characters.md  
**Priority**: Medium  
**Duration**: 20-25 seconds  
**Status**: ⏳ Pending

Verify correct handling of special characters and encoding.

---

## Error Handling Tests

### TC-006: Handle Network Connection Errors
**File**: 06-error-handling/TC-006-network-errors.md  
**Priority**: Medium  
**Duration**: 20-30 seconds  
**Status**: ⏳ Pending

Verify graceful error handling for network failures.

---

## High Priority Tests

Critical tests that must pass for release:

1. TC-001: Import valid contracts
2. TC-002: Validation errors
3. TC-003: Invalid file formats
4. TC-004: Mixed valid/invalid rows
5. TC-007: Duplicate detection
6. TC-008: Business rules and warnings
7. TC-009: Create reference data
8. TC-014: Derived field calculations

**Total Duration**: ~3-4 minutes

---

## Medium Priority Tests

Important tests for full functionality:

1. TC-005: Cancel import
2. TC-006: Network errors
3. TC-010: Navigation and state
4. TC-011: Download template
5. TC-012: Detailed validation results
6. TC-013: Large files
7. TC-015: Special characters

**Total Duration**: ~2-3 minutes

---

## Test Execution Strategies

### Smoke Test (Quick Validation)
Run these 3 tests for quick validation:
- TC-001: Import valid contracts
- TC-002: Validation errors
- TC-007: Duplicate detection

**Duration**: ~70-80 seconds

### Regression Test (Full Suite)
Run all 15 tests in sequence.

**Duration**: ~6-8 minutes

### Category-Based Testing
Run tests by category for focused testing:
```bash
# Happy path only
npm run test:e2e -- --spec "cypress/e2e/01-happy-path/**"

# Validation only
npm run test:e2e -- --spec "cypress/e2e/02-validation/**"
```

---

## Test Coverage Matrix

| Feature | Test Cases | Coverage |
|---------|------------|----------|
| File Upload | TC-003, TC-011 | ✅ Complete |
| Validation | TC-002, TC-003, TC-004, TC-012 | ✅ Complete |
| Business Rules | TC-007, TC-008, TC-014 | ✅ Complete |
| Import Execution | TC-001, TC-009 | ✅ Complete |
| User Interactions | TC-005, TC-010 | ✅ Complete |
| Error Handling | TC-006 | ⚠️ Basic |
| Performance | TC-013 | ⚠️ Basic |
| Data Integrity | TC-014, TC-015 | ✅ Complete |

---

## Test Statistics

- **Total Test Cases**: 15
- **High Priority**: 9 (60%)
- **Medium Priority**: 6 (40%)
- **Automated**: 15 (100%)
- **Manual**: 0 (0%)
- **Total Estimated Time**: 6-8 minutes

---

## Test Dependencies

### Prerequisites
- Backend server running
- Frontend server running
- MongoDB accessible
- Reference data seeded
- Test fixtures created

### Test Data Dependencies
- TC-007 requires existing contract "E2E-EXISTING"
- TC-009 requires minimal reference data
- All tests require reference data seeding

---

## Continuous Integration

### CI Pipeline Integration
```yaml
# .github/workflows/e2e-tests.yml
- name: Run Smoke Tests
  run: npm run test:e2e:smoke
  
- name: Run Full Regression
  run: npm run test:e2e
  if: github.event_name == 'pull_request'
```

### Test Execution Schedule
- **On PR**: Smoke tests (3 tests)
- **On Merge**: Full regression (15 tests)
- **Nightly**: Full regression + performance tests

---

## Reporting

### Test Reports Location
- HTML Report: `cypress/reports/html/index.html`
- JSON Report: `cypress/reports/json/results.json`
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

### Metrics Tracked
- Pass rate
- Execution time
- Flaky tests
- Coverage percentage

---

## Maintenance

### When to Update
- New features added
- Bug fixes implemented
- Business rules changed
- Schema modifications

### Review Schedule
- Weekly: Review failed tests
- Monthly: Update test data
- Quarterly: Full test suite review

---

## Contact & Support

### Test Ownership
- **Feature Owner**: Product Team
- **Test Automation**: QA Team
- **CI/CD**: DevOps Team

### Getting Help
- Review [Execution Checklist](test-execution/execution-checklist.md)
- Check [Error Codes](test-execution/error-codes.md)
- Consult [Test Data Summary](test-execution/test-data-summary.md)

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-05 | System | Initial test case structure |

---

## Quick Links

- [Main README](README.md)
- [E2E Test Plan](../E2E_TEST_PLAN.md)
- [Cypress Documentation](../cypress/README.md)
- [Project Documentation](../README.md)
