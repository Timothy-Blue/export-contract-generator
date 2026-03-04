# Functional Design Plan — Unit 2: File Upload & Validation Service

## Unit
Unit 2 — File Upload & Validation Service  
Stories: US-002, US-003, US-005  
Story Points: 17

---

## Plan Steps

- [x] Step 1: Clarify business logic ambiguities (questions below)
- [x] Step 2: Define domain entities and data structures
- [x] Step 3: Model the file upload and validation workflow
- [x] Step 4: Define all validation rules and algorithms (5 levels)
- [x] Step 5: Define conditional import decision logic
- [x] Step 6: Define error message catalog and error handling behavior
- [x] Step 7: Define frontend component structure and interaction flows
- [x] Step 8: Generate functional design artifacts

---

## Questions for Clarification

### Business Logic Modeling

**Q1 — Concurrent Upload Lock Scope**
The unit spec says "only one upload at a time" and returns 409 if an upload is in progress.

[Answer]: No limit at all — concurrent uploads are allowed, no 409 scenario.

> Is this lock scoped per-user (each admin can have one active upload) or system-wide (only one upload at a time across all admins)?

---

**Q2 — Partial Import User Confirmation Flow**
US-003 AC-006 says: when some rows are invalid, show an "Import Valid Rows" button for the user to confirm before importing.

[Answer]: All-or-nothing — if ANY row is invalid, the entire file is rejected. No import occurs until all rows pass validation. User must fix and re-upload. Response structure simplified (no skippedRows/failedRows fields).

> This implies a two-step interaction: (1) upload → get validation results, (2) user clicks "Import Valid Rows" → import executes. But the integration contract defines a single `POST /api/import/upload` endpoint that validates AND imports in one call. How should this work?
>
> Option A: The single endpoint always auto-imports valid rows (no user confirmation step — simplest, matches integration contract)
> Option B: Add a second endpoint `POST /api/import/confirm` that the frontend calls after user confirms
> Option C: Add a query parameter `?confirm=true` to the upload endpoint to trigger import after validation

---

**Q3 — Reference Data Lookup: Case Sensitivity**
When looking up buyers, sellers, commodities, payment terms, and bank details by name, should the match be:

[Answer]: Exact case-sensitive match

> Option A: Exact case-sensitive match (e.g., "ABC Trading" ≠ "abc trading")
> Option B: Case-insensitive match (e.g., "ABC Trading" = "abc trading")
> Option C: Case-insensitive + trimmed whitespace match

---

**Q4 — Reference Data: New vs Existing Lookup Strategy**
The CSV spec says "will create new buyer/seller/commodity/payment term/bank if not exists." But validation rule RD-001 to RD-005 say "if it exists, it must be active."

[Answer]: Pass (treat as "will be created by Unit 3") — no error

> When a name is NOT found in the database, should validation:
> Option A: Pass (treat as "will be created by Unit 3") — no error
> Option B: Warn the user that a new reference record will be created
> Option C: Error — require all reference data to pre-exist

---

**Q5 — Bank Details Lookup Key**
The CSV has `bankName`, `accountName`, `accountNumber`, and `swiftCode`. Rule RD-006 says the combination of `bankName + accountNumber` should be unique when creating new.

[Answer]: `bankName + accountNumber + swiftCode` all three

> When looking up existing bank details, what is the lookup key?
> Option A: `bankName + accountNumber` combination
> Option B: `swiftCode` only
> Option C: `bankName + accountNumber + swiftCode` all three

---

### Domain Model

**Q6 — ImportSession Entity**
Should the system track an "import session" or "import job" entity in the database to support the 409 concurrent upload check and for audit purposes?

[Answer]: No

> Option A: Yes — persist an ImportSession record (tracks status, user, timestamps, results)
> Option B: No — use an in-memory flag or simple DB flag on the user session
> Option C: No session tracking needed — rely on request timeout and client-side disable

---

**Q7 — Validation Result Persistence**
After validation and import complete, should the validation results (errors, warnings, summary) be persisted to the database?

[Answer]: No

> Option A: Yes — store results for audit/history (admin can review past imports)
> Option B: No — results are returned in the API response only, not stored
> Option C: Store only the summary (counts), not the full error details

---

### Business Rules

**Q8 — Contract Date Future Warning Threshold**
Rule BL-004 says "contract date more than 1 year in the future" is a warning. Is this threshold fixed at 1 year, or should it be configurable?

[Answer]: Fixed at 1 year

> Option A: Fixed at 1 year (hardcoded)
> Option B: Configurable via environment variable or system setting

---

**Q9 — Tolerance Calculation Precision**
When calculating minQuantity/maxQuantity and minTotalAmount/maxTotalAmount from tolerance percentage, what decimal precision should be used?

[Answer]: No rounding — keep full floating point precision

> Option A: Round to 2 decimal places
> Option B: Round to same precision as input quantity/price
> Option C: No rounding — keep full floating point precision

---

**Q10 — Contract Number Uniqueness Check Timing**
Rule CN-002 checks contract number uniqueness against the database. For a batch of 20 rows, should this check be:

