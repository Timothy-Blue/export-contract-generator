# TC-002: Reject CSV File with Validation Errors

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-002 |
| **Category** | Validation |
| **Priority** | High |
| **Estimated Duration** | 20-30 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that the system correctly identifies and reports validation errors when a CSV file contains invalid data, and prevents import of invalid contracts.

## Preconditions
- Backend server is running on localhost:5000
- Frontend server is running on localhost:3000
- Database is accessible

## Test Data
**File**: `cypress/fixtures/invalid-contracts.csv`

**Contents**: 3 contracts with different validation errors:
- Row 2: Missing contract number (empty field)
- Row 3: Invalid date format ("invalid-date") and negative quantity (-500)
- Row 4: Buyer and seller are the same ("Test Buyer Inc")

## Test Steps

### Given
1. I am on the Contract Import page
2. The upload zone is visible

### When
3. I upload the file `invalid-contracts.csv`
4. I wait for the validation to complete

### Then
5. I should see the results summary component
6. The summary should show "0 valid, 3 invalid"
7. I should NOT see a confirmation dialog
8. I should see detailed error messages for each invalid row

## Expected Results

### UI Verification
- ✅ No confirmation dialog appears
- ✅ Results summary shows correct error count
- ✅ Error banner is displayed
- ✅ Each invalid row is listed with specific errors

### Error Messages Verification

**Row 2 Errors**:
```
Row 2:
  ❌ Contract Number: Contract number is required (CN-001)
```

**Row 3 Errors**:
```
Row 3:
  ❌ Contract Date: Invalid date format. Expected YYYY-MM-DD (DF-001)
  ❌ Quantity: Quantity must be a positive number (BL-003)
```

**Row 4 Errors**:
```
Row 4:
  ❌ Business Rule: Buyer and seller cannot be the same (BL-001)
```

### Database Verification
```javascript
// Verify no contracts were created
const contracts = await Contract.find({ 
  contractNumber: { $regex: /^E2E-/ } 
});
expect(contracts).toHaveLength(0);
```

### Error Display Format
Each error should show:
- ✅ Row number
- ✅ Field name (if applicable)
- ✅ Error message (human-readable)
- ✅ Error code (e.g., CN-001, DF-001)
- ✅ Red error icon or styling

## Postconditions
- No contracts are created in the database
- User can upload a different file
- Error messages remain visible until user takes action
- User can click "Upload Another File" to try again

## Test Variations

### Variation 1: Fix Errors and Re-upload
**Steps**:
1. Note the validation errors
2. Click "Upload Another File"
3. Upload corrected version of the file
4. Verify validation passes

**Expected**: Corrected file validates successfully

### Variation 2: Multiple Error Types in One Row
**Steps**:
1. Upload CSV with row containing 3+ errors
2. Verify all errors are displayed for that row

**Expected**: All errors shown, not just the first one

## Error Code Reference

| Code | Description | Severity |
|------|-------------|----------|
| CN-001 | Contract number is required | Error |
| DF-001 | Invalid date format | Error |
| BL-003 | Quantity must be positive | Error |
| BL-001 | Buyer and seller cannot be same | Error |

## Related Test Cases
- TC-001: Successfully import valid contracts
- TC-004: Handle mixed valid and invalid rows
- TC-008: Validate business rules and show warnings
- TC-012: Display detailed validation results

## Notes
- This test verifies the validation layer is working correctly
- Should be included in smoke test suite
- Tests multiple error types in a single test case
- Verifies that validation prevents database writes

## Automation Script Reference
**Cypress**: `cypress/e2e/02-validation/01-validation-errors.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
