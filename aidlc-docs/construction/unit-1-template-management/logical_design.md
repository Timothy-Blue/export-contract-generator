# Logical Design — Unit 1: Template Management Service

**Unit**: Unit 1 — Template Management Service
**Stories**: US-001
**Created**: March 4, 2026
**Status**: Draft

---

## 1. Shared Conventions (applies to all units)

### Backend Layering
All backend code follows the existing project convention:

```
Route (server/routes/)
  └── Controller (server/controllers/)
        └── Service (server/services/)  ← new layer introduced for import feature
              └── Model (server/models/)
```

- Routes: declare HTTP method, path, middleware chain, and delegate to controller
- Controllers: handle HTTP request/response lifecycle; call service methods; never contain business logic
- Services: contain all business logic; are framework-agnostic; return plain objects
- Models: Mongoose schemas; no business logic

### Naming Conventions
- Route files: `camelCase.js` (e.g., `importRoutes.js`)
- Controller files: `camelCaseController.js` (e.g., `importController.js`)
- Service files: `camelCaseService.js` (e.g., `templateService.js`)
- Frontend component files: `PascalCase.js` (e.g., `ContractImportPage.js`)
- Frontend service files: `camelCase.js` (e.g., `importApi.js`)

### Auth/AuthZ
Reuse existing middleware from `server/middleware/auth.js`. The current `authenticateAPIKey` middleware is a pass-through (auth is disabled). The import routes will use the same pattern — no new middleware is introduced. Admin-role enforcement is noted as a future concern aligned with the existing auth posture.

### Error Handling
Reuse the existing pattern: controllers catch errors and return `res.status(N).json({ message })`. The existing `errorHandler.js` middleware is available for unhandled errors.

### Logging
Use `console.log` / `console.error` consistent with the existing codebase (no external logging library). Log format: `[timestamp] [LEVEL] [unit] message`.

### Frontend API Client
Extend the existing `client/src/services/api.js` with a new `importAPI` object using the existing `apiClient` axios instance.

---

## 2. Module Structure

### Backend

```
server/
  routes/
    import.js                  ← new: mounts all import routes under /api/import
  controllers/
    importController.js        ← new: handles GET /api/import/template
  services/
    templateService.js         ← new: locates and streams the template file
  assets/
    contract_import_template.csv  ← new: static template file
```

### Frontend

```
client/src/
  services/
    api.js                     ← extend: add importAPI.downloadTemplate()
  components/
    ContractImportPage.js      ← owned by Unit 2; Unit 1 contributes TemplateDownloadButton
```

The `TemplateDownloadButton` is a sub-component rendered inside `ContractImportPage` (Unit 2). It is defined within the Unit 2 component tree but its API call is Unit 1's responsibility.

---

## 3. Component Responsibilities

### `server/routes/import.js`
- Mounts `GET /api/import/template` → `importController.downloadTemplate`
- Applies existing auth middleware (reuse `authenticateAPIKey`)
- Mounts `POST /api/import/upload` → `importController.uploadCsv` (Unit 2, same file)

### `server/controllers/importController.js`
**`downloadTemplate(req, res)`**
- Responsibility: receive the HTTP request, call `templateService.getTemplatePath()`, stream the file to the response, handle errors
- Sets response headers: `Content-Type: text/csv`, `Content-Disposition: attachment; filename="contract_import_template.csv"`
- On file-not-found: returns HTTP 500 with message `"Template file not available. Please contact your administrator."`
- On success: streams file using `res.download()` or `res.sendFile()`
- Logs: timestamp, userId (placeholder until auth is active), outcome

### `server/services/templateService.js`
**`getTemplatePath()`**
- Responsibility: resolve the absolute path to the template CSV file
- Returns the resolved path string
- Throws an error if the file does not exist at the expected path
- Path is derived from a configurable constant (not hardcoded inline)

### `server/assets/contract_import_template.csv`
- Static file: 25-column header row + 3 sample data rows
- Content defined by the domain model (Unit 1 `domain-entities.md`)
- UTF-8 encoded, comma-delimited
- Managed manually; version-controlled

### Frontend: `importAPI` in `client/src/services/api.js`
**`downloadTemplate()`**
- Returns the full URL string for `GET /api/import/template`
- Used as the `href` of the anchor tag in `TemplateDownloadButton`
- No axios call needed — browser handles the download natively via anchor `href`

