# Integration Contract

## Overview
This document defines the public API contracts for the Contract Import feature.
All APIs are frontend-to-backend only. Backend units communicate via internal function calls.

## Authentication
All endpoints require:
- Valid session token (cookie or Authorization header)
- Admin role — non-admin requests return `403 Forbidden`

---

## Unit 1 — Template Management Service

### GET /api/import/template

Download the CSV template file.

**Request**
```
GET /api/import/template
Authorization: Bearer <token>
```

**Response — 200 OK**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="contract_import_template.csv"

[CSV file content]
```

**Error Responses**

| Status | Reason |
|--------|--------|
| 401 | Unauthenticated |
| 403 | User is not an admin |
| 500 | Server error |

---

## Unit 2 — File Upload & Validation Service

### POST /api/import/upload

Upload a CSV file. The server validates all rows, triggers import for valid rows (via Unit 3 internally), and returns the complete results in a single response.

**Request**
```
POST /api/import/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <CSV file>
```

**Constraints**
- File must be `.csv`
- File must be UTF-8 encoded
- Maximum 20 data rows (excluding header)
- Only one upload may be in progress per user at a time

**Response — 200 OK**

Returned when the upload, validation, and import pipeline completes (full success, partial success, or all rows invalid).

```json
{
  "success": true,
  "message": "Import completed successfully!",
  "summary": {
    "totalRows": 5,
    "validRows": 4,
    "invalidRows": 1,
    "importedRows": 4,
    "failedRows": 0,
    "skippedRows": 1
  },
  "validationResults": [
    {
      "rowNumber": 2,
      "contractNumber": "CNT-2026-001",
      "status": "valid"
    },
    {
      "rowNumber": 3,
      "contractNumber": "CNT-2026-002",
      "status": "invalid",
      "errors": [
        {
          "ruleId": "CD-002",
          "field": "contractDate",
          "message": "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)",
          "severity": "error"
        }
      ]
    }
  ],
  "importResults": [
    {
      "rowNumber": 2,
      "contractNumber": "CNT-2026-001",
      "status": "imported",
      "contractId": "64f1a2b3c4d5e6f7a8b9c0d1"
    },
    {
      "rowNumber": 3,
      "contractNumber": "CNT-2026-002",
      "status": "skipped",
      "contractId": null,
      "error": null
    }
  ],
  "errorReport": null
}
```

**Response — 200 OK (with errors available for download)**

When errors exist, `errorReport` contains the data needed to generate a downloadable CSV:

```json
{
  "success": true,
  "message": "Import completed with some errors",
  "summary": {
    "totalRows": 5,
    "validRows": 3,
    "invalidRows": 2,
    "importedRows": 3,
    "failedRows": 0,
    "skippedRows": 2
  },
  "validationResults": [ "..." ],
  "importResults": [ "..." ],
  "errorReport": {
    "available": true,
    "rows": [
      {
        "rowNumber": 3,
        "contractNumber": "CNT-2026-002",
        "field": "contractDate",
        "errorMessage": "Invalid date format. Use YYYY-MM-DD (e.g., 2026-03-15)"
      }
    ]
  }
}
```

**Response — 400 Bad Request**

Returned for file-level failures (wrong format, too many rows, empty file, missing headers).

```json
{
  "success": false,
  "message": "File exceeds maximum limit of 20 rows. Please split into multiple files.",
  "code": "FILE_TOO_LARGE"
}
```

**Error Response Codes**

| Code | Description |
|------|-------------|
| `INVALID_FILE_FORMAT` | File is not a CSV |
| `FILE_TOO_LARGE` | More than 20 data rows |
| `FILE_EMPTY` | No data rows found |
| `MISSING_HEADERS` | Required column headers missing |
| `INVALID_ENCODING` | File is not UTF-8 |
| `UPLOAD_IN_PROGRESS` | Another upload is already running for this user |
| `SERVER_ERROR` | Unexpected server error |

**HTTP Status Codes**

| Status | Reason |
|--------|--------|
| 200 | Pipeline completed (check `success` and `summary` for outcome) |
| 400 | File-level validation failed |
| 401 | Unauthenticated |
| 403 | User is not an admin |
| 409 | Upload already in progress |
| 500 | Server error |

---

## Summary

| Unit | Method | Endpoint | Auth | Public |
|------|--------|----------|------|--------|
| Unit 1 | GET | /api/import/template | Admin | Yes |
| Unit 2 | POST | /api/import/upload | Admin | Yes |
| Unit 3 | — | Internal functions only | — | No |

## Notes
- Unit 3 has no public API. It is invoked internally by Unit 2 during the upload pipeline.
- The `POST /api/import/upload` endpoint handles the complete workflow: upload → validate → import → return results.
- A `200` response does not guarantee all rows were imported. Always check `summary.importedRows`.
- The `errorReport` field is `null` when there are no errors.

---

**Created**: March 4, 2026
**Last Updated**: March 4, 2026
**Status**: Ready for Review
