# TC-007: Detect Duplicate Contract Numbers

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-007 |
| **Category** | Business Rules |
| **Priority** | High |
| **Estimated Duration** | 20-25 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that the system detects and prevents duplicate contract numbers both within the uploaded file and against existing contracts in the database.

## Preconditions
- Backend server is running
- Frontend server is running
- Database contains a contract with number "E2E-EXISTING"

## Test Data
**File**: `cypress/fixtures/duplicate-contracts.csv`

**Contents**: 3 contracts
- Row 2: Contract number "E2E-020" (first occurrence)
- Row 3: Contract number "E2E-020" (duplicate within file)
- Row 4: Contract number "E2E-EXISTING" (exists in database)

## Test Steps

### Given
1. I am on the Contract Import page
2. Database contains a contract with number "E2E-EXISTING"
3. Database does NOT contain contract "E2E-020"

### When
4. I upload `duplicate-contracts.csv`
5. I wait for validation to complete

### Then
6. I should see results summary showing "0 valid, 3 invalid"
7. I should see error for Row 3: "Duplicate contract number within file" (CN-003)
8. I should see error for Row 4: "Contract number already exists" (CN-002)
9. No contracts should be imported

## Expected Results

### Error Messages

**Row 3 Error**:
```
Row 3:
  ❌ Contract Number: Duplicate contract number 'E2E-020' found in row 2 (CN-003)
```

**Row 4 Error**:
```
Row 4:
  ❌ Contract Number: Contract number 'E2E-EXISTING' already exists in database (CN-002)
```

### Database Verification
```javascript
// Verify no new contracts created
const newContracts = await Contract.find({ 
  contractNumber: 'E2E-020'
});
expect(newContracts).toHaveLength(0);

// Verify existing contract unchanged
const existing = await Contract.findOne({ 
  contractNumber: 'E2E-EXISTING'
});
expect(existing).toBeDefined();
```

### UI Verification
- ✅ Clear error messages with row references
- ✅ Both duplicate types detected (within-file and database)
- ✅ No confirmation dialog appears
- ✅ Import is blocked

## Postconditions
- No new contracts created
- Existing contract "E2E-EXISTING" remains unchanged
- User can fix duplicates and re-upload

## Test Variations

### Variation 1: Multiple Duplicates Within File
**Test Data**: 5 rows with 3 using same contract number
```
E2E-030 (row 2)
E2E-030 (row 3) - duplicate
E2E-031 (row 4)
E2E-030 (row 5) - duplicate
E2E-032 (row 6)
```

**Expected**: Errors on rows 3 and 5, both referencing row 2

### Variation 2: Case Sensitivity
**Test Data**:
```
E2E-040 (row 2)
e2e-040 (row 3) - lowercase
```

**Expected**: Should be treated as duplicate (case-insensitive)

### Variation 3: Whitespace Handling
**Test Data**:
```
E2E-050 (row 2)
E2E-050  (row 3) - with trailing space
 E2E-050 (row 4) - with leading space
```

**Expected**: Should be treated as duplicates after trimming

## Error Code Reference

| Code | Description | Check Type |
|------|-------------|------------|
| CN-002 | Contract number already exists | Database check |
| CN-003 | Duplicate within file | File check |

## Related Test Cases
- TC-001: Successfully import valid contracts
- TC-002: Reject CSV file with validation errors
- TC-008: Validate business rules and show warnings

## Notes
- Duplicate detection is critical for data integrity
- Should check both within-file and database duplicates
- Contract numbers should be case-insensitive
- Whitespace should be trimmed before comparison
- Should be included in smoke test suite

## Automation Script Reference
**Cypress**: `cypress/e2e/03-business-rules/01-duplicate-detection.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
