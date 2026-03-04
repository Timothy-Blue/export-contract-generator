# Frontend Components — Unit 2: File Upload & Validation Service

## Overview
This document defines the frontend component structure, state, user interaction flows, and API integration points for the contract import UI.

---

## Component Hierarchy

```
ContractImportPage
├── ImportUploadZone
│   ├── DropZone (drag-and-drop + click-to-browse)
│   ├── FileInfo (selected filename display)
│   ├── FileRequirementsHint (format/size instructions + template link)
│   └── UploadButton
├── ImportLoadingSpinner (conditional — shown during upload/processing)
├── ImportConfirmDialog (conditional — shown when all rows valid, before import)
├── ImportResultsSummary (conditional — shown after processing completes)
│   ├── SummaryCard (counts: total, valid, invalid, imported)
│   └── RowResultsList
│       └── RowResultItem (expandable — one per CSV row)
│           ├── RowStatusBadge
│           ├── ErrorList (shown when expanded, if errors exist)
│           └── WarningList (shown when expanded, if warnings exist)
└── ImportErrorBanner (conditional — shown on system/file-level errors)
```

---

## Component Definitions

### 1. ContractImportPage

Top-level page component. Owns all state for the import workflow.

**State:**
| State | Type | Initial | Description |
|-------|------|---------|-------------|
| selectedFile | File \| null | null | The file chosen by the user |
| phase | "idle" \| "loading" \| "confirm" \| "results" \| "error" | "idle" | Current UI phase |
| validationResponse | ValidationResult \| null | null | Full API response after upload |
| fileError | string \| null | null | Client-side file validation error message |
| systemError | string \| null | null | Server or network error message |

**Phase transitions:**
```
idle → loading       (user clicks Upload)
loading → confirm    (API returns: all rows valid, no import yet)
loading → results    (API returns: some rows invalid — show errors)
loading → error      (API returns 400/500, or network failure)
confirm → loading    (user confirms import)
confirm → idle       (user cancels)
loading → results    (import complete — all imported)
results → idle       (user clicks "Upload Another File")
error → idle         (user dismisses error or selects new file)
```

**User interactions handled:**
- File selected → validate client-side → update `selectedFile` and `fileError`
- Upload clicked → POST to `/api/import/upload` → transition to `loading`
- Confirm clicked → POST to `/api/import/upload?confirm=true` (or equivalent) → transition to `loading`
- Cancel clicked → transition to `idle`
- "Upload Another File" clicked → reset all state → transition to `idle`

---

### 2. ImportUploadZone

Handles file selection via drag-and-drop and click-to-browse (Q15: both).

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| onFileSelected | (file: File) => void | Called when user selects a valid file |
| onFileError | (message: string) => void | Called when client-side file check fails |
| disabled | boolean | True during loading phase — prevents interaction |
| selectedFile | File \| null | Currently selected file (for display) |

**Sub-components:**

#### DropZone
- Renders a visually distinct drop area
- Accepts drag-over, drag-leave, drop events
- On drop: extract first file, pass to parent via `onFileSelected`
- On click: trigger hidden `<input type="file" accept=".csv">` element
- Visual states: default, drag-over (highlighted border), disabled (muted)

#### FileInfo
- Shown only when `selectedFile` is not null
- Displays: filename, file size in KB
- Includes a clear/remove button to deselect

#### FileRequirementsHint
- Static text: "CSV format, UTF-8 encoded, max 20 rows"
- Link: "Download template" → calls `GET /api/import/template`

#### UploadButton
- Label: "Upload & Validate"
- Disabled when: `selectedFile === null` OR `disabled === true` OR `fileError !== null`
- On click: triggers upload flow in parent

**Client-side file validation** (before upload):
- File extension must be `.csv` → error: "Invalid file format. Please upload a CSV file."
- File size must be > 0 bytes → error: "File is empty. Please add at least one contract row."
- These are quick checks only — full validation happens server-side

---

### 3. ImportLoadingSpinner

Shown during `phase === "loading"`.

**Props:** none (purely presentational)

**Renders:**
- A centered spinner icon
- No status text (Q16: single spinner, simplest)
- Upload button remains disabled while visible

---

### 4. ImportConfirmDialog

Shown during `phase === "confirm"` — when all rows passed validation and user must confirm before import executes.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| rowCount | number | Number of valid rows to be imported |
| onConfirm | () => void | Called when user clicks "Import" |
| onCancel | () => void | Called when user clicks "Cancel" |

**Renders:**
- Modal dialog (or inline card)
- Message: "All {rowCount} rows are valid. Import {rowCount} contracts?"
- "Import" button (primary action)
- "Cancel" button (secondary action)

