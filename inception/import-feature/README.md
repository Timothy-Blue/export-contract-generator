# Contract Import Feature - User Stories

## Overview
This directory contains comprehensive user stories for the Contract Import feature, which allows admin users to import multiple contracts via CSV file upload.

## Feature Summary
The Contract Import feature enables efficient bulk creation of contracts by:
- Providing a downloadable CSV template with sample data
- Validating uploaded data against business rules
- Creating reference data automatically when needed
- Supporting partial imports (valid rows imported, invalid rows skipped)
- Providing detailed error reporting and guidance

## User Stories

### [US-001: Download CSV Template](./US-001-download-template/user_story.md)
**Story Points:** 1  
**Priority:** High

Admin users can download a static CSV template with sample data to understand the required format for contract import.

**Key Features:**
- Static CSV file download
- Sample data demonstrating proper formatting
- No dynamic generation needed

---

### [US-002: Upload CSV File for Import](./US-002-upload-csv/user_story.md)
**Story Points:** 2  
**Priority:** High

Admin users can upload a CSV file which automatically triggers validation and import processing.

**Key Features:**
- Simple file upload interface
- File type and size validation
- Maximum 20 rows per file
- Clear error messages for invalid files
- Automatic processing (no preview or confirmation)
- Single upload at a time

---

### [US-003: Validate and Import CSV Data](./US-003-validate-data/user_story.md)
**Story Points:** 13  
**Priority:** High

System automatically validates all uploaded data and immediately imports valid rows without requiring preview or confirmation.

**Key Features:**
- 5 levels of validation (file, field, business logic, reference data, cross-field)
- Automatic import of valid rows
- Skips invalid rows with detailed error reporting
- Supports partial imports
- Progress tracking during import
- No preview step - streamlined workflow

---

### [US-004: Import Execution and Results](./US-004-transaction-management/user_story.md)
**Story Points:** 8  
**Priority:** High

Complete import execution with transaction management and results display.

**Key Features:**
- Transaction management for data integrity
- Automatic reference data creation
- Independent row processing
- Simple status messages and results display
- Error report generation
- Automatic redirect to contract list
- Audit trail

---

### [US-005: Handle Import Errors](./US-005-handle-errors/user_story.md)
**Story Points:** 2  
**Priority:** Medium

System provides clear error messages when validation or import errors occur.

**Key Features:**
- Clear error messages
- Field name and error text
- Validation and business rule error messages
- Simple error display

---

## Total Story Points: 26

## Import Workflow

```
1. Download Template (US-001)
   ↓
2. Prepare CSV file with contract data
   ↓
3. Upload CSV file (US-002)
   ↓
4. Automatic Validation and Import (US-003)
   ├─ Backend: Transaction Management (US-004)
   └─ Errors found? → Download Error Report (US-006) → Fix and re-upload
      ↓
5. View Results (US-005)
   ├─ View imported contracts
   ├─ Download reports
   └─ Import another file
```

## Key Features

### Partial Import Support
- Valid rows are imported even if some rows have errors
- Invalid rows are skipped with detailed error messages
- Users can fix errors and re-import failed rows

### Automatic Reference Data Creation
- Buyers, Sellers, Commodities, Payment Terms, and Bank Details are created automatically if they don't exist
- Existing active reference data is reused
- Reference data is matched by name (case-insensitive)

### Comprehensive Validation
- **File-level:** Format, size, encoding, structure
- **Field-level:** Required fields, data types, formats, enums
- **Business logic:** Buyer ≠ Seller, calculations, uniqueness
- **Reference data:** Existence, active status
- **Cross-field:** Currency consistency, unit consistency

### User-Friendly Error Handling
- Clear, actionable error messages
- Downloadable error reports in CSV format
- Inline help and documentation
- Error categorization and grouping
- Prevention guidance

## Technical Specifications

### CSV Template Specification
See [csv_template_specification.md](./csv_template_specification.md) for:
- Complete column mapping
- Data types and formats
- Valid enum values
- Reference data creation rules
- CSV format requirements

### Validation Rules
See [validation_rules.md](./validation_rules.md) for:
- All validation rules with rule IDs
- Error messages
- Validation processing order
- Error handling strategy

### Sample Template
See [csv_template.csv](./csv_template.csv) for a working example with sample data.

## Business Rules

1. **Access Control:** Only admin users can import contracts
2. **File Limits:** Maximum 20 rows per file (excluding header)
3. **Reference Data:** Created by name if not exists, reused if exists and active
4. **Partial Imports:** Valid rows imported, invalid rows skipped
5. **Uniqueness:** Contract numbers must be unique across the system
6. **Validation:** Mandatory before import, cannot be skipped
7. **Preview:** Mandatory before import, users must confirm
8. **Audit Trail:** All imports logged with user and timestamp

## Dependencies

### Models
- Contract model (server/models/Contract.js)
- Party model (server/models/Party.js)
- Commodity model (server/models/Commodity.js)
- PaymentTerm model (server/models/PaymentTerm.js)
- BankDetails model (server/models/BankDetails.js)

### Existing Features
- User authentication and authorization
- Contract list page
- Reference data management pages

### Technical Requirements
- File upload handling
- CSV parsing library
- Database transaction management
- Report generation
- Progress tracking

## Implementation Considerations

### Performance
- Import 20 contracts in under 30 seconds
- Validation completes within 10 seconds
- Progress updates every 1-2 seconds
- Efficient reference data lookups (caching)

### Security
- Admin role verification
- Server-side validation (never trust client)
- SQL injection prevention
- Rate limiting
- Audit logging

### Error Handling
- Graceful degradation
- Clear error messages
- Partial success support
- Transaction management
- Retry logic for transient errors

### User Experience
- Clear visual feedback
- Progress indicators
- Helpful error messages
- Easy navigation
- Downloadable reports

## Future Enhancements (Not in Current Scope)

1. **Export Existing Contracts:** Export contracts to CSV format
2. **Inline Editing:** Edit errors directly in preview screen
3. **Bulk Operations:** Update existing contracts via CSV
4. **Scheduled Imports:** Automated imports from external sources
5. **Import Templates:** Save custom column mappings
6. **Validation Profiles:** Custom validation rules per user/role
7. **Import History:** Detailed history with rollback capability
8. **Internationalization:** Multi-language error messages

## Success Metrics

- Import success rate (target: >90% of valid rows)
- Average time to complete import (target: <30 seconds for 20 rows)
- Error resolution rate (target: >80% of users fix and re-import)
- User satisfaction (target: >4/5 rating)
- Support tickets related to import (target: <5% of imports)

## Documentation

- [Contract Import Plan](./contract-import-plan.md) - Overall planning document
- [CSV Template Specification](./csv_template_specification.md) - Complete CSV format documentation
- [Validation Rules](./validation_rules.md) - All validation rules and error messages
- [CSV Template](./csv_template.csv) - Sample template file

## Contact

For questions or clarifications about these user stories, please contact the product team.

---

**Last Updated:** March 4, 2026  
**Version:** 1.0  
**Status:** Ready for Development
