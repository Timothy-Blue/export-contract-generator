# Test Data Summary

## Overview
This document provides a comprehensive summary of all test data files required for E2E testing of the Contract Import feature.

---

## Fixture Files Location
All test data files are located in: `cypress/fixtures/`

---

## Test Data Files

### 1. valid-contracts.csv
**Purpose**: Happy path testing - successful import  
**Status**: ✅ Created  
**Rows**: 3 data rows  
**Used By**: TC-001, TC-005, TC-006, TC-010

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-001,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-002,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
E2E-003,2026-03-17,Another Buyer,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,Special handling,ORIGINAL_BL,DRAFT
```

**Expected Results**: All 3 contracts imported successfully

---

### 2. invalid-contracts.csv
**Purpose**: Validation error testing  
**Status**: ✅ Created  
**Rows**: 3 data rows (all invalid)  
**Used By**: TC-002

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-005,invalid-date,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,-500,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-006,2026-03-15,Test Buyer Inc,Test Buyer Inc,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Errors**:
- Row 2: CN-001 (missing contract number)
- Row 3: DF-001 (invalid date), BL-003 (negative quantity)
- Row 4: BL-001 (buyer equals seller)

---

### 3. mixed-contracts.csv
**Purpose**: Partial validation testing (mix of valid and invalid)  
**Status**: ✅ Created  
**Rows**: 5 data rows (3 valid, 2 invalid)  
**Used By**: TC-004

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-010,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-011,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
,2026-03-17,Test Buyer Inc,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,None,ORIGINAL_BL,DRAFT
E2E-013,2026-03-18,Test Buyer Inc,Test Seller Ltd,Wheat,Durum,1500,MT,7,Canada,Bulk,Standard,900,USD,FOB,Vancouver Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,June 2026,None,ORIGINAL_BL,DRAFT
E2E-014,invalid-date,NonExistent Buyer,Test Seller Ltd,Corn,Yellow Corn,800,MT,5,USA,Bags,Premium,1100,USD,FOB,New Orleans,LC 30 Days,Test Bank,Test Account,1234567890,TESTUS33,July 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Results**: 3 valid, 2 invalid - no import due to errors

---

### 4. duplicate-contracts.csv
**Purpose**: Duplicate detection testing  
**Status**: ✅ Created  
**Rows**: 3 data rows  
**Used By**: TC-007

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-020,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-020,2026-03-16,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,USD,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2026,None,TELEX_RELEASE,ACTIVE
E2E-EXISTING,2026-03-17,Test Buyer Inc,Test Seller Ltd,Rice,Basmati,2000,MT,10,Pakistan,Bags,Premium,1200,USD,FOB,Karachi Port,LC 60 Days,Test Bank,Test Account,1234567890,TESTUS33,May 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Errors**:
- Row 3: CN-003 (duplicate of row 2)
- Row 4: CN-002 (exists in database)

**Prerequisite**: Database must contain contract "E2E-EXISTING"

---

### 5. business-rule-violations.csv
**Purpose**: Business rule and warning testing  
**Status**: ⏳ Pending  
**Rows**: 2 data rows  
**Used By**: TC-008

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-030,2026-03-15,Test Buyer Inc,Test Buyer Inc,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
E2E-031,2027-06-15,Test Buyer Inc,Test Seller Ltd,Tea Leaves,Green Tea,500,MT,3,India,Cartons,Standard,1800,EUR,CIF,Mumbai Port,TT 30 Days,Test Bank,Test Account,1234567890,TESTUS33,April 2027,None,TELEX_RELEASE,ACTIVE
```

**Expected Errors/Warnings**:
- Row 2: BL-001 error (buyer = seller)
- Row 3: BL-004 warning (future date), CF-001 warning (currency mismatch)

---

