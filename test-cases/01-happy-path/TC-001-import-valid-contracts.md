# TC-001: Successfully Import Three Valid Contracts

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-001 |
| **Category** | Happy Path |
| **Priority** | High |
| **Estimated Duration** | 30-45 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that a user can successfully upload a CSV file containing 3 valid contracts, validate them, confirm the import, and see the contracts created in the database with all derived fields calculated correctly.

## Preconditions
- Backend server is running on localhost:5000
- Frontend server is running on localhost:3000
- Database is accessible and contains reference data:
  - Parties: Test Buyer Inc, Test Seller Ltd
  - Commodities: Coffee Beans, Tea Leaves, Rice
  - Payment Terms: LC at Sight, TT 30 Days, LC 60 Days
  - Bank Details: Test Bank with USD currency

## Test Data
**File**: `cypress/fixtures/valid-contracts.csv`

**Contents**: 3 valid contracts with the following data:
- Contract 1: Coffee Beans, 1000 MT, $2500/MT, 5% tolerance
- Contract 2: Tea Leaves, 500 MT, $1800/MT, 3% tolerance
- Contract 3: Rice, 2000 MT, $1200/MT, 10% tolerance

## Test Steps

### Given
1. I am on the Contract Import page (http://localhost:3000/import)
2. The database contains the required reference data
3. No contracts with numbers E2E-001, E2E-002, E2E-003 exist

### When
4. I upload the file `valid-contracts.csv` via drag-and-drop or file picker
5. I wait for the validation to complete (loading spinner disappears)

### Then
6. I should see a confirmation dialog
7. The dialog should display "3 valid rows ready to import"
8. The dialog should show "0 errors, 0 warnings"

### When
9. I click the "Confirm Import" button
10. I wait for the import to complete (loading spinner disappears)

### Then
11. I should see the results summary component
12. The summary should show "3 imported, 0 failed"
13. The summary should display a success message
14. Each row should show status "✓ Imported successfully"

## Expected Results

### UI Verification
- ✅ Confirmation dialog appears after validation
- ✅ Dialog shows correct count of valid rows
- ✅ Results summary shows correct import statistics
- ✅ Success message is displayed
- ✅ No error messages are shown

### Database Verification
Query the database to verify:

**Contract 1 (E2E-001)**
```javascript
{
  contractNumber: "E2E-001",
  contractDate: "2026-03-15",
  buyer: ObjectId (reference to "Test Buyer Inc"),
  seller: ObjectId (reference to "Test Seller Ltd"),
  commodity: ObjectId (reference to "Coffee Beans"),
  quantity: 1000,
  unit: "MT",
  tolerance: 5,
  unitPrice: 2500,
  currency: "USD",
  totalAmount: 2500000,  // 1000 * 2500
  quantityMin: 950,      // 1000 - 5%
  quantityMax: 1050,     // 1000 + 5%
  status: "DRAFT",
  createdAt: <valid timestamp>,
  updatedAt: <valid timestamp>
}
```

**Contract 2 (E2E-002)**
```javascript
{
  contractNumber: "E2E-002",
  totalAmount: 900000,   // 500 * 1800
  quantityMin: 485,      // 500 - 3%
  quantityMax: 515,      // 500 + 3%
  status: "ACTIVE"
}
```

**Contract 3 (E2E-003)**
```javascript
{
  contractNumber: "E2E-003",
  totalAmount: 2400000,  // 2000 * 1200
  quantityMin: 1800,     // 2000 - 10%
  quantityMax: 2200,     // 2000 + 10%
  status: "DRAFT"
}
```

### Derived Fields Verification
- ✅ `totalAmount` = quantity × unitPrice
- ✅ `quantityMin` = quantity × (1 - tolerance/100)
- ✅ `quantityMax` = quantity × (1 + tolerance/100)
- ✅ `createdAt` and `updatedAt` are valid timestamps
- ✅ All references (buyer, seller, commodity, etc.) are properly linked

## Postconditions
- 3 new contracts exist in the database
- User can navigate to contract list and see the imported contracts
- User can click "Upload Another File" to import more contracts

## Cleanup
After test execution:
```javascript
// Delete test contracts
await Contract.deleteMany({ 
  contractNumber: { $in: ['E2E-001', 'E2E-002', 'E2E-003'] } 
});
```

## Related Test Cases
- TC-004: Handle mixed valid and invalid rows
- TC-009: Automatically create new reference data
- TC-014: Verify derived field calculations

## Notes
- This is the primary happy path test case
- Should be included in smoke test suite
- Verifies end-to-end functionality from upload to database persistence
- Tests both frontend UI and backend processing

## Automation Script Reference
**Cypress**: `cypress/e2e/01-happy-path/01-import-valid-contracts.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
