# E2E Test Plan for Contract Import Feature

## Executive Summary
This plan covers comprehensive end-to-end testing for the Contract Import feature of the Export Contract Generator application. The tests will validate complete user workflows from frontend UI interactions through backend API processing to database persistence.

## Application Architecture Analysis

### Technology Stack
- **Frontend**: React 18.2.0, React Router 6.21.0, Axios 1.6.2
- **Backend**: Express 4.18.2, Node.js
- **Database**: MongoDB with Mongoose 8.0.3
- **File Processing**: Multer 2.1.0, csv-parse 6.1.0
- **Testing**: Jest 30.2.0 (unit tests), mongodb-memory-server 11.0.1

### Application Flow
1. User navigates to Contract Import page
2. User downloads CSV template (optional)
3. User uploads CSV file via drag-and-drop or file picker
4. Frontend sends file to `/api/import/upload` with `confirm=false`
5. Backend parses, validates, and returns validation results
6. If valid, frontend shows confirmation dialog
7. User confirms import
8. Frontend sends file again with `confirm=true`
9. Backend executes import and creates contracts in database
10. Frontend displays import results summary

### Key Components
- **Frontend**: `ContractImportPage.js`, `ImportUploadZone.js`, `ImportResultsSummary.js`
- **Backend**: `importController.js`, `csvParserService.js`, `validationService.js`, `importExecutionService.js`
- **Database**: Contract, Party, Commodity, PaymentTerm, BankDetails models

