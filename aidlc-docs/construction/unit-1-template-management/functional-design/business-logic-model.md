# Business Logic Model — Unit 1: Template Management Service

## Overview
Unit 1 has minimal business logic. The entire workflow is: authenticate → serve static file.

---

## 1. Template Download Workflow

```
RECEIVE GET /api/import/template request
    │
    ├─ [FAIL] No auth token → return 401 Unauthorized
    ├─ [FAIL] User is not admin → return 403 Forbidden
    │
    ▼
LOCATE template file at server/assets/contract_import_template.csv
    │
    ├─ [FAIL] File not found → return 500 Server Error
    │
    ▼
STREAM file to client
    │
    ▼
Return 200 with headers:
  Content-Type: text/csv
  Content-Disposition: attachment; filename="contract_import_template.csv"
```

---

## 2. Template File Content

The static file contains:
- Row 1: Header row with all 25 column names (exact names, in order)
- Rows 2–4: 2–3 sample data rows demonstrating variety

### Sample Row 1 — FOB, MT, USD
```
CNT-2026-001,2026-03-15,ABC Trading Ltd,XYZ Exports Inc,White Rice,Premium Quality White Rice Grade A,1000,MT,5,Vietnam,50kg PP Bags,Moisture max 14%,450,USD,FOB,Ho Chi Minh Port,30% TT Advance Balance Against BL,Vietcombank,XYZ Exports Inc,1234567890,BFTVVNVX,April 2026,Inspection by SGS,NOT_SPECIFIED,DRAFT
```

### Sample Row 2 — CIF, KG, EUR
```
CNT-2026-002,2026-04-01,Global Imports GmbH,Pacific Grains Co,Wheat Flour,High Protein Wheat Flour Type 550,5000,KG,3,Australia,25kg Paper Bags,,320,EUR,CIF,Hamburg Port,60 days LC at sight,Deutsche Bank,Pacific Grains Co,9876543210,DEUTDEDB,May 2026,,SWB,FINALIZED
```

### Sample Row 3 — EXW, BAGS, USD
```
CNT-2026-003,2026-05-10,Eastern Foods Ltd,Southern Harvest Inc,Soybeans,Non-GMO Soybeans Grade 1,2000,BAGS,0,Brazil,Bulk,Oil content min 18%,280,USD,EXW,Santos Port,100% TT in advance,Banco do Brasil,Southern Harvest Inc,5555666677,BRASBRRJBHE,,,NOT_SPECIFIED,DRAFT
```

---

## 3. Error Handling

| Scenario | Response |
|----------|----------|
| Unauthenticated request | 401 `{ "message": "Unauthorized" }` |
| Non-admin user | 403 `{ "message": "Forbidden" }` |
| Template file missing | 500 `{ "message": "Template file not available. Please contact your administrator." }` |

---

**Created**: March 4, 2026
**Unit**: Unit 1 — Template Management Service
