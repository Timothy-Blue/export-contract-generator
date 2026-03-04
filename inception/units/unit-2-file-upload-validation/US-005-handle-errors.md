# US-005: Handle Import Errors

## Unit
Unit 2 - File Upload & Validation Service

## User Story
As an admin user
I want to see clear error messages when import errors occur
So that I can understand what went wrong and correct my data for re-upload

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
  - A user-friendly message (not a technical stack trace)
  - Assurance that no data was corrupted

## Business Rules
- All error messages must be user-friendly, not technical
- System errors must not expose sensitive information or stack traces
- Errors are displayed as part of the upload API response (no separate endpoint)

## Story Points
2