**Note**: This dialog is shown after the first API call returns all-valid results. The actual import is triggered by the user clicking "Import."

---

### 5. ImportResultsSummary

Shown during `phase === "results"`. Displays outcome of the full pipeline.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| response | ValidationResult | Full API response |

**Sub-components:**

#### SummaryCard
Displays counts in a card layout (Q13: summary card with expandable detail):

| Label | Value source |
|-------|-------------|
| Total Rows | `summary.totalRows` |
| Valid Rows | `summary.validRows` |
| Invalid Rows | `summary.invalidRows` |
| Imported | `summary.importedRows` |

Visual indicator: green card if `success === true`, red/amber card if errors exist.

#### RowResultsList
- Renders one `RowResultItem` per entry in `validationResults`
- Sorted by `rowNumber` ascending

#### RowResultItem
Expandable row showing per-row outcome.

**Collapsed state shows:**
- Row number
- Contract number
- Status badge: "Valid" (green) / "Invalid" (red) / "Warning" (amber) / "Imported" (blue)

**Expanded state shows (on click):**
- ErrorList: each error as `[field]: message` (only if errors exist)
- WarningList: each warning as `[field]: message` (only if warnings exist)
- Import outcome: "Imported — Contract ID: {contractId}" or "Not imported"

**No download button** — errors displayed inline only (Q14).

---

### 6. ImportErrorBanner

Shown during `phase === "error"`. Displays file-level or system errors.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| message | string | Error message to display |
| onDismiss | () => void | Resets to idle phase |

**Renders:**
- Error alert/banner with the message
- "Try Again" button → calls `onDismiss`

**Messages by scenario:**
- File-level error (400): use `response.message` from API
- System error (500): "Import failed due to a server error. Please contact your administrator." (Q17)
- Network error: "Unable to connect to the server. Please check your connection and try again."

---

## User Interaction Flows

### Flow 1: Successful Import (All Rows Valid)
```
1. User opens ContractImportPage → phase: idle
2. User drags CSV file onto DropZone (or clicks to browse)
3. Client validates file extension → OK
4. FileInfo shows filename
5. User clicks "Upload & Validate"
6. phase → loading, spinner shown
7. POST /api/import/upload → server validates all rows
8. Response: all rows valid, importResults: null
9. phase → confirm
10. ImportConfirmDialog shown: "All 5 rows valid. Import 5 contracts?"
11. User clicks "Import"
12. phase → loading, spinner shown
13. POST /api/import/upload (with confirm) → server imports all rows
14. Response: success, importedRows: 5
15. phase → results
16. SummaryCard: Total 5, Valid 5, Invalid 0, Imported 5
17. All RowResultItems show "Imported" badge
```

### Flow 2: Validation Errors (Some/All Rows Invalid)
```
1–7. Same as Flow 1
8. Response: invalidRows > 0, importResults: null
9. phase → results
10. SummaryCard: Total 5, Valid 3, Invalid 2, Imported 0
11. Invalid rows show "Invalid" badge
12. User expands invalid row → sees field errors
13. User clicks "Upload Another File" → phase: idle
14. User fixes CSV and re-uploads
```

### Flow 3: File-Level Error
```
1–5. Same as Flow 1
6. phase → loading
7. POST /api/import/upload → server returns 400
8. phase → error
9. ImportErrorBanner shows: "File exceeds maximum limit of 20 rows..."
10. User clicks "Try Again" → phase: idle
```

### Flow 4: User Cancels Confirmation
```
1–10. Same as Flow 1 up to ImportConfirmDialog
11. User clicks "Cancel"
12. phase → idle
13. File selection is cleared, user can upload a different file
```

---

## API Integration Points

| Component | Endpoint | Trigger | Response Used |
|-----------|----------|---------|---------------|
| UploadButton | POST /api/import/upload | User clicks Upload | Full ValidationResult |
| ImportConfirmDialog "Import" | POST /api/import/upload (confirm) | User confirms | Full ValidationResult with importResults |
| FileRequirementsHint | GET /api/import/template | User clicks "Download template" | CSV file download |

---

## Form Validation Rules (Client-Side Only)

These are lightweight pre-checks before the file is sent to the server. Full validation is always server-side.

| Check | Rule | Error Message |
|-------|------|---------------|
| File type | Extension must be `.csv` | "Invalid file format. Please upload a CSV file." |
| File not empty | Size must be > 0 bytes | "File is empty. Please add at least one contract row." |

---

**Created**: March 4, 2026
**Unit**: Unit 2 — File Upload & Validation Service
