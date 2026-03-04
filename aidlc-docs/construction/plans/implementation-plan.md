# Implementation Plan — Contract Import Feature (Units 1, 2, 3)

## Scope
Implement the full Contract Import feature across all three units based on the logical designs at:
- `aidlc-docs/construction/unit-1-template-management/logical_design.md`
- `aidlc-docs/construction/unit-2-file-upload-validation/logical_design.md`
- `aidlc-docs/construction/unit-3-import-execution/logical_design.md`

---

## Clarifications Needed Before Execution

**[Question]** Q1 — `multer` and `csv-parse` are not in `package.json`. These are required for file upload handling and CSV parsing respectively. Should I install them as part of this implementation?

[Answer] Yes

---

**[Question]** Q2 — The `Contract` model has a `pre('save')` middleware that auto-calculates `minQuantity`/`maxQuantity`/`minTotalAmount`/`maxTotalAmount` from `tolerance`. The logical design for Unit 3 also calculates these in `derivedFieldService` before the transaction. Since `Contract.create()` triggers `pre('save')`, the model will recalculate them anyway. Should `derivedFieldService` still calculate them explicitly (for completeness/auditability), or should it skip them and rely on the model hook?

[Answer] skip

---

**[Question]** Q3 — The frontend `App.js` uses a `currentView` state pattern (no React Router) to switch between views. Should the new `ContractImportPage` be added as a new `currentView` value (e.g., `'import'`) in `App.js`, or should it be accessible via a separate route using React Router (which is already installed)?

[Answer] Yes

---

**[Question]** Q4 — The `userId` passed to `executeImport` and set as `createdBy` on contracts: since auth is currently a pass-through (no real user session), what value should be used as the `userId` placeholder? Options:
- Option A: `'import'` (fixed string)
- Option B: `req.ip` (client IP address)
- Option C: `'admin'` (fixed string)

[Answer] Option A: `'import'` (fixed string)

---

**[Question]** Q5 — The `Contract` model's `pre('save')` hook uses `this.quantity` and `this.tolerance` to calculate ranges. However, `Contract.create([doc], { session })` in a transaction also triggers `pre('save')`. Is there any concern about the model hook interfering with the values set by `derivedFieldService`, or should we bypass the hook for import (e.g., use `insertMany` with `{ session }` instead of `create`)?

[Answer] Bypass

---

## Plan Steps

### Phase 0 — Setup
- [x] Step 0.1: Install `multer` and `csv-parse` npm packages (backend)
- [x] Step 0.2: Register the new `/api/import` route in `server/server.js`

### Phase 1 — Unit 1: Template Management Service (Backend)
- [x] Step 1.1: Create `server/assets/contract_import_template.csv` (25-column header + 3 sample rows)
- [x] Step 1.2: Create `server/services/templateService.js`
- [x] Step 1.3: Create `server/controllers/importController.js` with `downloadTemplate()`
- [x] Step 1.4: Create `server/routes/import.js` with `GET /api/import/template`

### Phase 2 — Unit 3: Import Execution Service (Backend — no public API, built before Unit 2 needs it)
- [x] Step 2.1: Create `server/services/referenceResolutionService.js`
- [x] Step 2.2: Create `server/services/derivedFieldService.js`
- [x] Step 2.3: Create `server/services/contractCreationService.js`
- [x] Step 2.4: Create `server/services/importExecutionService.js` (orchestrator)

### Phase 3 — Unit 2: File Upload & Validation Service (Backend)
- [x] Step 3.1: Create `server/middleware/uploadMiddleware.js` (multer config)
- [x] Step 3.2: Create `server/services/csvParserService.js`
- [x] Step 3.3: Create `server/services/validationService.js`
- [x] Step 3.4: Create `server/services/referenceDataCacheService.js`
- [x] Step 3.5: Create `server/services/importResponseService.js`
- [x] Step 3.6: Add `uploadCsv()` to `server/controllers/importController.js`
- [x] Step 3.7: Add `POST /api/import/upload` to `server/routes/import.js`

### Phase 4 — Frontend (Units 1 & 2)
- [x] Step 4.1: Extend `client/src/services/api.js` with `importAPI`
- [x] Step 4.2: Create `client/src/components/ImportLoadingSpinner.js`
- [x] Step 4.3: Create `client/src/components/ImportErrorBanner.js`
- [x] Step 4.4: Create `client/src/components/ImportConfirmDialog.js`
- [x] Step 4.5: Create `client/src/components/ImportResultsSummary.js`
- [x] Step 4.6: Create `client/src/components/ImportUploadZone.js`
- [x] Step 4.7: Create `client/src/components/ContractImportPage.js` (top-level, wires all sub-components)
- [x] Step 4.8: Wire `ContractImportPage` into `App.js` navigation

### Phase 5 — Verification
- [x] Step 5.1: Verify all files exist at the correct paths per the logical design module structure
- [x] Step 5.2: Verify `server/server.js` correctly mounts `/api/import`
- [x] Step 5.3: Verify no circular dependencies between services

---

## Notes
- Unit 3 is implemented before Unit 2 because Unit 2's controller depends on `importExecutionService`
- Frontend components are built leaf-first (smallest → largest) to avoid forward-reference issues
- No test files are generated unless explicitly requested
- The `server/assets/` directory is new and must be created

---

**Created**: March 4, 2026
**Status**: ✅ Complete — All 20 steps done
