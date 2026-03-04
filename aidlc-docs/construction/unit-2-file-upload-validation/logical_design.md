# Logical Design — Unit 2: File Upload & Validation Service

**Unit**: Unit 2 — File Upload & Validation Service
**Stories**: US-002, US-003, US-005
**Created**: March 4, 2026
**Status**: Draft

---

## 1. Module Structure

### Backend

```
server/
  routes/
    import.js                        ← shared with Unit 1; adds POST /api/import/upload
  controllers/
    importController.js              ← shared with Unit 1; adds uploadCsv()
  services/
    csvParserService.js              ← parses raw buffer into ParsedCsvFile
    validationService.js             ← all 5 validation levels as class methods
    referenceDataCacheService.js     ← loads reference data cache (5 DB queries)
    importResponseService.js         ← assembles the final API response object
  middleware/
    uploadMiddleware.js              ← multer configuration for multipart/form-data
```

### Frontend

```
client/src/
  services/
    api.js                           ← extend: add importAPI.uploadCsv()
  components/
    ContractImportPage.js            ← top-level page; owns all state
    ImportUploadZone.js              ← file selection (drag-drop + click-to-browse)
    ImportLoadingSpinner.js          ← shown during loading phase
    ImportConfirmDialog.js           ← shown when all rows valid, before import
    ImportResultsSummary.js          ← shown after pipeline completes
    ImportErrorBanner.js             ← shown on file-level or system errors
```

---

## 2. Component Responsibilities

### Backend

#### `server/middleware/uploadMiddleware.js`
- Configures `multer` for in-memory storage (`memoryStorage()`) — no temp files written to disk (SEC2-008)
- Sets file size limit at the HTTP layer before any parsing (SEC2-004)
- Accepts only `multipart/form-data` with field name `file`
- Exports a single middleware function: `upload.single('file')`

#### `server/routes/import.js`
- `POST /api/import/upload` → `[authenticateAPIKey, uploadMiddleware, importController.uploadCsv]`
- `GET /api/import/template` → `[authenticateAPIKey, importController.downloadTemplate]`

#### `server/controllers/importController.js`
**`uploadCsv(req, res)`**
- Responsibility: orchestrate the full upload → validate → (confirm) → import pipeline
- Reads `req.file` (populated by multer) and `req.body.confirm` flag
- Calls services in sequence; never contains business logic
- Handles all HTTP response construction
- Wraps entire body in try/catch; returns HTTP 500 on unhandled error (R2-003)
- Logs: timestamp, userId, filename, row count, outcome, duration (O2-001)

Pipeline orchestration inside `uploadCsv`:
```
1. Call csvParserService.parseFile(req.file)
   → on file-level error: return 400 with error code and message

2. Call referenceDataCacheService.loadCache(parsedFile)
   → on DB error: return 500

3. Call validationService.validateAll(parsedFile, cache)
   → returns ValidatedRow[]

4. If req.body.confirm !== 'true':
   → If any invalid rows: assemble and return 200 (validation-only response)
   → If all valid: assemble and return 200 (confirm-prompt response, importResults: null)

5. If req.body.confirm === 'true' AND all rows valid:
   → Call executeImport(validatedRows, userId) from Unit 3
   → Assemble and return 200 (full results response)
```

#### `server/services/csvParserService.js`
**`parseFile(fileObject)`**
- Input: multer file object `{ buffer, originalname, mimetype, size }`
- Responsibility: execute file-level validation (F-001 through F-005) in order; parse CSV into `ParsedCsvFile`
- Uses `csv-parse` library (sync or callback mode) for RFC 4180 compliant parsing
- Checks: MIME type + extension → encoding → parse headers → required headers present → row count (0 or >20)
- Returns `ParsedCsvFile` on success
- Throws a structured `FileLevelError` object `{ code, message }` on first failure (fail-fast)
- Required headers list defined as a module-level constant array

**`FileLevelError`** (internal class/object shape):
```
{ code: string, message: string }
```

#### `server/services/validationService.js`
A class `ValidationService` with the following methods. Instantiated once per request inside the controller.

**`validateAll(parsedFile, referenceDataCache)`**
- Orchestrates all row-level validation
- Builds contract number frequency map before iterating rows (for CN-003)
- Iterates all rows; for each row calls the four sub-level methods in order
- Collects ALL errors per row — never stops early within a row
- Returns `ValidatedRow[]`

**`validateFieldLevel(rawRow, contractNumberFrequencyMap)`** (Level 2)
- Applies all field-level rules from `business-rules.md` (CN-001 through RT-002)
- Parses typed fields: dates as `YYYY-MM-DD`, numbers via `parseFloat`, enums via exact match
- Applies optional field defaults when column is missing from file
- Returns `{ data: ContractImportData, errors: ValidationError[], warnings: ValidationWarning[] }`