### Authentication
- Currently NO authentication required (routes have auth middleware but it's not enforced)
- Tests can proceed without login flows

---

## Questions for Clarification

**[Question]** Which E2E testing framework should we use? Options: Cypress (best for React), Playwright (multi-browser), or Puppeteer (Chrome-only)?
**[Answer]** 

**[Question]** Should we test against a real MongoDB database or use mongodb-memory-server for E2E tests?
**[Answer]** 

**[Question]** Do we need to test multiple browsers (Chrome, Firefox, Safari) or just Chrome/Chromium?
**[Answer]** 

**[Question]** Should tests run in headless mode (CI/CD) or with visible browser (debugging)?
**[Answer]** 

**[Question]** Should we seed the database with reference data (parties, commodities, etc.) before each test, or test the "create new" flow?
**[Answer]** 

**[Question]** Do we need to test responsive design (mobile/tablet) or just desktop?
**[Answer]** 

**[Question]** Should we add `data-testid` attributes to components for reliable selectors, or use existing class names?
**[Answer]** 

**[Question]** What's the acceptable test execution time for the full E2E suite? (Typical: 5-10 minutes)
**[Answer]** 

**[Question]** Should tests run in parallel or sequentially to avoid database conflicts?
**[Answer]** 

**[Question]** Do we need to test file download (template) or focus on upload/import flows?
**[Answer]** 

---

## Test Scope

### Features to Test
- Contract Import workflow (Units 1-3)
- CSV template download
- File upload and validation
- Import confirmation dialog
- Import execution and results display
- Error handling and user feedback

### Testing Framework
**TBD** - Awaiting answer to Question 1

### Test Environment
- **Backend**: Express server running on localhost:5000
- **Frontend**: React dev server on localhost:3000 (proxied to backend)
- **Database**: TBD - Awaiting answer to Question 2
- **Browsers**: TBD - Awaiting answer to Question 3

### Out of Scope
- Authentication flows (not currently enforced)
- Contract CRUD operations (separate feature)
- Export/PDF generation features
- Performance/load testing
- Security testing (XSS, CSRF, etc.)

---

## Human-Readable Test Cases

### Test Case 1: Successfully Import Three Valid Contracts

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

---

### Test Case 2: Reject CSV File with Validation Errors

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

---

### Test Case 3: Reject Invalid File Formats

**Given** I am on the Contract Import page  
**When** I attempt to upload a .txt file  
**Then** I should see an error message "Invalid file format"  
**When** I attempt to upload a CSV file with more than 20 rows  
**Then** I should see an error message "File exceeds maximum 20 rows"  
**When** I attempt to upload a CSV file with missing required headers  
**Then** I should see an error message "Missing required headers"  
**When** I attempt to upload an empty CSV file  
**Then** I should see an error message "File is empty"

---

### Test Case 4: Handle Mixed Valid and Invalid Rows

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

---

### Test Case 5: Cancel Import After Validation

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing 2 valid contracts  
**And** I wait for the validation to complete  
**And** I see the confirmation dialog  
**When** I click the "Cancel" button  
**Then** the dialog should close  
**And** I should return to the upload zone  
**And** no contracts should be created in the database  
**And** I should be able to upload a different file

---

### Test Case 6: Handle Network Connection Errors

**Given** I am on the Contract Import page  
**And** the backend server is stopped  
**When** I attempt to upload a CSV file  
**Then** I should see an error message "Unable to connect to server"  
**And** I should be able to dismiss the error  
**When** the backend server is restarted  
**And** I upload the same file again  
**Then** the validation should complete successfully

---

### Test Case 7: Detect Duplicate Contract Numbers

**Given** I am on the Contract Import page  
**And** the database contains a contract with number "E2E-EXISTING"  
**When** I upload a CSV file containing:
- Row 1: Contract number "E2E-020"
- Row 2: Contract number "E2E-020" (duplicate within file)
- Row 3: Contract number "E2E-EXISTING" (duplicate with database)  
**And** I wait for the validation to complete  
**Then** I should see an error for Row 2 indicating duplicate within file  
**And** I should see an error for Row 3 indicating contract already exists  
**And** no contracts should be imported

---

### Test Case 8: Validate Business Rules and Show Warnings

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing:
- Row 1: Buyer and seller have the same name (error)
- Row 2: Contract date is more than 365 days in the future (warning)
- Row 3: Currency mismatch between contract and bank (warning)  
**And** I wait for the validation to complete  
**Then** I should see an error for Row 1 blocking the import  
**And** I should see warnings for Rows 2 and 3  
**And** rows with only warnings should be allowed to import  
**And** rows with errors should block the entire import

---

### Test Case 9: Automatically Create New Reference Data

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

---

### Test Case 10: Navigate Between Pages and Reset State

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

---

### Test Case 11: Download CSV Template

**Given** I am on the Contract Import page  
**When** I click the "Download Template" button  
**Then** a CSV file should be downloaded  
**And** the file should contain all required column headers  
**And** the file should contain one example row with sample data

---

### Test Case 12: Display Detailed Validation Results

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

---

### Test Case 13: Handle Large Files Within Limit

**Given** I am on the Contract Import page  
**When** I upload a CSV file containing exactly 20 contracts (the maximum)  
**And** I wait for validation to complete  
**Then** the validation should process all 20 rows  
**And** if all rows are valid, I should see a confirmation dialog  
**When** I confirm the import  
**Then** all 20 contracts should be created successfully

---

### Test Case 14: Verify Derived Field Calculations

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

---

### Test Case 15: Handle Special Characters in Data

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

---

## Test Scenarios

**Description**: User successfully downloads template, uploads valid CSV with 3 contracts, confirms import, and verifies contracts are created in database.

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Database is empty or has known state
- [ ] Reference data exists (parties, commodities, payment terms, bank details)

**Test Steps**:
- [ ] Step 1: Navigate to home page (http://localhost:3000)
- [ ] Step 2: Click "Import Contracts" button/link
- [ ] Step 3: Verify import page loads with upload zone visible
- [ ] Step 4: Click "Download Template" button
- [ ] Step 5: Verify CSV template file downloads successfully
- [ ] Step 6: Upload valid CSV file (3 contracts) via drag-and-drop or file picker
- [ ] Step 7: Verify loading spinner appears
- [ ] Step 8: Wait for validation to complete
- [ ] Step 9: Verify confirmation dialog appears showing "3 valid rows"
- [ ] Step 10: Click "Confirm Import" button
- [ ] Step 11: Verify loading spinner appears again
- [ ] Step 12: Wait for import to complete
- [ ] Step 13: Verify results summary shows "3 imported, 0 failed"
- [ ] Step 14: Verify success message is displayed
- [ ] Step 15: Query database to verify 3 contracts were created
- [ ] Step 16: Verify contract data matches CSV input

**Expected Results**:
- UI shows successful import with correct counts
- Database contains 3 new contracts with correct data
- All derived fields calculated correctly (totalAmount, quantityMin/Max, etc.)
- Timestamps (createdAt, updatedAt) are set
- References to parties, commodities, etc. are linked correctly

**Test Data**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-001,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-002,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
E2E-003,2026-03-17,Another Buyer,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,Special handling,ORIGINAL_BL,DRAFT
```

**Estimated Duration**: 30-45 seconds

---

### Scenario 2: Validation Errors - Invalid CSV Data

**Description**: User uploads CSV with validation errors (missing fields, invalid formats, business rule violations) and sees detailed error messages.

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Database has known state

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload CSV with validation errors (see test data below)
- [ ] Step 3: Verify loading spinner appears
- [ ] Step 4: Wait for validation to complete
- [ ] Step 5: Verify results summary shows validation errors
- [ ] Step 6: Verify error details are displayed for each invalid row
- [ ] Step 7: Verify specific error messages match expected errors
- [ ] Step 8: Verify no confirmation dialog appears
- [ ] Step 9: Verify no contracts are created in database
- [ ] Step 10: Click "Upload Another File" to reset

**Expected Results**:
- UI shows validation errors with row numbers
- Error messages are clear and actionable
- No contracts created in database
- User can upload a new file without page refresh

**Test Data** (3 rows with different error types):
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-005,invalid-date,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,-500,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-006,2026-03-15,Test Buyer Inc,Test Buyer Inc,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Errors**:
- Row 2: Missing contract number (CN-001)
- Row 3: Invalid date format, negative quantity
- Row 4: Buyer and seller are the same (BL-001)

**Estimated Duration**: 20-30 seconds

---

### Scenario 3: File-Level Errors - Invalid File Format

**Description**: User attempts to upload invalid files (wrong format, too large, missing headers) and sees appropriate error messages.

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Attempt to upload .txt file (wrong extension)
- [ ] Step 3: Verify error message: "Invalid file format" (F-001)
- [ ] Step 4: Attempt to upload CSV with > 20 rows
- [ ] Step 5: Verify error message: "File exceeds maximum 20 rows" (F-002)
- [ ] Step 6: Attempt to upload CSV with missing required headers
- [ ] Step 7: Verify error message: "Missing required headers" (F-004)
- [ ] Step 8: Attempt to upload empty CSV file
- [ ] Step 9: Verify error message: "File is empty" (F-005)

**Expected Results**:
- Clear error messages for each file-level error
- No API calls made for obviously invalid files (frontend validation)
- User can retry with valid file

**Test Data**:
- invalid.txt (text file)
- large.csv (21+ rows)
- missing-headers.csv (incomplete headers)
- empty.csv (0 bytes or header only)

**Estimated Duration**: 15-20 seconds

---

### Scenario 4: Partial Import - Mixed Valid and Invalid Rows

**Description**: User uploads CSV with both valid and invalid rows. System validates all rows, shows errors, and does NOT import any contracts (all-or-nothing validation).

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Database has known state

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload CSV with 5 rows (3 valid, 2 invalid)
- [ ] Step 3: Verify loading spinner appears
- [ ] Step 4: Wait for validation to complete
- [ ] Step 5: Verify results summary shows "3 valid, 2 invalid"
- [ ] Step 6: Verify error details for 2 invalid rows
- [ ] Step 7: Verify no confirmation dialog appears (due to errors)
- [ ] Step 8: Verify no contracts created in database
- [ ] Step 9: Fix errors in CSV and re-upload
- [ ] Step 10: Verify all 5 rows now valid
- [ ] Step 11: Confirm import
- [ ] Step 12: Verify 5 contracts created

**Expected Results**:
- Validation catches all errors before import
- No partial imports (all-or-nothing)
- Clear indication of which rows are invalid
- User can fix and re-upload

**Test Data**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-010,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-011,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
,2026-03-17,Test Buyer Inc,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,None,ORIGINAL_BL,DRAFT
E2E-013,2026-03-18,Test Buyer Inc,Test Seller Ltd,Wheat,Durum,1500,MT,7,Canada,Bulk,Standard,900,USD,FOB,Vancouver Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,June 2026,None,ORIGINAL_BL,DRAFT
E2E-014,invalid-date,NonExistent Buyer,Test Seller Ltd,Corn,Yellow Corn,800,MT,5,USA,Bags,Premium,1100,USD,FOB,New Orleans,LC 30 Days,Test Bank,Test Account,1234567890,TESTUS33,July 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Errors**:
- Row 3: Missing contract number
- Row 5: Invalid date format, non-existent buyer (if reference validation enabled)

**Estimated Duration**: 40-50 seconds

---

### Scenario 5: Cancel Import - User Cancels Confirmation

**Description**: User uploads valid CSV, sees confirmation dialog, but cancels instead of confirming. No contracts should be created.

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running
- [ ] Database has known state

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload valid CSV file (2 contracts)
- [ ] Step 3: Wait for validation to complete
- [ ] Step 4: Verify confirmation dialog appears
- [ ] Step 5: Click "Cancel" button
- [ ] Step 6: Verify dialog closes and returns to upload zone
- [ ] Step 7: Verify no contracts created in database
- [ ] Step 8: Verify user can upload a different file

**Expected Results**:
- Cancel button works correctly
- No contracts created
- UI resets to initial state
- No errors or warnings

**Estimated Duration**: 15-20 seconds

---

### Scenario 6: Network Error Handling

**Description**: Simulate network failures and verify graceful error handling.

**Preconditions**:
- [ ] Backend server is running (then stopped mid-test)
- [ ] Frontend server is running

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Stop backend server
- [ ] Step 3: Attempt to upload CSV file
- [ ] Step 4: Verify error message: "Unable to connect to server"
- [ ] Step 5: Verify user can dismiss error
- [ ] Step 6: Restart backend server
- [ ] Step 7: Upload same file again
- [ ] Step 8: Verify successful validation

**Expected Results**:
- Clear error message for network failures
- No application crash
- User can retry after error
- Graceful degradation

**Estimated Duration**: 20-30 seconds

---

### Scenario 7: Duplicate Contract Numbers

**Description**: User uploads CSV with duplicate contract numbers (within file and against database).

**Preconditions**:
- [ ] Backend server is running
- [ ] Database contains contract with number "E2E-EXISTING"

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload CSV with duplicate contract numbers (see test data)
- [ ] Step 3: Wait for validation to complete
- [ ] Step 4: Verify error for row with duplicate within file (CN-003)
- [ ] Step 5: Verify error for row with existing contract number (CN-002)
- [ ] Step 6: Verify no contracts imported

**Expected Results**:
- Duplicate detection works for both within-file and database duplicates
- Clear error messages with row numbers
- No contracts created

**Test Data**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-020,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-020,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
E2E-EXISTING,2026-03-17,Test Buyer Inc,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,None,ORIGINAL_BL,DRAFT
```

**Estimated Duration**: 20-25 seconds

---

### Scenario 8: Business Rule Validations and Warnings

**Description**: Test business logic validations (buyer ≠ seller) and warnings (currency mismatch, future dates).

**Preconditions**:
- [ ] Backend server is running
- [ ] Database has known state

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload CSV with business rule violations (see test data)
- [ ] Step 3: Wait for validation to complete
- [ ] Step 4: Verify error for buyer === seller (BL-001)
- [ ] Step 5: Verify warning for future date > 365 days (BL-004)
- [ ] Step 6: Verify warning for currency mismatch (CF-001)
- [ ] Step 7: Verify rows with only warnings can still be imported
- [ ] Step 8: Verify rows with errors cannot be imported

**Expected Results**:
- Errors block import
- Warnings allow import but show user notification
- Clear distinction between errors and warnings in UI

**Test Data**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-030,2026-03-15,Test Buyer Inc,Test Buyer Inc,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-031,2027-06-15,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,EUR,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2027,None,TELEX_RELEASE,ACTIVE
```

**Expected Errors/Warnings**:
- Row 2: Error - Buyer and seller are the same (BL-001)
- Row 3: Warning - Contract date > 365 days in future (BL-004)
- Row 3: Warning - Currency EUR doesn't match bank currency USD (CF-001)

**Estimated Duration**: 25-30 seconds

---

### Scenario 9: Reference Data Resolution - Create New Entities

**Description**: Test automatic creation of new parties, commodities, payment terms when they don't exist in database.

**Preconditions**:
- [ ] Backend server is running
- [ ] Database has minimal reference data (or empty)

**Test Steps**:
- [ ] Step 1: Navigate to import page
- [ ] Step 2: Upload CSV with new party names, commodity names, etc.
- [ ] Step 3: Wait for validation to complete
- [ ] Step 4: Verify validation passes (no reference data errors)
- [ ] Step 5: Confirm import
- [ ] Step 6: Wait for import to complete
- [ ] Step 7: Verify contracts created successfully
- [ ] Step 8: Query database to verify new parties were created
- [ ] Step 9: Query database to verify new commodities were created
- [ ] Step 10: Query database to verify new payment terms were created
- [ ] Step 11: Query database to verify new bank details were created

**Expected Results**:
- System automatically creates missing reference data
- Contracts link to newly created entities
- All entities have correct isActive status
- No validation errors for missing reference data

**Test Data**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-040,2026-03-15,Brand New Buyer Corp,Brand New Seller LLC,Exotic Spice,Rare Spice Blend,100,KG,2,Madagascar,Sealed Containers,Premium,5000,USD,CIF,Antananarivo Port,Advance Payment 100%,New Bank International,New Account,9876543210,NEWBUS44,March 2026,Handle with care,ORIGINAL_BL,DRAFT
```

**Estimated Duration**: 30-40 seconds

---

### Scenario 10: UI Navigation and State Management

**Description**: Test navigation between pages and state persistence.

**Preconditions**:
- [ ] Backend server is running
- [ ] Frontend server is running

**Test Steps**:
- [ ] Step 1: Navigate to home page
- [ ] Step 2: Click "Import Contracts" to go to import page
- [ ] Step 3: Upload valid CSV file
- [ ] Step 4: Wait for validation
- [ ] Step 5: Click "Back" button (before confirming)
- [ ] Step 6: Verify navigation to home page
- [ ] Step 7: Verify no contracts created
- [ ] Step 8: Navigate back to import page
- [ ] Step 9: Verify page is in initial state (no file selected)
- [ ] Step 10: Upload and confirm import
- [ ] Step 11: Verify results summary displayed
- [ ] Step 12: Click "Upload Another File" button
- [ ] Step 13: Verify page resets to initial state

**Expected Results**:
- Navigation works correctly
- State resets appropriately
- No memory leaks or stale data
- Back button behavior is intuitive

**Estimated Duration**: 30-40 seconds

---

## Test Data Management Strategy

### Reference Data Seeding
Before each test suite, seed database with:
- **Parties**: 5 buyers, 5 sellers (mix of active/inactive)
- **Commodities**: 10 commodities with different units
- **Payment Terms**: 5 payment terms (LC, TT, etc.)
- **Bank Details**: 3 banks with different currencies

### Test Data Isolation
- Use unique contract numbers per test (E2E-001, E2E-002, etc.)
- Prefix test data with "E2E-" or "TEST-" for easy cleanup
- Clean up test data after each test
- Use factories for generating test CSV files

### Test Data Files
Create fixture files in `e2e/fixtures/`:
- `valid-contracts.csv` - 3 valid contracts
- `invalid-contracts.csv` - 3 invalid contracts
- `mixed-contracts.csv` - 5 contracts (3 valid, 2 invalid)
- `duplicate-contracts.csv` - contracts with duplicates
- `business-rule-violations.csv` - buyer === seller, etc.
- `large-file.csv` - 21 rows (exceeds limit)
- `missing-headers.csv` - incomplete headers
- `empty-file.csv` - empty or header-only

---

## Environment Setup Requirements

### Prerequisites
- Node.js 18+ (current project uses Node 18+)
- MongoDB running locally or mongodb-memory-server
- npm or yarn package manager

### Installation Steps
```bash
# Install E2E testing framework (TBD based on answers)
# Option 1: Cypress
npm install --save-dev cypress @testing-library/cypress

# Option 2: Playwright
npm install --save-dev @playwright/test

# Option 3: Puppeteer
npm install --save-dev puppeteer jest-puppeteer
```

### Configuration Files
- `cypress.config.js` or `playwright.config.js` or `jest-puppeteer.config.js`
- Environment variables in `.env.test`
- Test data fixtures in `e2e/fixtures/`
- Helper utilities in `e2e/helpers/`

### Database Setup
```javascript
// e2e/helpers/dbSetup.js
async function seedDatabase() {
  // Create reference data
  await Party.insertMany([...]);
  await Commodity.insertMany([...]);
  await PaymentTerm.insertMany([...]);
  await BankDetails.insertMany([...]);
}

async function cleanupDatabase() {
  // Remove test data
  await Contract.deleteMany({ contractNumber: /^E2E-/ });
  await Party.deleteMany({ name: /^E2E-/ });
  // ... etc
}
```

### Server Management
```javascript
// e2e/helpers/serverSetup.js
let serverProcess;
let clientProcess;

async function startServers() {
  // Start backend server
  serverProcess = spawn('npm', ['run', 'server']);
  
  // Start frontend server
  clientProcess = spawn('npm', ['run', 'client']);
  
  // Wait for servers to be ready
  await waitForServer('http://localhost:5000/api/health');
  await waitForServer('http://localhost:3000');
}

async function stopServers() {
  serverProcess.kill();
  clientProcess.kill();
}
```

---

## Page Object Pattern

### Example: Import Page Object
```javascript
// e2e/pages/ImportPage.js
class ImportPage {
  constructor(page) {
    this.page = page;
    
    // Selectors (will need data-testid attributes)
    this.backButton = '[data-testid="back-button"]';
    this.downloadTemplateBtn = '[data-testid="download-template"]';
    this.uploadZone = '[data-testid="upload-zone"]';
    this.fileInput = 'input[type="file"]';
    this.uploadButton = '[data-testid="upload-button"]';
    this.loadingSpinner = '[data-testid="loading-spinner"]';
    this.confirmDialog = '[data-testid="confirm-dialog"]';
    this.confirmButton = '[data-testid="confirm-button"]';
    this.cancelButton = '[data-testid="cancel-button"]';
    this.resultsSummary = '[data-testid="results-summary"]';
    this.errorBanner = '[data-testid="error-banner"]';
    this.uploadAnotherButton = '[data-testid="upload-another"]';
  }

  async navigate() {
    await this.page.goto('http://localhost:3000');
    await this.page.click('[data-testid="import-link"]');
  }

  async downloadTemplate() {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.page.click(this.downloadTemplateBtn)
    ]);
    return download;
  }

  async uploadFile(filePath) {
    await this.page.setInputFiles(this.fileInput, filePath);
    await this.page.click(this.uploadButton);
  }

  async waitForValidation() {
    await this.page.waitForSelector(this.loadingSpinner, { state: 'visible' });
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden' });
  }

  async confirmImport() {
    await this.page.click(this.confirmButton);
  }

  async cancelImport() {
    await this.page.click(this.cancelButton);
  }

  async getResultsSummary() {
    const summary = await this.page.textContent(this.resultsSummary);
    return summary;
  }

  async getErrorMessage() {
    const error = await this.page.textContent(this.errorBanner);
    return error;
  }

  async uploadAnother() {
    await this.page.click(this.uploadAnotherButton);
  }
}

module.exports = ImportPage;
```

---

## API Helper Pattern

```javascript
// e2e/helpers/apiHelper.js
const axios = require('axios');

class ApiHelper {
  constructor(baseURL = 'http://localhost:5000') {
    this.client = axios.create({ baseURL });
  }

  async getContracts(filter = {}) {
    const response = await this.client.get('/api/contracts', { params: filter });
    return response.data;
  }

  async getContractByNumber(contractNumber) {
    const contracts = await this.getContracts({ contractNumber });
    return contracts[0];
  }

  async deleteContract(id) {
    await this.client.delete(`/api/contracts/${id}`);
  }

  async createParty(partyData) {
    const response = await this.client.post('/api/parties', partyData);
    return response.data;
  }

  async cleanupTestData() {
    // Delete all test contracts
    const contracts = await this.getContracts({ contractNumber: /^E2E-/ });
    for (const contract of contracts) {
      await this.deleteContract(contract._id);
    }
  }

  async healthCheck() {
    const response = await this.client.get('/api/health');
    return response.data.status === 'OK';
  }
}

module.exports = ApiHelper;
```

---

## Test Data Factory Pattern

```javascript
// e2e/factories/csvFactory.js
const fs = require('fs');
const path = require('path');

class CsvFactory {
  static createValidContract(overrides = {}) {
    const defaults = {
      contractNumber: `E2E-${Date.now()}`,
      contractDate: '2026-03-15',
      buyerName: 'Test Buyer Inc',
      sellerName: 'Test Seller Ltd',
      commodityName: 'Coffee Beans',
      commodityDescription: 'Arabica Grade A',
      quantity: '1000',
      unit: 'MT',
      tolerance: '5',
      origin: 'Brazil',
      packing: 'Jute Bags',
      qualitySpec: 'Premium',
      unitPrice: '2500',
      currency: 'USD',
      incoterm: 'FOB',
      portLocation: 'Santos Port',
      paymentTermName: 'LC at Sight',
      bankName: 'Test Bank',
      accountName: 'Test Account',
      accountNumber: '1234567890',
      swiftCode: 'TESTUS33',
      shipmentPeriod: 'March 2026',
      additionalTerms: 'None',
      releaseType: 'ORIGINAL_BL',
      status: 'DRAFT'
    };
    return { ...defaults, ...overrides };
  }

  static createInvalidContract(errorType) {
    const base = this.createValidContract();
    
    switch (errorType) {
      case 'missing-contract-number':
        base.contractNumber = '';
        break;
      case 'invalid-date':
        base.contractDate = 'invalid-date';
        break;
      case 'negative-quantity':
        base.quantity = '-500';
        break;
      case 'buyer-equals-seller':
        base.sellerName = base.buyerName;
        break;
      case 'invalid-swift':
        base.swiftCode = '123';
        break;
      default:
        throw new Error(`Unknown error type: ${errorType}`);
    }
    
    return base;
  }

  static generateCsvFile(contracts, filename) {
    const headers = [
      'contractNumber', 'contractDate', 'buyerName', 'sellerName',
      'commodityName', 'commodityDescription', 'quantity', 'unit',
      'tolerance', 'origin', 'packing', 'qualitySpec', 'unitPrice',
      'currency', 'incoterm', 'portLocation', 'paymentTermName',
      'bankName', 'accountName', 'accountNumber', 'swiftCode',
      'shipmentPeriod', 'additionalTerms', 'releaseType', 'status'
    ];

    const rows = contracts.map(contract => 
      headers.map(h => contract[h] || '').join(',')
    );

    const csv = [headers.join(','), ...rows].join('\n');
    const filePath = path.join(__dirname, '../fixtures', filename);
    
    fs.writeFileSync(filePath, csv, 'utf8');
    return filePath;
  }

  static createValidCsvFile(count = 3) {
    const contracts = Array.from({ length: count }, (_, i) => 
      this.createValidContract({ contractNumber: `E2E-${Date.now()}-${i}` })
    );
    return this.generateCsvFile(contracts, `valid-${Date.now()}.csv`);
  }

  static createInvalidCsvFile(errorTypes = ['missing-contract-number']) {
    const contracts = errorTypes.map(type => this.createInvalidContract(type));
    return this.generateCsvFile(contracts, `invalid-${Date.now()}.csv`);
  }

  static createMixedCsvFile(validCount = 3, invalidCount = 2) {
    const validContracts = Array.from({ length: validCount }, (_, i) => 
      this.createValidContract({ contractNumber: `E2E-VALID-${i}` })
    );
    const invalidContracts = [
      this.createInvalidContract('missing-contract-number'),
      this.createInvalidContract('buyer-equals-seller')
    ];
    return this.generateCsvFile([...validContracts, ...invalidContracts], `mixed-${Date.now()}.csv`);
  }
}

module.exports = CsvFactory;
```

---

## Example E2E Test (Playwright)

```javascript
// e2e/tests/import.spec.js
const { test, expect } = require('@playwright/test');
const ImportPage = require('../pages/ImportPage');
const ApiHelper = require('../helpers/apiHelper');
const CsvFactory = require('../factories/csvFactory');
const { seedDatabase, cleanupDatabase } = require('../helpers/dbSetup');

test.describe('Contract Import E2E Tests', () => {
  let importPage;
  let apiHelper;

  test.beforeAll(async () => {
    // Seed reference data
    await seedDatabase();
  });

  test.afterAll(async () => {
    // Cleanup all test data
    await cleanupDatabase();
  });

  test.beforeEach(async ({ page }) => {
    importPage = new ImportPage(page);
    apiHelper = new ApiHelper();
    
    // Navigate to import page
    await importPage.navigate();
  });

  test.afterEach(async () => {
    // Cleanup test contracts after each test
    await apiHelper.cleanupTestData();
  });

  test('Scenario 1: Complete happy path - import valid contracts', async () => {
    // Arrange
    const csvFile = CsvFactory.createValidCsvFile(3);

    // Act - Upload file
    await importPage.uploadFile(csvFile);
    await importPage.waitForValidation();

    // Assert - Confirmation dialog appears
    await expect(importPage.page.locator(importPage.confirmDialog)).toBeVisible();
    const dialogText = await importPage.page.textContent(importPage.confirmDialog);
    expect(dialogText).toContain('3');

    // Act - Confirm import
    await importPage.confirmImport();
    await importPage.waitForValidation();

    // Assert - Results summary shows success
    const summary = await importPage.getResultsSummary();
    expect(summary).toContain('3 imported');
    expect(summary).toContain('0 failed');

    // Assert - Verify database
    const contracts = await apiHelper.getContracts({ contractNumber: /^E2E-/ });
    expect(contracts.length).toBe(3);
    
    // Verify first contract data
    const contract = contracts[0];
    expect(contract.buyerName).toBe('Test Buyer Inc');
    expect(contract.quantity).toBe(1000);
    expect(contract.totalAmount).toBe(2500000); // 1000 * 2500
  });

  test('Scenario 2: Validation errors - invalid CSV data', async () => {
    // Arrange
    const csvFile = CsvFactory.createInvalidCsvFile([
      'missing-contract-number',
      'invalid-date',
      'buyer-equals-seller'
    ]);

    // Act
    await importPage.uploadFile(csvFile);
    await importPage.waitForValidation();

    // Assert - No confirmation dialog
    await expect(importPage.page.locator(importPage.confirmDialog)).not.toBeVisible();

    // Assert - Results show errors
    const summary = await importPage.getResultsSummary();
    expect(summary).toContain('3 invalid');

    // Assert - No contracts created
    const contracts = await apiHelper.getContracts({ contractNumber: /^E2E-/ });
    expect(contracts.length).toBe(0);
  });

  test('Scenario 5: Cancel import - user cancels confirmation', async () => {
    // Arrange
    const csvFile = CsvFactory.createValidCsvFile(2);

    // Act
    await importPage.uploadFile(csvFile);
    await importPage.waitForValidation();
    await importPage.cancelImport();

    // Assert - Back to upload zone
    await expect(importPage.page.locator(importPage.uploadZone)).toBeVisible();

    // Assert - No contracts created
    const contracts = await apiHelper.getContracts({ contractNumber: /^E2E-/ });
    expect(contracts.length).toBe(0);
  });

  // ... more tests
});
```

---

## Selector Strategy & Component Updates

### Adding data-testid Attributes

To make tests reliable and maintainable, we should add `data-testid` attributes to key UI elements. This requires minimal changes to React components:

#### ContractImportPage.js Updates
```javascript
// Back button
<button data-testid="back-button" onClick={onBack}>← Back</button>

// Title
<h2 data-testid="import-title">Import Contracts</h2>
```

#### ImportUploadZone.js Updates
```javascript
// Upload zone container
<div data-testid="upload-zone">
  
// Download template button
<button data-testid="download-template" onClick={handleDownloadTemplate}>
  Download Template
</button>

// File input
<input 
  data-testid="file-input"
  type="file" 
  accept=".csv"
/>

// Upload button
<button data-testid="upload-button" onClick={onUpload}>
  Upload and Validate
</button>

// File error message
<div data-testid="file-error">{fileError}</div>
```

#### ImportLoadingSpinner.js Updates
```javascript
<div data-testid="loading-spinner">
  <div>Processing...</div>
</div>
```

#### ImportConfirmDialog.js Updates
```javascript
<div data-testid="confirm-dialog">
  <p data-testid="confirm-message">
    Ready to import {rowCount} contracts?
  </p>
  <button data-testid="confirm-button" onClick={onConfirm}>
    Confirm Import
  </button>
  <button data-testid="cancel-button" onClick={onCancel}>
    Cancel
  </button>
</div>
```

#### ImportResultsSummary.js Updates
```javascript
<div data-testid="results-summary">
  <div data-testid="import-stats">
    {summary.importedRows} imported, {summary.failedRows} failed
  </div>
  <div data-testid="row-details">
    {/* Row-by-row results */}
  </div>
  <button data-testid="upload-another" onClick={onReset}>
    Upload Another File
  </button>
</div>
```

#### ImportErrorBanner.js Updates
```javascript
<div data-testid="error-banner">
  <p data-testid="error-message">{message}</p>
  <button data-testid="dismiss-error" onClick={onDismiss}>
    Dismiss
  </button>
</div>
```

### Selector Hierarchy
```
[data-testid="import-page"]
├── [data-testid="back-button"]
├── [data-testid="import-title"]
├── [data-testid="upload-zone"]
│   ├── [data-testid="download-template"]
│   ├── [data-testid="file-input"]
│   ├── [data-testid="upload-button"]
│   └── [data-testid="file-error"]
├── [data-testid="loading-spinner"]
├── [data-testid="confirm-dialog"]
│   ├── [data-testid="confirm-message"]
│   ├── [data-testid="confirm-button"]
│   └── [data-testid="cancel-button"]
├── [data-testid="results-summary"]
│   ├── [data-testid="import-stats"]
│   ├── [data-testid="row-details"]
│   └── [data-testid="upload-another"]
└── [data-testid="error-banner"]
    ├── [data-testid="error-message"]
    └── [data-testid="dismiss-error"]
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          npm ci --prefix client
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Build frontend
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          MONGODB_URI: mongodb://localhost:27017/test-db
          NODE_ENV: test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
      
      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: e2e/screenshots/
```

### Package.json Scripts
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## Framework-Specific Configurations

### Option 1: Playwright Configuration

```javascript
// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false, // Run sequentially to avoid DB conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid DB conflicts
  reporter: [
    ['html'],
    ['json', { outputFile: 'e2e/results/results.json' }],
    ['junit', { outputFile: 'e2e/results/junit.xml' }]
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for multi-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  webServer: [
    {
      command: 'npm run server',
      port: 5000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run client',
      port: 3000,
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
    }
  ],
});
```

### Option 2: Cypress Configuration

```javascript
// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'e2e/tests/**/*.cy.js',
    supportFile: 'e2e/support/e2e.js',
    fixturesFolder: 'e2e/fixtures',
    screenshotsFolder: 'e2e/screenshots',
    videosFolder: 'e2e/videos',
    
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        async seedDatabase() {
          // Seed database logic
          return null;
        },
        async cleanupDatabase() {
          // Cleanup logic
          return null;
        }
      });
    },
    
    env: {
      apiUrl: 'http://localhost:5000/api',
      mongoUri: 'mongodb://localhost:27017/test-db'
    },
    
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    
    viewportWidth: 1280,
    viewportHeight: 720
  },
});
```

### Option 3: Puppeteer Configuration

```javascript
// jest-puppeteer.config.js
module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    devtools: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  },
  browserContext: 'default',
  server: [
    {
      command: 'npm run server',
      port: 5000,
      launchTimeout: 120000,
      debug: true
    },
    {
      command: 'npm run client',
      port: 3000,
      launchTimeout: 120000,
      debug: true
    }
  ]
};

// jest.e2e.config.js
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/e2e/tests/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.js'],
  globalSetup: '<rootDir>/e2e/globalSetup.js',
  globalTeardown: '<rootDir>/e2e/globalTeardown.js'
};
```

---

## Best Practices & Guidelines

### Waiting Strategies
```javascript
// ❌ Bad - Hard-coded delays
await page.waitForTimeout(5000);

// ✅ Good - Wait for specific conditions
await page.waitForSelector('[data-testid="results-summary"]', { state: 'visible' });
await page.waitForLoadState('networkidle');
await page.waitForResponse(response => 
  response.url().includes('/api/import/upload') && response.status() === 200
);
```

### Error Handling
```javascript
// Wrap tests in try-catch for better debugging
test('import contracts', async ({ page }) => {
  try {
    await importPage.uploadFile(csvFile);
    await importPage.waitForValidation();
    // ... test steps
  } catch (error) {
    // Take screenshot on error
    await page.screenshot({ path: `error-${Date.now()}.png`, fullPage: true });
    console.error('Test failed:', error);
    throw error;
  }
});
```

### Test Independence
```javascript
// Each test should be independent
test.beforeEach(async () => {
  // Reset database state
  await cleanupDatabase();
  await seedDatabase();
  
  // Clear browser state
  await page.goto('about:blank');
  await page.context().clearCookies();
  await page.context().clearPermissions();
});
```

### Assertions
```javascript
// Use specific assertions
await expect(page.locator('[data-testid="import-stats"]'))
  .toHaveText(/3 imported, 0 failed/);

// Verify multiple conditions
const summary = await importPage.getResultsSummary();
expect(summary).toContain('3 imported');
expect(summary).toContain('0 failed');
expect(summary).not.toContain('error');

// Verify database state
const contracts = await apiHelper.getContracts({ contractNumber: /^E2E-/ });
expect(contracts).toHaveLength(3);
expect(contracts[0]).toMatchObject({
  buyerName: 'Test Buyer Inc',
  quantity: 1000,
  status: 'DRAFT'
});
```

### Performance Optimization
```javascript
// Reuse browser context
test.describe.configure({ mode: 'serial' });

// Use API for setup when possible
test.beforeEach(async () => {
  // Instead of clicking through UI to create data
  await apiHelper.createParty({ name: 'Test Buyer Inc' });
  await apiHelper.createCommodity({ name: 'Coffee Beans' });
});

// Parallel execution for independent tests
test.describe.configure({ mode: 'parallel' });
```

---

