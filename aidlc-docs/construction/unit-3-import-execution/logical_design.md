# Logical Design — Unit 3: Import Execution & Results Service

**Unit**: Unit 3 — Import Execution & Results Service
**Stories**: US-004
**Created**: March 4, 2026
**Status**: Draft

---

## 1. Module Structure

Unit 3 has no public API. It is a backend-internal module imported and called directly by Unit 2's controller.

```
server/
  services/
    importExecutionService.js        ← public entry point: exports executeImport()
    referenceResolutionService.js    ← Phase 1: resolves all reference data
    derivedFieldService.js           ← Phase 2: calculates totalAmount, min/max, etc.
    contractCreationService.js       ← Phase 3: transactional contract inserts
```

No routes, no controllers, no frontend components.

---

## 2. Component Responsibilities

#### `server/services/importExecutionService.js`
The single public interface of Unit 3. Unit 2 imports and calls only this module.

**`executeImport(validatedRows, userId)`**
- Input: `ValidatedRow[]` (all rows guaranteed valid by Unit 2), `userId: string`
- Responsibility: orchestrate Phase 1 → Phase 2 → Phase 3; return `ImportExecutionResult`
- Validates `userId` is non-null and non-empty before proceeding (SEC3-002)
- Calls `referenceResolutionService.resolveAll(validatedRows)` → Phase 1
- On resolution failure: returns all-failed `ImportExecutionResult` immediately (no Phase 2/3)
- Calls `derivedFieldService.calculateAll(validatedRows, resolutionMap)` → Phase 2
- Calls `contractCreationService.createAll(resolvedRows, userId)` → Phase 3
- On transaction failure: returns all-failed `ImportExecutionResult`
- On success: returns all-imported `ImportExecutionResult`
- Logs: timestamp, userId, rowCount, phase reached, outcome, duration (O3-001)

**`ImportExecutionResult`** (return shape):
```
{
  success: boolean,
  message: string,
  summary: { totalRows, validRows, invalidRows, importedRows },
  importResults: ImportRowResult[]
}
```

---

#### `server/services/referenceResolutionService.js`
**`resolveAll(validatedRows)`**
- Responsibility: resolve all 5 reference entity types for all rows; return a resolution map
- Collects unique values per entity type across all rows before any DB queries (P3-002)
- Executes resolution for each entity type in sequence (buyers, sellers, commodities, paymentTerms, bankDetails)
- Detects buyer/seller name collision (RR-005) before any DB writes
- Returns `ResolutionMap` (a plain object keyed by entity type and name/composite key → ObjectId)
- Throws `ResolutionError` if any resolution fails (inactive record, buyer=seller conflict)

**`resolveBuyers(uniqueNames)`**
- Queries `Party` where `companyName IN uniqueNames AND type = 'BUYER'`
- For each name: if found+active → cache ID; if found+inactive → throw `ResolutionError`; if not found → create new Party record
- Returns `Map<name, ObjectId>`
- Logs newly created parties at INFO level (O3-002)

**`resolveSellers(uniqueNames, buyerNameSet)`**
- Same algorithm as `resolveBuyers` with `type = 'SELLER'`
- Before processing: checks if any seller name exists in `buyerNameSet` → throws `ResolutionError` (RR-005)

**`resolveCommodities(uniqueNames, rowsByName)`**
- Queries `Commodity` where `name IN uniqueNames`
- On create: uses field values from the first row that references this commodity name
- Returns `Map<name, ObjectId>`

**`resolvePaymentTerms(uniqueNames)`**
- Queries `PaymentTerm` where `name IN uniqueNames`
- On create: sets `description` and `terms` to the configurable constant `IMPORT_PLACEHOLDER` (MT3-001)
- Returns `Map<name, ObjectId>`

**`resolveBankDetails(uniqueTuples, rowsByKey)`**
- Lookup key: `"bankName|accountNumber|swiftCode"`
- Queries `BankDetails` where `bankName IN names AND accountNumber IN numbers AND swiftCode IN codes`
- Filters results in memory to exact tuple matches
- Returns `Map<compositeKey, ObjectId>`

**`ResolutionError`** (internal error class):
```
{ message: string, affectedRows: number[], entityType: string, entityName: string }
```

---

#### `server/services/derivedFieldService.js`
**`calculateAll(validatedRows, resolutionMap)`**
- Input: `ValidatedRow[]` + `ResolutionMap`
- Responsibility: compute all derived fields for each row; return `ResolvedContractData[]`
- Calls `calculateForRow(row, resolutionMap)` for each row
- All calculations performed before the transaction opens (P3-003)

**`calculateForRow(row, resolutionMap)`**
- Computes: `totalAmount = quantity × unitPrice` (full floating-point precision, DI3-005)
- Computes: `totalAmountText = numberToText(totalAmount, currency)` using existing `server/utils/calculations.js` utility (MT3-002)
- Computes tolerance fields if `tolerance > 0`: `minQuantity`, `maxQuantity`, `minTotalAmount`, `maxTotalAmount`
- Sets `minQuantity = null`, etc. if `tolerance === 0`
- Sets `paymentTermText = row.data.paymentTermName`
- Resolves all ObjectIds from `resolutionMap`
- Returns `ResolvedContractData`