**`validateBusinessLogic(data, errors)`** (Level 3)
- Applies BL-001 through BL-004
- Skips rules whose dependent fields have type errors (checks `errors` array for relevant field errors)
- Returns additional `ValidationError[]` and `ValidationWarning[]`

**`validateReferenceData(data, cache)`** (Level 4)
- Applies RD-001 through RD-006 using the pre-loaded cache
- Exact case-sensitive lookup
- Returns additional `ValidationError[]`

**`validateCrossField(data, cache)`** (Level 5)
- Applies CF-001 and CF-002
- Only executes if relevant reference data was found in cache
- Returns additional `ValidationWarning[]`

**Validation rule constants**: All rule IDs, field names, and error messages are defined as a module-level constants object (not inline strings) to support maintainability.

#### `server/services/referenceDataCacheService.js`
**`loadCache(parsedFile)`**
- Input: `ParsedCsvFile`
- Responsibility: execute exactly 5 DB queries to populate the `ReferenceDataCache`
- Collects unique values per entity type from all rows before querying
- Queries: `Party`, `Commodity`, `PaymentTerm`, `BankDetails`, `Contract` (for existing contract numbers)
- Builds lookup Maps and Sets as defined in the domain model
- Returns `ReferenceDataCache` object
- Throws on DB error (caught by controller → HTTP 500)

#### `server/services/importResponseService.js`
**`buildValidationOnlyResponse(validatedRows)`**
- Assembles the 200 response when validation has errors (no import)
- Returns `{ success, message, summary, validationResults, importResults: null, errorReport }`

**`buildConfirmResponse(validatedRows)`**
- Assembles the 200 response when all rows are valid but import not yet confirmed
- `importResults: null`, `success: false`, message prompts user to confirm

**`buildImportCompleteResponse(validatedRows, importResults)`**
- Assembles the 200 response after import execution
- Merges validation results with import results
- Computes `errorReport` field if any errors exist

**`buildFileLevelErrorResponse(fileLevelError)`**
- Assembles the 400 response for file-level failures
- Returns `{ success: false, message, code }`

---

### Frontend

#### `client/src/services/api.js` — `importAPI` extension
**`importAPI.uploadCsv(file, confirm)`**
- Sends `POST /api/import/upload` as `multipart/form-data`
- Appends `file` to `FormData`
- Appends `confirm: 'true'` to `FormData` when `confirm === true`
- Uses `apiClient` with `Content-Type: multipart/form-data` (let axios set boundary automatically)
- Returns the full response data object

**`importAPI.templateUrl`**
- String constant: `${API_URL}/import/template`
- Used as `href` in `TemplateDownloadButton`

#### `ContractImportPage.js`
- Top-level page component; owns all state via `useState`
- State shape:
  - `selectedFile: File | null` — currently selected file
  - `phase: 'idle' | 'loading' | 'confirm' | 'results' | 'error'` — UI phase
  - `apiResponse: object | null` — full API response after upload
  - `fileError: string | null` — client-side file validation error
  - `systemError: string | null` — server/network error message
- Handlers:
  - `handleFileSelected(file)` — client-side validates extension and size; sets `selectedFile` or `fileError`
  - `handleUpload()` — calls `importAPI.uploadCsv(selectedFile, false)`; transitions phase
  - `handleConfirm()` — calls `importAPI.uploadCsv(selectedFile, true)`; transitions phase
  - `handleCancel()` — resets to `idle`
  - `handleReset()` — clears all state, returns to `idle`
- Phase transition logic is co-located in each handler (not a reducer, per Q3 answer: local state)
- Renders child components conditionally based on `phase`

#### `ImportUploadZone.js`
- Props: `{ onFileSelected, onFileError, disabled, selectedFile }`
- Contains `DropZone` (drag-and-drop area with visual states: default, drag-over, disabled)
- Contains `FileInfo` (filename + size display + clear button) — shown when `selectedFile !== null`
- Contains `FileRequirementsHint` (static text + `TemplateDownloadButton`)
- Contains `UploadButton` — disabled when `selectedFile === null || disabled || fileError !== null`
- Drag-and-drop: handles `onDragOver`, `onDragLeave`, `onDrop` events; extracts first file from `event.dataTransfer.files`
- Click-to-browse: hidden `<input type="file" accept=".csv">` triggered by DropZone click

#### `ImportLoadingSpinner.js`
- Purely presentational; no props
- Renders a centered spinner; no status text

