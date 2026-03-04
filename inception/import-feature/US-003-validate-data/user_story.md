# US-003: Validate and Import CSV Data

## User Story
As an admin user  
I want the system to automatically validate my uploaded CSV data and import valid rows  
So that I can quickly import contracts without additional confirmation steps

## Description
After uploading a CSV file, the system should automatically validate all data according to the defined validation rules. If all rows are valid, import happens automatically. If any rows are invalid, the system displays validation results and waits for user confirmation before importing valid rows. This approach provides automatic processing for clean data while allowing review when errors exist.

## Acceptance Criteria

### AC-001: Automatic Validation Trigger
- Given I have successfully uploaded a CSV file
- When the upload completes
- Then the system should automatically:
  - Begin validating all rows in the file
  - Show a simple message "Validating..."
  - Process all rows even if errors are found
  - Remove the message after validation completes

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
  - Contract number is unique in the file
  - Contract number doesn't already exist in the database

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
  - Automatically begin importing all rows
  - Show a simple message "Importing..."
  - Create reference data as needed
  - Redirect to results page when complete
- When at least one row is invalid
- Then the system should:
  - Display validation results
  - Wait for user confirmation to import valid rows
  - Show "Import Valid Rows" button
  - Allow user to cancel and fix errors

### AC-007: Validation and Import Summary
- Given the validation and import have completed
- When all rows have been processed
- Then it should provide:
  - Total number of rows processed
  - Number of rows successfully imported
  - Number of rows skipped (invalid)
  - Detailed error list for each invalid row
  - Detailed warning list for rows with warnings

### AC-008: Partial Import Execution
- Given the validation has completed with some invalid rows
- When user confirms to proceed with import
- Then the system should:
  - Import all valid rows
  - Skip all invalid rows
  - Create reference data as needed
  - Redirect to results page when complete

### AC-009: Validation Error Details
- Given a row has validation errors
- When I view the validation results
- Then for each error I should see:
  - Row number
  - Field name with error
  - Clear error message
  - Severity (error or warning)

### AC-010: Validation Performance
- Given I upload a file with 20 rows
- When the validation runs
- Then it should:
  - Complete within 10 seconds
  - Not block the user interface
  - Handle validation asynchronously if needed

### AC-011: All Rows Invalid Scenario
- Given validation completed with zero valid rows
- When all rows have errors
- Then the system should:
  - Not attempt any import
  - Show error summary
  - Allow user to upload a corrected file

## Business Rules
- All validation rules defined in validation_rules.md must be applied
- Validation should process all rows, not stop at first error
- If all rows are valid, import happens automatically
- If any rows are invalid, user must confirm before importing valid rows
- Invalid rows are skipped during import, valid rows are imported
- Warnings do not prevent import, only errors do
- Contract number uniqueness is checked against existing database records
- Reference data is validated but can be created if missing
- User is redirected to results page after import completes

## Dependencies
- Validation rules specification (validation_rules.md)
- CSV template specification
- Contract model and all reference models
- Database access for uniqueness checks and import
- Reference data lookup and creation services
- Import execution logic (from US-005)

## Technical Considerations
- Validation and import should be performed server-side for security
- Consider batch processing for performance
- Cache reference data lookups to avoid repeated database queries
- Use transactions for each contract + reference data creation
- Proper error handling for database connection issues
- Transaction management for reference data checks and creation
- Progress updates sent to frontend during import

## Notes
- Validation happens automatically after upload
- If all rows valid: automatic import (no confirmation)
- If any rows invalid: show results and wait for confirmation
- Users can review errors before deciding to import valid rows
- Validation results and import results are shown on results page (US-005)
- Clear, actionable error messages are critical
- Process should be as fast as possible

## Priority
High - Core functionality that validates and imports data

## Estimated Story Points
13

## Estimation Rationale
**Increased from 8 to 13 points** due to combining validation + import:
- All validation logic (5 levels, 50+ rules)
- Plus automatic import execution
- Reference data creation
- Transaction management
- Progress tracking
- Error handling for both validation and import
- Essentially combines old US-003 (8 pts) + part of US-005
