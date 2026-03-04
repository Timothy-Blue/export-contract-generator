# Logical Design Plan — All Units (1, 2, 3)

## Scope
Generate a logical design for software source code implementation for each of the three units of the Contract Import feature, based on:
- Domain model documents under `aidlc-docs/construction/{unit}/functional-design/`
- Integration contract at `inception/units/integration_contract.md`
- NFR requirements under `aidlc-docs/construction/{unit}/nfr-requirements/`

Output files:
- `aidlc-docs/construction/unit-1-template-management/logical_design.md`
- `aidlc-docs/construction/unit-2-file-upload-validation/logical_design.md`
- `aidlc-docs/construction/unit-3-import-execution/logical_design.md`

---

## Clarifications Needed Before Execution

**[Question]** Q1 — Tech Stack Confirmation
The existing codebase uses Node.js/Express on the backend and React on the frontend (observed from `client/` and `api/` folders). The logical design will target this stack (Express route handlers, Mongoose ODM for MongoDB, React components with hooks).

[Answer] Yes

---

**[Question]** Q2 — Layered Architecture Style
For the backend, should the logical design follow a layered architecture (Route → Controller → Service → Repository/Model), or a different pattern (e.g., hexagonal/ports-and-adapters, flat handler functions)?

[Answer] Layered

---

**[Question]** Q3 — Frontend State Management
The existing frontend uses React. Should the logical design use:
- Option A: Local component state only (useState/useReducer inside ContractImportPage)
- Option B: A React Context for import state (shared across components)
- Option C: An external state library (Redux, Zustand, etc.)

[Answer] Local component state only

---

**[Question]** Q4 — Validation Layer Placement
The 5-level validation logic for Unit 2 is substantial. Should it be designed as:
- Option A: A single `ValidationService` class with methods per validation level
- Option B: Separate validator modules per level (e.g., `fileLevelValidator.js`, `fieldLevelValidator.js`, etc.)
- Option C: A pipeline/chain-of-responsibility pattern where each level is a composable step

[Answer] A single `ValidationService` class with methods per validation level

---

**[Question]** Q5 — Unit 3 Internal Call Mechanism
Unit 3 is called internally by Unit 2 with no public API. Should the logical design model this as:
- Option A: A direct function/module import (Unit 2 imports and calls Unit 3's `executeImport` function directly)
- Option B: An internal service class instantiated and called within the same request handler
- Option C: An event-driven call (Unit 2 emits an event, Unit 3 listens)

[Answer]  A direct function/module import (Unit 2 imports and calls Unit 3's `executeImport` function directly)

---

**[Question]** Q6 — Error Logging Library
Should the logical design reference a specific logging library (e.g., `winston`, `pino`, `morgan`) or remain library-agnostic (describe a `logger` abstraction)?

[Answer] No

---

**[Question]** Q7 — Middleware for Auth/AuthZ
Should authentication and admin-role authorization be handled by:
- Option A: Existing middleware already in the codebase (reuse what's there)
- Option B: New middleware defined as part of this feature's logical design
- Option C: Inline checks inside each route handler

[Answer]  Existing middleware already in the codebase (reuse what's there)

---

## Plan Steps

- [x] Step 1: Review answers to clarification questions above
- [x] Step 2: Define the shared logical design conventions (naming, layering, file structure) that apply to all three units
- [x] Step 3: Generate logical design for Unit 1 — Template Management Service
  - [x] 3a: Route and controller design
  - [x] 3b: Service layer design
  - [x] 3c: Static asset handling design
  - [x] 3d: Frontend component logical design (TemplateDownloadButton)
  - [x] 3e: NFR mapping (auth middleware, logging, error handling)
  - [x] 3f: Write `unit-1-template-management/logical_design.md`
- [x] Step 4: Generate logical design for Unit 2 — File Upload & Validation Service
  - [x] 4a: Route and controller design (POST /api/import/upload)
  - [x] 4b: File parsing service design
  - [x] 4c: Validation pipeline design (5 levels)
  - [x] 4d: Reference data cache loader design
  - [x] 4e: Import decision and response assembly design
  - [x] 4f: Frontend component logical design (ContractImportPage and sub-components)
  - [x] 4g: NFR mapping (security, performance, observability)
  - [x] 4h: Write `unit-2-file-upload-validation/logical_design.md`
- [x] Step 5: Generate logical design for Unit 3 — Import Execution & Results Service
  - [x] 5a: Internal function interface design (executeImport)
  - [x] 5b: Phase 1 — Reference data resolution service design
  - [x] 5c: Phase 2 — Derived field calculation design
  - [x] 5d: Phase 3 — Transactional contract creation design
  - [x] 5e: Result formatting design
  - [x] 5f: NFR mapping (transaction integrity, observability, security)
  - [x] 5g: Write `unit-3-import-execution/logical_design.md`
- [x] Step 6: Cross-unit review — verify integration contract alignment across all three logical designs
- [x] Step 7: Final review and sign-off

---

## Notes
- No code snippets will be generated — logical design only (module names, responsibilities, interfaces, data flows, dependency maps)
- Each logical design document will cover: module structure, component responsibilities, data flow diagrams, dependency map, NFR design decisions
- The domain model source of truth is the `functional-design/` folder for each unit

---

**Created**: March 4, 2026
**Status**: ✅ Complete — Logical design artifacts generated
