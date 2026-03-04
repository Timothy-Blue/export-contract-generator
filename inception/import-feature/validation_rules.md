# Validation Rules for Contract Import

## Overview
This document defines all validation rules that must be applied during the contract import process.

## Validation Levels

### Level 1: File-Level Validations
These validations are performed on the entire file before processing individual rows.

| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| F-001 | File must be in CSV format | "Invalid file format. Please upload a CSV file." |
| F-002 | File must not exceed 20 rows (excluding header) | "File exceeds maximum limit of 20 rows. Please split into multiple files." |
| F-003 | File must be UTF-8 encoded | "Invalid file encoding. Please ensure file is UTF-8 encoded." |
| F-004 | File must contain header row with required columns | "Missing required header columns: [list of missing columns]" |
| F-005 | File must not be empty (must have at least 1 data row) | "File is empty. Please add at least one contract row." |

### Level 2: Field-Level Validations
These validations are performed on individual fields in each row.

#### Contract Number (contractNumber)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CN-001 | Required field | "Contract number is required" |
| CN-002 | Must be unique across all existing contracts | "Contract number '{value}' already exists" |
| CN-003 | Must be unique within the import file | "Duplicate contract number '{value}' found in row {row_number}" |
| CN-004 | Must not contain leading/trailing whitespace | "Contract number contains invalid whitespace" |

#### Contract Date (contractDate)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CD-001 | Required field | "Contract date is required" |
| CD-002 | Must be valid date in YYYY-MM-DD format | "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)" |
| CD-003 | Must be a valid calendar date | "Invalid date value" |

#### Buyer Name (buyerName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| BN-001 | Required field | "Buyer name is required" |
| BN-002 | Must not be empty after trimming whitespace | "Buyer name cannot be empty" |

#### Seller Name (sellerName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| SN-001 | Required field | "Seller name is required" |
| SN-002 | Must not be empty after trimming whitespace | "Seller name cannot be empty" |

#### Commodity Name (commodityName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CM-001 | Required field | "Commodity name is required" |
| CM-002 | Must not be empty after trimming whitespace | "Commodity name cannot be empty" |

#### Commodity Description (commodityDescription)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CMD-001 | Required field | "Commodity description is required" |
| CMD-002 | Must not be empty after trimming whitespace | "Commodity description cannot be empty" |

#### Quantity (quantity)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| QT-001 | Required field | "Quantity is required" |
| QT-002 | Must be a valid number | "Quantity must be a valid number" |
| QT-003 | Must be greater than 0 | "Quantity must be greater than 0" |

#### Unit (unit)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| UN-001 | Required field | "Unit is required" |
| UN-002 | Must be one of: MT, KG, TONS, BAGS, PIECES, CARTONS, CBM | "Invalid unit. Must be one of: MT, KG, TONS, BAGS, PIECES, CARTONS, CBM" |

#### Tolerance (tolerance)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| TL-001 | Optional field (defaults to 0) | N/A |
| TL-002 | If provided, must be a valid number | "Tolerance must be a valid number" |
| TL-003 | Must be between 0 and 100 | "Tolerance must be between 0 and 100" |

#### Origin (origin)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| OR-001 | Required field | "Origin is required" |
| OR-002 | Must not be empty after trimming whitespace | "Origin cannot be empty" |

#### Packing (packing)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| PK-001 | Required field | "Packing is required" |
| PK-002 | Must not be empty after trimming whitespace | "Packing cannot be empty" |

#### Quality Spec (qualitySpec)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| QS-001 | Optional field | N/A |

#### Unit Price (unitPrice)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| UP-001 | Required field | "Unit price is required" |
| UP-002 | Must be a valid number | "Unit price must be a valid number" |
| UP-003 | Must be greater than 0 | "Unit price must be greater than 0" |

#### Currency (currency)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CU-001 | Required field | "Currency is required" |
| CU-002 | Must be valid 3-letter currency code | "Invalid currency code" |

#### Incoterm (incoterm)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| IC-001 | Required field | "Incoterm is required" |
| IC-002 | Must be one of: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP | "Invalid incoterm. Must be one of: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP" |

#### Port Location (portLocation)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| PL-001 | Required field | "Port location is required" |
| PL-002 | Must not be empty after trimming whitespace | "Port location cannot be empty" |

#### Payment Term Name (paymentTermName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| PT-001 | Required field | "Payment term name is required" |
| PT-002 | Must not be empty after trimming whitespace | "Payment term name cannot be empty" |

#### Bank Name (bankName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| BK-001 | Required field | "Bank name is required" |
| BK-002 | Must not be empty after trimming whitespace | "Bank name cannot be empty" |

