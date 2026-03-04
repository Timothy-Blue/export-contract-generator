# NFR Requirements — Unit 3: Import Execution & Results Service

**Created**: March 4, 2026
**Unit**: Unit 3 — Import Execution & Results Service

---

## Overview
Unit 3 is a backend-internal service called exclusively by Unit 2. It performs reference data resolution, derived field calculation, and transactional contract creation. It has no public API. NFR requirements focus on data integrity, transaction reliability, and performance of DB operations.

---

## 1. Performance

| ID | Requirement | Rationale |
|----|-------------|-----------|
| P3-001 | Full import execution (resolution + calculation + transaction) must complete in ≤ 15 seconds for 20 rows | Acceptable for an admin batch operation; combined with Unit 2's validation, total pipeline ≤ 25s |
| P3-002 | Reference data resolution must batch DB queries per entity type — one query per unique name set, not one per row | Prevents N+1 queries; already specified in functional design |
| P3-003 | Derived field calculations (totalAmount, min/max) must be performed before the transaction opens | Keeps transaction duration minimal |
| P3-004 | Transaction must contain only INSERT operations — no reads inside the transaction | Minimizes lock contention and transaction duration |

---

## 2. Data Integrity

| ID | Requirement | Rationale |
|----|-------------|-----------|
| DI3-001 | All contract inserts must be wrapped in a single database transaction | Enforces all-or-nothing import guarantee |
| DI3-002 | Transaction must roll back completely if any single insert fails | No partial imports |
| DI3-003 | Duplicate contractNumber must be rejected at the DB level (unique index) as a secondary guard | Defense-in-depth; Unit 2 already validates this |
| DI3-004 | Reference data created in Phase 1 is not rolled back if Phase 3 fails — this is acceptable and documented | Orphaned reference records are harmless |
| DI3-005 | totalAmount must be calculated with full floating-point precision — no rounding before storage | Preserves financial accuracy |
| DI3-006 | createdBy must always be set to the authenticated userId — never null or anonymous | Audit integrity |

---

## 3. Reliability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| R3-001 | If the database is unavailable during Phase 1 (resolution), the entire import must fail with a clear error — no partial state | Prevents inconsistent data |
| R3-002 | If the transaction rolls back in Phase 3, the error message must identify which row caused the failure | Enables diagnosis without exposing internals |
| R3-003 | System errors (DB timeout, connection loss) must result in all rows marked `status: "failed"` with a generic user-facing message | Consistent failure response |
| R3-004 | Unit 3 must never re-validate rows — it trusts Unit 2's validation output | Avoids double-validation inconsistency |
| R3-005 | Resolution failure (inactive reference, buyer=seller conflict) must abort before any DB writes in Phase 3 | Prevents partial contract creation |

---

## 4. Security

| ID | Requirement | Rationale |
|----|-------------|-----------|
| SEC3-001 | Unit 3 has no public API — it must only be callable from within the same process as Unit 2 | Prevents direct external invocation |
| SEC3-002 | userId passed from Unit 2 must be validated as non-null and non-empty before use | Prevents anonymous contract creation |
| SEC3-003 | All DB write operations must use parameterized queries / ORM methods — no raw string interpolation | Prevents NoSQL injection |
| SEC3-004 | Error messages returned to Unit 2 must not expose DB schema, collection names, or internal query details | Prevents information leakage through the API |

---

## 5. Scalability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| S3-001 | Unit 3 is stateless — no in-memory state persists between calls | Supports horizontal scaling of the host process |
| S3-002 | Maximum input is 20 validated rows — no streaming or chunked processing required | Bounded input; single-pass processing is sufficient |
| S3-003 | Reference resolution cache is call-scoped (in-memory per executeImport call) | No shared state between concurrent imports |

---

## 6. Observability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| O3-001 | Each executeImport call must be logged with: timestamp, userId, row count, phase reached, outcome (success/failure), duration | Full audit trail for import operations |
| O3-002 | Reference data creation events must be logged at INFO level: entity type, name, wasCreated flag | Tracks auto-created reference data for admin review |
| O3-003 | Transaction rollback events must be logged at ERROR level with the triggering row number and error detail | Enables post-mortem diagnosis |
| O3-004 | All Phase 1 resolution failures must be logged at WARN level with entity type and name | Distinguishes expected failures (inactive records) from system errors |
| O3-005 | Imported contract IDs must be included in the success log entry | Enables traceability from import log to contract records |

---

## 7. Maintainability

| ID | Requirement | Rationale |
|----|-------------|-----------|
| MT3-001 | Reference data creation defaults (address: "To be updated", description: "Imported") must be configurable constants, not hardcoded strings | Simplifies future updates |
| MT3-002 | The numberToText utility used for totalAmountText must be isolated and independently testable | Prevents regressions in financial text generation |
| MT3-003 | Phase 1, Phase 2, and Phase 3 must be implemented as distinct, independently testable functions | Supports unit testing of each phase in isolation |

---

## Summary

Unit 3's NFR profile centers on:
- Data integrity: single transaction, all-or-nothing, duplicate guard at DB level
- Reliability: graceful failure at each phase, no partial state
- Observability: detailed audit logging of resolution events and import outcomes
- Security: internal-only API, parameterized DB writes, no info leakage