### 6. new-reference-data.csv
**Purpose**: Reference data auto-creation testing  
**Status**: ⏳ Pending  
**Rows**: 1 data row  
**Used By**: TC-009

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-040,2026-03-15,Brand New Buyer Corp,Brand New Seller LLC,Exotic Spice,Rare Spice Blend,100,KG,2,Madagascar,Sealed Containers,Premium,5000,USD,CIF,Antananarivo Port,Advance Payment 100%,New Bank International,New Account,9876543210,NEWBUS44,March 2026,Handle with care,ORIGINAL_BL,DRAFT
```

**Expected Results**: New entities created automatically

---

### 7. large-file.csv
**Purpose**: File size limit testing (exceeds maximum)  
**Status**: ⏳ Pending  
**Rows**: 21 data rows  
**Used By**: TC-003

**Expected Error**: F-002 (exceeds maximum 20 rows)

---

### 8. max-contracts.csv
**Purpose**: Maximum capacity testing (at limit)  
**Status**: ⏳ Pending  
**Rows**: 20 data rows (exactly at limit)  
**Used By**: TC-013

**Expected Results**: All 20 contracts imported successfully

---

### 9. missing-headers.csv
**Purpose**: Header validation testing  
**Status**: ⏳ Pending  
**Rows**: 1 data row  
**Headers**: Missing contractNumber, quantity, unitPrice

**Expected Error**: F-004 (missing required headers)

---

### 10. empty-file.csv
**Purpose**: Empty file testing  
**Status**: ⏳ Pending  
**Rows**: 0 data rows (header only or completely empty)  
**Used By**: TC-003

**Expected Error**: F-005 (file is empty)

---

### 11. derived-fields-test.csv
**Purpose**: Derived field calculation verification  
**Status**: ⏳ Pending  
**Rows**: 1 data row  
**Used By**: TC-014

**Contents**:
```csv
contractNumber,contractDate,buyerName,sellerName,commodityName,commodityDescription,quantity,unit,tolerance,origin,packing,qualitySpec,unitPrice,currency,incoterm,portLocation,paymentTermName,bankName,accountName,accountNumber,swiftCode,shipmentPeriod,additionalTerms,releaseType,status
E2E-050,2026-03-15,Test Buyer Inc,Test Seller Ltd,Coffee Beans,Arabica Grade A,1000,MT,5,Brazil,Jute Bags,Premium,2500,USD,FOB,Santos Port,LC at Sight,Test Bank,Test Account,1234567890,TESTUS33,March 2026,None,ORIGINAL_BL,DRAFT
```

**Expected Calculations**:
- totalAmount = 2,500,000 (1000 × 2500)
- quantityMin = 950 (1000 - 5%)
- quantityMax = 1050 (1000 + 5%)

---

### 12. special-characters.csv
**Purpose**: Special character handling  
**Status**: ⏳ Pending  
**Rows**: 2 data rows  
**Used By**: TC-015

**Contents**: Contracts with special characters (é, ñ, ü), commas in quoted fields, line breaks

---

### 13. invalid.txt
**Purpose**: Wrong file format testing  
**Status**: ⏳ Pending  
**Format**: Plain text file (not CSV)  
**Used By**: TC-003

**Expected Error**: F-001 (invalid file format)

---

## Reference Data Requirements

### Database Seed Data
Before running tests, seed the database with:

**Parties (Buyers)**:
- Test Buyer Inc
- Another Buyer
- ABC Trading Co
- Global Imports Ltd
- Eastern Trading

**Parties (Sellers)**:
- Test Seller Ltd
- XYZ Exports Ltd
- Western Exports
- Southern Trading
- Northern Suppliers

**Commodities**:
- Coffee Beans
- Tea Leaves
- Rice
- Wheat
- Corn
- Soybeans
- Sugar
- Cotton
- Rubber
- Palm Oil

**Payment Terms**:
- LC at Sight
- TT 30 Days
- LC 60 Days
- TT 60 Days
- Advance Payment 100%

**Bank Details**:
- Test Bank (USD)
- International Bank (EUR)
- Global Bank (GBP)

**Existing Contract** (for duplicate testing):
- Contract Number: E2E-EXISTING
- Status: ACTIVE

---

## Test Data Generation Scripts

### Generate Large File (21 rows)
```javascript
// scripts/generate-large-file.js
const fs = require('fs');
const header = 'contractNumber,contractDate,...'; // Full header
const rows = [];
for (let i = 1; i <= 21; i++) {
  rows.push(`E2E-LARGE-${i},2026-03-15,...`);
}
fs.writeFileSync('cypress/fixtures/large-file.csv', 
  [header, ...rows].join('\n'));
```

### Generate Max Contracts (20 rows)
```javascript
// scripts/generate-max-contracts.js
// Similar to above but with 20 rows
```

---

## File Validation Checklist

Before test execution, verify:
- [ ] All fixture files exist
- [ ] Files have correct encoding (UTF-8)
- [ ] CSV files have proper line endings
- [ ] No trailing commas or spaces
- [ ] Headers match exactly
- [ ] Test data is realistic
- [ ] Special characters are preserved

---

## Maintenance

### When to Update Test Data
- Schema changes (new required fields)
- Business rule changes
- New validation rules added
- Bug fixes that affect validation

### Version Control
- All fixture files are version controlled
- Changes require review
- Document changes in commit messages

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-05 | Initial test data documentation |
