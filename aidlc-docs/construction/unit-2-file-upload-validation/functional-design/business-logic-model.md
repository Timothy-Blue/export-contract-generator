# Business Logic Model — Unit 2: File Upload & Validation Service

## Overview
This document describes the complete business logic workflow for the file upload, validation, and import trigger pipeline. All logic is technology-agnostic.

---

## 1. Top-Level Workflow

```
RECEIVE file upload request
    │
    ├─ [FAIL] File-level validation fails → return 400 with first error (fail-fast)
    │
    ▼
PARSE CSV into rows
    │
    ▼
LOAD reference data cache (one DB round-trip per entity type)
    │
    ▼
VALIDATE all rows (collect all errors, never stop early)
    │
    ├─ [ANY invalid rows] → return 200 with validation results, importResults = null
    │                        (all-or-nothing: no import occurs)
    │
    └─ [ALL rows valid] → show confirmation dialog to user
                              │
                              ├─ [User cancels] → no import
                              │
                              └─ [User confirms] → CALL Unit 3: executeImport(validatedRows)
                                                       │
                                                       ▼
                                                   return 200 with full results
```

---

## 2. File-Level Validation Algorithm

Executed in order. Stop and return 400 on the first failure (fail-fast per Q18).

```
1. Check MIME type and file extension → must be .csv
   → FAIL: code=INVALID_FILE_FORMAT

2. Check file encoding → must be UTF-8
   → FAIL: code=INVALID_ENCODING

3. Parse header row → extract column names
   → FAIL if parse error: code=INVALID_FILE_FORMAT

4. Check required headers present (all 25 columns must exist)
   → FAIL: code=MISSING_HEADERS, message lists missing column names

5. Count data rows (rows after header)
   → FAIL if 0 rows: code=FILE_EMPTY
   → FAIL if > 20 rows: code=FILE_TOO_LARGE
```

**Required headers** (exact names, case-sensitive):
`contractNumber`, `contractDate`, `status`, `buyerName`, `sellerName`, `commodityName`, `commodityDescription`, `quantity`, `unit`, `tolerance`, `origin`, `packing`, `qualitySpec`, `unitPrice`, `currency`, `incoterm`, `portLocation`, `paymentTermName`, `bankName`, `accountName`, `accountNumber`, `swiftCode`, `shipmentPeriod`, `additionalTerms`, `releaseType`

---

## 3. Reference Data Cache Loading Algorithm

Executed once after file-level validation passes, before any row validation.

```
1. Collect all unique buyerName values from all rows
2. Collect all unique sellerName values from all rows
3. Query DB: fetch all Party records where companyName IN (buyers ∪ sellers)
   → Build cache: Map<companyName, {type, isActive}>

4. Collect all unique commodityName values from all rows
5. Query DB: fetch all Commodity records where name IN (commodityNames)
   → Build cache: Map<name, {defaultUnit, isActive}>

6. Collect all unique paymentTermName values from all rows
7. Query DB: fetch all PaymentTerm records where name IN (paymentTermNames)
   → Build cache: Map<name, {isActive}>

8. Collect all unique (bankName, accountNumber, swiftCode) tuples from all rows
9. Query DB: fetch all BankDetails records matching any of those tuples
   → Build cache: Map<"bankName|accountNumber|swiftCode", {currency, isActive}>

10. Collect all contractNumber values from all rows
11. Query DB: fetch all Contract records where contractNumber IN (contractNumbers)
    → Build cache: Set<contractNumber> of existing numbers
```

Total: 5 DB queries regardless of row count.

---

## 4. Row Validation Algorithm

For each row, execute all 4 sub-levels in order. Collect ALL errors — never stop at first error within a row.

### 4.1 Level 2: Field-Level Validation

For each field, apply rules in the order listed in `business-rules.md`.

**Parsing rules for typed fields:**
- Dates: parse string as `YYYY-MM-DD`; reject if not matching pattern or not a valid calendar date
- Numbers: parse with `parseFloat`; reject if `NaN` or `Infinity`
- Enums: compare against allowed values list (exact case-sensitive match)
- Strings: trim whitespace before required-field check; store trimmed value

**Optional field defaults** (applied only when column is missing from file entirely):
- `tolerance` → `0`
- `status` → `"DRAFT"`
- `releaseType` → `"NOT_SPECIFIED"`
- `qualitySpec`, `shipmentPeriod`, `additionalTerms` → `""` (empty string)

