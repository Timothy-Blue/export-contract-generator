# US-005: Handle Import Errors

## User Story
As an admin user  
I want to see clear error messages when import errors occur  
So that I can understand what went wrong

## Description
When validation or import errors occur, the system should provide clear error messages. Users should be able to understand what went wrong and correct their data for re-upload.

## Acceptance Criteria

### AC-001: Error Message Clarity
- Given an error occurs during validation or import
- When I view the error message
- Then it should include:
  - What went wrong (clear description)
  - Which row has the issue
  - Error message text

### AC-002: Field-Level Error Display
- Given a field has a validation error
- When I view the error details
- Then I should see:
  - Field name
  - Error message
  - Example: "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)"

### AC-003: Validation Error Messages
- Given a validation error occurs
- When I view the error details
- Then I should see specific messages for:
  - Required field missing: "This field is required"
  - Invalid format: "Expected format: [format]"
  - Invalid enum: "Must be one of: [list of valid values]"
  - Out of range: "Value must be between [min] and [max]"
  - Duplicate: "This value already exists"

### AC-004: Business Rule Error Messages
- Given a business rule error occurs
- When I view the error details
- Then I should see specific messages for:
  - Buyer = Seller: "Buyer and Seller cannot be the same"
  - Inactive reference: "This [type] exists but is inactive"
  - Calculation error: "Unable to calculate [field]"

### AC-005: System Error Handling
- Given a system error occurs (database, network, etc.)
- When the error is displayed
- Then I should see:
  - User-friendly message (not technical stack trace)
  - Assurance that no data was corrupted

## Business Rules
- All error messages must be user-friendly, not technical
- System errors should not expose sensitive information

## Dependencies
- Validation rules from US-003
- Error message templates

## Technical Considerations
- Centralized error message management
- Logging of all errors for analysis
- User-friendly error formatting

## UI/UX Considerations
- Clear error message display
- Simple list format
- Accessible error messages (screen readers)

## Error Message Examples

### Good Error Messages
- ✓ "Contract date is required. Use YYYY-MM-DD format (e.g., 2026-03-15)"
- ✓ "Quantity must be greater than 0"
- ✓ "Invalid incoterm 'FOV'. Must be one of: FOB, CIF, EXW, FCA"

### Bad Error Messages
- ✗ "Validation failed"
- ✗ "Error in row 5"
- ✗ "Invalid data"

## Notes
- Focus on clear, simple error messages
- No complex error handling features
- Users fix errors offline and re-upload
- System errors should be logged for debugging

## Priority
Medium - Important for user understanding

## Estimated Story Points
2

## Estimation Rationale
**Reduced from 3 to 2 points** due to further simplification:
- No actionable guidance (just error messages)
- No field highlighting
- No error categorization/grouping
- No "Try Again" button
- Simple error message display only
- Minimal UI requirements
