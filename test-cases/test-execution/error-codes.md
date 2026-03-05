# Error Code Reference

## Overview
This document provides a comprehensive reference of all error and warning codes used in the Contract Import feature validation system.

---

## File-Level Errors (F-xxx)

### F-001: Invalid File Format
**Severity**: Error  
**Validation Level**: Frontend  
**Message**: "Invalid file format. Please upload a CSV file."

**Cause**: User attempted to upload a non-CSV file

**Resolution**: Upload a file with .csv extension

**Related Test Cases**: TC-003

---

### F-002: File Exceeds Maximum Rows
**Severity**: Error  
**Validation Level**: Frontend/Backend  
**Message**: "File exceeds maximum 20 rows. Please reduce the number of contracts."

**Cause**: CSV file contains more than 20 data rows (excluding header)

**Resolution**: Split the file into multiple files with ≤20 rows each

**Related Test Cases**: TC-003, TC-013

---

### F-003: File Upload Failed
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "File upload failed. Please try again."

**Cause**: Network error, server error, or file corruption during upload

**Resolution**: Retry the upload, check network connection

**Related Test Cases**: TC-006

---

### F-004: Missing Required Headers
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Missing required headers: {headerList}"

**Cause**: CSV file is missing one or more required column headers

**Resolution**: Add missing headers to the CSV file. Download template for reference.

**Required Headers**:
- contractNumber
- contractDate
- buyerName
- sellerName
- commodityName
- quantity
- unit
- unitPrice
- currency
- (and 16 more - see template)

**Related Test Cases**: TC-003

---

### F-005: File Is Empty
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "File is empty or contains no data rows."

**Cause**: CSV file has no data rows (only header or completely empty)

**Resolution**: Add at least one data row to the CSV file

**Related Test Cases**: TC-003

---

## Contract Number Errors (CN-xxx)

### CN-001: Contract Number Required
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Contract number is required"

**Cause**: contractNumber field is empty or missing

**Resolution**: Provide a unique contract number for each row

**Related Test Cases**: TC-002, TC-004

---

### CN-002: Contract Number Already Exists
**Severity**: Error  
**Validation Level**: Backend (Database)  
**Message**: "Contract number '{number}' already exists in database"

**Cause**: A contract with this number already exists in the database

**Resolution**: Use a different, unique contract number

**Related Test Cases**: TC-007

---

### CN-003: Duplicate Contract Number in File
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Duplicate contract number '{number}' found in row {rowNumber}"

**Cause**: The same contract number appears multiple times in the uploaded file

**Resolution**: Ensure each contract number is unique within the file

**Related Test Cases**: TC-007

---

## Business Logic Errors (BL-xxx)

### BL-001: Buyer and Seller Cannot Be Same
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Buyer and seller cannot be the same party"

**Cause**: buyerName and sellerName fields contain the same value

**Resolution**: Ensure buyer and seller are different parties

**Related Test Cases**: TC-002, TC-008

---

### BL-002: Invalid Contract Date
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Contract date cannot be in the past"

**Cause**: contractDate is before today's date

**Resolution**: Use a current or future date

**Related Test Cases**: TC-002

---

### BL-003: Quantity Must Be Positive
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Quantity must be a positive number"

**Cause**: quantity field contains zero, negative number, or non-numeric value

**Resolution**: Provide a positive numeric value for quantity

**Related Test Cases**: TC-002

---

### BL-004: Contract Date Too Far in Future
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "Contract date is more than 365 days in the future"

**Cause**: contractDate is more than 1 year from today

**Resolution**: Verify the date is correct. This is a warning and won't block import.

**Related Test Cases**: TC-008

---

### BL-005: Tolerance Out of Range
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "Tolerance {value}% is unusually high (>20%)"

**Cause**: tolerance field exceeds 20%

**Resolution**: Verify the tolerance value is correct

**Related Test Cases**: TC-008

---

## Currency/Financial Errors (CF-xxx)

### CF-001: Currency Mismatch
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "Contract currency '{currency}' doesn't match bank currency '{bankCurrency}'"

**Cause**: Contract currency differs from the bank account currency

**Resolution**: Verify currencies are correct. This is a warning and won't block import.

**Related Test Cases**: TC-008

---

### CF-002: Invalid Unit Price
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Unit price must be a positive number"

**Cause**: unitPrice is zero, negative, or non-numeric

**Resolution**: Provide a positive numeric value for unit price

**Related Test Cases**: TC-002

---

### CF-003: Unit Price Too High
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "Unit price {price} {currency} seems unusually high"

**Cause**: unitPrice exceeds typical range for the commodity

**Resolution**: Verify the price is correct

---

## Data Format Errors (DF-xxx)

### DF-001: Invalid Date Format
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Invalid date format. Expected YYYY-MM-DD"

**Cause**: Date field doesn't match YYYY-MM-DD format

