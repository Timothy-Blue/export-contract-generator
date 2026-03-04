# Domain Entities — Unit 1: Template Management Service

## Overview
Unit 1 has no domain entities of its own. It serves a static file and introduces no new persistent data structures.

---

## 1. CsvTemplate (Static Asset)
Represents the downloadable CSV template file stored on the backend.

| Attribute | Value |
|-----------|-------|
| Filename | `contract_import_template.csv` |
| Storage location | `server/assets/contract_import_template.csv` |
| Encoding | UTF-8 |
| Delimiter | Comma (,) |
| Content-Type | `text/csv` |
| Content-Disposition | `attachment; filename="contract_import_template.csv"` |

---

## 2. TemplateColumn (Conceptual)
Describes each column in the template header row. Not a runtime object — used to define the static file structure.

| # | Column Name | Required | Example Value |
|---|-------------|----------|---------------|
| 1 | contractNumber | Yes | CNT-2026-001 |
| 2 | contractDate | Yes | 2026-03-15 |
| 3 | buyerName | Yes | ABC Trading Ltd |
| 4 | sellerName | Yes | XYZ Exports Inc |
| 5 | commodityName | Yes | White Rice |
| 6 | commodityDescription | Yes | Premium Quality White Rice Grade A |
| 7 | quantity | Yes | 1000 |
| 8 | unit | Yes | MT |
| 9 | tolerance | No | 5 |
| 10 | origin | Yes | Vietnam |
| 11 | packing | Yes | 50kg PP Bags |
| 12 | qualitySpec | No | Moisture max 14% |
| 13 | unitPrice | Yes | 450 |
| 14 | currency | Yes | USD |
| 15 | incoterm | Yes | FOB |
| 16 | portLocation | Yes | Ho Chi Minh Port |
| 17 | paymentTermName | Yes | 30% TT Advance Balance Against BL |
| 18 | bankName | Yes | Vietcombank |
| 19 | accountName | Yes | XYZ Exports Inc |
| 20 | accountNumber | Yes | 1234567890 |
| 21 | swiftCode | Yes | BFTVVNVX |
| 22 | shipmentPeriod | No | April 2026 |
| 23 | additionalTerms | No | Inspection by SGS |
| 24 | releaseType | No | NOT_SPECIFIED |
| 25 | status | No | DRAFT |

---

**Created**: March 4, 2026
**Unit**: Unit 1 — Template Management Service
