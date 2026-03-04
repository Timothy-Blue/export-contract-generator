# Frontend Components — Unit 1: Template Management Service

## Overview
Unit 1's frontend surface is a single button rendered inside the ContractImportPage (owned by Unit 2). No standalone page is needed.

---

## Component

### TemplateDownloadButton

A simple download link rendered within the `FileRequirementsHint` area of the `ImportUploadZone` component (Unit 2).

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| disabled | boolean | Optionally disable during upload loading state |

**Behavior:**
- Renders as an anchor tag (`<a>`) pointing to `GET /api/import/template`
- The `download` attribute triggers browser file download
- Clicking initiates the file download directly — no loading state needed (static file, instant response)
- No state management required

**Display:**
- Label: "Download CSV Template"
- Positioned within the file requirements hint area, clearly visible before the user selects a file
- Available at all times (idle, results, error phases) — only hidden during loading phase

---

## API Integration

| Action | Endpoint | Trigger |
|--------|----------|---------|
| Download template | GET /api/import/template | User clicks "Download CSV Template" |

---

## User Interaction Flow

```
1. User opens ContractImportPage
2. User sees "Download CSV Template" link in the upload zone hint area
3. User clicks the link
4. Browser downloads "contract_import_template.csv" immediately
5. User opens file in spreadsheet software, fills in data, saves as CSV
6. User uploads the filled file via ImportUploadZone
```

---

**Created**: March 4, 2026
**Unit**: Unit 1 — Template Management Service