### Frontend: `TemplateDownloadButton` (inside `ContractImportPage`)
- Renders as `<a href={importAPI.templateUrl} download>Download CSV Template</a>`
- `disabled` prop: when true, renders as non-interactive (e.g., muted style, pointer-events: none)
- No state, no loading indicator — static file download is instant
- Visible in all phases except `loading`

---

## 4. Data Flow

```
Browser
  │  click "Download CSV Template"
  │
  ▼
<a href="/api/import/template" download>
  │  HTTP GET /api/import/template
  │
  ▼
server/routes/import.js
  │  authenticateAPIKey middleware (pass-through)
  │
  ▼
importController.downloadTemplate(req, res)
  │  calls templateService.getTemplatePath()
  │
  ▼
templateService.getTemplatePath()
  │  resolves path to server/assets/contract_import_template.csv
  │  throws if file missing
  │
  ▼
importController
  │  res.download(path, "contract_import_template.csv")
  │
  ▼
Browser receives CSV file download
```

---

## 5. Dependency Map

```
import.js (route)
  └── importController.js
        └── templateService.js
              └── path (Node built-in)
              └── fs (Node built-in, for existence check)

TemplateDownloadButton (React)
  └── importAPI.templateUrl (string constant)
```

No Mongoose models are used by Unit 1. No DB queries.

---

## 6. Configuration

| Constant | Location | Value | Purpose |
|----------|----------|-------|---------|
| `TEMPLATE_FILE_PATH` | `templateService.js` (top of file) | `path.join(__dirname, '../assets/contract_import_template.csv')` | Configurable path to template file |
| `TEMPLATE_FILENAME` | `importController.js` (top of file) | `'contract_import_template.csv'` | Filename sent in Content-Disposition header |

---

## 7. NFR Design Decisions

| NFR ID | Requirement | Design Decision |
|--------|-------------|-----------------|
| P1-001 | ≤ 500ms response time | `res.download()` uses Node.js stream — no buffering; OS-level file cache handles repeat requests |
| P1-002 | No app-level caching needed | Static file served directly from disk via `res.download()` |
| S1-001 | Stateless | No in-memory state; `templateService` is a pure function |
| S1-002 | File accessible from all instances | File is bundled in `server/assets/` — part of deployment artifact |
| A1-002 | Graceful degradation if file missing | `templateService.getTemplatePath()` throws; controller catches and returns HTTP 500 |
| A1-003 | File version-controlled | `server/assets/contract_import_template.csv` committed to repo |
| SEC1-001 | Auth required | `authenticateAPIKey` middleware on route (pass-through currently; enforced when auth is activated) |
| SEC1-004 | No internal path exposure | `Content-Disposition` uses only filename, not full path |
| O1-001 | Audit log per download | Controller logs: `[timestamp] [INFO] [Unit1] Template downloaded by userId=<id>` |
| O1-002 | File-not-found logged at ERROR | Controller logs: `[timestamp] [ERROR] [Unit1] Template file not found at <path>` |

---

## 8. Error Scenarios

| Scenario | HTTP Status | Response Body | Log Level |
|----------|-------------|---------------|-----------|
| Unauthenticated (future) | 401 | `{ "message": "Unauthorized" }` | WARN |
| Non-admin (future) | 403 | `{ "message": "Forbidden" }` | WARN |
| Template file missing | 500 | `{ "message": "Template file not available. Please contact your administrator." }` | ERROR |
| Unexpected server error | 500 | `{ "message": "Something went wrong!" }` | ERROR |

---

## 9. Integration Contract Alignment

| Contract Requirement | Design Coverage |
|----------------------|-----------------|
| `GET /api/import/template` | Defined in `server/routes/import.js` |
| `Content-Type: text/csv` | Set in `importController.downloadTemplate` via `res.download()` |
| `Content-Disposition: attachment; filename="contract_import_template.csv"` | Set via `res.download(path, filename)` second argument |
| 401 on unauthenticated | Auth middleware (currently pass-through; enforced when auth activated) |
| 403 on non-admin | Auth middleware (same) |
| 500 on file missing | Controller error handler |