#### `ImportConfirmDialog.js`
- Props: `{ rowCount, onConfirm, onCancel }`
- Renders modal/inline card with confirmation message and two action buttons
- No internal state

#### `ImportResultsSummary.js`
- Props: `{ response }` (full API response object)
- Renders `SummaryCard` (counts from `response.summary`) and `RowResultsList`
- `RowResultsList` maps `response.validationResults` to `RowResultItem` components, sorted by `rowNumber`
- `RowResultItem`: expandable; collapsed shows row number, contract number, status badge; expanded shows error/warning list and import outcome
- Status badge colors: valid=green, invalid=red, warning=amber, imported=blue
- "Upload Another File" button calls `onReset` prop (passed from `ContractImportPage`)

#### `ImportErrorBanner.js`
- Props: `{ message, onDismiss }`
- Renders error alert with message and "Try Again" button

---

## 3. State Machine (Frontend)

```
idle
  │ handleUpload()
  ▼
loading
  │ API 200, invalidRows > 0
  ├──────────────────────────► results
  │
  │ API 200, invalidRows = 0, confirm=false
  ├──────────────────────────► confirm
  │
  │ API 200, confirm=true, import complete
  ├──────────────────────────► results
  │
  │ API 400 / 500 / network error
  └──────────────────────────► error

confirm
  │ handleConfirm()
  ├──────────────────────────► loading
  │ handleCancel()
  └──────────────────────────► idle

results
  │ handleReset()
  └──────────────────────────► idle

error
  │ handleDismiss()
  └──────────────────────────► idle
```

---

## 4. Data Flow

```
Browser (ContractImportPage)
  │  User selects file → handleFileSelected() → client-side check
  │  User clicks Upload → handleUpload()
  │
  ▼
importAPI.uploadCsv(file, confirm=false)
  │  POST /api/import/upload  multipart/form-data
  │
  ▼
uploadMiddleware (multer, memoryStorage)
  │  populates req.file.buffer
  │
  ▼
importController.uploadCsv(req, res)
  │
  ├─► csvParserService.parseFile(req.file)
  │     → FileLevelError? → return 400
  │     → ParsedCsvFile
  │
  ├─► referenceDataCacheService.loadCache(parsedFile)
  │     → 5 DB queries → ReferenceDataCache
  │
  ├─► validationService.validateAll(parsedFile, cache)
  │     → ValidatedRow[]
  │
  ├─► [confirm=false, any invalid] → importResponseService.buildValidationOnlyResponse()
  │     → return 200
  │
  ├─► [confirm=false, all valid] → importResponseService.buildConfirmResponse()
  │     → return 200 (phase → confirm on frontend)
  │
  └─► [confirm=true, all valid] → executeImport(validatedRows, userId)  [Unit 3]
        → importResponseService.buildImportCompleteResponse()
        → return 200
```

---

## 5. Dependency Map

```
importController.js
  ├── csvParserService.js
  │     └── csv-parse (npm)
  ├── referenceDataCacheService.js
  │     ├── Party (Mongoose model)
  │     ├── Commodity (Mongoose model)
  │     ├── PaymentTerm (Mongoose model)
  │     ├── BankDetails (Mongoose model)
  │     └── Contract (Mongoose model)
  ├── validationService.js
  │     └── (no external deps — pure logic)
  ├── importResponseService.js
  │     └── (no external deps — pure assembly)
  └── importExecutionService.js  ← Unit 3 module (direct import)

uploadMiddleware.js
  └── multer (npm)

ContractImportPage.js
  ├── ImportUploadZone.js
  │     └── TemplateDownloadButton (inline or imported)
  ├── ImportLoadingSpinner.js
  ├── ImportConfirmDialog.js
  ├── ImportResultsSummary.js
  └── ImportErrorBanner.js

importAPI (api.js)
  └── apiClient (axios instance, existing)
```

---

## 6. Validation Rule Constants Structure

All validation rule metadata lives in a single constants module to avoid magic strings scattered across `validationService.js`:

```
server/services/validationService.js  (top of file)

VALIDATION_RULES = {
  CN_001: { ruleId: 'CN-001', field: 'contractNumber', message: '...' },
  CN_002: { ruleId: 'CN-002', field: 'contractNumber', message: '...' },
  ...
}

ALLOWED_UNITS = ['MT', 'KG', 'TONS', 'BAGS', 'PIECES', 'CARTONS', 'CBM']
ALLOWED_INCOTERMS = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
ALLOWED_STATUSES = ['DRAFT', 'FINALIZED', 'SENT', 'SIGNED', 'CANCELLED']
ALLOWED_RELEASE_TYPES = ['SWB', 'TELEX_RELEASE', 'ORIGINAL_BL', 'NOT_SPECIFIED']
REQUIRED_HEADERS = ['contractNumber', 'contractDate', ...]  (all 25)
SWIFT_CODE_PATTERN = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/
CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/
```

