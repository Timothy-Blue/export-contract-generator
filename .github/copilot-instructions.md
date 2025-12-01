# Export Contract Generator - AI Coding Agent Instructions

## Project Overview

Full-stack MERN application for automating commercial export contract creation, replacing manual document handling. Core workflow: create contract → calculate pricing/tolerances → generate professional PDF.

**Stack**: Node.js/Express backend + React frontend + MongoDB + PDFKit for document generation

## Architecture Essentials

### Component Boundaries

```
Client (port 3000) ←HTTP/JSON→ Express API (port 5000) ←Mongoose→ MongoDB
```

- **Backend**: RESTful API at `server/` - handles CRUD, calculations, PDF generation
- **Frontend**: React SPA at `client/` - form-heavy UI with real-time calculations
- **Database**: Single MongoDB instance with 5 collections (contracts, parties, commodities, paymentterms, bankdetails)

### Key Data Relationships

Contracts are the central entity with **populated references** to:
- `buyer` & `seller` → Party collection (type: 'BUYER' | 'SELLER')
- `commodity` → Commodity collection (product catalog)
- `paymentTerm` → PaymentTerm collection (templates)
- `bankDetails` → BankDetails collection (accounts)

**Critical**: Always use `.populate()` when fetching contracts for display/export - see `server/routes/export.js` for pattern.

## Core Business Logic

### Automatic Calculations (`server/utils/calculations.js`)

All contract financial calculations happen **server-side** in real-time:

```javascript
// Total amount
totalAmount = quantity × unitPrice

// Tolerance ranges (±X%)
minQuantity = quantity - (quantity × tolerance / 100)
maxQuantity = quantity + (quantity × tolerance / 100)
// Same formula for amount ranges

// Number to text conversion
numberToText(116100, 'USD') → "US Dollars One Hundred Sixteen Thousand and One Hundred only"
```

**Pattern**: Client sends calculation request to `/api/contracts/calculate` endpoint, server responds with computed values. Never calculate on frontend.

### Contract Number Generation

Auto-generated format: `CON-YYYYMM-XXXXXX` where XXXXXX is last 6 digits of timestamp. See `generateContractNumber()` in calculations.js.

### PDF Generation Flow

1. Fetch contract with all populated references
2. Pass to `server/utils/pdfGenerator.js`
3. PDFKit streams document directly to response
4. Browser downloads as `Contract_${contractNumber}.pdf`

**Important**: PDF generation is synchronous - ensure all data is populated before calling generator.

## Development Workflows

### Running the Application

```powershell
# Development (concurrent frontend + backend)
npm run dev

# Backend only (with nodemon auto-reload)
npm run server

# Frontend only
npm run client

# First-time setup
npm run install-all  # Installs both root and client dependencies
```

**Environment**: Requires `.env` file at root (copy from `.env.example`) - MongoDB URI is mandatory.

### Database Seeding

Run `node server/seed.js` to populate initial data (commodities, payment terms, bank details). **Must have MongoDB running first**.

### Testing API Endpoints

Health check: `GET http://localhost:5000/api/health`

Contract endpoints follow RESTful conventions:
- `GET /api/contracts?page=1&limit=10` - paginated list
- `GET /api/contracts/search?query=buyer` - search by contract# or buyer name
- `POST /api/contracts/calculate` - get computed values without saving

## Project-Specific Patterns

### Soft Deletes (Not Hard Deletes)

All entities use `isActive` boolean field. Delete operations set `isActive: false` rather than removing documents. Filter queries with `{ isActive: true }`.

### Form State Management

React components use local state (no Redux/Context for forms). ContractForm.js maintains all contract fields in a single state object, passed to API as-is.

### API Service Layer

All HTTP calls centralized in `client/src/services/api.js` using Axios. Uses `proxy: "http://localhost:5000"` in client package.json for dev server.

### Language Support (i18n)

Application supports English/Arabic via `client/src/contexts/LanguageContext.js`. UI text uses `t('key')` function, not hardcoded strings. When adding features, check if translation keys exist in context.

### Incoterms Validation

Contract model enforces enum validation for incoterms field: `['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']`. Don't accept arbitrary incoterm values.

### Error Handling Convention

Backend routes use try-catch with consistent response format:
```javascript
res.status(500).json({ message: 'Error description', error: err.message })
```

Frontend displays errors using browser alerts (no toast library currently).

## Critical Files Reference

- **Contract schema**: `server/models/Contract.js` - defines all fields, validations, relationships
- **Calculation utilities**: `server/utils/calculations.js` - all business logic for pricing
- **Main form component**: `client/src/components/ContractForm.js` - 500+ lines, handles all contract input
- **API routes index**: `server/server.js` - shows all mounted route paths

## Common Gotchas

1. **MongoDB connection**: App won't start without MongoDB running - check with health endpoint first
2. **Memory settings**: Client scripts use `--max_old_space_size=4096` due to react-scripts memory issues on Windows
3. **Date handling**: Contract dates stored as Date objects, formatted with `date-fns` for display
4. **Populated queries**: Forgetting `.populate()` returns ObjectIds instead of full documents
5. **Currency symbols**: Only currency codes stored (USD, EUR, etc.), not symbols - `getCurrencyName()` maps codes to full names

## Adding New Features

**New contract fields**: Update Contract model → add to ContractForm inputs → update calculations if numeric → test PDF output

**New master data types**: Create model → route → add to seed.js → create form component

**New calculations**: Add function to calculations.js → call from contracts route `/calculate` endpoint → update frontend to use endpoint