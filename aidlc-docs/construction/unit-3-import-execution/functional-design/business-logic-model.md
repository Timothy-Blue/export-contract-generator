# Business Logic Model — Unit 3: Import Execution & Results Service

## Overview
Unit 3 is a backend-internal service. It receives fully-validated rows from Unit 2, resolves all reference data, creates contracts, and returns structured results. It has no public API.

---

## 1. Top-Level Workflow

```
RECEIVE executeImport(validatedRows, userId) call from Unit 2
    │
    ▼
PHASE 1: Resolve all reference data for all rows
    │
    ├─ [ANY resolution failure] → abort entire import, return all-failed results
    │
    ▼
PHASE 2: Calculate derived fields for all rows
    │
    ▼
PHASE 3: Create all contracts in a single transaction (all-or-nothing)
    │
    ├─ [ANY contract creation fails] → roll back entire transaction
    │                                   return all-failed results
    │
    └─ [ALL succeed] → commit transaction
                       return all-imported results
```

---

## 2. Phase 1: Reference Data Resolution Algorithm

For each unique reference name across all rows, resolve once and cache the result. Exact case-sensitive lookup (consistent with Unit 2 validation).

### 2.1 Buyer Resolution
```
For each unique buyerName in validatedRows:
  1. Query DB: Party where companyName = buyerName AND type = "BUYER"
  2. If found AND isActive = true → cache ID, wasCreated = false
  3. If found AND isActive = false → RESOLUTION FAILURE
     (should not happen — Unit 2 already caught this, but guard anyway)
  4. If not found → CREATE new Party:
       { companyName: buyerName, type: "BUYER", address: "To be updated", isActive: true }
     → cache new ID, wasCreated = true
```

### 2.2 Seller Resolution
```
Same algorithm as buyer, with type = "SELLER"

ADDITIONAL CHECK — same name as buyer:
  Before creating a seller, check if the same name was already resolved as a buyer.
  If buyerName === sellerName (same name used as both buyer and seller in the file):
    → RESOLUTION FAILURE for all rows using that name
    → Error: "'{name}' cannot be used as both buyer and seller"
```

### 2.3 Commodity Resolution
```
For each unique commodityName in validatedRows:
  1. Query DB: Commodity where name = commodityName
  2. If found AND isActive = true → cache ID, wasCreated = false
  3. If found AND isActive = false → RESOLUTION FAILURE
  4. If not found → CREATE new Commodity:
       {
         name: commodityName,
         description: commodityDescription,  ← from first row using this commodity
         defaultUnit: unit,
         defaultOrigin: origin,
         defaultPacking: packing,
         isActive: true
       }
     → cache new ID, wasCreated = true
```

### 2.4 PaymentTerm Resolution
```
For each unique paymentTermName in validatedRows:
  1. Query DB: PaymentTerm where name = paymentTermName
  2. If found AND isActive = true → cache ID, wasCreated = false
  3. If found AND isActive = false → RESOLUTION FAILURE
  4. If not found → CREATE new PaymentTerm:
       {
         name: paymentTermName,
         description: "Imported",
         terms: "Imported",
         isActive: true
       }
     → cache new ID, wasCreated = true
```

### 2.5 BankDetails Resolution
```
For each unique (bankName, accountNumber, swiftCode) tuple in validatedRows:
  Lookup key: "bankName|accountNumber|swiftCode"
  1. Query DB: BankDetails where bankName = bankName
                              AND accountNumber = accountNumber
                              AND swiftCode = swiftCode
  2. If found AND isActive = true → cache ID, wasCreated = false
  3. If found AND isActive = false → RESOLUTION FAILURE
  4. If not found → CREATE new BankDetails:
       {
         bankName, accountName, accountNumber, swiftCode,
         currency,   ← from the row
         isActive: true,
         isDefault: false
       }
     → cache new ID, wasCreated = true
```

