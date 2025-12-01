# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, the API does not require authentication. For production, implement JWT or OAuth.

---

## 📋 Contracts API

### Get All Contracts
```http
GET /api/contracts
```

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, FINALIZED, SENT, SIGNED, CANCELLED)
- `buyer` (optional): Filter by buyer ID
- `search` (optional): Search by contract number
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "contracts": [...],
  "totalPages": 5,
  "currentPage": 1,
  "total": 47
}
```

### Search Contracts
```http
GET /api/contracts/search?query={searchTerm}
```

**Response:** Array of matching contracts

### Get Single Contract
```http
GET /api/contracts/:id
```

**Response:** Single contract object with populated references

### Create Contract
```http
POST /api/contracts
Content-Type: application/json
```

**Request Body:**
```json
{
  "buyer": "ObjectId",
  "seller": "ObjectId",
  "commodity": "ObjectId",
  "commodityDescription": "string",
  "quantity": 100,
  "unit": "MT",
  "tolerance": 5,
  "origin": "India",
  "packing": "50kg PP bags",
  "unitPrice": 1200,
  "currency": "USD",
  "incoterm": "FOB",
  "portLocation": "Mumbai",
  "paymentTerm": "ObjectId",
  "paymentTermText": "30% advance...",
  "bankDetails": "ObjectId",
  "shipmentPeriod": "Within 30 days",
  "additionalTerms": "...",
  "status": "DRAFT"
}
```

**Response:** Created contract with auto-generated fields

### Update Contract
```http
PUT /api/contracts/:id
Content-Type: application/json
```

**Request Body:** Same as create (partial updates allowed)

### Delete Contract
```http
DELETE /api/contracts/:id
```

**Response:**
```json
{
  "message": "Contract deleted successfully"
}
```

### Calculate Contract Values
```http
POST /api/contracts/calculate
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 100,
  "unitPrice": 1161,
  "tolerance": 5,
  "currency": "USD"
}
```

**Response:**
```json
{
  "totalAmount": 116100,
  "totalAmountText": "US Dollars One Hundred Sixteen Thousand and One Hundred only",
  "quantityRange": {
    "min": 95,
    "max": 105
  },
  "amountRange": {
    "min": 110295,
    "max": 121905
  }
}
```

---

## 👥 Parties API

### Get All Parties
```http
GET /api/parties?type=BUYER&isActive=true
```

**Query Parameters:**
- `type`: BUYER or SELLER
- `isActive`: true/false (default: true)

### Get Single Party
```http
GET /api/parties/:id
```

### Create Party
```http
POST /api/parties
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "BUYER",
  "companyName": "ABC Trading Co.",
  "address": "123 Business St, City, Country",
  "contactPerson": "John Doe",
  "email": "contact@abc.com",
  "phone": "+1234567890",
  "country": "USA",
  "taxId": "TAX123456"
}
```

### Update Party
```http
PUT /api/parties/:id
```

### Delete Party (Soft Delete)
```http
DELETE /api/parties/:id
```

---

## 📦 Commodities API

### Get All Commodities
```http
GET /api/commodities?isActive=true
```

### Get Single Commodity
```http
GET /api/commodities/:id
```

### Create Commodity
```http
POST /api/commodities
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Basmati Rice",
  "description": "Premium quality aged basmati rice",
  "hsCode": "1006.30.10",
  "defaultUnit": "MT",
  "defaultOrigin": "India",
  "defaultPacking": "50kg PP bags"
}
```

### Update Commodity
```http
PUT /api/commodities/:id
```

### Delete Commodity (Soft Delete)
```http
DELETE /api/commodities/:id
```

---

## 💳 Payment Terms API

### Get All Payment Terms
```http
GET /api/payment-terms?isActive=true
```

### Create Payment Term
```http
POST /api/payment-terms
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "30/70 TT",
  "description": "30% advance, 70% against documents",
  "terms": "30% payment by TT in advance, balance 70% against copy of shipping documents",
  "depositPercentage": 30
}
```

---

## 🏦 Bank Details API

### Get All Bank Details
```http
GET /api/bank-details?isActive=true
```

### Get Default Bank Details
```http
GET /api/bank-details/default
```

### Create Bank Details
```http
POST /api/bank-details
Content-Type: application/json
```

**Request Body:**
```json
{
  "bankName": "International Bank",
  "accountName": "Your Company Ltd",
  "accountNumber": "1234567890",
  "swiftCode": "ABCDEFGH123",
  "bankAddress": "Bank Street, City",
  "iban": "GB00ABCD1234567890",
  "currency": "USD",
  "isDefault": true
}
```

---

## 📄 Export API

### Download PDF
```http
GET /api/export/pdf/:id
```

**Response:** PDF file download

### Download DOCX (Planned)
```http
GET /api/export/docx/:id
```

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation failed",
  "errors": ["Buyer is required", "Quantity must be greater than 0"]
}
```

### 404 Not Found
```json
{
  "message": "Contract not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!",
  "error": "Detailed error message (development only)"
}
```

---

## Data Models

### Contract Schema
```javascript
{
  _id: ObjectId,
  contractNumber: String (unique),
  contractDate: Date,
  buyer: ObjectId (ref: Party),
  seller: ObjectId (ref: Party),
  commodity: ObjectId (ref: Commodity),
  commodityDescription: String,
  quantity: Number,
  unit: String,
  tolerance: Number,
  origin: String,
  packing: String,
  qualitySpec: String,
  unitPrice: Number,
  currency: String,
  incoterm: String (enum),
  portLocation: String,
  totalAmount: Number (calculated),
  totalAmountText: String (calculated),
  minQuantity: Number (calculated),
  maxQuantity: Number (calculated),
  minTotalAmount: Number (calculated),
  maxTotalAmount: Number (calculated),
  paymentTerm: ObjectId (ref: PaymentTerm),
  paymentTermText: String,
  bankDetails: ObjectId (ref: BankDetails),
  shipmentPeriod: String,
  additionalTerms: String,
  status: String (enum),
  createdAt: Date,
  updatedAt: Date
}
```

### Party Schema
```javascript
{
  _id: ObjectId,
  type: String (BUYER | SELLER),
  companyName: String,
  address: String,
  contactPerson: String,
  email: String,
  phone: String,
  country: String,
  taxId: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Commodity Schema
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  hsCode: String,
  defaultUnit: String,
  defaultOrigin: String,
  defaultPacking: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### PaymentTerm Schema
```javascript
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  terms: String,
  depositPercentage: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### BankDetails Schema
```javascript
{
  _id: ObjectId,
  bankName: String,
  accountName: String,
  accountNumber: String,
  swiftCode: String,
  bankAddress: String,
  iban: String,
  currency: String,
  isDefault: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Constants

### Incoterms
- EXW - Ex Works
- FCA - Free Carrier
- FAS - Free Alongside Ship
- FOB - Free On Board
- CFR - Cost and Freight
- CIF - Cost, Insurance and Freight
- CPT - Carriage Paid To
- CIP - Carriage and Insurance Paid To
- DAP - Delivered At Place
- DPU - Delivered at Place Unloaded
- DDP - Delivered Duty Paid

### Contract Status
- DRAFT
- FINALIZED
- SENT
- SIGNED
- CANCELLED

### Units
- MT (Metric Tons)
- KG (Kilograms)
- TONS
- BAGS
- PIECES
- CARTONS
- CBM (Cubic Meters)

### Supported Currencies
- USD, EUR, GBP, JPY, CNY, INR, AED, SGD, AUD, CAD
