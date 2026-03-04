# Unit 3: Import Execution & Results Service

## Overview
The Import Execution & Results Service handles the actual creation of contracts and reference data with proper transaction management. This is a backend-internal service with no public APIs, called exclusively by Unit 2 after validation completes.

## Purpose
Execute contract import with data integrity guarantees, create necessary reference data, and format results for the frontend response.

## Scope
This unit contains a single user story focused on import execution and results formatting.

## User Stories Included
- **US-004**: Import Execution and Results (8 story points)

## Responsibilities

### Primary Responsibilities
1. Execute import for validated contract rows
2. Create or lookup reference data (Buyer, Seller, Commodity, PaymentTerm, BankDetails)
3. Create contract records with proper relationships
4. Manage transactions for data integrity
5. Handle database constraints and errors
6. Calculate derived fields (totalAmount, min/max quantities)
7. Format import results for response
8. Generate error reports for failed imports
9. Log audit trail for all imports

### Out of Scope
- Validation logic (handled by Unit 2)
- File upload handling (handled by Unit 2)
- Public API exposure (backend internal only)
- User interface concerns
- Progress tracking UI

## Dependencies

### Upstream Dependencies
- **Unit 2**: File Upload & Validation Service (calls this unit's functions)

### Downstream Dependencies
- None (this is the lowest level service)

### External Dependencies
- **Existing Reference Data Services**:
  - Party service (Buyer/Seller creation)
  - Commodity service (Commodity creation)
  - PaymentTerm service (Payment term creation)
  - BankDetails service (Bank details creation)
- **Contract Management Service**: Contract creation
- **Database**: MongoDB for data persistence
- **Audit Logging Service**: For import audit trail

## Integration Points

### Public APIs Exposed
**None** - This unit has no public APIs. It is backend-internal only.

### Internal Functions Exposed
This unit exposes internal functions callable by Unit 2:

```javascript
/**
 * Execute import for validated rows
 * @param validatedRows - Array of validated contract data
 * @param userId - Admin user ID for audit trail
 * @returns Array of import results
 */
async function executeImport(
  validatedRows: ValidatedRow[], 
  userId: string
): Promise<ImportResult[]>

/**
 * Format import results for API response
 * @param importResults - Raw import results
 * @param validationResults - Validation results from Unit 2
 * @returns Formatted results object
 */
function formatResults(
  importResults: ImportResult[],
  validationResults: ValidationResult[]
): FormattedResults

/**
 * Generate error report for failed imports
 * @param importResults - Import results with errors
 * @returns CSV error report data
 */
function generateErrorReport(
  importResults: ImportResult[]
): ErrorReportData
```

### APIs Consumed
This unit calls existing services:

**Reference Data Services:**
```javascript
// Check if party exists by name
GET /api/parties?name={name}&type={BUYER|SELLER}

// Create new party
POST /api/parties
Body: { companyName, type, isActive: true }

// Check if commodity exists by name
GET /api/commodities?name={name}

// Create new commodity
POST /api/commodities
Body: { name, description, defaultUnit, defaultOrigin, defaultPacking, isActive: true }

// Check if payment term exists by name
GET /api/payment-terms?name={name}

// Create new payment term
POST /api/payment-terms
Body: { name, description, terms, isActive: true }

// Check if bank details exist
GET /api/bank-details?bankName={name}&accountNumber={number}

// Create new bank details
POST /api/bank-details
Body: { bankName, accountName, accountNumber, swiftCode, currency, isActive: true }
```

**Contract Service:**
```javascript
// Create new contract
POST /api/contracts
Body: { /* all contract fields */ }
```

## Data Contracts

### ValidatedRow Input (from Unit 2)
```typescript
interface ValidatedRow {
  rowNumber: number;
  contractNumber: string;
  isValid: boolean;
  data: {
    contractNumber: string;
    contractDate: Date;
    buyerName: string;
    sellerName: string;
    commodityName: string;
    commodityDescription: string;
    quantity: number;
    unit: string;
    tolerance: number;
    origin: string;
    packing: string;
    qualitySpec?: string;
    unitPrice: number;
    currency: string;
    incoterm: string;
    portLocation: string;
    paymentTermName: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string;
    shipmentPeriod?: string;
    additionalTerms?: string;
    releaseType?: string;
    status?: string;
  };
}
```

### ImportResult Output
```typescript
interface ImportResult {
  rowNumber: number;
  contractNumber: string;
  status: 'imported' | 'failed' | 'skipped';
  contractId?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  createdReferenceData?: {
    buyer?: string;
    seller?: string;
    commodity?: string;
    paymentTerm?: string;
    bankDetails?: string;
  };
}
```

### FormattedResults Output
```typescript
interface FormattedResults {
  summary: {
    totalRows: number;
    importedRows: number;
    failedRows: number;
    skippedRows: number;
  };
  importResults: ImportResult[];
  message: string;
}
```

## Business Rules

### Import Execution Rules
1. Only valid rows are imported (invalid rows skipped)
2. Each row processed independently
3. Successful imports are not rolled back if later rows fail
4. Reference data created before contracts
5. Existing active reference data is reused
6. Inactive reference data cannot be used

### Transaction Management Rules
1. Each contract + its reference data = one transaction
2. Transaction commits immediately on success
3. Transaction rolls back on failure (for that row only)
4. Other rows continue processing after a failure
5. No global transaction across all rows

### Reference Data Creation Rules
1. Check if reference data exists by name (case-insensitive)
2. If exists and active → reuse
3. If exists and inactive → fail with error
4. If not exists → create new with default values
5. Reference data matched by name only

### Error Handling Rules
1. Database constraint violations → fail that row
2. Duplicate contract number → fail that row
3. Reference data creation failure → fail that row
4. Network/timeout errors → fail that row
5. Log all errors for debugging

## Technical Considerations

### Implementation Approach
- Independent row processing (no dependencies between rows)
- Transaction per contract (not global transaction)
- Reference data caching to avoid repeated lookups
- Retry logic for transient errors
- Comprehensive error logging
- Audit trail for all operations

### Performance Requirements
- Import 20 contracts in < 30 seconds
- Efficient reference data lookups (caching)
- Minimal database round trips
- Parallel processing where possible

### Security
- No public API exposure (internal only)
- Parameterized queries (SQL injection prevention)
- Audit logging for all imports
- User ID tracking for accountability

### Error Handling
- Graceful failure per row
- Clear error messages
- Detailed error logging
- Transaction rollback per row
- Continue processing after errors

### Data Integrity
- Foreign key constraints enforced
- Unique constraints enforced
- Required fields validated
- Calculated fields accurate
- Audit trail complete

## Team Information

### Team Size
1-2 developers

### Estimated Effort
8 story points (~1-2 weeks)

### Skills Required
- Backend development (Node.js/Express)
- Database transactions (MongoDB)
- Error handling and logging
- Service integration
- Testing (unit, integration)

## Testing Strategy

### Unit Tests
- Import execution logic
- Reference data creation/lookup
- Transaction management
- Error handling scenarios
- Result formatting
- Calculation logic (totalAmount, min/max quantities)

### Integration Tests
- End-to-end import with real database
- Reference data service integration
- Contract service integration
- Transaction rollback scenarios
- Concurrent import handling

### Performance Tests
- 20 contracts import time
- Reference data caching effectiveness
- Database query optimization
- Memory usage

### Acceptance Tests
- All acceptance criteria from US-004
- Partial import scenarios
- Reference data reuse scenarios
- Error handling scenarios
- Audit trail verification

## Deployment Considerations

### Deployment Unit
- Part of monolithic backend
- Deployed with Unit 2
- Requires database access
- Requires access to existing services

### Configuration
- Database connection settings
- Transaction timeout settings
- Reference data cache settings
- Retry logic configuration
- Audit logging configuration

### Monitoring
- Import success/failure rates
- Import execution time
- Reference data creation rates
- Database transaction metrics
- Error rates by type

## Success Criteria
- [ ] Valid rows imported successfully
- [ ] Invalid rows skipped correctly
- [ ] Reference data created when needed
- [ ] Existing reference data reused correctly
- [ ] Transactions managed properly (no data corruption)
- [ ] Import completes in < 30 seconds for 20 rows
- [ ] All errors logged with details
- [ ] Audit trail complete for all imports
- [ ] Zero data integrity issues

## Notes
- This unit has no public APIs (backend internal only)
- Called exclusively by Unit 2 after validation
- Focuses on data persistence and integrity
- Transaction management is critical
- Reference data handling is complex
- Error handling must be robust

---

**Unit Owner**: TBD  
**Status**: Ready for Development  
**Priority**: High  
**Story Points**: 8  
**Created**: March 4, 2026  
**Last Updated**: March 4, 2026