**Resolution**: Use format: 2026-03-15

**Examples**:
- ✅ Valid: 2026-03-15
- ❌ Invalid: 03/15/2026, 15-03-2026, March 15 2026

**Related Test Cases**: TC-002, TC-004

---

### DF-002: Invalid Number Format
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Invalid number format for field '{fieldName}'"

**Cause**: Numeric field contains non-numeric characters

**Resolution**: Remove commas, currency symbols, and text from numeric fields

**Examples**:
- ✅ Valid: 1000, 1000.50
- ❌ Invalid: 1,000, $1000, 1000 MT

**Related Test Cases**: TC-002

---

### DF-003: Invalid SWIFT Code Format
**Severity**: Error  
**Validation Level**: Backend  
**Message**: "Invalid SWIFT code format. Expected 8 or 11 characters"

**Cause**: swiftCode doesn't match standard SWIFT format

**Resolution**: Use 8 or 11 character SWIFT/BIC code

**Format**: AAAABBCCXXX
- AAAA: Bank code (4 letters)
- BB: Country code (2 letters)
- CC: Location code (2 characters)
- XXX: Branch code (3 characters, optional)

**Examples**:
- ✅ Valid: CHASUS33, CHASUS33XXX
- ❌ Invalid: CHASE, 123456, CHAS

**Related Test Cases**: TC-002

---

## Reference Data Errors (REF-xxx)

### REF-001: Reference Not Found
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "{entityType} '{name}' not found. Will be created automatically."

**Cause**: Referenced entity (party, commodity, etc.) doesn't exist in database

**Resolution**: No action needed. Entity will be created automatically during import.

**Note**: This is informational. Import will proceed.

**Related Test Cases**: TC-009

---

### REF-002: Inactive Reference
**Severity**: Warning  
**Validation Level**: Backend  
**Message**: "{entityType} '{name}' is marked as inactive"

**Cause**: Referenced entity exists but is marked as inactive

**Resolution**: Verify you want to use this inactive entity

**Related Test Cases**: TC-009

---

## Validation Summary Codes (VS-xxx)

### VS-001: All Valid
**Severity**: Info  
**Message**: "All {count} rows are valid and ready to import"

**Related Test Cases**: TC-001

---

### VS-002: Has Errors
**Severity**: Error  
**Message**: "Cannot import due to {count} validation errors"

**Related Test Cases**: TC-002, TC-004

---

### VS-003: Has Warnings
**Severity**: Warning  
**Message**: "{count} warnings found. Review before importing."

**Related Test Cases**: TC-008

---

## Error Severity Levels

### Error (Blocks Import)
- Prevents import from proceeding
- Must be fixed before import can succeed
- Indicated by ❌ icon and red styling
- Examples: CN-001, BL-001, DF-001

### Warning (Allows Import)
- Alerts user to potential issues
- Does not block import
- User can proceed with import
- Indicated by ⚠️ icon and yellow styling
- Examples: BL-004, CF-001, REF-001

### Info (Informational)
- Provides additional information
- No action required
- Indicated by ℹ️ icon and blue styling
- Examples: VS-001, REF-001

---

## Error Code Patterns

### Prefix Meanings
- **F-**: File-level errors (format, size, structure)
- **CN-**: Contract number validation
- **BL-**: Business logic rules
- **CF-**: Currency and financial validation
- **DF-**: Data format validation
- **REF-**: Reference data validation
- **VS-**: Validation summary messages

### Numbering
- 001-099: Core validation rules
- 100-199: Extended validation rules
- 200-299: Reserved for future use

---

## Quick Reference Table

| Code | Severity | Message Summary | Fix Time |
|------|----------|-----------------|----------|
| F-001 | Error | Wrong file type | Instant |
| F-002 | Error | Too many rows | 5 min |
| F-004 | Error | Missing headers | 2 min |
| F-005 | Error | Empty file | 1 min |
| CN-001 | Error | Missing contract number | 1 min |
| CN-002 | Error | Duplicate in database | 2 min |
| CN-003 | Error | Duplicate in file | 2 min |
| BL-001 | Error | Buyer = Seller | 1 min |
| BL-003 | Error | Invalid quantity | 1 min |
| BL-004 | Warning | Future date | Review |
| CF-001 | Warning | Currency mismatch | Review |
| DF-001 | Error | Invalid date format | 2 min |
| DF-003 | Error | Invalid SWIFT code | 2 min |

---

## Usage in Test Cases

When writing test cases, reference error codes to:
1. Verify correct error is displayed
2. Ensure error message is clear
3. Confirm error severity is appropriate
4. Test error resolution flow

Example:
```javascript
// Verify error code and message
cy.get('[data-testid="error-message"]')
  .should('contain', 'CN-001')
  .and('contain', 'Contract number is required');
```

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-05 | Initial error code documentation |
