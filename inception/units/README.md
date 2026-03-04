# Contract Import Feature — Units

## Overview
The Contract Import feature is organized into 3 independent units. Each unit contains highly cohesive user stories and can be built by a single team. Units are loosely coupled and communicate through well-defined interfaces.

## Units

### Unit 1 — Template Management Service
**Folder**: `unit-1-template-management/`
**Story Points**: 1
**Team Size**: 1 developer

Provides a downloadable CSV template so admin users can prepare their contract data for import.

| Story | Points |
|-------|--------|
| US-001: Download CSV Template | 1 |

Public API: `GET /api/import/template`

---

### Unit 2 — File Upload & Validation Service
**Folder**: `unit-2-file-upload-validation/`
**Story Points**: 17
**Team Size**: 2-3 developers

Handles the complete upload workflow — file validation, 5-level data validation, import triggering, and error reporting. This is the most complex unit and the only one with a write API.

| Story | Points |
|-------|--------|
| US-002: Upload CSV File for Import | 2 |
| US-003: Validate and Import CSV Data | 13 |
| US-005: Handle Import Errors | 2 |

Public API: `POST /api/import/upload`

---

### Unit 3 — Import Execution & Results Service
**Folder**: `unit-3-import-execution/`
**Story Points**: 8
**Team Size**: 1-2 developers

Handles contract creation, reference data management, transaction integrity, and result formatting. Backend-internal only — no public API.

| Story | Points |
|-------|--------|
| US-004: Import Execution and Results | 8 |

Public API: None (called internally by Unit 2)

---

## Total Story Points: 26

## Integration Contract
See [`integration_contract.md`](./integration_contract.md) for full API specifications including request/response formats, status codes, and error codes.

## Workflow
```
User
 │
 ├─ GET /api/import/template  ──►  Unit 1 (returns CSV file)
 │
 └─ POST /api/import/upload   ──►  Unit 2 (validate)
                                       │
                                       └─► Unit 3 (import) ──► existing services
                                       │
                                   Unit 2 (return results to user)
```

## Dependencies Between Units

| Unit | Depends On |
|------|-----------|
| Unit 1 | Nothing |
| Unit 2 | Unit 3 (internal), existing reference data services |
| Unit 3 | Existing reference data services, contract service |

## Source User Stories
Original user stories are in [`/inception/import-feature/`](../import-feature/).

---

**Created**: March 4, 2026
**Last Updated**: March 4, 2026
**Status**: ✅ Complete — Ready for Development
