# US-003: Validate and Import CSV Data

## Unit
Unit 2 - File Upload & Validation Service

## User Story
As an admin user
I want the system to automatically validate my uploaded CSV data and import valid rows
So that I can quickly import contracts without additional confirmation steps

## Acceptance Criteria

### AC-001: Automatic Validation Trigger
- Given I have successfully uploaded a CSV file
- When the upload completes
- Then the system should automatically:
  - Begin validating all rows in the file
  - Show a simple message "Validating..."
  - Process all rows even if errors are found

### AC-002: Field-Level Validation
- Given the system is validating my CSV data
- When it processes each row
- Then it should check:
  - All required fields are present and not empty
  - Data types are correct (numbers, dates, strings)
  - Field formats match specifications (date format, SWIFT code pattern)
  - Enum values are valid (incoterm, unit, status, releaseType)

### AC-003: Business Logic Validation
- Given the system is validating my CSV data
- When it processes each row
- Then it should verify:
  - Buyer and seller are not the same
  - Total amount can be calculated (quantity × unitPrice)
  - Tolerance calculations are valid
  - Contract number is unique within the file
  - Contract number does not already exist in the database

### AC-004: Reference Data Validation
- Given the system is validating my CSV data
- When it encounters reference data (buyer, seller, commodity, payment term, bank)
- Then it should:
  - Check if the reference exists by name
  - Verify existing references are active
  - Flag inactive references as errors
  - Allow creation of new references if they don't exist

### AC-005: Cross-Field Validation
- Given the system is validating my CSV data
- When it processes each row
- Then it should check:
  - Currency consistency between contract and bank details
  - Unit consistency with commodity default unit
  - Generate warnings (not errors) for mismatches

### AC-006: Conditional Import After Validation
- Given the validation has completed
- When all rows are valid
- Then the system should:
  - Automatically trigger import for all rows (via Unit 3)
  - Show a simple message "Importing..."
- When at least one row is invalid
- Then the system should:
  - Display validation results with errors
  - Show "Import Valid Rows" button for user to confirm
  - Allow user to cancel and fix errors instead

### AC-007: All Rows Invalid Scenario
- Given validation completed with zero valid rows
- When all rows have errors
- Then the system should:
  - Not trigger any import
  - Show a full error summary
  - Allow user to upload a corrected file

### AC-008: Validation Error Details
- Given a row has validation errors
- When I view the validation results
- Then for each error I should see:
  - Row number
  - Field name with error
  - Clear error message
  - Severity (error or warning)

### AC-009: Validation Performance
- Given I upload a file with 20 rows
- When the validation runs
- Then it should complete within 10 seconds

### AC-010: Results Summary
- Given validation and import have completed
- When all rows have been processed
- Then the response should include:
  - Total rows processed
  - Rows successfully imported
  - Rows skipped (invalid)
  - Detailed error list per invalid row
  - Warning list for rows with warnings

## Business Rules
- All validation rules defined in validation_rules.md must be applied
- All rows are processed even if errors are found (no early exit)
- Warnings do not prevent import, only errors do
- If all rows valid → import triggered automatically
- If any rows invalid → user must confirm before importing valid rows
- Invalid rows are never imported
- Contract number uniqueness checked against existing database records

## Story Points
13
