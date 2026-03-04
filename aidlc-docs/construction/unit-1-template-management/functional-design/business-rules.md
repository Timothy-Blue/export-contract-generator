# Business Rules — Unit 1: Template Management Service

## Access Rules

| Rule ID | Rule | Error |
|---------|------|-------|
| T-001 | Only authenticated users may download the template | 401 Unauthorized |
| T-002 | Only admin-role users may download the template | 403 Forbidden |

## Template Content Rules

| Rule ID | Rule |
|---------|------|
| T-003 | Template must contain exactly 25 column headers in the specified order |
| T-004 | Column names must be exact (case-sensitive) as defined in the CSV specification |
| T-005 | Template must include 2–3 sample data rows |
| T-006 | All sample rows must use valid enum values (incoterm, unit, status, releaseType) |
| T-007 | All sample rows must use realistic but fictional company names (no real PII) |
| T-008 | Sample rows must use YYYY-MM-DD date format |
| T-009 | Template file must be UTF-8 encoded, comma-delimited |
| T-010 | Template is a static file — updated manually when CSV specification changes |
| T-011 | Template must not contain any authentication tokens or sensitive system data |

## Response Rules

| Rule ID | Rule |
|---------|------|
| T-012 | Response Content-Type must be `text/csv` |
| T-013 | Response Content-Disposition must be `attachment; filename="contract_import_template.csv"` |
| T-014 | Response must trigger a file download in the browser (not inline display) |

---

**Created**: March 4, 2026
**Unit**: Unit 1 — Template Management Service
