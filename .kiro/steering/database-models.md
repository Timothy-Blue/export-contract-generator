---
inclusion: fileMatch
fileMatchPattern: "**/models/*.js"
---

# Database Models and Schema Reference

## MongoDB Collections Overview

This project uses 5 main collections:
1. **contracts** - Main contract documents
2. **parties** - Buyers and sellers
3. **commodities** - Product catalog
4. **paymentterms** - Payment term templates
5. **bankdetails** - Bank account information

## Model Relationships

```
Contract (Many) → Party (One) [buyer]
Contract (Many) → Party (One) [seller]
Contract (Many) → Commodity (One)
Contract (Many) → PaymentTerm (One)
Contract (Many) → BankDetails (One)
```

## Contract Model

### Schema Structure
```javascript
{
  // Header
  contractNumber: String (unique, auto-generated: CON-YYYYMM-XXXXXX)
  contractDate: Date (default: now)
  
  // Parties (References)
  buyer: ObjectId → Party
  seller: ObjectId → Party
  
  // Article 1: Commodity
  commodity: ObjectId → Commodity
  commodityDescription: String
  quantity: Number (required)
  unit: String (enum: MT, KG, TONS, LBS, PIECES, BAGS)
  tolerance: Number (0-100, default: 0)
  origin: String
  packing: String
  qualitySpec: String
  
  // Article 2: Price
  unitPrice: Number (required)
  currency: String (enum: USD, EUR, GBP, JPY, CNY, INR, AED, SGD, THB, VND)
  totalAmount: Number (calculated)
  totalAmountText: String (auto-generated)
  incoterm: String (enum: FOB, CIF, CFR, EXW, FCA, CPT, CIP, DAP, DPU, DDP, FAS)
  portLocation: String
  
  // Calculated fields
  minQuantity: Number
  maxQuantity: Number
  minTotalAmount: Number
  maxTotalAmount: Number
  
  // Article 3: Payment
  paymentTerm: ObjectId → PaymentTerm
  paymentTermText: String
  
  // Bank Details
  bankDetails: ObjectId → BankDetails
  
  // Additional
  shipmentPeriod: String
  additionalTerms: String
  status: String (enum: DRAFT, FINALIZED, SENT, SIGNED, CANCELLED)
  
  // Metadata
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Key Fields Explained
- **contractNumber**: Auto-generated in format CON-YYYYMM-XXXXXX (e.g., CON-202512-123456)
- **tolerance**: Percentage (±X%) for quantity flexibility
- **totalAmount**: Calculated as quantity × unitPrice
- **totalAmountText**: Number-to-words conversion (e.g., "US Dollars One Hundred...")
- **minQuantity/maxQuantity**: Calculated based on tolerance
- **status**: Workflow state of the contract

### Validation Rules
- quantity, unitPrice are required
- tolerance must be between 0-100
- contractNumber must be unique
- buyer and seller must be valid Party references

## Party Model

### Schema Structure
```javascript
{
  type: String (enum: BUYER, SELLER, required)
  companyName: String (required)
  address: String
  contactPerson: String
  email: String
  phone: String
  country: String
  taxId: String
  
  // Metadata
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Usage
- **BUYER**: Customer companies that purchase goods
- **SELLER**: Your company (usually one default seller)

### Validation Rules
- type must be BUYER or SELLER
- companyName is required
- email should be valid format (if provided)

## Commodity Model

### Schema Structure
```javascript
{
  name: String (required, unique)
  description: String
  hsCode: String (Harmonized System Code)
  defaultUnit: String (enum: MT, KG, TONS, LBS, PIECES, BAGS)
  defaultOrigin: String
  defaultPacking: String
  defaultQualitySpec: String
  category: String
  
  // Metadata
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Purpose
Pre-defined product catalog for quick selection in contracts.

### Example Commodities
- Basmati Rice (HS Code: 1006.30)
- Wheat Flour (HS Code: 1101.00)
- Raw Cashew Nuts (HS Code: 0801.31)

## PaymentTerm Model

### Schema Structure
```javascript
{
  name: String (required, unique)
  description: String (required)
  terms: String (detailed terms text)
  depositPercent: Number (0-100)
  
  // Metadata
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Purpose
Template library for common payment terms.

### Example Payment Terms
- "100% TT Advance"
- "30% Deposit, 70% Against Documents"
- "Letter of Credit at Sight"
- "Open Account - Net 30 Days"

## BankDetails Model

### Schema Structure
```javascript
{
  bankName: String (required)
  accountName: String (required)
  accountNumber: String (required)
  swiftCode: String (required)
  bankAddress: String
  iban: String
  currency: String (default: USD)
  isDefault: Boolean (default: false)
  
  // Metadata
  isActive: Boolean (default: true)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Purpose
Store seller's bank account information for contract inclusion.

### Default Bank
Only one bank account should have `isDefault: true` at a time.

## Common Mongoose Patterns

### Creating a Document
```javascript
const newContract = new Contract({
  buyer: buyerId,
  quantity: 100,
  unitPrice: 1161,
  // ... other fields
});
await newContract.save();
```

### Finding Documents
```javascript
// Find all active
const contracts = await Contract.find({ isActive: true });

// Find by ID with population
const contract = await Contract.findById(id)
  .populate('buyer')
  .populate('seller');

// Find with conditions
const buyers = await Party.find({ type: 'BUYER', isActive: true });
```

### Updating Documents
```javascript
// Find and update
const updated = await Contract.findByIdAndUpdate(
  id,
  { status: 'FINALIZED' },
  { new: true, runValidators: true }
);

// Update many
await Contract.updateMany(
  { status: 'DRAFT' },
  { status: 'CANCELLED' }
);
```

### Soft Delete
```javascript
// Mark as inactive instead of deleting
await Contract.findByIdAndUpdate(id, { isActive: false });

// Query only active documents
const active = await Contract.find({ isActive: true });
```

## Indexes

### Recommended Indexes
```javascript
// Contract
contractNumber: unique index
buyer: index
status: index
contractDate: index

// Party
companyName: text index (for search)
type: index

// Commodity
name: unique index
category: index
```

### Creating Indexes
```javascript
// In model file
schema.index({ contractNumber: 1 }, { unique: true });
schema.index({ buyer: 1, status: 1 }); // Compound index
schema.index({ companyName: 'text' }); // Text search
```

## Virtuals

### Example Virtual Field
```javascript
// In Contract schema
schema.virtual('quantityRange').get(function() {
  return {
    min: this.minQuantity,
    max: this.maxQuantity
  };
});

// Enable virtuals in JSON
schema.set('toJSON', { virtuals: true });
```

## Pre/Post Hooks

### Example Pre-Save Hook
```javascript
// Auto-generate contract number before saving
schema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const prefix = `CON-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const timestamp = Date.now().toString().slice(-6);
    this.contractNumber = `${prefix}-${timestamp}`;
  }
  next();
});
```

### Example Post-Save Hook
```javascript
// Log after saving
schema.post('save', function(doc) {
  console.log(`Contract ${doc.contractNumber} saved successfully`);
});
```

## Validation Examples

### Custom Validators
```javascript
quantity: {
  type: Number,
  required: true,
  min: [0, 'Quantity must be positive'],
  validate: {
    validator: function(v) {
      return v > 0;
    },
    message: 'Quantity must be greater than zero'
  }
}
```

### Enum Validation
```javascript
status: {
  type: String,
  enum: {
    values: ['DRAFT', 'FINALIZED', 'SENT', 'SIGNED', 'CANCELLED'],
    message: '{VALUE} is not a valid status'
  },
  default: 'DRAFT'
}
```

## Query Performance Tips

1. **Use lean()** for read-only queries (faster)
2. **Use select()** to limit returned fields
3. **Add indexes** for frequently queried fields
4. **Use populate()** wisely - only when needed
5. **Implement pagination** for large datasets
6. **Use countDocuments()** instead of count()

## Migration Considerations

When modifying schemas:
1. Add new fields with default values
2. Make fields optional initially
3. Run migration script to update existing documents
4. Make fields required after migration
5. Test thoroughly before deploying
