# E2E Test Cases - Contract Import Feature

## Overview
This document contains human-readable test cases for the Contract Import feature. Each test case is written in Given-When-Then format for clarity and can be used by QA teams, product owners, and developers.

## Test Execution Status
- Total Test Cases: 15
- Status: Ready for Implementation
- Framework: Cypress
- Last Updated: 2026-03-05

---

## TC-001: Successfully Import Three Valid Contracts

**Priority:** High  
**Category:** Happy Path  
**Estimated Duration:** 30-45 seconds

**Given** I am on the Contract Import page  
**And** the database contains reference data for parties, commodities, and payment terms  
**When** I upload a CSV file containing 3 valid contracts  
**And** I wait for the validation to complete  
**Then** I should see a confirmation dialog showing "3 valid rows"  
**When** I click the "Confirm Import" button  
**And** I wait for the import to complete  
**Then** I should see a success message showing "3 imported, 0 failed"  
**And** the database should contain 3 new contracts with correct data  
**And** all derived fields should be calculated correctly

**Test Data:** `cypress/fixtures/valid-contracts.csv`

**Expected Results:**
- UI shows successful import with correct counts
- Database contains 3 new contracts
- Derived fields: totalAmount, quantityMin, quantityMax calculated correctly
- Timestamps (createdAt, updatedAt) are set
- References to parties, commodities linked correctly

---

## TC-002: Reject CSV File with Validation Errors

**Priority:** High  
**Category:** Validation  
**Estimated Duration:** 20-30 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing 3 contracts with validation errors:
- Row 1: Missing contract number
- Row 2: Invalid date format and negative quantity
- Row 3: Buyer and seller are the same  
**And** I wait for the validation to complete  
**Then** I should see error messages for all 3 rows  
**And** I should NOT see a confirmation dialog  
**And** no contracts should be created in the database  
**And** I should be able to upload a different file

**Test Data:** `cypress/fixtures/invalid-contracts.csv`

**Expected Errors:**
- Row 2: Missing contract number (CN-001)
- Row 3: Invalid date format, negative quantity
- Row 4: Buyer and seller are the same (BL-001)

---

## TC-003: Reject Invalid File Formats

**Priority:** High  
**Category:** File Validation  
**Estimated Duration:** 15-20 seconds

**Given** I am on the Contract Import page  
**When** I attempt to upload a .txt file  
**Then** I should see an error message "Invalid file format" (F-001)  
**When** I attempt to upload a CSV file with more than 20 rows  
**Then** I should see an error message "File exceeds maximum 20 rows" (F-002)  
**When** I attempt to upload a CSV file with missing required headers  
**Then** I should see an error message "Missing required headers" (F-004)  
**When** I attempt to upload an empty CSV file  
**Then** I should see an error message "File is empty" (F-005)

**Test Data:**
- `cypress/fixtures/invalid.txt`
- `cypress/fixtures/large-file.csv` (21+ rows)
- `cypress/fixtures/missing-headers.csv`
- `cypress/fixtures/empty-file.csv`

**Expected Results:**
- Clear error messages for each file-level error
- No API calls made for obviously invalid files
- User can retry with valid file

---

## TC-004: Handle Mixed Valid and Invalid Rows

**Priority:** High  
**Category:** Partial Validation  
**Estimated Duration:** 40-50 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing 5 contracts (3 valid, 2 invalid)  
**And** I wait for the validation to complete  
**Then** I should see a summary showing "3 valid, 2 invalid"  
**And** I should see error details for the 2 invalid rows  
**And** I should NOT see a confirmation dialog  
**And** no contracts should be created in the database  
**When** I fix the errors and re-upload the corrected file  
**And** I confirm the import  
**Then** all 5 contracts should be created successfully

**Test Data:** `cypress/fixtures/mixed-contracts.csv`

**Expected Results:**
- Validation catches all errors before import
- No partial imports (all-or-nothing)
- Clear indication of which rows are invalid
- User can fix and re-upload

---

## TC-005: Cancel Import After Validation

**Priority:** Medium  
**Category:** User Flow  
**Estimated Duration:** 15-20 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing 2 valid contracts  
**And** I wait for the validation to complete  
**And** I see the confirmation dialog  
**When** I click the "Cancel" button  
**Then** the dialog should close  
**And** I should return to the upload zone  
**And** no contracts should be created in the database  
**And** I should be able to upload a different file

**Test Data:** `cypress/fixtures/valid-contracts.csv` (2 rows)

**Expected Results:**
- Cancel button works correctly
- No contracts created
- UI resets to initial state
- No errors or warnings

---

## TC-006: Handle Network Connection Errors

**Priority:** Medium  
**Category:** Error Handling  
**Estimated Duration:** 20-30 seconds

**Given** I am on the Contract Import page  
**And** the backend server is stopped  
**When** I attempt to upload a CSV file  
**Then** I should see an error message "Unable to connect to server"  
**And** I should be able to dismiss the error  
**When** the backend server is restarted  
**And** I upload the same file again  
**Then** the validation should complete successfully

