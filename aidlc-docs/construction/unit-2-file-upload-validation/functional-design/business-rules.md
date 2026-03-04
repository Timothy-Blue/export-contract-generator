# Business Rules — Unit 2: File Upload & Validation Service

## Core Import Strategy Rules

| Rule | Description |
|------|-------------|
| IS-001 | Import is all-or-nothing: if ANY row has errors, NO rows are imported |
| IS-002 | All rows must pass validation before import is triggered |
| IS-003 | User must confirm before import executes, even when all rows are valid |
| IS-004 | Warnings do not block import — only errors do |
| IS-005 | No partial imports — skipped/partial states do not exist |
| IS-006 | No concurrent upload limits — multiple admins may upload simultaneously |
| IS-007 | Validation results and import results are not persisted to the database |

---

## File-Level Rules (F-001 to F-005)

| Rule ID | Rule | Error Code | Error Message | Behavior |
|---------|------|------------|---------------|----------|
| F-001 | File must be CSV format (.csv extension and valid CSV content) | INVALID_FILE_FORMAT | "Invalid file format. Please upload a CSV file." | Fail-fast, return 400 |
| F-002 | File must not exceed 20 data rows (excluding header) | FILE_TOO_LARGE | "File exceeds maximum limit of 20 rows. Please split into multiple files." | Fail-fast, return 400 |
| F-003 | File must be UTF-8 encoded | INVALID_ENCODING | "Invalid file encoding. Please ensure file is UTF-8 encoded." | Fail-fast, return 400 |
| F-004 | File must contain all 25 required header columns (exact names, case-sensitive) | MISSING_HEADERS | "Missing required header columns: [comma-separated list]" | Fail-fast, return 400 |
| F-005 | File must have at least 1 data row | FILE_EMPTY | "File is empty. Please add at least one contract row." | Fail-fast, return 400 |

**Processing order**: F-001 → F-003 → F-004 → F-005 → F-002. Stop at first failure.

---

## Field-Level Rules (Level 2)

### Contract Number
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CN-001 | Required — must not be empty after trim | error | "Contract number is required" |
| CN-002 | Must not already exist in the database | error | "Contract number '{value}' already exists" |
| CN-003 | Must be unique within the uploaded file | error | "Duplicate contract number '{value}' found in row {first_occurrence_row}" |
| CN-004 | Must not contain leading or trailing whitespace | error | "Contract number contains invalid whitespace" |

### Contract Date
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CD-001 | Required | error | "Contract date is required" |
| CD-002 | Must match YYYY-MM-DD format | error | "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)" |
| CD-003 | Must be a valid calendar date | error | "Invalid date value" |

### Buyer Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| BN-001 | Required | error | "Buyer name is required" |
| BN-002 | Must not be empty after trim | error | "Buyer name cannot be empty" |

### Seller Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| SN-001 | Required | error | "Seller name is required" |
| SN-002 | Must not be empty after trim | error | "Seller name cannot be empty" |

### Commodity Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CM-001 | Required | error | "Commodity name is required" |
| CM-002 | Must not be empty after trim | error | "Commodity name cannot be empty" |

### Commodity Description
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CMD-001 | Required | error | "Commodity description is required" |
| CMD-002 | Must not be empty after trim | error | "Commodity description cannot be empty" |

### Quantity
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| QT-001 | Required | error | "Quantity is required" |
| QT-002 | Must be a valid number (parseFloat, not NaN) | error | "Quantity must be a valid number" |
| QT-003 | Must be greater than 0 | error | "Quantity must be greater than 0" |

### Unit
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| UN-001 | Required | error | "Unit is required" |
| UN-002 | Must be one of: MT, KG, TONS, BAGS, PIECES, CARTONS, CBM | error | "Invalid unit. Must be one of: MT, KG, TONS, BAGS, PIECES, CARTONS, CBM" |

### Tolerance
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| TL-001 | Optional — defaults to 0 if column missing | — | — |
| TL-002 | If provided (non-empty), must be a valid number | error | "Tolerance must be a valid number" |
| TL-003 | Must be between 0 and 100 (inclusive) | error | "Tolerance must be between 0 and 100" |

### Origin
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| OR-001 | Required | error | "Origin is required" |
| OR-002 | Must not be empty after trim | error | "Origin cannot be empty" |

### Packing
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| PK-001 | Required | error | "Packing is required" |
| PK-002 | Must not be empty after trim | error | "Packing cannot be empty" |

### Quality Spec
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| QS-001 | Optional — no validation | — | — |

### Unit Price
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| UP-001 | Required | error | "Unit price is required" |
| UP-002 | Must be a valid number | error | "Unit price must be a valid number" |
| UP-003 | Must be greater than 0 | error | "Unit price must be greater than 0" |

### Currency
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CU-001 | Required | error | "Currency is required" |
| CU-002 | Must be a valid 3-letter uppercase currency code (A-Z, exactly 3 chars) | error | "Invalid currency code" |

### Incoterm
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| IC-001 | Required | error | "Incoterm is required" |
| IC-002 | Must be one of: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP | error | "Invalid incoterm. Must be one of: EXW, FCA, FAS, FOB, CFR, CIF, CPT, CIP, DAP, DPU, DDP" |

