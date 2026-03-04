# US-004: Import Execution and Results

## Unit
Unit 3 - Import Execution & Results Service (Backend Internal Only)

## User Story
As an admin user
I want the system to handle the import process reliably and show me the results
So that I know what was imported and can view the contracts

## Note on Exposure
This user story is implemented as a backend-internal function called by Unit 2.
It has no public API. The results are returned as part of the Unit 2 upload response.

## Acceptance Criteria

### AC-001: Reference Data Creation
- Given the import is processing rows with new reference data
- When it encounters a new buyer, seller, commodity, payment term, or bank details
- Then it should:
  - Create the reference data record first using existing reference data services
  - Use the name as the primary identifier
  - Set appropriate default values for missing fields
  - Mark the record as active
  - Handle duplicate creation attempts gracefully

### AC-002: Reference Data Reuse
- Given a row references existing active reference data
- When the import processes that row
- Then it should:
  - Reuse the existing reference data record (match by name, case-insensitive)
  - Not create duplicate reference data
  - Link the contract to the existing record

### AC-003: Reference Data Conflict Handling
- Given a row tries to use reference data that already exists but is inactive
- When the import processes that row
- Then it should:
  - Fail that row with error: "Reference data exists but is inactive"
  - Not reactivate the inactive record automatically
  - Continue processing remaining rows

### AC-004: Contract Creation
- Given the import is processing a valid row
- When it creates a contract
- Then it should:
  - Create the contract with all provided fields
  - Link to existing or newly created reference data
  - Calculate totalAmount (quantity × unitPrice)
  - Calculate min/max quantities based on tolerance
  - Set default values for optional fields
  - Set status to provided value or DRAFT
  - Record createdBy (current admin user) and createdAt timestamp

### AC-005: Transaction Management
- Given the import is processing multiple contracts
- When creating reference data and contracts
- Then it should:
  - Process each valid row independently
  - Commit each successful import immediately
  - Continue processing even if one row fails
  - Not rollback successful imports if later rows fail

### AC-006: Error Handling During Import
- Given the import is processing a row
- When an unexpected error occurs (database error, constraint violation, etc.)
- Then it should:
  - Log the error with full details
  - Mark that row as failed
  - Continue processing remaining rows
  - Include the error in the final results

### AC-007: Duplicate Contract Number Handling
- Given a row has a contract number that already exists in the database
- When the import tries to create that contract
- Then it should:
  - Fail that specific row with error: "Contract number already exists"
  - Continue processing other rows
  - Not overwrite the existing contract

### AC-008: Results - Full Success
- Given all valid rows have been processed successfully
- When the import completes
- Then the results should include:
  - Message: "Import completed successfully!"
  - Total contracts imported
  - Total rows skipped (if any)

### AC-009: Results - Partial Success
- Given some valid rows failed during import due to unexpected errors
- When the import completes
- Then the results should include:
  - Message: "Import completed with some errors"
  - Successfully imported count
  - Failed count
  - Skipped count

### AC-010: Results - Total Failure
- Given all rows failed during import due to system errors
- When the import completes
- Then the results should include:
  - Message: "Import failed. No contracts were imported."
  - Explanation of what went wrong

### AC-011: Error Report Generation
- Given there were validation or import errors
- When the results are returned
- Then the results should include data to generate a downloadable CSV error report
- Containing: failed rows, error messages, and row numbers

### AC-012: Post-Import Navigation
- Given the import has completed and results are returned to Unit 2
- When the frontend receives the response
- Then the user should be automatically redirected to the contract list page

### AC-013: Import Audit Trail
- Given contracts have been imported
- When I view the imported contracts
- Then each contract should have:
  - createdBy field set to the current admin user
  - createdAt timestamp

## Business Rules
- Only valid rows are processed (invalid rows are never passed to this unit)
- Each valid row is processed independently
- Reference data is created before contracts
- Duplicate contract numbers are rejected
- Existing active reference data is reused
- Inactive reference data cannot be used
- Partial success is allowed (no global rollback)
- All import operations are logged for audit purposes

## Story Points
8