[Answer]: Batch-checked once for all contract numbers in the file (1 DB query)

> Option A: Checked once per row during validation (20 separate DB queries)
> Option B: Batch-checked once for all contract numbers in the file (1 DB query)
> Option C: Checked at import time (Unit 3), not during validation

---

### Data Flow

**Q11 — File Parsing: Handling Quoted Fields with Commas**
The CSV spec says fields containing commas should be wrapped in double quotes. Should the parser:

[Answer]: Use a standard CSV parser library (e.g., `csv-parse`) that handles RFC 4180 quoting automatically

> Option A: Use a standard CSV parser library (e.g., `csv-parse`) that handles RFC 4180 quoting automatically
> Option B: Implement custom parsing logic
> Option C: Reject files with quoted fields (require simple comma-delimited only)

---

**Q12 — Empty Optional Fields vs Missing Fields**
In the CSV, optional fields (tolerance, qualitySpec, shipmentPeriod, etc.) may be present but empty, or the column may be omitted entirely.

[Answer]: No — present-but-empty is an explicit empty string, missing column uses default

> Should the validator treat a present-but-empty optional field the same as a missing/omitted column?
> Option A: Yes — both treated as "not provided", use default value
> Option B: No — present-but-empty is an explicit empty string, missing column uses default

---

### Frontend Components

**Q13 — Results Display: Table vs List**
After import completes, the validation and import results need to be displayed. Should the UI show:

[Answer]: A summary card with counts only, with expandable detail per row

> Option A: A results table with one row per CSV row, showing status, errors, and import outcome
> Option B: Two separate sections — "Errors" list and "Imported" list
> Option C: A summary card with counts only, with expandable detail per row

---

**Q14 — Error Report Download**
The integration contract includes an `errorReport` field in the response with rows of errors. Should the frontend offer a "Download Error Report" button that generates a CSV of errors?

[Answer]: No — display errors inline in the UI only, no download

> Option A: Yes — provide a download button that generates a CSV error report from the response data
> Option B: No — display errors inline in the UI only, no download
> Option C: Yes — but only if there are more than N errors (e.g., > 5)

---

**Q15 — Upload Component: Drag and Drop**
US-002 AC-001 mentions "drag-and-drop area." Should this be:

[Answer]: Both — drag-and-drop zone that also accepts click-to-browse

> Option A: Full drag-and-drop implementation with visual drop zone
> Option B: Click-to-browse only (simpler, no drag-and-drop)
> Option C: Both — drag-and-drop zone that also accepts click-to-browse

---

**Q16 — Loading State Granularity**
US-002 AC-007 says show a "simple loading spinner." US-003 AC-001 mentions showing "Validating..." and "Importing..." messages. Should the loading state:

[Answer]: Single spinner with no status text (simplest)

> Option A: Single spinner with no status text (simplest)
> Option B: Status text that updates: "Uploading..." → "Validating..." → "Importing..."
> Option C: Progress steps indicator showing which phase is active

---

### Error Handling

**Q17 — System Error User Message**
US-005 AC-005 says system errors should show a "user-friendly message." What should the default system error message be?

[Answer]: Import failed due to a server error. Please contact your administrator.

> Option A: "An unexpected error occurred. Please try again. No data was affected."
> Option B: "Import failed due to a server error. Please contact your administrator."
> Option C: Custom message per error type (file error vs DB error vs network error)

---

**Q18 — Validation Stops at File Level**
If a file-level validation fails (F-001 to F-005), the system returns a 400 immediately without processing any rows. Should the response include ALL file-level errors found, or stop at the first one?

[Answer]: Return only the first file-level error encountered (fail-fast)

> Option A: Return all file-level errors found (e.g., wrong format AND too many rows)
> Option B: Return only the first file-level error encountered (fail-fast)

---

### Business Scenarios

**Q19 — All Rows Valid: Auto-Import Confirmation**
When all rows are valid, the unit spec says import is triggered automatically with no user confirmation. Should the UI:

[Answer]: Show a confirmation dialog even for all-valid case ("Import 20 contracts?")

> Option A: Show results immediately after auto-import completes (no intermediate screen)
> Option B: Show a brief "All rows valid — importing now..." message before showing results
> Option C: Show a confirmation dialog even for all-valid case ("Import 20 contracts?")

---

**Q20 — Re-upload After Partial Import**
If a user uploads a file where 15 rows import successfully and 5 fail, then fixes the 5 rows and re-uploads — the 15 already-imported contracts will fail CN-002 (duplicate contract number). Should the system:

[Answer]: No partial import

> Option A: Treat this as a normal validation error — user must remove already-imported rows from the file
> Option B: Detect already-imported rows and skip them with a "already imported" status (not an error)
> Option C: Offer an "update existing" mode vs "create new" mode

---

## Storage Location
This plan is stored at: `aidlc-docs/construction/plans/unit-2-file-upload-validation-functional-design-plan.md`

---

**Created**: March 4, 2026  
**Unit**: Unit 2 — File Upload & Validation Service  
**Status**: ✅ Complete — Functional design artifacts generated
