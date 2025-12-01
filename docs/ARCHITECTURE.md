# System Architecture & Data Flow

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                     (React Application)                      │
│                     http://localhost:3000                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Requests (Axios)
                       │ JSON Data
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                      REST API SERVER                         │
│                   (Express.js + Node.js)                     │
│                     http://localhost:5000                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API ROUTES                             │    │
│  │  • /api/contracts      • /api/commodities          │    │
│  │  • /api/parties        • /api/payment-terms        │    │
│  │  • /api/bank-details   • /api/export               │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │         BUSINESS LOGIC & UTILITIES                  │    │
│  │  • Calculations (Total, Tolerance, Number-to-Text) │    │
│  │  • PDF Generation (PDFKit)                         │    │
│  │  • Validation                                      │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                              │
│  ┌────────────▼───────────────────────────────────────┐    │
│  │           DATA ACCESS LAYER                         │    │
│  │              (Mongoose ODM)                         │    │
│  └────────────┬───────────────────────────────────────┘    │
└───────────────┼──────────────────────────────────────────────┘
                │
                │ MongoDB Driver
                │
┌───────────────▼──────────────────────────────────────────┐
│                    DATABASE                              │
│                  MongoDB Server                          │
│              mongodb://localhost:27017                   │
│                                                          │
│  Collections:                                            │
│  • contracts      • parties       • commodities          │
│  • paymentterms   • bankdetails                          │
└──────────────────────────────────────────────────────────┘
```

---

## Data Flow: Create Contract

```
┌─────────┐
│  USER   │
└────┬────┘
     │ 1. Fills contract form
     ▼
┌──────────────────┐
│ ContractForm.js  │
│ (React Component)│
└────┬─────────────┘
     │ 2. Submits form data
     ▼
┌──────────────────┐
│   api.js         │  3. POST /api/contracts
│ (Axios Service)  ├──────────────────────┐
└──────────────────┘                      │
                                          ▼
                              ┌────────────────────┐
                              │  contracts.js      │
                              │  (Route Handler)   │
                              └────┬───────────────┘
                                   │ 4. Validate data
                                   │ 5. Calculate totals
                                   │ 6. Convert to text
                                   ▼
                              ┌────────────────────┐
                              │  calculations.js   │
                              │  (Utils)           │
                              └────┬───────────────┘
                                   │ Total = Qty × Price
                                   │ Tolerance ranges
                                   │ Number to text
                                   ▼
                              ┌────────────────────┐
                              │  Contract.js       │
                              │  (Mongoose Model)  │
                              └────┬───────────────┘
                                   │ 7. Save to DB
                                   ▼
                              ┌────────────────────┐
                              │    MongoDB         │
                              │  (contracts coll.) │
                              └────┬───────────────┘
                                   │ 8. Return saved doc
                                   ▼
┌──────────────────┐         ┌────────────────────┐
│ ContractForm.js  │ ◄───────┤  Response JSON     │
│ (Success Alert)  │  9.     └────────────────────┘
└──────────────────┘
```

---

## Data Flow: Export PDF

```
┌─────────┐
│  USER   │ Clicks PDF button (📄)
└────┬────┘
     │
     ▼
┌──────────────────┐
│ ContractList.js  │
└────┬─────────────┘
     │ GET /api/export/pdf/:id
     ▼
┌──────────────────┐
│   export.js      │
│  (Route Handler) │
└────┬─────────────┘
     │ 1. Fetch contract with populated refs
     ▼
┌──────────────────┐
│    MongoDB       │
│  Find contract   │
│  + buyer info    │
│  + seller info   │
│  + commodity     │
│  + payment term  │
│  + bank details  │
└────┬─────────────┘
     │ 2. Return populated contract
     ▼
┌──────────────────┐
│ pdfGenerator.js  │
│  (PDFKit)        │
└────┬─────────────┘
     │ 3. Generate PDF
     │    - Headers
     │    - Parties info
     │    - Articles 1-3
     │    - Bank details
     │    - Signatures
     ▼
┌──────────────────┐
│   PDF Stream     │
│ Pipe to Response │
└────┬─────────────┘
     │ 4. Download file
     ▼
┌──────────────────┐
│  USER'S DEVICE   │
│ Contract_XXX.pdf │
└──────────────────┘
```

---

## Calculation Flow

```
USER INPUT                  CALCULATION                    RESULT
───────────                ─────────────                  ──────

Quantity: 100 MT           
                    ─────► Total = 100 × 1161      ────►  Total: 116,100
Unit Price: 1161 USD                                      
                                                          
Tolerance: 5%              
                    ─────► Min = 100 - (100×0.05)  ────►  Qty Range:
                           Max = 100 + (100×0.05)         95 - 105 MT
                           
                    ─────► MinAmt = 116100×0.95    ────►  Amount Range:
                           MaxAmt = 116100×1.05           $110,295 - $121,905
                           
Currency: USD              
Total: 116,100      ─────► numberToWords(116100)   ────►  "US Dollars One
                           + getCurrency('USD')           Hundred Sixteen
                                                          Thousand and One
                                                          Hundred only"
