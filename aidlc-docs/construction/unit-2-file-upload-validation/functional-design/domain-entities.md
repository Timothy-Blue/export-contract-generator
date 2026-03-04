# Domain Entities — Unit 2: File Upload & Validation Service

## Overview
Unit 2 operates on transient (in-memory) domain objects only. No new persistent entities are introduced — validation results and import results are returned in the API response and not stored.

---

## 1. CsvUploadRequest
Represents the incoming file upload from the admin user.

| Attribute | Type | Description |
|-----------|------|-------------|
| file | Buffer | Raw file bytes |
| originalName | string | Original filename from client |
| mimeType | string | MIME type declared by client |
| sizeBytes | number | File size in bytes |

---

## 2. ParsedCsvFile
Result of parsing the raw CSV buffer.

| Attribute | Type | Description |
|-----------|------|-------------|
| headers | string[] | Column names from header row |
| rows | RawCsvRow[] | All data rows as key-value maps |
| totalRows | number | Count of data rows (excluding header) |

---

## 3. RawCsvRow
A single unparsed row from the CSV, before any validation.

| Attribute | Type | Description |
|-----------|------|-------------|
| rowNumber | number | 1-based row number (header = row 1, first data row = row 2) |
| fields | Map<string, string> | Column name → raw string value |

---

## 4. ValidatedRow
A row after all 5 validation levels have been applied.

| Attribute | Type | Description |
|-----------|------|-------------|
| rowNumber | number | Row number from source CSV |
| contractNumber | string | Parsed contract number (or empty if missing) |
| isValid | boolean | True only if zero errors |
| hasWarnings | boolean | True if any warnings exist |
| data | ContractImportData | Parsed and typed field values |
| errors | ValidationError[] | All errors collected for this row |
| warnings | ValidationWarning[] | All warnings collected for this row |

---

## 5. ContractImportData
Typed, parsed field values for a single contract row. Mirrors the CSV columns.

| Attribute | Type | Required | Default |
|-----------|------|----------|---------|
| contractNumber | string | Yes | — |
| contractDate | Date | Yes | — |
| status | string (enum) | No | DRAFT |
| buyerName | string | Yes | — |
| sellerName | string | Yes | — |
| commodityName | string | Yes | — |
| commodityDescription | string | Yes | — |
| quantity | number | Yes | — |
| unit | string (enum) | Yes | — |
| tolerance | number | No | 0 |
| origin | string | Yes | — |
| packing | string | Yes | — |
| qualitySpec | string | No | "" (empty string if column present-but-empty) |
| unitPrice | number | Yes | — |
| currency | string | Yes | — |
| incoterm | string (enum) | Yes | — |
| portLocation | string | Yes | — |
| paymentTermName | string | Yes | — |
| bankName | string | Yes | — |
| accountName | string | Yes | — |
| accountNumber | string | Yes | — |
| swiftCode | string | Yes | — |
| shipmentPeriod | string | No | "" (empty string if column present-but-empty) |
| additionalTerms | string | No | "" (empty string if column present-but-empty) |
| releaseType | string (enum) | No | NOT_SPECIFIED |

**Note on optional fields**: If a column is present in the CSV but empty, the value is stored as an explicit empty string `""`. If the column is entirely missing from the file, the default value is used. This distinction is preserved per Q12.

---

## 6. ValidationError
A single validation failure on a row.

| Attribute | Type | Description |
|-----------|------|-------------|
| ruleId | string | Rule identifier (e.g., "CN-002") |
| field | string | CSV column name the error applies to |
| message | string | User-facing error message |
| severity | "error" | Always "error" for this type |

---

## 7. ValidationWarning
A non-blocking validation notice on a row.

| Attribute | Type | Description |
|-----------|------|-------------|
| ruleId | string | Rule identifier (e.g., "CF-001") |
| field | string | CSV column name the warning applies to |
| message | string | User-facing warning message |
| severity | "warning" | Always "warning" for this type |

---

## 8. ReferenceDataCache
In-memory cache of reference data loaded once before row validation begins, to avoid repeated DB queries.

| Attribute | Type | Description |
|-----------|------|-------------|
| parties | Map<string, PartyRecord> | Key: exact companyName → Party record |
| commodities | Map<string, CommodityRecord> | Key: exact name → Commodity record |
| paymentTerms | Map<string, PaymentTermRecord> | Key: exact name → PaymentTerm record |
| bankDetails | Map<string, BankDetailsRecord> | Key: `bankName|accountNumber|swiftCode` → BankDetails record |
| existingContractNumbers | Set<string> | All contract numbers currently in DB |

**Note**: Cache is populated once per upload request before row-level validation starts. Lookup keys use exact case-sensitive matching per Q3.

---

## 9. ValidationResult (API Response Shape)
The complete response returned by `POST /api/import/upload`.

| Attribute | Type | Description |
|-----------|------|-------------|
| success | boolean | True if all rows valid and all imported |
| message | string | Human-readable outcome summary |
| summary | ImportSummary | Counts of rows by outcome |
| validationResults | RowValidationResult[] | Per-row validation detail |
| importResults | RowImportResult[] \| null | Per-row import outcome (null if validation failed) |

---

## 10. ImportSummary

| Attribute | Type | Description |
|-----------|------|-------------|
| totalRows | number | Total data rows in file |
| validRows | number | Rows that passed all validation |
| invalidRows | number | Rows with at least one error |
| importedRows | number | Rows successfully imported (0 if any invalid) |

---

## 11. RowValidationResult

| Attribute | Type | Description |
|-----------|------|-------------|
| rowNumber | number | Row number |
| contractNumber | string | Contract number from that row |
| status | "valid" \| "invalid" \| "warning" | Row validation outcome |
| errors | ValidationError[] | Errors (empty array if none) |
| warnings | ValidationWarning[] | Warnings (empty array if none) |

---

## 12. RowImportResult

| Attribute | Type | Description |
|-----------|------|-------------|
| rowNumber | number | Row number |
| contractNumber | string | Contract number |
| status | "imported" \| "failed" | Import outcome |
| contractId | string \| null | MongoDB ObjectId of created contract |
| error | string \| null | Error message if failed |

---

## Entity Relationships

```
CsvUploadRequest
    │
    ▼ (parse)
ParsedCsvFile ──── RawCsvRow[]
                       │
                       ▼ (validate with ReferenceDataCache)
                   ValidatedRow[]
                       │
                       ├── ContractImportData
                       ├── ValidationError[]
                       └── ValidationWarning[]
                       │
                       ▼ (all valid? → Unit 3)
                   RowImportResult[]
                       │
                       ▼ (assemble)
                   ValidationResult (API response)
```

---

**Created**: March 4, 2026
**Unit**: Unit 2 — File Upload & Validation Service
