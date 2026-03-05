# TC-011: Download CSV Template

## Test Case Information

| Property | Value |
|----------|-------|
| **Test ID** | TC-011 |
| **Category** | Happy Path |
| **Priority** | Medium |
| **Estimated Duration** | 10-15 seconds |
| **Automation Status** | ✅ Automated |
| **Last Updated** | 2026-03-05 |

## Description
Verify that a user can download the CSV template file from the Contract Import page and that the template contains all required headers and sample data.

## Preconditions
- Frontend server is running on localhost:3000
- User has access to the Contract Import page

## Test Steps

### Given
1. I am on the Contract Import page (http://localhost:3000/import)
2. The upload zone is visible

### When
3. I click the "Download Template" button

### Then
4. A CSV file should be downloaded to my downloads folder
5. The file should be named `contract-import-template.csv`
6. The file should be downloadable without errors

### When
7. I open the downloaded CSV file in a text editor or spreadsheet application

### Then
8. The file should contain exactly 26 columns (25 data columns + 1 header row)
9. The first row should contain all required headers
10. The second row should contain one example with sample data

## Expected Results

### File Download Verification
- ✅ File downloads successfully
- ✅ File name is `contract-import-template.csv`
- ✅ File size is > 0 bytes
- ✅ File can be opened in Excel/Google Sheets/text editor

### Header Verification
The first row should contain these exact headers (in order):
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
```

### Sample Data Verification
The second row should contain valid example data:
```csv
SAMPLE-001,2026-03-15,ABC Trading Co,XYZ Exports Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium Quality,2500,USD,FOB,Santos Port,LC at Sight,International Bank,Export Account,1234567890,INTLUS33,March 2026,Handle with care,ORIGINAL_BL,DRAFT
```

### Data Validation
- ✅ All 25 required columns are present
- ✅ Headers match the expected field names exactly
- ✅ Sample data is valid and can be imported without errors
- ✅ Sample data demonstrates proper formatting for each field type
- ✅ No extra columns or missing columns

## Postconditions
- User has a valid template file to use for importing contracts
- Template file can be modified and uploaded successfully

## Test Variations

### Variation 1: Download Multiple Times
**Steps**:
1. Click "Download Template" button
2. Wait for download to complete
3. Click "Download Template" button again
4. Verify both files are downloaded successfully

**Expected**: Both downloads succeed, files may have (1), (2) suffix

### Variation 2: Open in Different Applications
**Steps**:
1. Download template
2. Open in Microsoft Excel
3. Verify formatting is preserved
4. Open in Google Sheets
5. Verify formatting is preserved
6. Open in LibreOffice Calc
7. Verify formatting is preserved

**Expected**: Template opens correctly in all applications

## Related Test Cases
- TC-001: Successfully import three valid contracts (uses template format)
- TC-003: Reject invalid file formats
- TC-004: Handle mixed valid and invalid rows

## Notes
- Template download should work even if backend is down (static file)
- Template should be version-controlled to match current schema
- Sample data should be realistic and demonstrate best practices
- Consider adding comments or instructions in the template

## Automation Script Reference
**Cypress**: `cypress/e2e/01-happy-path/02-download-template.cy.js`

## Test Execution History

| Date | Tester | Result | Notes |
|------|--------|--------|-------|
| 2026-03-05 | Automated | ⏳ Pending | Initial creation |
