# TC-004: Handle Mixed Valid and Invalid Rows

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-004 |
| **Category** | Validation |
| **Priority** | High |
| **Estimated Duration** | 40-50 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that when a CSV file contains both valid and invalid rows, the system validates all rows, reports errors for invalid rows, and prevents import (all-or-nothing validation). User can then fix errors and successfully import all rows.

## Preconditions
- Backend server is running on localhost:5000
- Frontend server is running on localhost:3000
- Database contains reference data

## Test Data
**File**: `cypress/fixtures/mixed-contracts.csv`

**Contents**: 5 contracts
- Row 2: Valid (E2E-010)
- Row 3: Valid (E2E-011)
- Row 4: Invalid - Missing contract number
- Row 5: Valid (E2E-013)
- Row 6: Invalid - Invalid date format, non-existent buyer

## Test Steps

### Phase 1: Upload Mixed File

#### Given
1. I am on the Contract Import page
2. Database has known state (no E2E-01X contracts)

#### When
3. I upload `mixed-contracts.csv` (5 rows: 3 valid, 2 invalid)
4. I wait for validation to complete

#### Then
5. I should see results summary showing "3 valid, 2 invalid"
6. I should see error details for rows 4 and 6
7. I should NOT see a confirmation dialog
8. I should see a message: "Cannot import due to validation errors"

### Phase 2: Verify No Partial Import

#### When
9. I query the database for contracts E2E-010 through E2E-014

#### Then
10. No contracts should exist (all-or-nothing validation)
11. Database state should be unchanged

### Phase 3: Fix and Re-upload

#### When
12. I click "Upload Another File" button
13. I upload `mixed-contracts-fixed.csv` (all 5 rows now valid)
14. I wait for validation to complete

#### Then
15. I should see confirmation dialog showing "5 valid rows"
16. I should see "0 errors, 0 warnings"

#### When
17. I click "Confirm Import"
18. I wait for import to complete

#### Then
19. I should see results summary showing "5 imported, 0 failed"
20. All 5 contracts should exist in database

## Expected Results

### Initial Upload (Mixed File)

**Results Summary**:
```
Validation Results:
✓ 3 valid rows
❌ 2 invalid rows

Cannot proceed with import due to errors.
```

**Error Details**:
```
Row 4:
  ❌ Contract Number: Contract number is required (CN-001)

Row 6:
  ❌ Contract Date: Invalid date format (DF-001)
  ❌ Buyer: Buyer "NonExistent Buyer" not found (REF-001)
```

**Valid Rows Indication**:
```
Row 2: ✓ Valid
Row 3: ✓ Valid
Row 5: ✓ Valid
```

### Database Verification After Initial Upload
```javascript
const contracts = await Contract.find({ 
  contractNumber: { $in: ['E2E-010', 'E2E-011', 'E2E-013'] } 
});
expect(contracts).toHaveLength(0); // No partial import
```

### After Fix and Re-upload
```javascript
const contracts = await Contract.find({ 
  contractNumber: { $regex: /^E2E-01[0-4]$/ } 
});
expect(contracts).toHaveLength(5); // All imported
```

## Postconditions
- After initial upload: No contracts created
- After fixed upload: All 5 contracts created successfully
- User can continue to import more files

## Test Variations

### Variation 1: Fix Only Some Errors
**Steps**:
1. Upload mixed file (3 valid, 2 invalid)
2. Fix 1 of 2 errors, re-upload
3. Verify still shows 1 invalid row
4. Verify no import occurs

**Expected**: Import still blocked until all errors fixed

### Variation 2: Large Mixed File
**Steps**:
1. Upload file with 20 rows (15 valid, 5 invalid)
2. Verify all errors are detected
3. Verify no partial import

**Expected**: All 5 errors reported, no import

### Variation 3: All Invalid Rows
**Steps**:
1. Upload file with 5 rows (0 valid, 5 invalid)
2. Verify shows "0 valid, 5 invalid"

**Expected**: Clear indication that no rows are valid

## Business Rules Verified
- ✅ All-or-nothing validation (no partial imports)
- ✅ All rows validated before import
- ✅ Clear distinction between valid and invalid rows
- ✅ User can fix and retry
- ✅ Database integrity maintained

## Related Test Cases
- TC-001: Successfully import valid contracts
- TC-002: Reject CSV file with validation errors
- TC-012: Display detailed validation results

## Notes
- This test verifies the all-or-nothing validation strategy
- Critical for data integrity
- Should be included in smoke test suite
- Tests both validation and error recovery flow

## Automation Script Reference
**Cypress**: `cypress/e2e/02-validation/03-mixed-valid-invalid.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