### 4.2 Level 3: Business Logic Validation

Executed only if all required fields for the rule are present and valid (no type errors).

```
BL-001: buyerName.trim() !== sellerName.trim()
        → ERROR if equal

BL-002: quantity × unitPrice must produce a finite positive number
        → ERROR if result is NaN, Infinity, or ≤ 0

BL-003: if tolerance > 0:
          minQty = quantity - (quantity × tolerance / 100)
          maxQty = quantity + (quantity × tolerance / 100)
          → ERROR if either calculation produces NaN or Infinity

BL-004: if contractDate > (today + 365 days):
          → WARNING (not error)
```

### 4.3 Level 4: Reference Data Validation

Uses the pre-loaded cache. Exact case-sensitive name lookup per Q3.

```
For buyerName:
  if found in cache:
    if NOT isActive → ERROR RD-001
  if NOT found → PASS (will be created by Unit 3)

For sellerName:
  if found in cache:
    if NOT isActive → ERROR RD-002
  if NOT found → PASS

For commodityName:
  if found in cache:
    if NOT isActive → ERROR RD-003
  if NOT found → PASS

For paymentTermName:
  if found in cache:
    if NOT isActive → ERROR RD-004
  if NOT found → PASS

For (bankName + accountNumber + swiftCode):
  if found in cache:
    if NOT isActive → ERROR RD-005
  if NOT found → PASS

Contract number uniqueness:
  CN-003: if contractNumber appears more than once in the file → ERROR on the duplicate row
  CN-002: if contractNumber exists in DB cache → ERROR
```

**Note on CN-003**: Build a frequency map of contract numbers across all rows before validation. Any row whose contract number appears more than once gets CN-003 on the second (and subsequent) occurrence.

### 4.4 Level 5: Cross-Field Validation

Executed only if relevant reference data was found in cache.

```
CF-001: if bank found in cache AND bank.currency ≠ row.currency
          → WARNING

CF-002: if commodity found in cache AND commodity.defaultUnit ≠ row.unit
          → WARNING
```

---

## 5. Import Decision Algorithm

```
After all rows validated:

validRows = rows where isValid === true
invalidRows = rows where isValid === false

if invalidRows.length > 0:
  → Return response immediately
  → success: false
  → importResults: null
  → message: "Validation failed. Please fix all errors and re-upload."
  → (no import occurs — all-or-nothing per Q2/Q20)

if invalidRows.length === 0:
  → Present confirmation to user: "All N rows are valid. Import N contracts?"
  → On user confirm:
      → Call Unit 3: executeImport(validatedRows)
      → Assemble and return full response
  → On user cancel:
      → No import, no response sent (client-side only)
```

---

## 6. Response Assembly Algorithm

```
summary = {
  totalRows: parsedFile.totalRows,
  validRows: validatedRows.filter(r => r.isValid).length,
  invalidRows: validatedRows.filter(r => !r.isValid).length,
  importedRows: importResults ? importResults.filter(r => r.status === "imported").length : 0
}

validationResults = validatedRows.map(row => {
  status = row.errors.length > 0 ? "invalid"
         : row.warnings.length > 0 ? "warning"
         : "valid"
  return { rowNumber, contractNumber, status, errors, warnings }
})

if import was executed:
  importResults = results from Unit 3
  success = importResults.every(r => r.status === "imported")
  message = success ? "Import completed successfully."
                    : "Import completed with some failures."
else:
  importResults = null
  success = false
  message = "Validation failed. Please fix all errors and re-upload."
```

---

## 7. Error Response Assembly (File-Level Failures)

```
HTTP 400
{
  success: false,
  message: <first file-level error message>,
  code: <error code>
}
```

No `validationResults` or `importResults` in 400 responses.

---

## 8. System Error Handling

Any unhandled exception during the pipeline:
- Log full error server-side (with stack trace)
- Return HTTP 500 to client:
  ```json
  {
    "success": false,
    "message": "Import failed due to a server error. Please contact your administrator.",
    "code": "SERVER_ERROR"
  }
  ```
- Never expose stack traces or internal error details to the client

---

**Created**: March 4, 2026
**Unit**: Unit 2 — File Upload & Validation Service