#### Account Name (accountName)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| AN-001 | Required field | "Account name is required" |
| AN-002 | Must not be empty after trimming whitespace | "Account name cannot be empty" |

#### Account Number (accountNumber)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| AC-001 | Required field | "Account number is required" |
| AC-002 | Must not be empty after trimming whitespace | "Account number cannot be empty" |

#### SWIFT Code (swiftCode)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| SW-001 | Required field | "SWIFT code is required" |
| SW-002 | Must be 8 or 11 characters | "SWIFT code must be 8 or 11 characters" |
| SW-003 | Must match pattern: [A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})? | "Invalid SWIFT code format. Must be 6 letters + 2 alphanumeric + optional 3 alphanumeric" |
| SW-004 | Must be uppercase | "SWIFT code must be uppercase" |

#### Shipment Period (shipmentPeriod)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| SP-001 | Optional field | N/A |

#### Additional Terms (additionalTerms)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| AT-001 | Optional field | N/A |

#### Release Type (releaseType)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| RT-001 | Optional field (defaults to NOT_SPECIFIED) | N/A |
| RT-002 | If provided, must be one of: SWB, TELEX_RELEASE, ORIGINAL_BL, NOT_SPECIFIED | "Invalid release type. Must be one of: SWB, TELEX_RELEASE, ORIGINAL_BL, NOT_SPECIFIED" |

#### Status (status)
| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| ST-001 | Optional field (defaults to DRAFT) | N/A |
| ST-002 | If provided, must be one of: DRAFT, FINALIZED, SENT, SIGNED, CANCELLED | "Invalid status. Must be one of: DRAFT, FINALIZED, SENT, SIGNED, CANCELLED" |

### Level 3: Business Logic Validations
These validations enforce business rules across multiple fields.

| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| BL-001 | Buyer and Seller cannot be the same | "Buyer and Seller cannot be the same party" |
| BL-002 | Total amount calculation: quantity × unitPrice must be valid | "Unable to calculate total amount. Check quantity and unit price values" |
| BL-003 | If tolerance > 0, min/max quantity calculations must be valid | "Unable to calculate quantity range with given tolerance" |
| BL-004 | Contract date should not be in the far future (warning only, > 1 year) | "Warning: Contract date is more than 1 year in the future" |

### Level 4: Reference Data Validations
These validations check reference data integrity.

| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| RD-001 | If buyer exists, it must be active | "Buyer '{name}' exists but is inactive" |
| RD-002 | If seller exists, it must be active | "Seller '{name}' exists but is inactive" |
| RD-003 | If commodity exists, it must be active | "Commodity '{name}' exists but is inactive" |
| RD-004 | If payment term exists, it must be active | "Payment term '{name}' exists but is inactive" |
| RD-005 | If bank details exist, it must be active | "Bank details '{name}' exists but is inactive" |
| RD-006 | Bank details combination (bankName + accountNumber) should be unique when creating new | "Bank details with same bank name and account number already exists" |

### Level 5: Cross-Field Validations
These validations check relationships between fields.

| Rule ID | Rule Description | Error Message |
|---------|------------------|---------------|
| CF-001 | Currency in contract should match currency in bank details (if bank exists) | "Warning: Contract currency '{currency}' differs from bank account currency '{bankCurrency}'" |
| CF-002 | Unit should match commodity's default unit (if commodity exists) | "Warning: Unit '{unit}' differs from commodity's default unit '{defaultUnit}'" |

## Validation Processing Order

1. File-Level Validations (F-001 to F-005)
2. For each row:
   a. Field-Level Validations (all field rules)
   b. Business Logic Validations (BL-001 to BL-004)
   c. Reference Data Validations (RD-001 to RD-006)
   d. Cross-Field Validations (CF-001 to CF-002)

## Error Handling Strategy

### Critical Errors (Stop Processing)
- All File-Level validation failures
- All Required field validation failures
- All Data type validation failures
- All Business Logic validation failures

### Warnings (Continue Processing)
- Cross-field mismatches (CF-001, CF-002)
- Future date warnings (BL-004)

### Row-Level Error Handling
- If a row has any critical error, skip that row and continue with next row
- Collect all errors for each row
- Report all errors at the end of validation

## Validation Output Format

For each row, provide:
```json
{
  "rowNumber": 2,
  "contractNumber": "CNT-2026-001",
  "status": "valid" | "invalid" | "warning",
  "errors": [
    {
      "ruleId": "CN-002",
      "field": "contractNumber",
      "message": "Contract number 'CNT-2026-001' already exists",
      "severity": "error"
    }
  ],
  "warnings": [
    {
      "ruleId": "CF-001",
      "field": "currency",
      "message": "Contract currency 'USD' differs from bank account currency 'EUR'",
      "severity": "warning"
    }
  ]
}
```