---

## 7. NFR Design Decisions

| NFR ID | Requirement | Design Decision |
|--------|-------------|-----------------|
| P2-001 | ≤ 10s end-to-end | 5 batched DB queries + in-memory validation; no per-row DB calls |
| P2-002 | 5 DB queries max | `referenceDataCacheService` collects all unique values first, then queries once per entity type |
| P2-004 | File-level validation before DB | `csvParserService.parseFile()` called before `referenceDataCacheService.loadCache()` |
| S2-001 | Stateless | No request state persisted; all data flows through function parameters |
| S2-003 | Concurrent uploads supported | No shared mutable state between requests; each request has its own cache instance |
| S2-004 | Request-scoped cache | `ReferenceDataCache` is a local variable inside `loadCache()`, not a module-level singleton |
| SEC2-003 | MIME + extension check | `csvParserService` checks both `mimetype` and file extension before any parsing |
| SEC2-004 | File size at HTTP layer | `multer` `limits.fileSize` set in `uploadMiddleware` |
| SEC2-005 | No execution of file content | `csv-parse` library only parses; no eval or dynamic execution |
| SEC2-006 | CSV injection mitigation | `importResponseService` sanitizes cell values starting with `=`, `+`, `-`, `@` in any exported/displayed output |
| SEC2-007 | No internal detail leakage | Error messages in `validationService` use only user-facing strings from the rules catalog |
| SEC2-008 | In-memory only | `multer` configured with `memoryStorage()` |
| R2-001 | Deterministic validation | `validationService` is a pure class; same input always produces same output |
| R2-002 | All errors collected per row | `validateAll` never returns early within a row; all four sub-level methods always called |
| R2-003 | Top-level error catch | `importController.uploadCsv` wraps entire body in try/catch → HTTP 500 |
| R2-004 | DB failure aborts pipeline | `referenceDataCacheService` throws on DB error; controller catches → HTTP 500 |
| O2-001 | Per-request audit log | Controller logs at start and end of `uploadCsv`: userId, filename, rowCount, outcome, duration |
| O2-002 | DB errors logged at ERROR | `referenceDataCacheService` logs before throwing |
| U2-001 | Spinner on upload click | `ContractImportPage.handleUpload()` sets `phase = 'loading'` before awaiting API call |
| U2-004 | Confirm dialog shows row count | `ImportConfirmDialog` receives `rowCount` prop from `apiResponse.summary.validRows` |

---

## 8. Error Scenarios

| Scenario | HTTP Status | Response Shape | Log Level |
|----------|-------------|----------------|-----------|
| Invalid file format | 400 | `{ success: false, message, code: 'INVALID_FILE_FORMAT' }` | INFO |
| File too large (>20 rows) | 400 | `{ success: false, message, code: 'FILE_TOO_LARGE' }` | INFO |
| File empty | 400 | `{ success: false, message, code: 'FILE_EMPTY' }` | INFO |
| Missing headers | 400 | `{ success: false, message, code: 'MISSING_HEADERS' }` | INFO |
| Invalid encoding | 400 | `{ success: false, message, code: 'INVALID_ENCODING' }` | INFO |
| Validation errors in rows | 200 | Full response with `invalidRows > 0`, `importResults: null` | INFO |
| All rows valid, not confirmed | 200 | Full response with `importResults: null` | INFO |
| Import complete | 200 | Full response with `importResults` populated | INFO |
| DB unavailable (cache load) | 500 | `{ success: false, message: 'Import failed...', code: 'SERVER_ERROR' }` | ERROR |
| Unhandled exception | 500 | `{ success: false, message: 'Import failed...', code: 'SERVER_ERROR' }` | ERROR |

---

## 9. Integration Contract Alignment

| Contract Requirement | Design Coverage |
|----------------------|-----------------|
| `POST /api/import/upload` | `server/routes/import.js` |
| `multipart/form-data` | `uploadMiddleware.js` (multer) |
| `confirm` flow (two-step) | `req.body.confirm` flag in `importController.uploadCsv` |
| 200 with `summary`, `validationResults`, `importResults` | `importResponseService` methods |
| 400 with `code` field | `csvParserService` throws `FileLevelError`; controller returns 400 |
| 409 (upload in progress) | Not applicable — IS-006 states no concurrent limit |
| `errorReport` field | `importResponseService.buildImportCompleteResponse()` computes when errors exist |
| `skippedRows` field | Not present — IS-005 states no partial imports; `skippedRows` = `invalidRows` count |
