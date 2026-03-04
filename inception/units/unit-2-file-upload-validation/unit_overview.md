# Unit 2: File Upload & Validation Service

## Overview
The File Upload & Validation Service handles the complete workflow of accepting CSV file uploads, performing comprehensive validation, triggering import execution, and returning results. This is the most complex unit in the import feature, containing the core validation logic.

## Purpose
Enable admin users to upload CSV files and receive immediate validation feedback with automatic import execution for valid data, all within a single request/response cycle.

## Scope
This unit contains three user stories covering file upload, validation, and error handling.

## User Stories Included
- **US-002**: Upload CSV File for Import (2 story points)
- **US-003**: Validate and Import CSV Data (13 story points)
- **US-005**: Handle Import Errors (2 story points)

**Total Story Points**: 17

## Responsibilities

### Primary Responsibilities
1. Accept CSV file uploads from frontend
2. Perform file-level validation (format, size, encoding, structure)
3. Parse CSV file and extract data
4. Execute 5-level validation on all rows:
   - Field-level validation (required, types, formats, enums)
   - Business logic validation (calculations, uniqueness)
   - Reference data validation (existence, active status)
   - Cross-field validation (consistency checks)
5. Determine import strategy (automatic or conditional)
6. Call Unit 3 to execute import for valid rows
7. Format and return complete results (validation + import)
8. Provide clear, actionable error messages

### Out of Scope
- Actual contract creation (handled by Unit 3)
- Reference data creation (handled by Unit 3 via existing services)
- Transaction management (handled by Unit 3)
- Preview functionality (removed from scope)
- Progress tracking during validation

## Dependencies

### Upstream Dependencies
- Frontend file upload component

### Downstream Dependencies
- **Unit 3**: Import Execution & Results Service (internal function calls)

### External Dependencies
- CSV parsing library
- File upload handling infrastructure
- Validation rules specification
- CSV template specification
- Existing Reference Data services (for lookup during validation)

## Integration Points

### Public APIs Exposed
```
POST /api/import/upload
```
**Description**: Upload CSV file, validate, import, and return complete results  
**Authentication**: Required (admin role)  
**Request**:
- Content-Type: multipart/form-data
- Body: CSV file (max 20 rows + header)

**Response**: JSON
```json
{
  "success": boolean,
  "summary": {
    "totalRows": number,
    "validRows": number,
    "invalidRows": number,
    "importedRows": number,
    "failedRows": number,
    "skippedRows": number
  },
  "validationResults": [
    {
      "rowNumber": number,
      "contractNumber": string,
      "status": "valid" | "invalid" | "warning",
      "errors": [
        {
          "ruleId": string,
          "field": string,
          "message": string,
          "severity": "error" | "warning"
        }
      ]
    }
  ],
  "importResults": [
    {
      "rowNumber": number,
      "contractNumber": string,
      "status": "imported" | "failed" | "skipped",
      "contractId": string | null,
      "error": string | null
    }
  ],
  "message": string
}
```

**Status Codes**:
- 200: Success (validation and/or import completed — check summary for outcome)
- 400: Bad request (invalid file format, size exceeded, empty file, missing headers)
- 401: Unauthorized
- 403: Forbidden (non-admin user)
- 409: Upload already in progress
- 500: Server error

### Internal Functions Exposed
None - this unit does not expose functions to other backend units.

### Internal Functions Consumed
This unit calls Unit 3 internal functions:
```javascript
// Execute import for validated rows
executeImport(validatedData: ValidatedRow[]): ImportResult[]

// Generate formatted results
generateResults(importResults: ImportResult[]): FormattedResults
```

### APIs Consumed
- Existing Reference Data services (for validation lookups):
  - GET /api/parties (to check buyer/seller existence)
  - GET /api/commodities (to check commodity existence)
  - GET /api/payment-terms (to check payment term existence)
  - GET /api/bank-details (to check bank details existence)

## Data Contracts