---

#### `server/services/contractCreationService.js`
**`createAll(resolvedRows, userId)`**
- Input: `ResolvedContractData[]`, `userId: string`
- Responsibility: insert all contracts inside a single Mongoose session transaction
- Opens a MongoDB session via `mongoose.startSession()`; calls `session.startTransaction()`
- Iterates `resolvedRows`; for each: builds contract document and calls `Contract.create([doc], { session })`
- On any insert failure: calls `session.abortTransaction()` → logs at ERROR level with triggering row (O3-003) → returns all-failed results
- On all success: calls `session.commitTransaction()` → returns all-imported results with new `contractId` values
- Always calls `session.endSession()` in a finally block
- Transaction contains only INSERT operations — no reads inside transaction (P3-004)

**Contract document assembly** follows the field mapping defined in `domain-entities.md` (Unit 3), including:
- `releaseStatus: 'PENDING'` (always, CC-006)
- `createdBy: userId` (CC-007)
- `status` defaults to `'DRAFT'` if not provided (CC-008)
- `releaseType` defaults to `'NOT_SPECIFIED'` if not provided (CC-009)

---

## 3. Data Flow

```
Unit 2 (importController.js)
  │  executeImport(validatedRows, userId)
  │
  ▼
importExecutionService.executeImport()
  │
  ├─► referenceResolutionService.resolveAll(validatedRows)
  │     │
  │     ├─ resolveBuyers(uniqueBuyerNames)
  │     │    └─ Party.find({ companyName: { $in: [...] }, type: 'BUYER' })
  │     │    └─ Party.create([...]) for new buyers
  │     │
  │     ├─ resolveSellers(uniqueSellerNames, buyerNameSet)
  │     │    └─ Party.find({ companyName: { $in: [...] }, type: 'SELLER' })
  │     │    └─ Party.create([...]) for new sellers
  │     │
  │     ├─ resolveCommodities(uniqueCommodityNames, rowsByName)
  │     │    └─ Commodity.find({ name: { $in: [...] } })
  │     │    └─ Commodity.create([...]) for new commodities
  │     │
  │     ├─ resolvePaymentTerms(uniquePaymentTermNames)
  │     │    └─ PaymentTerm.find({ name: { $in: [...] } })
  │     │    └─ PaymentTerm.create([...]) for new payment terms
  │     │
  │     └─ resolveBankDetails(uniqueTuples, rowsByKey)
  │          └─ BankDetails.find({ bankName: { $in: [...] }, ... })
  │          └─ BankDetails.create([...]) for new bank details
  │
  │  [ResolutionError?] → return all-failed ImportExecutionResult
  │
  ├─► derivedFieldService.calculateAll(validatedRows, resolutionMap)
  │     └─ calculateForRow() × N rows
  │     └─ numberToText() from server/utils/calculations.js
  │     → ResolvedContractData[]
  │
  └─► contractCreationService.createAll(resolvedRows, userId)
        │
        ├─ mongoose.startSession() → session.startTransaction()
        ├─ Contract.create([doc], { session }) × N rows
        │
        ├─ [any failure] → session.abortTransaction() → all-failed results
        └─ [all success] → session.commitTransaction() → all-imported results
              │
              ▼
        ImportExecutionResult → returned to Unit 2
```

---

## 4. Dependency Map

```
importExecutionService.js
  ├── referenceResolutionService.js
  │     ├── Party (Mongoose model)
  │     ├── Commodity (Mongoose model)
  │     ├── PaymentTerm (Mongoose model)
  │     └── BankDetails (Mongoose model)
  ├── derivedFieldService.js
  │     └── server/utils/calculations.js  (numberToText, existing utility)
  └── contractCreationService.js
        ├── Contract (Mongoose model)
        └── mongoose (for session/transaction)
```

Unit 3 has no dependency on Unit 2. Unit 2 depends on Unit 3 (one-way).

---

## 5. Configuration Constants

All placeholder strings and defaults are defined as named constants (MT3-001):

| Constant | Location | Value | Purpose |
|----------|----------|-------|---------|
| `IMPORT_PLACEHOLDER` | `referenceResolutionService.js` | `'Imported'` | Default `description` and `terms` for new PaymentTerm |
| `PARTY_ADDRESS_PLACEHOLDER` | `referenceResolutionService.js` | `'To be updated'` | Default `address` for new Party |
| `DEFAULT_RELEASE_STATUS` | `contractCreationService.js` | `'PENDING'` | Always set on imported contracts |
| `DEFAULT_STATUS` | `contractCreationService.js` | `'DRAFT'` | Used when CSV row has no status |
| `DEFAULT_RELEASE_TYPE` | `contractCreationService.js` | `'NOT_SPECIFIED'` | Used when CSV row has no releaseType |
| `DEFAULT_DAYS_FROM_BL` | `referenceResolutionService.js` | `0` | Default for new PaymentTerm |

