# US-004: Import Execution and Results

## User Story
As an admin user  
I want the system to handle the import process reliably and show me the results  
So that I know what was imported and can view the contracts

## Description
This story covers the complete import execution including transaction management, reference data creation, error handling, and displaying results to the user. After import completes, the system shows a simple message with statistics and automatically redirects to the contract list.

## Acceptance Criteria

### AC-001: Import Initiation
- Given the import process begins
- When contracts are being created
- Then the system should:
  - Show a simple message "Importing..."
  - Process each valid row
  - Track success/failure for each row

### AC-002: Reference Data Creation
- Given the import is processing rows with new reference data
- When it encounters a new buyer, seller, commodity, payment term, or bank details
- Then it should:
  - Create the reference data record first
  - Use the name as the primary identifier
  - Set appropriate default values for missing fields
  - Mark the record as active
  - Handle duplicate creation attempts gracefully

### AC-003: Contract Creation
- Given the import is processing a valid row
- When it creates a contract
- Then it should:
  - Create the contract with all provided fields
  - Link to existing or newly created reference data
  - Calculate totalAmount (quantity × unitPrice)
  - Calculate min/max quantities based on tolerance
  - Set default values for optional fields
  - Set status to provided value or DRAFT
  - Record creation timestamp and user

### AC-004: Transaction Management
- Given the import is processing multiple contracts
- When creating reference data and contracts
- Then it should:
  - Process each valid row independently
  - Commit successful imports immediately
  - Continue processing even if one row fails
  - Track which rows succeeded and which failed
  - Not rollback successful imports if later rows fail

### AC-005: Error Handling During Import
- Given the import is processing a row
- When an unexpected error occurs (database error, constraint violation, etc.)
- Then it should:
  - Log the error with full details
  - Mark that row as failed
  - Continue processing remaining rows
  - Include the error in the final results
  - Not crash or stop the entire import

### AC-006: Simple Status Updates
- Given the import is running
- When each contract is processed
- Then the system should:
  - Track success/failure status for each row
  - Log any errors that occur
  - Continue processing all rows

### AC-007: Import Completion - Full Success
- Given all valid rows have been processed successfully
- When the import completes
- Then the system should:
  - Show success message: "Import completed successfully!"
  - Display total contracts imported
  - Display total rows skipped (if any)

### AC-008: Import Completion - Partial Success
- Given some valid rows failed during import due to unexpected errors
- When the import completes
- Then the system should:
  - Show warning message: "Import completed with some errors"
  - Display successfully imported count
  - Display failed count
  - Display skipped count

### AC-009: Import Completion - Total Failure
- Given all rows failed during import due to system errors
- When the import completes
- Then the system should:
  - Show error message: "Import failed. No contracts were imported."
  - Display explanation of what went wrong

### AC-010: Duplicate Contract Number Handling
- Given a row has a contract number that already exists in the database
- When the import tries to create that contract
- Then it should:
  - Fail that specific row with error: "Contract number already exists"
  - Continue processing other rows
  - Include this in the failure report
  - Not overwrite the existing contract

### AC-011: Reference Data Reuse
- Given a row references existing active reference data
- When the import processes that row
- Then it should:
  - Reuse the existing reference data record
  - Not create duplicate reference data
  - Link the contract to the existing record
  - Match by name (case-insensitive)

### AC-012: Reference Data Conflict Handling
- Given a row tries to create reference data that already exists but is inactive
- When the import processes that row
- Then it should:
  - Fail with error: "Reference data exists but is inactive"
  - Not reactivate the inactive record automatically
  - Skip that row
  - Include in failure report

### AC-013: Post-Import Navigation
- Given the import has completed
- When the results are displayed
- Then the system should:
  - Automatically redirect to the contract list page
  - Or reload the page if already on contract list
  - Show the newly imported contracts

### AC-014: Import Audit Trail
- Given contracts have been imported
- When I view the imported contracts
- Then each contract should have:
  - createdBy field set to current admin user
  - createdAt timestamp
  - Indication that it was imported (vs manually created)

### AC-015: Error Report Generation (if errors exist)
- Given there were validation or import errors
- When the results are displayed
- Then the system should:
  - Provide option to download error report
  - Generate CSV file with failed rows, error messages, and row numbers
  - Make report available on-demand

## Business Rules
- Only valid rows from preview are processed
- Invalid rows are never imported
- Each valid row is processed independently
- Reference data is created before contracts
- Duplicate contract numbers are rejected
- Existing active reference data is reused
- Inactive reference data cannot be used
- Import is not fully transactional (partial success is allowed)
- Successfully imported contracts are not rolled back
- Import operation is logged for audit purposes

## Dependencies
- Validation results from US-003
- Database transaction management
- Contract model and all reference models
- User authentication for audit trail
- Error logging system
- Existing contract list page
- Error report generation functionality

## Technical Considerations
- Use database transactions for each contract + its reference data
- Implement proper error handling and logging
- Consider batch processing for performance
- Handle database constraints (unique, foreign key)
- Implement retry logic for transient errors
- Proper connection pooling for concurrent operations
- Memory management for large imports
- Simple status messages (no complex progress tracking)
- Automatic redirect after completion
- Error report generation on-demand
- Minimal UI components for results display

## Performance Requirements
- Import 20 contracts in under 30 seconds
- Handle concurrent imports by different users
- Not block other system operations
- Quick redirect to contract list after completion

## Error Scenarios
- Database connection failure
- Constraint violations (unique, foreign key)
- Invalid reference data IDs
- Timeout during import
- Memory exhaustion
- Concurrent modification conflicts

## Security Considerations
- Verify user has admin role before import
- Validate all data again before database insertion
- Prevent SQL injection through parameterized queries
- Log all import operations for audit
- Rate limiting to prevent abuse

## UI/UX Considerations
- Simple, clean message display
- Clear success/warning/error indicators
- Basic statistics (counts only)
- Quick automatic redirect to contract list
- Error report download option when needed
- Minimal clicks to see imported contracts

## Notes
- This story combines import execution and results display
- Partial success is acceptable and expected
- Simple status messages instead of detailed progress tracking
- Import should be as fast as possible while maintaining data integrity
- Automatic redirect to contract list after completion
- No cancel functionality - imports complete quickly (max 20 rows)
- Leverages existing contract list and detail screens
- Error report provides details for troubleshooting

## Priority
High - Core functionality for import execution and user feedback

## Estimated Story Points
8

## Estimation Rationale
**Increased from 6 to 8 points** by merging US-005:
- Transaction management and data persistence (6 pts)
- Plus results display and user feedback (2 pts)
- Error report generation
- Automatic redirect logic
- Simple UI for results message
- Combines backend execution with user-facing results
