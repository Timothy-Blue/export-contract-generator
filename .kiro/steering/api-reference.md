---
inclusion: fileMatch
fileMatchPattern: "**/routes/*.js"
---

# API Reference and Patterns

## Base Configuration
- Base URL: `http://localhost:5000/api`
- Content-Type: `application/json`
- Authentication: Optional API key in `x-api-key` header (currently disabled)

## Standard Response Formats

### Success Response
```javascript
{
  data: { /* resource data */ },
  message: "Operation successful"
}
```

### Error Response
```javascript
{
  message: "Error description",
  error: "Technical details" // Only in development
}
```

## Common Route Patterns

### GET All Resources (with pagination)
```javascript
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const items = await Model.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .populate('relatedField')
      .lean();

    const total = await Model.countDocuments({ isActive: true });

    res.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});
```

### GET Single Resource
```javascript
router.get('/:id', async (req, res) => {
  try {
    const item = await Model.findById(req.params.id)
      .populate('relatedField')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ data: item });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resource', error: error.message });
  }
});
```

### POST Create Resource
```javascript
router.post('/', async (req, res) => {
  try {
    // Validation
    const { field1, field2 } = req.body;
    if (!field1 || !field2) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create
    const newItem = new Model(req.body);
    await newItem.save();

    // Populate if needed
    await newItem.populate('relatedField');

    res.status(201).json({ 
      data: newItem, 
      message: 'Resource created successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating resource', error: error.message });
  }
});
```

### PUT Update Resource
```javascript
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('relatedField');

    if (!updatedItem) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ 
      data: updatedItem, 
      message: 'Resource updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating resource', error: error.message });
  }
});
```

### DELETE Resource (Soft Delete)
```javascript
router.delete('/:id', async (req, res) => {
  try {
    const item = await Model.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting resource', error: error.message });
  }
});
```

## Existing API Endpoints

### Contracts (`/api/contracts`)
- GET `/` - List all contracts (paginated)
- GET `/search?query=` - Search by contract number or buyer name
- GET `/:id` - Get single contract with populated references
- POST `/` - Create new contract (auto-generates contract number)
- POST `/calculate` - Calculate totals and ranges without saving
- PUT `/:id` - Update existing contract
- DELETE `/:id` - Soft delete contract

### Parties (`/api/parties`)
- GET `/?type=BUYER` - Get all buyers
- GET `/?type=SELLER` - Get all sellers
- GET `/:id` - Get single party
- POST `/` - Create new party
- PUT `/:id` - Update party
- DELETE `/:id` - Soft delete party

### Commodities (`/api/commodities`)
- GET `/` - Get all active commodities
- GET `/:id` - Get single commodity
- POST `/` - Create new commodity
- PUT `/:id` - Update commodity
- DELETE `/:id` - Soft delete commodity

### Payment Terms (`/api/payment-terms`)
- GET `/` - Get all active payment terms
- GET `/:id` - Get single payment term
- POST `/` - Create new payment term
- PUT `/:id` - Update payment term
- DELETE `/:id` - Soft delete payment term

### Bank Details (`/api/bank-details`)
- GET `/` - Get all active bank details
- GET `/default` - Get default bank account
- GET `/:id` - Get single bank detail
- POST `/` - Create new bank detail
- PUT `/:id` - Update bank detail
- DELETE `/:id` - Soft delete bank detail

### Export (`/api/export`)
- GET `/pdf/:id` - Generate and download contract PDF
- GET `/release-note/:id` - Generate and download release note PDF

## Special Endpoints

### Calculate Endpoint
```javascript
POST /api/contracts/calculate
Body: {
  quantity: 100,
  unitPrice: 1161,
  tolerance: 5,
  currency: "USD"
}

Response: {
  totalAmount: 116100,
  totalAmountText: "US Dollars One Hundred Sixteen Thousand...",
  quantityRange: { min: 95, max: 105 },
  amountRange: { min: 110295, max: 121905 }
}
```

### Search Endpoint
```javascript
GET /api/contracts/search?query=CON-202512

Response: {
  data: [/* matching contracts */],
  count: 5
}
```

## Middleware Usage

### Authentication Middleware (Optional)
```javascript
const { authenticateAPIKey } = require('../middleware/auth');

// Apply to specific routes
router.post('/', authenticateAPIKey, async (req, res) => {
  // Protected route
});
```

### Rate Limiting Middleware
```javascript
const { rateLimit } = require('../middleware/auth');

// Apply to all routes in a router
router.use(rateLimit);
```

### Input Sanitization
Applied globally in `server.js` - automatically sanitizes all request bodies.

## Error Handling Best Practices

### Validation Errors
```javascript
if (!requiredField) {
  return res.status(400).json({ 
    message: 'Validation failed',
    errors: { requiredField: 'This field is required' }
  });
}
```

### Database Errors
```javascript
try {
  await Model.save();
} catch (error) {
  if (error.code === 11000) {
    return res.status(400).json({ message: 'Duplicate entry' });
  }
  res.status(500).json({ message: 'Database error', error: error.message });
}
```

### Not Found Errors
```javascript
const item = await Model.findById(id);
if (!item) {
  return res.status(404).json({ message: 'Resource not found' });
}
```

## Population Patterns

### Single Reference
```javascript
await Contract.findById(id).populate('buyer');
```

### Multiple References
```javascript
await Contract.findById(id)
  .populate('buyer')
  .populate('seller')
  .populate('commodity')
  .populate('paymentTerm')
  .populate('bankDetails');
```

### Selective Population
```javascript
await Contract.findById(id)
  .populate('buyer', 'companyName email') // Only these fields
  .populate('seller');
```

## Query Optimization

### Use Lean for Read-Only
```javascript
const items = await Model.find().lean(); // Returns plain JS objects
```

### Use Select to Limit Fields
```javascript
const items = await Model.find().select('name status'); // Only these fields
```

### Use Indexes
```javascript
// In model definition
schema.index({ contractNumber: 1 });
schema.index({ 'buyer': 1, 'status': 1 }); // Compound index
```

## Testing API Endpoints

### Using curl
```bash
# GET request
curl http://localhost:5000/api/contracts

# POST request
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"buyer":"123","quantity":100}'

# With API key
curl -X POST http://localhost:5000/api/contracts \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-api-key" \
  -d '{"buyer":"123"}'
```

### Using Postman
1. Set method (GET, POST, PUT, DELETE)
2. Enter URL: `http://localhost:5000/api/endpoint`
3. Add headers: `Content-Type: application/json`
4. Add body (for POST/PUT): Raw JSON
5. Send request

### Using Frontend (Axios)
```javascript
import api from './services/api';

// GET
const data = await api.get('/contracts');

// POST
const result = await api.post('/contracts', formData);

// PUT
const updated = await api.put(`/contracts/${id}`, formData);

// DELETE
await api.delete(`/contracts/${id}`);
```
