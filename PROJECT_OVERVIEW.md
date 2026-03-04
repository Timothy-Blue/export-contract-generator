# Export Contract Generator - Project Overview

## Quick Reference for Developers

### 🎯 What This Application Does
A full-stack web application that automates the creation, calculation, and management of commercial export contracts. It replaces manual document handling with a structured digital workflow.

---

## 📚 Technology Stack

### Backend
- **Runtime**: Node.js v14+
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Key Libraries**: PDFKit, number-to-words, date-fns, CORS, dotenv

### Frontend
- **Library**: React 18.x
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: React Select
- **Styling**: Plain CSS (co-located with components)

### Development Tools
- **Dev Server**: Nodemon (backend), React Scripts (frontend)
- **Concurrent Running**: Concurrently package
- **Environment**: dotenv for configuration

---

## 🏗️ Architecture Pattern

### Backend: MVC-Style
```
Request → Routes → Controllers → Models → Database
                      ↓
                   Utilities (calculations, PDF generation)
```

### Frontend: Component-Based
```
User → Components → Services (API) → Backend
         ↓
      Contexts (global state)
```

---

## 📁 Project Structure

### Root Level
```
/
├── server/              # Backend application
├── client/              # React frontend
├── docs/                # Documentation
├── scripts/             # Utility scripts
├── .env                 # Environment variables (not in git)
├── package.json         # Backend dependencies
└── README.md            # Main documentation
```

### Backend (`/server`)
```
server/
├── config/
│   └── db.js                    # MongoDB connection
├── models/                      # Mongoose schemas
│   ├── Contract.js             # Main contract model
│   ├── Party.js                # Buyers/Sellers
│   ├── Commodity.js            # Product catalog
│   ├── PaymentTerm.js          # Payment templates
│   └── BankDetails.js          # Bank accounts
├── routes/                      # API endpoints
│   ├── contracts.js
│   ├── parties.js
│   ├── commodities.js
│   ├── paymentTerms.js
│   ├── bankDetails.js
│   └── export.js               # PDF/DOCX export
├── controllers/                 # Business logic
│   ├── contractController.js
│   ├── partyController.js
│   ├── commodityController.js
│   ├── paymentTermController.js
│   └── bankDetailsController.js
├── middleware/
│   ├── auth.js                 # Authentication & rate limiting
│   └── errorHandler.js         # Global error handling
├── utils/
│   ├── calculations.js         # Math & conversions
│   ├── pdfGenerator.js         # PDF creation
│   ├── releaseNotePdfGenerator.js
│   └── defaultTerms.js         # Default contract terms
└── server.js                    # Express app entry point
```

### Frontend (`/client/src`)
```
client/src/
├── components/
│   ├── ContractForm.js         # Create/edit contracts
│   ├── ContractForm.css
│   ├── ContractList.js         # List & search contracts
│   ├── ContractList.css
│   ├── BuyerModal.js           # Buyer management
│   ├── SellerModal.js          # Seller management
│   ├── CommodityModal.js       # Commodity management
│   ├── BankDetailsModal.js     # Bank details management
│   ├── ReleaseModal.js         # Release note management
│   ├── LanguageSwitcher.js     # Language toggle
│   └── ErrorBoundary.js        # Error handling
├── services/
│   └── api.js                  # Axios API client
├── contexts/
│   └── LanguageContext.js      # i18n state management
├── i18n/
│   └── translations.js         # Multi-language support
├── constants/
│   └── index.js                # App constants (enums, options)
├── App.js                       # Main component
├── App.css                      # Global styles
└── index.js                     # React entry point
```

---

## 🔌 API Endpoints

### Contracts
- `GET /api/contracts` - Get all contracts (paginated)
- `GET /api/contracts/:id` - Get single contract
- `GET /api/contracts/search?query=` - Search contracts
- `POST /api/contracts` - Create contract
- `POST /api/contracts/calculate` - Calculate totals
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Delete contract

### Parties (Buyers/Sellers)
- `GET /api/parties?type=BUYER` - Get buyers
- `GET /api/parties?type=SELLER` - Get sellers
- `POST /api/parties` - Create party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Soft delete party