### Port Location
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| PL-001 | Required | error | "Port location is required" |
| PL-002 | Must not be empty after trim | error | "Port location cannot be empty" |

### Payment Term Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| PT-001 | Required | error | "Payment term name is required" |
| PT-002 | Must not be empty after trim | error | "Payment term name cannot be empty" |

### Bank Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| BK-001 | Required | error | "Bank name is required" |
| BK-002 | Must not be empty after trim | error | "Bank name cannot be empty" |

### Account Name
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| AN-001 | Required | error | "Account name is required" |
| AN-002 | Must not be empty after trim | error | "Account name cannot be empty" |

### Account Number
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| AC-001 | Required | error | "Account number is required" |
| AC-002 | Must not be empty after trim | error | "Account number cannot be empty" |

### SWIFT Code
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| SW-001 | Required | error | "SWIFT code is required" |
| SW-002 | Must be exactly 8 or 11 characters | error | "SWIFT code must be 8 or 11 characters" |
| SW-003 | Must match pattern: `[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?` | error | "Invalid SWIFT code format. Must be 6 letters + 2 alphanumeric + optional 3 alphanumeric" |
| SW-004 | Must be uppercase | error | "SWIFT code must be uppercase" |

### Shipment Period
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| SP-001 | Optional — no validation | — | — |

### Additional Terms
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| AT-001 | Optional — no validation | — | — |

### Release Type
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| RT-001 | Optional — defaults to NOT_SPECIFIED if column missing | — | — |
| RT-002 | If provided (non-empty), must be one of: SWB, TELEX_RELEASE, ORIGINAL_BL, NOT_SPECIFIED | error | "Invalid release type. Must be one of: SWB, TELEX_RELEASE, ORIGINAL_BL, NOT_SPECIFIED" |

### Status
| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| ST-001 | Optional — defaults to DRAFT if column missing | — | — |
| ST-002 | If provided (non-empty), must be one of: DRAFT, FINALIZED, SENT, SIGNED, CANCELLED | error | "Invalid status. Must be one of: DRAFT, FINALIZED, SENT, SIGNED, CANCELLED" |

---

## Business Logic Rules (Level 3)

| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| BL-001 | buyerName (trimmed) must not equal sellerName (trimmed) | error | "Buyer and Seller cannot be the same party" |
| BL-002 | quantity × unitPrice must produce a finite positive number | error | "Unable to calculate total amount. Check quantity and unit price values" |
| BL-003 | If tolerance > 0: min/max quantity calculations must be finite | error | "Unable to calculate quantity range with given tolerance" |
| BL-004 | contractDate must not be more than 365 days after today | warning | "Warning: Contract date is more than 1 year in the future" |

**Calculation formulas** (full floating point precision, no rounding per Q9):
- `totalAmount = quantity × unitPrice`
- `minQuantity = quantity - (quantity × tolerance / 100)`
- `maxQuantity = quantity + (quantity × tolerance / 100)`
- `minTotalAmount = totalAmount - (totalAmount × tolerance / 100)`
- `maxTotalAmount = totalAmount + (totalAmount × tolerance / 100)`

---

## Reference Data Rules (Level 4)

Lookup uses exact case-sensitive name matching (Q3). Not-found = pass (Q4).

| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| RD-001 | If buyer found in DB: must be active | error | "Buyer '{name}' exists but is inactive" |
| RD-002 | If seller found in DB: must be active | error | "Seller '{name}' exists but is inactive" |
| RD-003 | If commodity found in DB: must be active | error | "Commodity '{name}' exists but is inactive" |
| RD-004 | If payment term found in DB: must be active | error | "Payment term '{name}' exists but is inactive" |
| RD-005 | If bank details found in DB (by bankName+accountNumber+swiftCode): must be active | error | "Bank details '{bankName}' exists but is inactive" |
| RD-006 | Bank details lookup key: bankName + accountNumber + swiftCode (all three, per Q5) | — | — |

---

## Cross-Field Rules (Level 5)

| Rule ID | Rule | Severity | Message |
|---------|------|----------|---------|
| CF-001 | If bank found in DB: contract currency should match bank currency | warning | "Warning: Contract currency '{currency}' differs from bank account currency '{bankCurrency}'" |
| CF-002 | If commodity found in DB: contract unit should match commodity defaultUnit | warning | "Warning: Unit '{unit}' differs from commodity's default unit '{defaultUnit}'" |

---

## Validation Processing Order

```
Per upload:
  1. File-level validation (fail-fast on first error → 400)
  2. Load reference data cache (5 DB queries)
  3. Build contract number frequency map (for CN-003)

Per row (collect all errors, never stop early):
  4. Level 2: Field-level validation
  5. Level 3: Business logic validation (skip if dependent fields have type errors)
  6. Level 4: Reference data validation (uses cache)
  7. Level 5: Cross-field validation (uses cache)

After all rows:
  8. Import decision (all valid → confirm → import | any invalid → return errors)
```

---

## Error Severity Summary

| Severity | Effect | Examples |
|----------|--------|---------|
| error | Row is invalid, blocks import of entire file | Missing required field, duplicate contract number, inactive reference |
| warning | Row is valid, import proceeds | Future date, currency mismatch, unit mismatch |

---

**Created**: March 4, 2026
**Unit**: Unit 2 — File Upload & Validation Service
