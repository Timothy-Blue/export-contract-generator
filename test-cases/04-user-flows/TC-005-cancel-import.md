# TC-005: Cancel Import After Validation

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-005 |
| **Category** | User Flows |
| **Priority** | Medium |
| **Estimated Duration** | 15-20 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that a user can cancel the import process after validation completes, and that no contracts are created when the import is cancelled.

## Preconditions
- Backend server is running
- Frontend server is running
- Database is accessible

## Test Data
**File**: `cypress/fixtures/valid-contracts.csv` (2 rows)

## Test Steps

### Given
1. I am on the Contract Import page
2. Database has known state (no E2E-001, E2E-002 contracts)

### When
3. I upload a valid CSV file containing 2 contracts
4. I wait for validation to complete

### Then
5. I should see the confirmation dialog
6. The dialog should show "2 valid rows ready to import"

### When
7. I click the "Cancel" button in the confirmation dialog

### Then
8. The confirmation dialog should close
9. I should return to the upload zone (initial state)
10. The upload zone should be empty (no file selected)
11. I should see the "Upload CSV" button enabled

### Database Verification
12. Query database for contracts E2E-001 and E2E-002
13. No contracts should exist

## Expected Results

### UI Behavior
- ✅ Confirmation dialog closes immediately
- ✅ Returns to upload zone
- ✅ No error messages displayed
- ✅ Upload zone is in initial state
- ✅ "Download Template" button is visible
- ✅ "Upload CSV" button is enabled
- ✅ No loading spinners visible

### Database Verification
```javascript
const contracts = await Contract.find({ 
  contractNumber: { $in: ['E2E-001', 'E2E-002'] } 
});
expect(contracts).toHaveLength(0);
```

### State Management
- ✅ File selection is cleared
- ✅ Validation results are cleared
- ✅ No residual state from cancelled import
- ✅ User can upload a different file

## Postconditions
- No contracts created in database
- Application is in initial state
- User can upload a new file
- No memory leaks or stale data

## Test Variations

### Variation 1: Cancel and Upload Different File
**Steps**:
1. Upload file A (2 contracts)
2. See confirmation dialog
3. Click Cancel
4. Upload file B (3 contracts)
5. Confirm import

**Expected**: Only file B's 3 contracts are imported

### Variation 2: Cancel Multiple Times
**Steps**:
1. Upload file, cancel
2. Upload same file again, cancel
3. Upload same file third time, confirm

**Expected**: All cancels work correctly, final import succeeds

### Variation 3: Cancel with Warnings
**Steps**:
1. Upload file with warnings (but no errors)
2. See confirmation dialog with warnings
3. Click Cancel

**Expected**: Cancel works, no contracts created despite warnings

## User Experience Verification
- ✅ Cancel button is clearly visible
- ✅ Cancel button has appropriate styling
- ✅ No confirmation prompt for cancellation (single click)
- ✅ Smooth transition back to upload zone
- ✅ No confusing messages or states

## Related Test Cases
- TC-001: Successfully import valid contracts
- TC-010: Navigate between pages and reset state
- TC-008: Validate business rules and show warnings

## Notes
- Cancel should be instant (no API call needed)
- Important for user control and data integrity
- Tests state management and cleanup
- Should not leave application in inconsistent state

## Automation Script Reference
**Cypress**: `cypress/e2e/04-user-flows/01-cancel-import.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