```

---

## Component Hierarchy

```
App.js
│
├── Header
│   ├── Title: "Export Contract Generator"
│   └── Navigation
│       ├── Contracts Button
│       └── New Contract Button
│
├── Main Content (Conditional Rendering)
│   │
│   ├── ContractList.js (when view = 'list')
│   │   ├── Search Box
│   │   ├── Status Filter
│   │   └── Contract Table
│   │       ├── Contract Row 1
│   │       ├── Contract Row 2
│   │       └── ...
│   │           ├── Edit Button → Opens ContractForm
│   │           ├── PDF Button → Downloads PDF
│   │           └── Delete Button → Deletes contract
│   │
│   └── ContractForm.js (when view = 'form')
│       ├── Parties Section
│       │   ├── Buyer Select (React-Select)
│       │   └── Seller Select (Auto-filled)
│       │
│       ├── Article 1: Commodity
│       │   ├── Commodity Select
│       │   ├── Quantity Input
│       │   ├── Unit Select
│       │   ├── Tolerance Input
│       │   ├── Origin Input
│       │   └── Packing Input
│       │
│       ├── Article 2: Price
│       │   ├── Unit Price Input
│       │   ├── Currency Select
│       │   ├── Calculation Display (Real-time)
│       │   │   ├── Total Amount
│       │   │   ├── Amount in Words
│       │   │   └── Tolerance Ranges
│       │   ├── Incoterm Select
│       │   └── Port/Location Input
│       │
│       ├── Article 3: Payment
│       │   ├── Payment Term Select
│       │   └── Payment Text Textarea
│       │
│       ├── Bank Details Section
│       │   └── Bank Select
│       │
│       ├── Additional Info
│       │   ├── Shipment Period
│       │   ├── Additional Terms
│       │   └── Status Select
│       │
│       └── Form Actions
│           ├── Submit Button
│           └── Cancel Button
│
└── Footer
    └── Copyright Info
```

---

## Database Relationships

```
┌─────────────┐
│   PARTY     │
│  (Buyers)   │
└──────┬──────┘
       │
       │ Many Contracts
       │ (as buyer)
       │
       ▼
┌─────────────────────────────┐
│        CONTRACT             │
│                             │
│  buyer ────┐                │
│  seller ───┼────┐           │
│  commodity ┼────┼───┐       │
│  payment ──┼────┼───┼──┐    │
│  bank ─────┼────┼───┼──┼─┐  │
└────────────┼────┼───┼──┼─┼──┘
             │    │   │  │ │
             ▼    │   │  │ │
        ┌─────────┐  │  │ │
        │  PARTY  │  │  │ │
        │(Sellers)│  │  │ │
        └─────────┘  │  │ │
                     ▼  │ │
             ┌──────────┐│ │
             │COMMODITY ││ │
             └──────────┘│ │
                         ▼ │
                  ┌─────────┐
                  │PAYMENT  │
                  │  TERM   │
                  └─────────┘
                            ▼
                     ┌─────────┐
                     │  BANK   │
                     │ DETAILS │
                     └─────────┘
```

---

## API Request/Response Flow

### Example: Create Contract

**Request:**
```http
POST /api/contracts HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "buyer": "674a1b...",
  "seller": "674a1c...",
  "commodity": "674a1d...",
  "quantity": 100,
  "unitPrice": 1161,
  "tolerance": 5,
  ...
}
```

**Processing:**
```javascript
1. Validate required fields ✓
2. Calculate: total = 100 × 1161 = 116,100
3. Calculate: minQty = 95, maxQty = 105
4. Calculate: minAmt = 110,295, maxAmt = 121,905
5. Convert: "US Dollars One Hundred Sixteen..."
6. Generate: contractNumber = "CON-202512-123456"
7. Save to MongoDB
```

**Response:**
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_id": "674a1e...",
  "contractNumber": "CON-202512-123456",
  "contractDate": "2025-12-01T...",
  "buyer": { ... },
  "seller": { ... },
  "totalAmount": 116100,
  "totalAmountText": "US Dollars One Hundred Sixteen...",
  "minQuantity": 95,
  "maxQuantity": 105,
  ...
}
```

---

## File Organization

### Backend Structure
```
server/
├── config/
│   └── db.js                 # MongoDB connection
├── models/                   # Data schemas
│   ├── Contract.js          # Main contract model
│   ├── Party.js             # Buyer/Seller model
│   ├── Commodity.js         # Product catalog
│   ├── PaymentTerm.js       # Payment templates
│   └── BankDetails.js       # Bank accounts
├── routes/                   # API endpoints
│   ├── contracts.js         # Contract CRUD + search
│   ├── parties.js           # Party management
│   ├── commodities.js       # Commodity catalog
│   ├── paymentTerms.js      # Payment templates
│   ├── bankDetails.js       # Bank accounts
│   └── export.js            # PDF/DOCX export
├── utils/                    # Helper functions
│   ├── calculations.js      # Math & conversions
│   └── pdfGenerator.js      # PDF creation
├── server.js                 # Express app setup
└── seed.js                   # Database seeder
```

### Frontend Structure
```
client/src/
├── components/
│   ├── ContractForm.js      # Create/edit contract
│   ├── ContractForm.css     # Form styling
│   ├── ContractList.js      # List & search
│   └── ContractList.css     # List styling
├── services/
│   └── api.js               # API integration
├── constants/
│   └── index.js             # App constants
├── App.js                    # Main component
├── App.css                   # Global styles
└── index.js                  # React entry point
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Clear data flow
- ✅ RESTful design
- ✅ Reusable components
