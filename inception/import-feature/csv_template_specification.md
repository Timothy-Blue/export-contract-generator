# CSV Template Specification for Contract Import

## Overview
This document defines the CSV template structure for importing contracts into the system.

## CSV Column Mapping

### Basic Contract Information
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| contractNumber | String | Yes | CNT-2026-001 | Must be unique |
| contractDate | Date | Yes | YYYY-MM-DD (2026-03-15) | ISO date format |
| status | String | No | DRAFT, FINALIZED, SENT, SIGNED | Defaults to DRAFT if not provided |

### Party Information (Reference Data - By Name)
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| buyerName | String | Yes | ABC Trading Ltd | Will create new buyer if not exists |
| sellerName | String | Yes | XYZ Exports Inc | Will create new seller if not exists |

### Commodity Information (Reference Data - By Name)
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| commodityName | String | Yes | White Rice | Will create new commodity if not exists |
| commodityDescription | String | Yes | Premium Quality White Rice Grade A | Detailed description |
| quantity | Number | Yes | 1000 | Must be positive number |
| unit | String | Yes | MT, KG, TONS, BAGS, PIECES, CARTONS, CBM | Defaults to MT |
| tolerance | Number | No | 5 | Percentage (0-100), defaults to 0 |
| origin | String | Yes | Vietnam | Country of origin |
| packing | String | Yes | 50kg PP Bags | Packing specification |
| qualitySpec | String | No | Moisture max 14% | Quality specifications |

### Price Information
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| unitPrice | Number | Yes | 450 | Must be positive number |
| currency | String | Yes | USD, EUR, GBP, etc. | Defaults to USD |
| incoterm | String | Yes | FOB, CIF, EXW, etc. | Must be valid Incoterm |
| portLocation | String | Yes | Ho Chi Minh Port | Port or delivery location |

### Payment Information (Reference Data - By Name)
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| paymentTermName | String | Yes | 30% TT Advance Balance Against BL | Will create new payment term if not exists |

### Bank Details (Reference Data - By Name)
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| bankName | String | Yes | Vietcombank | Will create new bank details if not exists |
| accountName | String | Yes | XYZ Exports Inc | Account holder name |
| accountNumber | String | Yes | 1234567890 | Bank account number |
| swiftCode | String | Yes | BFTVVNVX | 8 or 11 character SWIFT/BIC code |

### Additional Terms
| Column Name | Data Type | Required | Format/Example | Notes |
|-------------|-----------|----------|----------------|-------|
| shipmentPeriod | String | No | April 2026 | Shipment period description |
| additionalTerms | String | No | Inspection by SGS | Any additional contract terms |
| releaseType | String | No | SWB, TELEX_RELEASE, ORIGINAL_BL, NOT_SPECIFIED | Defaults to NOT_SPECIFIED |

## Valid Enum Values

### Incoterms
- EXW (Ex Works)
- FCA (Free Carrier)
- FAS (Free Alongside Ship)
- FOB (Free On Board)
- CFR (Cost and Freight)
- CIF (Cost, Insurance and Freight)
- CPT (Carriage Paid To)
- CIP (Carriage and Insurance Paid To)
- DAP (Delivered At Place)
- DPU (Delivered at Place Unloaded)
- DDP (Delivered Duty Paid)

### Status Values
- DRAFT
- FINALIZED
- SENT
- SIGNED
- CANCELLED

### Release Types
- SWB (Sea Waybill)
- TELEX_RELEASE
- ORIGINAL_BL (Original Bill of Lading)
- NOT_SPECIFIED

### Unit Types
- MT (Metric Tons)
- KG (Kilograms)
- TONS
- BAGS
- PIECES
- CARTONS
- CBM (Cubic Meters)

## Calculated Fields
The following fields are automatically calculated and should NOT be included in the CSV:
- totalAmount (calculated as: quantity × unitPrice)
- minQuantity (calculated based on tolerance)
- maxQuantity (calculated based on tolerance)
- minTotalAmount (calculated based on tolerance)
- maxTotalAmount (calculated based on tolerance)
- totalAmountText (generated from totalAmount)
- paymentTermText (generated from payment term reference)

## Reference Data Creation Rules

When reference data (Buyer, Seller, Commodity, PaymentTerm, BankDetails) is not found by name:

### Buyer/Seller (Party)
- Creates new Party with:
  - companyName: from buyerName/sellerName
  - type: BUYER or SELLER
  - isActive: true
  - Other fields: empty (can be updated later)

### Commodity
- Creates new Commodity with:
  - name: from commodityName
  - description: from commodityDescription
  - defaultUnit: from unit
  - defaultOrigin: from origin
  - defaultPacking: from packing
  - isActive: true

### Payment Term
- Creates new PaymentTerm with:
  - name: from paymentTermName
  - description: from paymentTermName
  - terms: from paymentTermName
  - isActive: true

### Bank Details
- Creates new BankDetails with:
  - bankName: from bankName
  - accountName: from accountName
  - accountNumber: from accountNumber
  - swiftCode: from swiftCode
  - currency: from currency (or USD default)
  - isActive: true

## CSV Format Requirements
- File encoding: UTF-8
- Delimiter: Comma (,)
- Text qualifier: Double quotes (") for fields containing commas
- First row must contain column headers (exact names as specified)
- Maximum 20 rows per file (excluding header)
- Date format: YYYY-MM-DD (ISO 8601)
- Number format: No thousand separators, decimal point with period (.)