### Commodities
- `GET /api/commodities` - Get all commodities
- `POST /api/commodities` - Create commodity
- `PUT /api/commodities/:id` - Update commodity
- `DELETE /api/commodities/:id` - Soft delete commodity

### Payment Terms
- `GET /api/payment-terms` - Get all payment terms
- `POST /api/payment-terms` - Create payment term
- `PUT /api/payment-terms/:id` - Update payment term
- `DELETE /api/payment-terms/:id` - Soft delete payment term

### Bank Details
- `GET /api/bank-details` - Get all bank details
- `GET /api/bank-details/default` - Get default bank
- `POST /api/bank-details` - Create bank detail
- `PUT /api/bank-details/:id` - Update bank detail
- `DELETE /api/bank-details/:id` - Soft delete bank detail

### Export
- `GET /api/export/pdf/:id` - Download contract as PDF
- `GET /api/export/docx/:id` - Download contract as DOCX
- `GET /api/export/release-note/:id` - Download release note PDF

---

## 🗄️ Data Model

### Core Entities

**Contract** (Main entity)
- Contract metadata (number, date, status)
- References: buyer, seller, commodity, paymentTerm, bankDetails
- Article 1: Commodity details (quantity, unit, tolerance, origin, packing)
- Article 2: Pricing (unitPrice, currency, incoterm, totalAmount)
- Article 3: Payment terms
- Calculated fields (min/max quantity and amounts)
- Release information (SWB/Telex Release)
- Invoice/Debit note details

**Party** (Buyers & Sellers)
- Company information
- Contact details
- Type: BUYER or SELLER

**Commodity** (Product Catalog)
- Name and description
- HS Code
- Default specifications

**PaymentTerm** (Payment Templates)
- Name and description
- Payment terms text
- Deposit percentage

**BankDetails** (Bank Accounts)
- Bank information
- Account details
- SWIFT code

---

## 🔄 Development Workflow

### Setup
```bash
# Install all dependencies
npm run install-all

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start MongoDB
# Windows: net start MongoDB
# Linux/Mac: sudo systemctl start mongod
```

### Running the Application
```bash
# Development (both frontend and backend)
npm run dev

# Backend only
npm run server

# Frontend only
npm run client

# Production
npm start
```

### Building for Production
```bash
# Build frontend
npm run build

# The build output goes to client/build/
```

---

## 🎨 Key Features & Patterns

### 1. Automatic Calculations
- **Total Amount**: `quantity × unitPrice`
- **Tolerance Ranges**: `baseValue ± (baseValue × tolerance%)`
- **Number to Text**: "116,100 USD" → "US Dollars One Hundred Sixteen Thousand and One Hundred only"

### 2. Contract Number Generation
- Format: `CON-YYYYMM-TIMESTAMP`
- Example: `CON-202603-456789`

### 3. Multi-Language Support
- English and Turkish translations
- Context-based language switching
- Stored in `client/src/i18n/translations.js`

### 4. PDF Generation
- Professional contract formatting
- Includes all contract details
- Generated on-demand using PDFKit

### 5. Soft Delete Pattern
- Records marked as inactive instead of deleted
- Maintains data integrity
- Allows recovery if needed

---

## 🔧 Common Development Tasks

### Adding a New API Endpoint
1. Create/update controller in `server/controllers/`
2. Add route in `server/routes/`
3. Register route in `server/server.js`
4. Add API method in `client/src/services/api.js`
5. Use in React components

### Adding a New React Component
1. Create component file in `client/src/components/`
2. Create co-located CSS file
3. Import and use in parent component
4. Add to routing if needed

### Adding a New Database Field
1. Update Mongoose schema in `server/models/`
2. Update controller validation
3. Update frontend form/display components
4. Test CRUD operations

### Adding a New Calculation
1. Add function to `server/utils/calculations.js`
2. Use in controller
3. Update frontend to display result

---

## 🛡️ Security Features

- **Input Sanitization**: Middleware cleans all inputs
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: Prevents API abuse
- **Environment Variables**: Sensitive data not in code
- **Validation**: Both frontend and backend validation
- **Soft Delete**: Prevents accidental data loss