**Test Data:** `cypress/fixtures/valid-contracts.csv`

**Expected Results:**
- Clear error message for network failures
- No application crash
- User can retry after error
- Graceful degradation

---

## TC-007: Detect Duplicate Contract Numbers

**Priority:** High  
**Category:** Business Rules  
**Estimated Duration:** 20-25 seconds

**Given** I am on the Contract Import page  
**And** the database contains a contract with number "E2E-EXISTING"  
**When** I upload a CSV file containing:
- Row 1: Contract number "E2E-020"
- Row 2: Contract number "E2E-020" (duplicate within file)
- Row 3: Contract number "E2E-EXISTING" (duplicate with database)  
**And** I wait for the validation to complete  
**Then** I should see an error for Row 2 indicating duplicate within file (CN-003)  
**And** I should see an error for Row 3 indicating contract already exists (CN-002)  
**And** no contracts should be imported

**Test Data:** `cypress/fixtures/duplicate-contracts.csv`

**Expected Results:**
- Duplicate detection works for both within-file and database duplicates
- Clear error messages with row numbers
- No contracts created

---

## TC-008: Validate Business Rules and Show Warnings

**Priority:** High  
**Category:** Business Rules  
**Estimated Duration:** 25-30 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing:
- Row 1: Buyer and seller have the same name (error)
- Row 2: Contract date is more than 365 days in the future (warning)
- Row 3: Currency mismatch between contract and bank (warning)  
**And** I wait for the validation to complete  
**Then** I should see an error for Row 1 blocking the import (BL-001)  
**And** I should see warnings for Rows 2 and 3 (BL-004, CF-001)  
**And** rows with only warnings should be allowed to import  
**And** rows with errors should block the entire import

**Test Data:** `cypress/fixtures/business-rule-violations.csv`

**Expected Errors/Warnings:**
- Row 2: Error - Buyer and seller are the same (BL-001)
- Row 3: Warning - Contract date > 365 days in future (BL-004)
- Row 3: Warning - Currency mismatch (CF-001)

---

## TC-009: Automatically Create New Reference Data

**Priority:** High  
**Category:** Reference Data  
**Estimated Duration:** 30-40 seconds

**Given** I am on the Contract Import page  
**And** the database has minimal reference data  
**When** I upload a CSV file containing new party names, commodity names, and payment terms that don't exist  
**And** I wait for the validation to complete  
**Then** the validation should pass without reference data errors  
**When** I confirm the import  
**And** I wait for the import to complete  
**Then** the contracts should be created successfully  
**And** new parties should be created in the database  
**And** new commodities should be created in the database  
**And** new payment terms should be created in the database  
**And** new bank details should be created in the database  
**And** all new entities should have isActive status set to true

**Test Data:** `cypress/fixtures/new-reference-data.csv`

**Expected Results:**
- System automatically creates missing reference data
- Contracts link to newly created entities
- All entities have correct isActive status
- No validation errors for missing reference data

---

## TC-010: Navigate Between Pages and Reset State

**Priority:** Medium  
**Category:** UI Navigation  
**Estimated Duration:** 30-40 seconds

**Given** I am on the home page  
**When** I click "Import Contracts"  
**Then** I should be on the Contract Import page  
**When** I upload a valid CSV file  
**And** I wait for validation  
**And** I click the "Back" button before confirming  
**Then** I should return to the home page  
**And** no contracts should be created  
**When** I navigate back to the Import page  
**Then** the page should be in its initial state with no file selected  
**When** I upload and confirm an import  
**And** I see the results summary  
**And** I click "Upload Another File"  
**Then** the page should reset to its initial state

**Test Data:** `cypress/fixtures/valid-contracts.csv`

**Expected Results:**
- Navigation works correctly
- State resets appropriately
- No memory leaks or stale data
- Back button behavior is intuitive

---

## TC-011: Download CSV Template

**Priority:** Medium  
**Category:** Template Management  
**Estimated Duration:** 10-15 seconds

**Given** I am on the Contract Import page  
**When** I click the "Download Template" button  
**Then** a CSV file should be downloaded  
**And** the file should contain all required column headers  
**And** the file should contain one example row with sample data

**Expected Results:**
- CSV file downloads successfully
- File contains 25 required headers
- Example row has valid sample data
- File can be opened in Excel/spreadsheet applications

---

## TC-012: Display Detailed Validation Results

**Priority:** Medium  
**Category:** UI Display  
**Estimated Duration:** 20-25 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file with multiple validation errors  
**And** I wait for validation to complete  
**Then** I should see a summary showing total valid and invalid rows  
**And** I should see a detailed list of errors grouped by row number  
**And** each error should show:
- Row number
- Field name
- Error code
- Human-readable error message  
**And** the error display should be scrollable if there are many errors

**Test Data:** `cypress/fixtures/multiple-errors.csv`

**Expected Results:**
- Clear summary statistics
- Errors grouped by row
- All error details visible
- Scrollable error list

---

## TC-013: Handle Large Files Within Limit