### ValidatedRow Structure
```typescript
interface ValidatedRow {
  rowNumber: number;
  contractNumber: string;
  isValid: boolean;
  hasWarnings: boolean;
  data: {
    // All 25 CSV columns parsed and validated
    contractNumber: string;
    contractDate: Date;
    buyerName: string;
    sellerName: string;
    // ... (all other fields)
  };
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

### ValidationError Structure
```typescript
interface ValidationError {
  ruleId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

## Business Rules

### File Validation Rules
1. File must be CSV format
2. Maximum 20 rows (excluding header)
3. File must be UTF-8 encoded
4. Must contain required header row
5. Must have at least 1 data row

### Validation Processing Rules
1. Process all rows even if errors found
2. Collect all errors per row (don't stop at first error)
3. Warnings do not prevent import
4. Only errors prevent import

### Import Trigger Rules
1. If all rows valid → automatic import
2. If any rows invalid → import only valid rows (skip invalid)
3. Invalid rows are never imported
4. Each row processed independently

### Error Handling Rules
1. Provide clear, actionable error messages
2. Include field name and row number in errors
3. Group errors by row
4. Return all errors in single response

## Validation Levels

### Level 1: File-Level Validation
- File format (CSV)
- File size (max 20 rows)
- File encoding (UTF-8)
- Header structure
- Non-empty file

### Level 2: Field-Level Validation
- Required fields present
- Data types correct
- Field formats valid
- Enum values valid
- Field constraints met

### Level 3: Business Logic Validation
- Buyer ≠ Seller
- Total amount calculation valid
- Tolerance calculations valid
- Contract number unique in file
- Contract number unique in database

### Level 4: Reference Data Validation
- Reference data exists (or can be created)
- Existing reference data is active
- Reference data lookups successful

### Level 5: Cross-Field Validation
- Currency consistency (contract vs bank)
- Unit consistency (contract vs commodity)
- Generate warnings for mismatches

## Technical Considerations

### Implementation Approach
- Server-side validation for security
- Synchronous processing (max 20 rows)
- Cache reference data lookups
- Single transaction per contract (in Unit 3)
- Comprehensive error collection

### Performance Requirements
- Validate 20 rows in < 10 seconds
- Import 20 contracts in < 30 seconds
- Total request time < 40 seconds
- Efficient reference data caching

### Security
- Admin authentication required
- Server-side validation (never trust client)
- SQL injection prevention
- File upload size limits
- Rate limiting
- Audit logging

### Error Handling
- Graceful degradation
- Clear error messages
- Partial success support
- Transaction rollback per contract
- Detailed error logging

## Team Information

### Team Size
2-3 developers (most complex unit)

### Estimated Effort
17 story points (~2-3 weeks)

### Skills Required
- Backend development (Node.js/Express)
- CSV parsing and validation
- Database queries and transactions
- Error handling and logging
- API design
- Testing (unit, integration)

## Testing Strategy

### Unit Tests
- File validation logic
- Each validation rule (50+ rules)
- Error message generation
- Data parsing and transformation
- Reference data lookup mocking

### Integration Tests
- End-to-end upload workflow
- Validation with real database
- Import execution integration
- Error scenarios
- Edge cases (empty file, malformed CSV, etc.)

### Performance Tests
- 20 rows validation time
- Concurrent upload handling
- Memory usage
- Database query optimization

### Acceptance Tests
- All acceptance criteria from US-002, US-003, US-005
- User workflow testing
- Error message clarity
- Results accuracy

## Deployment Considerations

### Deployment Unit
- Part of monolithic backend
- Deployed with Unit 3
- Requires database access

### Configuration
- File upload size limits
- Validation timeout settings
- Reference data cache settings
- Error message templates

### Monitoring
- Upload success/failure rates
- Validation error rates by rule
- Processing time metrics
- Error type distribution
- API response times

## Success Criteria
- [ ] Admin users can upload CSV files successfully
- [ ] All 50+ validation rules implemented correctly
- [ ] Clear error messages for all validation failures
- [ ] Validation completes in < 10 seconds for 20 rows
- [ ] Import triggered automatically for valid data
- [ ] Partial imports work correctly (valid rows imported, invalid skipped)
- [ ] Complete results returned in single response
- [ ] Zero data corruption or security vulnerabilities

## Notes
- This is the most complex unit (17 story points)
- Contains the core business logic for import feature
- Quality of validation directly impacts data integrity
- Error message clarity is critical for user experience
- Performance optimization is important for user satisfaction

---

**Unit Owner**: TBD  
**Status**: Ready for Development  
**Priority**: High  
**Story Points**: 17  
**Created**: March 4, 2026  
**Last Updated**: March 4, 2026