---

## 📊 Database Indexes

For optimal performance, these fields are indexed:
- Contract: `contractNumber`, `contractDate`, `buyer`, `status`
- Party: `companyName` (text index), `type`, `isActive`
- Commodity: `name`, `isActive`
- PaymentTerm: `name`, `isActive`
- BankDetails: `isDefault`, `isActive`

---

## 🚀 Where to Add New Features

### New Master Data Type
1. Create model in `server/models/`
2. Create controller in `server/controllers/`
3. Create routes in `server/routes/`
4. Add API methods in `client/src/services/api.js`
5. Create management modal in `client/src/components/`

### New Contract Field
1. Update `Contract` model schema
2. Update `ContractForm.js` component
3. Update `ContractList.js` display
4. Update PDF generator if needed
5. Update calculations if applicable

### New Calculation
1. Add to `server/utils/calculations.js`
2. Use in contract controller
3. Display in `ContractForm.js`
4. Include in PDF if needed

### New Export Format
1. Create generator in `server/utils/`
2. Add route in `server/routes/export.js`
3. Add API method in `client/src/services/api.js`
4. Add download button in `ContractList.js`

---

## 📝 Naming Conventions

### Files
- **Backend**: camelCase (userController.js)
- **Frontend Components**: PascalCase (ContractForm.js)
- **CSS**: Match component (ContractForm.css)
- **Utilities**: camelCase (calculations.js)

### Variables
- **Descriptive names**: `contractNumber` not `cn`
- **Booleans**: `isActive`, `hasPermission`
- **Functions**: `calculateTotal`, `fetchData`, `handleSubmit`

### API Endpoints
- **RESTful**: `/api/resources`, `/api/resources/:id`
- **Custom actions**: `/api/resources/search`, `/api/resources/calculate`

---

## 🧪 Testing

### Manual Testing
```bash
# Test backend endpoints
npm run test:controllers

# Test frontend
npm run client
# Navigate through UI and test features
```

### Health Check
```bash
# Check if server is running
curl http://localhost:5000/api/health
```

---

## 📚 Documentation Files

- `README.md` - Main project documentation
- `docs/ARCHITECTURE.md` - System architecture details
- `docs/API.md` - API documentation
- `docs/SECURITY.md` - Security guidelines
- `DEPLOYMENT.md` - Deployment instructions
- `amazon-q-developer-rule.md` - Development best practices

---

## 🔑 Environment Variables

Required in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/export-contracts
NODE_ENV=development

# Optional
SELLER_NAME=Your Company Name
SELLER_ADDRESS=Company Address
SELLER_CONTACT=+1234567890
SELLER_EMAIL=sales@company.com
```

Required in `client/.env.production`:
```env
REACT_APP_API_URL=https://your-api-url.com/api
```

---

## 🐛 Common Issues & Solutions

### MongoDB Connection Failed
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- Verify network connectivity

### CORS Errors
- Check CORS configuration in server.js
- Verify frontend API_URL matches backend
- Check allowed origins

### Build Errors
- Clear node_modules and reinstall
- Check Node.js version (v14+)
- Increase memory: `NODE_OPTIONS=--max_old_space_size=4096`

### PDF Generation Issues
- Verify PDFKit installation
- Check file permissions
- Ensure all contract data is populated

---

## 📞 Getting Help

1. Check existing documentation in `/docs`
2. Review similar implementations in codebase
3. Check console logs for errors
4. Verify environment configuration
5. Test API endpoints independently

---

## 🎯 Development Priorities

When working on this project, prioritize:

1. **Data Integrity**: Validate all inputs, use transactions where needed
2. **User Experience**: Clear error messages, loading states, intuitive UI
3. **Performance**: Optimize queries, use indexes, implement pagination
4. **Security**: Sanitize inputs, validate on both ends, use environment variables
5. **Maintainability**: Follow patterns, document code, write clean functions

---

This overview provides a quick reference for understanding and extending the Export Contract Generator application. For detailed implementation patterns, refer to `amazon-q-developer-rule.md`.
