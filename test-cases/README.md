# E2E Test Cases - Contract Import Feature

## Overview
This directory contains human-readable test cases for the Contract Import feature, organized by category for easy navigation and execution.

## Folder Structure

```
test-cases/
├── README.md                           # This file
├── 01-happy-path/                      # Successful import scenarios
│   ├── TC-001-import-valid-contracts.md
│   └── TC-011-download-template.md
├── 02-validation/                      # Validation and error scenarios
│   ├── TC-002-validation-errors.md
│   ├── TC-003-invalid-file-formats.md
│   ├── TC-004-mixed-valid-invalid.md
│   └── TC-012-detailed-validation-results.md
├── 03-business-rules/                  # Business logic validation
│   ├── TC-007-duplicate-detection.md
│   ├── TC-008-business-rules-warnings.md
│   └── TC-014-derived-field-calculations.md
├── 04-user-flows/                      # User interaction scenarios
│   ├── TC-005-cancel-import.md
│   └── TC-010-navigation-state-management.md
├── 05-data-handling/                   # Data processing scenarios
│   ├── TC-009-create-reference-data.md
│   ├── TC-013-large-files.md
│   └── TC-015-special-characters.md
├── 06-error-handling/                  # Error and edge cases
│   └── TC-006-network-errors.md
└── test-execution/                     # Test execution resources
    ├── execution-checklist.md
    ├── error-codes.md
    └── test-data-summary.md
```

## Test Case Categories

### 1. Happy Path (Priority: High)
Tests that verify the main success scenarios where everything works as expected.
- **Count**: 2 test cases
- **Execution Time**: ~40-60 seconds

### 2. Validation (Priority: High)
Tests that verify input validation, file format checks, and error detection.
- **Count**: 4 test cases
- **Execution Time**: ~75-105 seconds

### 3. Business Rules (Priority: High)
Tests that verify business logic, calculations, and domain-specific rules.
- **Count**: 3 test cases
- **Execution Time**: ~65-80 seconds

### 4. User Flows (Priority: Medium)
Tests that verify user interactions, navigation, and state management.
- **Count**: 2 test cases
- **Execution Time**: ~45-60 seconds

### 5. Data Handling (Priority: Medium)
Tests that verify data processing, reference data creation, and special cases.
- **Count**: 3 test cases
- **Execution Time**: ~70-105 seconds

### 6. Error Handling (Priority: Medium)
Tests that verify error scenarios, network failures, and recovery.
- **Count**: 1 test case
- **Execution Time**: ~20-30 seconds

## Quick Start

### Run All Tests
```bash
npm run test:e2e
```

### Run by Category
```bash
# Happy path tests only
npm run test:e2e -- --spec "cypress/e2e/01-happy-path/**"

# Validation tests only
npm run test:e2e -- --spec "cypress/e2e/02-validation/**"
```

### Run by Priority
```bash
# High priority tests only
npm run test:e2e:high-priority

# Medium priority tests only
npm run test:e2e:medium-priority
```

## Test Execution Order

### Recommended Sequence
1. **Happy Path** - Verify basic functionality works
2. **Validation** - Verify error detection works
3. **Business Rules** - Verify domain logic works
4. **User Flows** - Verify UI interactions work
5. **Data Handling** - Verify edge cases work
6. **Error Handling** - Verify recovery works

### Smoke Test Suite (Quick validation)
- TC-001: Import valid contracts
- TC-002: Validation errors
- TC-007: Duplicate detection

**Estimated Time**: ~70-80 seconds

### Full Regression Suite
All 15 test cases in sequence.

**Estimated Time**: ~6-8 minutes

## Test Data Requirements

All test cases require fixture files located in `cypress/fixtures/`. See `test-execution/test-data-summary.md` for details.

## Prerequisites

- Backend server running on localhost:5000
- Frontend server running on localhost:3000
- MongoDB running and accessible
- Database seeded with reference data
- Cypress installed and configured

## Reporting

Test results are generated in:
- HTML Report: `cypress/reports/html/index.html`
- JSON Report: `cypress/reports/json/results.json`
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

## Contributing

When adding new test cases:
1. Place in appropriate category folder
2. Follow naming convention: `TC-XXX-description.md`
3. Use Given-When-Then format
4. Include test data references
5. Update this README with new test count

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-05 | System | Initial structure with 15 test cases |
