# Business Rules — Unit 3: Import Execution & Results Service

## Import Strategy Rules

| Rule ID | Rule |
|---------|------|
| IE-001 | Unit 3 only receives fully-validated rows — it never re-validates |
| IE-002 | Import is all-or-nothing: if any contract fails to save, the entire transaction rolls back |
| IE-003 | If any reference data resolution fails, the entire import is aborted before the transaction opens |
| IE-004 | No partial imports — either all rows are imported or none are |
| IE-005 | Unit 3 has no public API — it is called exclusively by Unit 2 |

---

## Reference Data Resolution Rules

| Rule ID | Rule | Error Message |
|---------|------|---------------|
| RR-001 | Reference data lookup uses exact case-sensitive name matching | — |
| RR-002 | If reference data exists and is active → reuse it, do not create duplicate | — |
| RR-003 | If reference data exists and is inactive → abort import | "'{name}' exists but is inactive" |
| RR-004 | If reference data does not exist → create new record with defaults | — |
| RR-005 | The same name cannot be used as both a buyer and a seller in the same import | "'{name}' cannot be used as both buyer and seller" |
| RR-006 | Buyer Party is created with type = "BUYER"; Seller Party with type = "SELLER" | — |
| RR-007 | Bank details lookup key: bankName + accountNumber + swiftCode (all three must match) | — |
| RR-008 | Reference data is resolved once per unique name across all rows (not per row) | — |

---

## Reference Data Creation Defaults

### Party (Buyer or Seller)
| Field | Value |
|-------|-------|
| companyName | from CSV |
| type | BUYER or SELLER |
| address | "To be updated" |
| isActive | true |
| all other fields | not set |

### Commodity
| Field | Value |
|-------|-------|
| name | commodityName from CSV |
| description | commodityDescription from CSV (first row using this commodity) |
| defaultUnit | unit from CSV |
| defaultOrigin | origin from CSV |
| defaultPacking | packing from CSV |
| isActive | true |
| hsCode | not set |

### PaymentTerm
| Field | Value |
|-------|-------|
| name | paymentTermName from CSV |
| description | "Imported" |
| terms | "Imported" |
| isActive | true |
| depositPercentage | not set |
| daysFromBL | 0 |

### BankDetails
| Field | Value |
|-------|-------|
| bankName | from CSV |
| accountName | from CSV |
| accountNumber | from CSV |
| swiftCode | from CSV |
| currency | from CSV |
| isActive | true |
| isDefault | false |
| bankAddress | not set |
| iban | not set |

---

## Contract Creation Rules

| Rule ID | Rule |
|---------|------|
| CC-001 | totalAmount = quantity × unitPrice (full floating point precision) |
| CC-002 | totalAmountText = numberToText(totalAmount, currency) using existing utility |
| CC-003 | paymentTermText = paymentTermName value from CSV row |
| CC-004 | If tolerance > 0: calculate minQuantity, maxQuantity, minTotalAmount, maxTotalAmount |
| CC-005 | If tolerance = 0: min/max fields are null |
| CC-006 | releaseStatus is always set to "PENDING" on import |
| CC-007 | createdBy is set to the userId passed from Unit 2 |
| CC-008 | status defaults to "DRAFT" if not provided in CSV |
| CC-009 | releaseType defaults to "NOT_SPECIFIED" if not provided in CSV |

---

## Transaction Rules

| Rule ID | Rule |
|---------|------|
| TX-001 | All contract inserts are wrapped in a single database transaction |
| TX-002 | Transaction commits only when all contracts are successfully inserted |
| TX-003 | Any single insert failure causes full transaction rollback |
| TX-004 | Reference data creation (Phase 1) occurs outside the main transaction |
| TX-005 | Reference data created in Phase 1 is not rolled back if Phase 3 fails (orphaned records are acceptable) |

---

## Audit Rules

| Rule ID | Rule |
|---------|------|
| AU-001 | Every imported contract must have createdBy set to the admin userId |
| AU-002 | createdAt timestamp is set automatically by the database (Mongoose timestamps) |

---

## Error Handling Rules

| Rule ID | Rule |
|---------|------|
| EH-001 | All errors are logged server-side with full details |
| EH-002 | User-facing error messages must not expose stack traces or internal details |
| EH-003 | If the transaction rolls back, the error message identifies which row caused the failure |
| EH-004 | System errors (DB unavailable, timeout) result in all rows marked failed with a generic message |

---

**Created**: March 4, 2026
**Unit**: Unit 3 — Import Execution & Results Service
