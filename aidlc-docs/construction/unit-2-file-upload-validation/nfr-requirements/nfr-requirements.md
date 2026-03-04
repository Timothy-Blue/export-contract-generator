# NFR Requirements — Unit 2: File Upload & Validation Service

**Created**: March 4, 2026
**Unit**: Unit 2 — File Upload & Validation Service

---

## Overview
Unit 2 handles file upload, multi-level validation (5 levels), reference data cache loading (5 DB queries), and import triggering. It is the most complex unit in the pipeline and has the highest NFR surface area.

---

## 1. Performance

| ID | Requirement | Rationale |
|----|-------------|-----------|
| P2-001 | End-to-end validation response (upload → validation results) must complete in ≤ 10 seconds for a 20-row file | Acceptable UX for an admin batch operation |
| P2-002 | Reference data cache must be loaded in a single round-trip batch (5 DB queries max) — no per-row DB calls during validation | Prevents N+1 query degradation; already specified in functional design |
| P2-003 | File parsing must complete in ≤ 1 second for a 20-row CSV | CSV files are small; parsing is CPU-bound and fast |
| P2-004 | File-level validation (fail-fast) must complete before any DB queries are issued | Avoids unnecessary DB load for invalid files |
| P2-005 | Validation result payload must not exceed 1MB | 20 rows × max error messages is well within this limit |

---

## 2. Scalability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| S2-001 | Unit 2 is stateless — no upload session state is persisted between requests | Enables horizontal scaling |
| S2-002 | Maximum file size is 20 data rows — no streaming or chunked processing is required | Bounded input size eliminates streaming complexity |
| S2-003 | Concurrent uploads from multiple admin users must be supported without interference | No shared mutable state between upload requests |
| S2-004 | Reference data cache is request-scoped (in-memory per request) — no shared cache between requests | Avoids cache invalidation complexity; acceptable given 20-row limit |

---

## 3. Availability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| A2-001 | If the database is unavailable during reference data loading, the endpoint must return HTTP 500 with a user-friendly message | Graceful degradation; no partial validation results |
| A2-002 | File upload endpoint must handle multipart/form-data requests reliably | Standard file upload mechanism |
| A2-003 | Request timeout must be set to ≥ 30 seconds to accommodate DB latency under load | Prevents premature timeout on valid requests |

---

## 4. Security

| ID | Requirement | Rationale |
|----|-------------|-----------|
| SEC2-001 | Endpoint must require a valid authentication token (JWT) | Prevents unauthenticated uploads |
| SEC2-002 | Endpoint must enforce admin-role authorization | Only admins may upload import files |
| SEC2-003 | Uploaded file must be validated for MIME type and extension before any processing | Prevents malicious file uploads |
| SEC2-004 | File size must be enforced at the HTTP layer (before parsing) to prevent memory exhaustion | Protects against large file DoS |
| SEC2-005 | Uploaded file content must never be executed or interpreted beyond CSV parsing | Prevents CSV injection and code execution |
| SEC2-006 | CSV injection must be mitigated: cell values starting with `=`, `+`, `-`, `@` must be sanitized or rejected in output | Protects downstream spreadsheet consumers of exported data |
| SEC2-007 | Validation error messages must not expose internal DB schema, query structure, or stack traces | Prevents information leakage |
| SEC2-008 | File upload must be processed in memory only — no temporary files written to disk | Reduces attack surface and cleanup complexity |

---

## 5. Reliability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R2-001 | Validation must be deterministic: the same file must always produce the same validation result | Enables reproducible debugging |
| R2-002 | All validation errors must be collected per row (never stop early within a row) | Functional requirement with reliability implications — partial error lists cause re-upload loops |
| R2-003 | Unhandled exceptions during the pipeline must be caught at the top level and return HTTP 500 | Prevents unhandled promise rejections crashing the server |
| R2-004 | DB query failures during reference data loading must abort the entire pipeline — no partial validation | Ensures consistent all-or-nothing behavior |

---

## 6. Observability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| O2-001 | Each upload request must be logged with: timestamp, userId, filename, row count, validation outcome (pass/fail), duration | Operational visibility and audit trail |
| O2-002 | DB query errors during reference data loading must be logged at ERROR level with query context | Enables rapid diagnosis |
| O2-003 | Validation summary (total/valid/invalid rows) must be included in the response for client display | Already in functional design; reinforced as NFR |
| O2-004 | Server-side errors must be logged with full stack trace; client must receive only a sanitized message | Security + observability balance |

---

## 7. Usability (Frontend NFR)

| ID | Requirement | Rationale |
|----|-------------|-----------|
| U2-001 | Loading spinner must be shown immediately on upload click — no perceived freeze | UX for potentially 10-second operations |
| U2-002 | Validation results must be displayed inline per row — no page reload required | SPA behavior |
| U2-003 | Error messages must be human-readable and actionable (field name + message) | Reduces re-upload iteration time for admins |
| U2-004 | Confirmation dialog must clearly state the number of rows to be imported before the user commits | Prevents accidental bulk imports |

---

## Summary

Unit 2 has the highest NFR complexity in the pipeline. Key concerns are:
- Performance: bounded by 20-row limit; 5-query batch cache loading is the critical path
- Security: file upload attack surface (MIME, size, CSV injection)
- Reliability: deterministic validation, top-level error handling
- Observability: per-request audit logging with outcome and duration