---

## 6. NFR Design Decisions

| NFR ID | Requirement | Design Decision |
|--------|-------------|-----------------|
| P3-001 | ≤ 15s for 20 rows | Batched resolution queries (one per entity type) + pre-calculated derived fields + single transaction |
| P3-002 | Batch DB queries per entity type | `resolveAll` collects all unique values first; one `find` per entity type |
| P3-003 | Derived fields before transaction | `derivedFieldService.calculateAll()` called before `contractCreationService.createAll()` |
| P3-004 | No reads inside transaction | `contractCreationService` only calls `Contract.create()` inside the session |
| DI3-001 | Single transaction for all inserts | `mongoose.startSession()` + `session.startTransaction()` wraps all `Contract.create()` calls |
| DI3-002 | Full rollback on any failure | `session.abortTransaction()` called on any insert error |
| DI3-003 | Duplicate contractNumber guard at DB | Relies on existing unique index on `Contract.contractNumber` field |
| DI3-004 | Phase 1 reference records not rolled back | Reference creation is outside the transaction; documented as acceptable (TX-005) |
| DI3-005 | Full floating-point precision | `calculateForRow` does not round `totalAmount` before storage |
| DI3-006 | `createdBy` always set | `contractCreationService` receives `userId` parameter; validated non-null in `importExecutionService` |
| R3-001 | DB unavailable → fail cleanly | `referenceResolutionService` throws; `importExecutionService` catches → all-failed result |
| R3-002 | Rollback error identifies row | `contractCreationService` logs row number before aborting |
| R3-004 | No re-validation | `importExecutionService` trusts `ValidatedRow.isValid === true`; no validation logic in Unit 3 |
| R3-005 | Resolution failure before Phase 3 | `importExecutionService` checks for `ResolutionError` before calling `contractCreationService` |
| SEC3-001 | Internal-only API | No route or controller; only exported as a JS module function |
| SEC3-002 | userId validated non-null | `importExecutionService.executeImport()` guards at entry |
| SEC3-003 | Parameterized DB writes | All Mongoose `create()` and `find()` calls use object parameters — no string interpolation |
| SEC3-004 | No internal detail in error messages | `ResolutionError.message` uses only user-facing strings; stack traces logged server-side only |
| S3-001 | Stateless | No module-level mutable state; all data flows through function parameters |
| S3-003 | Call-scoped resolution cache | `ResolutionMap` is a local variable inside `resolveAll()` |
| O3-001 | Audit log per executeImport call | `importExecutionService` logs at start and end with all required fields |
| O3-002 | Reference creation logged at INFO | Each `resolve*` method logs `wasCreated=true` events |
| O3-003 | Transaction rollback logged at ERROR | `contractCreationService` logs triggering row number and error detail |
| O3-004 | Resolution failures logged at WARN | Each `resolve*` method logs inactive-record and collision failures at WARN |
| O3-005 | Imported contract IDs in success log | `importExecutionService` includes `contractId[]` in success log entry |
| MT3-001 | Configurable placeholder constants | All defaults defined as named constants at top of each service file |
| MT3-002 | `numberToText` isolated | `derivedFieldService` imports only `numberToText` from `server/utils/calculations.js` |
| MT3-003 | Phases independently testable | Phase 1, 2, 3 are separate service modules with clear input/output contracts |

---

## 7. Error Scenarios

| Scenario | Handling | Log Level | Result Returned to Unit 2 |
|----------|----------|-----------|---------------------------|
| Inactive reference data found | `ResolutionError` thrown; caught in `importExecutionService` | WARN | All rows `status: 'failed'` |
| Buyer name = seller name | `ResolutionError` thrown | WARN | All rows `status: 'failed'` |
| DB unavailable during Phase 1 | Exception thrown; caught in `importExecutionService` | ERROR | All rows `status: 'failed'` |
| Contract insert fails (constraint) | `session.abortTransaction()`; caught in `contractCreationService` | ERROR | All rows `status: 'failed'` |
| DB unavailable during Phase 3 | Transaction aborted; caught | ERROR | All rows `status: 'failed'` |
| `userId` is null/empty | Guard in `importExecutionService`; throws immediately | ERROR | All rows `status: 'failed'` |

---

## 8. Integration Contract Alignment

| Contract Requirement | Design Coverage |
|----------------------|-----------------|
| Unit 3 has no public API | No route or controller defined; module is internal only |
| Called by Unit 2 after user confirms | `importExecutionService.executeImport()` called from `importController.uploadCsv` when `confirm=true` |
| Returns `ImportExecutionResult` to Unit 2 | `importExecutionService` return type matches `ImportExecutionResult` shape |
| `status: 'imported'` with `contractId` on success | `contractCreationService` returns new `_id` values from Mongoose |
| `status: 'failed'` with `error` message on failure | All failure paths return structured `ImportRowResult[]` with `error` field |
| All-or-nothing import | Single Mongoose session transaction in `contractCreationService` |