### 2.6 Resolution Failure Handling
If any reference data resolution fails (inactive record found, or same name used as buyer and seller):
- Do NOT proceed to Phase 2 or Phase 3
- Return `ImportRowResult[]` with all rows marked `status: "failed"`
- Error message identifies which reference and which rows are affected
- No DB writes have occurred at this point (reference creation is rolled back if any failure)

**Note**: Reference data records created during Phase 1 are created outside the main contract transaction. If Phase 1 partially succeeds (some created, then one fails), the already-created reference records remain in the DB. This is acceptable — orphaned reference data is harmless and can be cleaned up manually.

---

## 3. Phase 2: Derived Field Calculation

For each row, calculate all derived fields before the transaction opens.

```
totalAmount = quantity × unitPrice
totalAmountText = numberToText(totalAmount, currency)

if tolerance > 0:
  toleranceFactor = tolerance / 100
  minQuantity = quantity - (quantity × toleranceFactor)
  maxQuantity = quantity + (quantity × toleranceFactor)
  minTotalAmount = totalAmount - (totalAmount × toleranceFactor)
  maxTotalAmount = totalAmount + (totalAmount × toleranceFactor)
else:
  minQuantity = null
  maxQuantity = null
  minTotalAmount = null
  maxTotalAmount = null

paymentTermText = paymentTermName   ← from CSV row directly
```

---

## 4. Phase 3: Contract Creation (Single Transaction)

All contracts are created inside a single database transaction. All-or-nothing: if any contract fails, the entire transaction rolls back.

```
BEGIN TRANSACTION

for each validatedRow in validatedRows:
  1. Build contract document from ResolvedContractData
  2. Set createdBy = userId (passed from Unit 2)
  3. INSERT contract into DB

  if INSERT fails (constraint violation, duplicate key, etc.):
    ROLLBACK TRANSACTION
    return all rows as failed with the error message

END TRANSACTION (COMMIT)

return all rows as imported with their new contractIds
```

### Contract Document Assembly
```
{
  contractNumber,
  contractDate,
  buyer: resolvedBuyerId,
  seller: resolvedSellerId,
  commodity: resolvedCommodityId,
  commodityDescription,
  quantity,
  unit,
  tolerance,
  origin,
  packing,
  qualitySpec,
  unitPrice,
  currency,
  incoterm,
  portLocation,
  totalAmount,
  totalAmountText,
  paymentTerm: resolvedPaymentTermId,
  paymentTermText,          ← paymentTermName from CSV
  bankDetails: resolvedBankDetailsId,
  minQuantity,
  maxQuantity,
  minTotalAmount,
  maxTotalAmount,
  shipmentPeriod,
  additionalTerms,
  releaseType,
  status,
  createdBy: userId,
  releaseStatus: "PENDING"  ← always default
}
```

---

## 5. Result Formatting

### All Imported (success)
```javascript
{
  summary: {
    totalRows: N,
    validRows: N,
    invalidRows: 0,
    importedRows: N
  },
  importResults: [
    { rowNumber, contractNumber, status: "imported", contractId, error: null }
    // ... one per row
  ],
  success: true,
  message: "Import completed successfully."
}
```

### All Failed (transaction rolled back or resolution failure)
```javascript
{
  summary: {
    totalRows: N,
    validRows: N,
    invalidRows: 0,
    importedRows: 0
  },
  importResults: [
    { rowNumber, contractNumber, status: "failed", contractId: null, error: "..." }
    // ... one per row
  ],
  success: false,
  message: "Import failed. No contracts were imported."
}
```

---

## 6. Internal Function Signatures

```javascript
/**
 * Execute import for all validated rows (all-or-nothing)
 * Called by Unit 2 after user confirms
 */
async function executeImport(
  validatedRows: ValidatedRow[],
  userId: string
): Promise<ImportExecutionResult>

/**
 * Result returned to Unit 2
 */
interface ImportExecutionResult {
  success: boolean;
  message: string;
  summary: ImportSummary;
  importResults: ImportRowResult[];
}
```

---

**Created**: March 4, 2026
**Unit**: Unit 3 — Import Execution & Results Service
