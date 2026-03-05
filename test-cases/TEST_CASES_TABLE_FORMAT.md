# E2E Test Cases - Table Format

## Test Case Summary

| ID | Test Case Name | Category | Priority | Duration | Status |
|---|---|---|---|---|---|
| TC-001 | Successfully Import Three Valid Contracts | Happy Path | High | 30-45s | ⏳ Pending |
| TC-002 | Reject CSV File with Validation Errors | Validation | High | 20-30s | ⏳ Pending |
| TC-003 | Reject Invalid File Formats | Validation | High | 15-20s | ⏳ Pending |
| TC-004 | Handle Mixed Valid and Invalid Rows | Validation | High | 40-50s | ⏳ Pending |
| TC-005 | Cancel Import After Validation | User Flow | Medium | 15-20s | ⏳ Pending |
| TC-006 | Handle Network Connection Errors | Error Handling | Medium | 20-30s | ⏳ Pending |
| TC-007 | Detect Duplicate Contract Numbers | Business Rules | High | 20-25s | ⏳ Pending |
| TC-008 | Validate Business Rules and Show Warnings | Business Rules | High | 25-30s | ⏳ Pending |
| TC-009 | Automatically Create New Reference Data | Data Handling | High | 30-40s | ⏳ Pending |
| TC-010 | Navigate Between Pages and Reset State | User Flow | Medium | 30-40s | ⏳ Pending |
| TC-011 | Download CSV Template | Happy Path | Medium | 10-15s | ⏳ Pending |
| TC-012 | Display Detailed Validation Results | Validation | Medium | 20-25s | ⏳ Pending |
| TC-013 | Handle Large Files Within Limit | Data Handling | Medium | 45-60s | ⏳ Pending |
| TC-014 | Verify Derived Field Calculations | Business Rules | High | 20-25s | ⏳ Pending |
| TC-015 | Handle Special Characters in Data | Data Handling | Medium | 20-25s | ⏳ Pending |

---

## TC-001: Successfully Import Three Valid Contracts

### Test Information
| Field | Value |
|---|---|
| **Test ID** | TC-001 |
| **Category** | Happy Path |
| **Priority** | High |
| **Duration** | 30-45 seconds |
| **Automation** | Yes |
| **Test Data** | cypress/fixtures/valid-contracts.csv |

### Test Steps
| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Contract Import page | Import page loads successfully |
| 2 | Upload valid-contracts.csv (3 contracts) | File uploads without error |
| 3 | Wait for validation to complete | Loading spinner appears then disappears |
| 4 | Verify confirmation dialog | Dialog shows "3 valid rows ready to import" |
| 5 | Click "Confirm Import" button | Import process starts |
| 6 | Wait for import to complete | Loading spinner appears then disappears |
| 7 | Verify results summary | Shows "3 imported, 0 failed" |
| 8 | Query database | 3 contracts exist with correct data |

### Expected Results
| Verification Point | Expected Value |
|---|---|
| UI Status | Success message displayed |
| Import Count | 3 contracts imported |
| Failed Count | 0 contracts failed |
| Database Records | 3 new contracts created |
| Contract E2E-001 totalAmount | 2,500,000 (1000 × 2500) |
| Contract E2E-001 quantityMin | 950 (1000 - 5%) |
| Contract E2E-001 quantityMax | 1050 (1000 + 5%) |

---

## TC-002: Reject CSV File with Validation Errors

### Test Information
| Field | Value |
|---|---|
| **Test ID** | TC-002 |
| **Category** | Validation |
| **Priority** | High |
| **Duration** | 20-30 seconds |
| **Automation** | Yes |
| **Test Data** | cypress/fixtures/invalid-contracts.csv |

### Test Steps
| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Contract Import page | Import page loads successfully |
| 2 | Upload invalid-contracts.csv (3 invalid rows) | File uploads without error |
| 3 | Wait for validation to complete | Loading spinner appears then disappears |
| 4 | Verify results summary | Shows "0 valid, 3 invalid" |
| 5 | Verify no confirmation dialog | Dialog does not appear |
| 6 | Check error messages | All 3 rows show specific errors |
| 7 | Query database | No contracts created |

### Expected Errors
| Row | Field | Error Code | Error Message |
|---|---|---|---|
| 2 | contractNumber | CN-001 | Contract number is required |
| 3 | contractDate | DF-001 | Invalid date format. Expected YYYY-MM-DD |
| 3 | quantity | BL-003 | Quantity must be a positive number |
| 4 | Business Rule | BL-001 | Buyer and seller cannot be the same |

### Expected Results
| Verification Point | Expected Value |
|---|---|
| Valid Count | 0 |
| Invalid Count | 3 |
| Confirmation Dialog | Not displayed |
| Database Records | 0 new contracts |
| Error Display | All errors shown with row numbers |

---

## TC-003: Reject Invalid File Formats

### Test Information
| Field | Value |
|---|---|
| **Test ID** | TC-003 |
| **Category** | Validation |
| **Priority** | High |
| **Duration** | 15-20 seconds |
| **Automation** | Yes |
| **Test Data** | Multiple invalid files |

### Test Steps
| Step | File | Expected Error Code | Expected Error Message |
|---|---|---|---|
| 1 | invalid.txt | F-001 | Invalid file format. Please upload a CSV file. |
| 2 | large-file.csv (21 rows) | F-002 | File exceeds maximum 20 rows. Please reduce the number of contracts. |
| 3 | missing-headers.csv | F-004 | Missing required headers: contractNumber, quantity |
| 4 | empty-file.csv | F-005 | File is empty or contains no data rows. |

### Expected Results
| Verification Point | Expected Value |
|---|---|
| Error Display | Immediate error message |
| API Call | No API call for F-001 (frontend validation) |
| Database Records | 0 new contracts |
| User Action | Can upload different file |

---

## TC-004: Handle Mixed Valid and Invalid Rows

### Test Information
| Field | Value |
|---|---|
| **Test ID** | TC-004 |
| **Category** | Validation |
| **Priority** | High |
| **Duration** | 40-50 seconds |
| **Automation** | Yes |
| **Test Data