**Priority:** Medium  
**Category:** Performance  
**Estimated Duration:** 45-60 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing exactly 20 contracts (the maximum)  
**And** I wait for validation to complete  
**Then** the validation should process all 20 rows  
**And** if all rows are valid, I should see a confirmation dialog  
**When** I confirm the import  
**Then** all 20 contracts should be created successfully

**Test Data:** `cypress/fixtures/max-contracts.csv` (20 rows)

**Expected Results:**
- All 20 rows processed
- Validation completes within acceptable time
- All contracts created successfully
- No performance degradation

---

## TC-014: Verify Derived Field Calculations

**Priority:** High  
**Category:** Data Integrity  
**Estimated Duration:** 20-25 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file with a contract having:
- Quantity: 1000 MT
- Unit Price: 2500 USD
- Tolerance: 5%  
**And** I confirm the import  
**Then** the created contract should have:
- totalAmount = 2,500,000 (1000 × 2500)
- quantityMin = 950 (1000 - 5%)
- quantityMax = 1050 (1000 + 5%)
- All timestamps (createdAt, updatedAt) should be set

**Test Data:** `cypress/fixtures/derived-fields-test.csv`

**Expected Results:**
- totalAmount calculated correctly
- quantityMin calculated correctly
- quantityMax calculated correctly
- Timestamps are valid dates

---

## TC-015: Handle Special Characters in Data

**Priority:** Medium  
**Category:** Data Handling  
**Estimated Duration:** 20-25 seconds

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing contracts with:
- Special characters in text fields (é, ñ, ü, etc.)
- Commas within quoted fields
- Line breaks within quoted fields  
**And** I wait for validation to complete  
**Then** the validation should parse the data correctly  
**And** special characters should be preserved  
**When** I confirm the import  
**Then** the contracts should be created with all special characters intact

**Test Data:** `cypress/fixtures/special-characters.csv`

**Expected Results:**
- Special characters preserved
- Commas in quoted fields handled correctly
- Line breaks in quoted fields handled correctly
- No encoding issues

---

## Test Data Summary

| Fixture File | Purpose | Rows | Status |
|--------------|---------|------|--------|
| valid-contracts.csv | Happy path testing | 3 | ✅ Created |
| invalid-contracts.csv | Validation error testing | 3 | ✅ Created |
| mixed-contracts.csv | Partial validation testing | 5 | ✅ Created |
| duplicate-contracts.csv | Duplicate detection | 3 | ✅ Created |
| business-rule-violations.csv | Business rule testing | 3 | ⏳ Pending |
| new-reference-data.csv | Reference data creation | 1 | ⏳ Pending |
| large-file.csv | File size limit testing | 21 | ⏳ Pending |
| missing-headers.csv | Header validation | 1 | ⏳ Pending |
| empty-file.csv | Empty file handling | 0 | ⏳ Pending |
| max-contracts.csv | Maximum capacity testing | 20 | ⏳ Pending |
| derived-fields-test.csv | Calculation verification | 1 | ⏳ Pending |
| special-characters.csv | Character encoding | 2 | ⏳ Pending |
| invalid.txt | Wrong file format | N/A | ⏳ Pending |

---

## Test Execution Checklist

### Pre-Execution
- [ ] Backend server is running on localhost:5000
- [ ] Frontend server is running on localhost:3000
- [ ] MongoDB is running and accessible
- [ ] Database is seeded with reference data
- [ ] All test fixture files are created
- [ ] Cypress is installed and configured

### Execution
- [ ] Run all test cases in sequence
- [ ] Capture screenshots for failures
- [ ] Record video of test execution
- [ ] Log all errors and warnings
- [ ] Verify database state after each test

### Post-Execution
- [ ] Review test results
- [ ] Document any failures
- [ ] Clean up test data from database
- [ ] Archive test artifacts (screenshots, videos)
- [ ] Update test case status

---

## Error Code Reference

### File-Level Errors (F-xxx)
- **F-001**: Invalid file format
- **F-002**: File exceeds maximum rows
- **F-003**: File upload failed
- **F-004**: Missing required headers
- **F-005**: File is empty

### Contract Number Errors (CN-xxx)
- **CN-001**: Contract number is required
- **CN-002**: Contract number already exists
- **CN-003**: Duplicate contract number in file

### Business Logic Errors (BL-xxx)
- **BL-001**: Buyer and seller cannot be the same
- **BL-002**: Invalid contract date
- **BL-003**: Quantity must be positive
- **BL-004**: Contract date too far in future (warning)

### Currency/Financial Errors (CF-xxx)
- **CF-001**: Currency mismatch (warning)
- **CF-002**: Invalid unit price

### Data Format Errors (DF-xxx)
- **DF-001**: Invalid date format
- **DF-002**: Invalid number format
- **DF-003**: Invalid SWIFT code format

---

## Notes

1. All test cases assume the application is in a clean state before execution
2. Test data should be cleaned up after each test to avoid interference
3. Some tests require specific database states (e.g., existing contracts for duplicate testing)
4. Network error tests (TC-006) may require manual server control
5. Performance tests (TC-013) should be run on a representative environment

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-05 | System | Initial creation with 15 test cases |

