# TC-003: Reject Invalid File Formats

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-003 |
| **Category** | Validation |
| **Priority** | High |
| **Estimated Duration** | 15-20 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that the system rejects files with invalid formats, sizes, or structures before processing, providing clear error messages to the user.

## Preconditions
- Frontend server is running on localhost:3000
- Backend server is running on localhost:5000
- User has access to the Contract Import page

## Test Data Files

| File | Purpose | Expected Error |
|------|---------|----------------|
| `invalid.txt` | Wrong file extension | F-001: Invalid file format |
| `large-file.csv` | 21+ rows | F-002: File exceeds maximum 20 rows |
| `missing-headers.csv` | Incomplete headers | F-004: Missing required headers |
| `empty-file.csv` | 0 bytes or header only | F-005: File is empty |

## Test Steps

### Test 1: Wrong File Extension

#### Given
1. I am on the Contract Import page

#### When
2. I attempt to upload `invalid.txt` (text file)

#### Then
3. I should see an error message: "Invalid file format. Please upload a CSV file." (F-001)
4. The file should be rejected immediately
5. No API call should be made to the backend

### Test 2: File Exceeds Maximum Rows

#### Given
1. I am on the Contract Import page

#### When
2. I attempt to upload `large-file.csv` (21 rows of data)

#### Then
3. I should see an error message: "File exceeds maximum 20 rows. Please reduce the number of contracts." (F-002)
4. The file should be rejected
5. No validation should be performed

### Test 3: Missing Required Headers

#### Given
1. I am on the Contract Import page

#### When
2. I attempt to upload `missing-headers.csv` (missing contractNumber, quantity columns)

#### Then
3. I should see an error message: "Missing required headers: contractNumber, quantity" (F-004)
4. The file should be rejected
5. The error should list all missing headers

### Test 4: Empty File

#### Given
1. I am on the Contract Import page

#### When
2. I attempt to upload `empty-file.csv` (0 bytes or header row only)

#### Then
3. I should see an error message: "File is empty or contains no data rows." (F-005)
4. The file should be rejected
5. No validation should be performed

## Expected Results

### Error Display
- ✅ Error message appears immediately after file selection
- ✅ Error message is clear and actionable
- ✅ Error code is included (F-001, F-002, etc.)
- ✅ Error styling (red banner or alert)
- ✅ User can dismiss the error
- ✅ User can select a different file

### Performance
- ✅ File extension check happens on frontend (instant)
- ✅ File size check happens on frontend (instant)
- ✅ Header check happens on backend (< 1 second)
- ✅ No unnecessary API calls for obvious errors

### No Side Effects
- ✅ No contracts created in database
- ✅ No partial data processing
- ✅ Application remains stable
- ✅ Upload zone remains functional

## Postconditions
- User can upload a valid file after seeing the error
- Error message is cleared when new file is selected
- No data is persisted from invalid files

## Test Variations

### Variation 1: Multiple File Types
Test with various invalid extensions:
- `.xlsx` (Excel file)
- `.json` (JSON file)
- `.pdf` (PDF file)
- `.doc` (Word document)

**Expected**: All rejected with F-001 error

### Variation 2: Edge Case - Exactly 20 Rows
**Steps**:
1. Upload CSV with exactly 20 data rows (maximum allowed)
2. Verify file is accepted and processed

**Expected**: File accepted, validation proceeds

### Variation 3: Edge Case - 21 Rows
**Steps**:
1. Upload CSV with 21 data rows (one over limit)
2. Verify file is rejected

**Expected**: F-002 error displayed

### Variation 4: Partial Headers
**Steps**:
1. Upload CSV with 20 out of 25 required headers
2. Verify specific missing headers are listed

**Expected**: F-004 error with list of 5 missing headers

## Error Code Reference

| Code | Message | Validation Level |
|------|---------|------------------|
| F-001 | Invalid file format | Frontend |
| F-002 | File exceeds maximum rows | Frontend/Backend |
| F-004 | Missing required headers | Backend |
| F-005 | File is empty | Backend |

## Related Test Cases
- TC-002: Reject CSV file with validation errors
- TC-013: Handle large files within limit
- TC-012: Display detailed validation results

## Notes
- Frontend validation should catch obvious errors (extension, size)
- Backend validation should catch structural errors (headers, empty)
- Error messages should guide user to fix the issue
- File size limit (20 rows) is a business requirement

## Automation Script Reference
**Cypress**: `cypress/e2e/02-validation/02-invalid-file-formats.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
