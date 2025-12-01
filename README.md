# Export Contract Generator

A comprehensive web-based application to automate the creation, calculation, standardization, and management of commercial contracts for export transactions, replacing manual document handling.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Data Model](#data-model)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [License](#license)

## ✨ Features

### Core Functionality

1. **Contract Generation**
   - Automatic contract number generation with date-based prefixes
   - Auto-populated contract date
   - Structured form interface with all mandatory sections

2. **Party Management**
   - Database of buyer profiles with quick selection
   - Auto-populated seller details (fixed company information)
   - Store and manage multiple parties

3. **Commodity Details (Article 1)**
   - Commodity catalog with pre-defined descriptions
   - Quantity input with flexible units (MT, KG, TONS, etc.)
   - Tolerance percentage (±X%) with automatic range calculation
   - Origin and packing specifications
   - Quality specifications

4. **Pricing (Article 2)**
   - Real-time total amount calculation: `Total = Quantity × Unit Price`
   - Automatic number-to-text conversion (e.g., "USD 116,100" → "US Dollars One Hundred Sixteen Thousand and One Hundred only")
   - Tolerance range display for amounts
   - Incoterms selection (FOB, CIF, CFR, etc.)
   - Port/location specification
   - Multi-currency support

5. **Payment Terms (Article 3)**
   - Payment term templates library
   - Customizable payment descriptions
   - Example: "10% TT deposit, 90% against copy of shipping documents"

6. **Bank Details**
   - Pre-saved seller's bank information
   - Automatic insertion of bank name, account number, SWIFT code
   - Support for multiple bank accounts

7. **Contract Management**
   - Save contracts as DRAFT, FINALIZED, SENT, SIGNED, or CANCELLED
   - Search by contract number or buyer name
   - Edit existing contracts
   - Delete contracts (soft delete)
   - Pagination for large datasets

8. **Document Export**
   - PDF generation for final non-editable contracts
   - DOCX template export capability (planned)
   - Professional formatting maintained

## 🛠 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM (Object Data Modeling)

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **React Select** - Enhanced select components
- **Axios** - HTTP client

### Utilities
- **PDFKit** - PDF generation
- **number-to-words** - Numeric to text conversion
- **date-fns** - Date manipulation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 🏗 System Architecture

```
export-contract-generator/
│
├── server/                      # Backend
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/                 # Mongoose schemas
│   │   ├── Contract.js
│   │   ├── Party.js
│   │   ├── Commodity.js
│   │   ├── PaymentTerm.js
│   │   └── BankDetails.js
│   ├── routes/                 # API routes
│   │   ├── contracts.js
│   │   ├── parties.js
│   │   ├── commodities.js
│   │   ├── paymentTerms.js
│   │   ├── bankDetails.js
│   │   └── export.js
│   ├── utils/                  # Utility functions
│   │   ├── calculations.js
│   │   └── pdfGenerator.js
│   └── server.js               # Express server
│
├── client/                      # Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ContractForm.js
│   │   │   ├── ContractForm.css
│   │   │   ├── ContractList.js
│   │   │   └── ContractList.css
│   │   ├── services/
│   │   │   └── api.js          # API calls
│   │   ├── constants/
│   │   │   └── index.js        # Constants & enums
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── .env.example                # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 📊 Data Model

### Entity-Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     PARTY       │         │   COMMODITY     │
├─────────────────┤         ├─────────────────┤
│ _id (PK)        │         │ _id (PK)        │
│ type            │         │ name            │
│ companyName     │         │ description     │
│ address         │         │ hsCode          │
│ contactPerson   │         │ defaultUnit     │
│ email           │         │ defaultOrigin   │
│ phone           │         │ defaultPacking  │
│ country         │         │ isActive        │
│ isActive        │         └─────────────────┘
└─────────────────┘                 │
        │                           │
        │ (buyer, seller)           │
        │                           │
        ▼                           ▼
┌───────────────────────────────────────────────┐
│              CONTRACT                          │
├───────────────────────────────────────────────┤
│ _id (PK)                                      │
│ contractNumber (unique)                       │
│ contractDate                                  │
│ buyer (FK → Party)                            │
│ seller (FK → Party)                           │
│ commodity (FK → Commodity)                    │
│ commodityDescription                          │
│ quantity, unit, tolerance                     │
│ origin, packing, qualitySpec                  │
│ unitPrice, currency                           │
│ incoterm, portLocation                        │
│ totalAmount, totalAmountText                  │
│ minQuantity, maxQuantity                      │
│ minTotalAmount, maxTotalAmount                │
│ paymentTerm (FK → PaymentTerm)                │
│ paymentTermText                               │
│ bankDetails (FK → BankDetails)                │
│ shipmentPeriod, additionalTerms               │
│ status (DRAFT/FINALIZED/SENT/SIGNED/CANCELLED)│
└───────────────────────────────────────────────┘
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│  PAYMENT_TERM   │         │  BANK_DETAILS   │
├─────────────────┤         ├─────────────────┤
│ _id (PK)        │         │ _id (PK)        │
│ name            │         │ bankName        │
│ description     │         │ accountName     │
│ terms           │         │ accountNumber   │
│ depositPercent  │         │ swiftCode       │
│ isActive        │         │ bankAddress     │
└─────────────────┘         │ iban            │
                            │ currency        │
                            │ isDefault       │
                            │ isActive        │
                            └─────────────────┘
```

### Key Relationships

- **Contract → Party (Buyer)**: Many-to-One
- **Contract → Party (Seller)**: Many-to-One
- **Contract → Commodity**: Many-to-One
- **Contract → PaymentTerm**: Many-to-One
- **Contract → BankDetails**: Many-to-One

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd export-contract-generator
```

### Step 2: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 3: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/export-contracts
NODE_ENV=development

# Seller Default Information
SELLER_NAME=Your Company Name
SELLER_ADDRESS=Company Address Line 1, Line 2, City, Country
SELLER_CONTACT=+1234567890
SELLER_EMAIL=sales@yourcompany.com

# Bank Details
BANK_NAME=International Bank Name
BANK_ACCOUNT_NO=1234567890
BANK_SWIFT_CODE=ABCDEFGH123
BANK_ADDRESS=Bank Branch Address
```

### Step 4: Start MongoDB

```bash
# Windows (if MongoDB is installed as a service)
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

### Step 5: Seed Database (Optional)

Create a seed script or manually add initial data through the application:

```bash
# Run seed script (if created)
node server/seed.js
```

### Step 6: Run the Application

```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
# Backend only
npm run server

# Frontend only (in another terminal)
npm run client
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## ⚙ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/export-contracts |
| `NODE_ENV` | Environment (development/production) | development |

### Application Settings

Customize constants in `client/src/constants/index.js`:
- Incoterms list
- Currency options
- Unit measurements
- Contract statuses

## 📖 Usage

### Creating a New Contract

1. Click "New Contract" button
2. **Select Parties**: Choose buyer from dropdown (seller auto-populated)
3. **Article 1 - Commodity**:
   - Select commodity from catalog
   - Adjust quantity and unit
   - Set tolerance percentage (optional)
   - Specify origin and packing
4. **Article 2 - Price**:
   - Enter unit price
   - Select currency
   - Choose Incoterm and port/location
   - View auto-calculated total amount and text conversion
5. **Article 3 - Payment**:
   - Select payment term template
   - Modify payment text if needed
6. **Bank Details**: Select bank account (default pre-selected)
7. **Additional Info**: Add shipment period and terms
8. Click "Create Contract"

### Searching Contracts

- Use search box to find by contract number or buyer name
- Filter by status (Draft, Finalized, Sent, Signed, Cancelled)
- Navigate through pages if multiple contracts exist

### Editing Contracts

1. Click edit (✏️) icon on contract in list
2. Modify fields as needed
3. Click "Update Contract"

### Exporting Contracts

- Click PDF icon (📄) to download contract as PDF
- Opens in new tab for viewing/downloading

### Managing Master Data

To add buyers, commodities, payment terms, or bank details, use the API endpoints directly or create admin interfaces:

```javascript
// Example: Add a new buyer via API
POST http://localhost:5000/api/parties
Content-Type: application/json

{
  "type": "BUYER",
  "companyName": "ABC Trading Co.",
  "address": "123 Business St, City, Country",
  "email": "contact@abctrading.com",
  "phone": "+1234567890"
}
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Contracts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contracts` | Get all contracts (with pagination) |
| GET | `/contracts/search?query={text}` | Search contracts |
| GET | `/contracts/:id` | Get single contract |
| POST | `/contracts` | Create new contract |
| PUT | `/contracts/:id` | Update contract |
| DELETE | `/contracts/:id` | Delete contract |
| POST | `/contracts/calculate` | Calculate values |

#### Parties (Buyers/Sellers)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/parties?type=BUYER` | Get all buyers |
| GET | `/parties?type=SELLER` | Get all sellers |
| GET | `/parties/:id` | Get single party |
| POST | `/parties` | Create new party |
| PUT | `/parties/:id` | Update party |
| DELETE | `/parties/:id` | Delete party (soft) |

#### Commodities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/commodities` | Get all commodities |
| GET | `/commodities/:id` | Get single commodity |
| POST | `/commodities` | Create commodity |
| PUT | `/commodities/:id` | Update commodity |
| DELETE | `/commodities/:id` | Delete commodity (soft) |

#### Payment Terms

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/payment-terms` | Get all payment terms |
| GET | `/payment-terms/:id` | Get single payment term |
| POST | `/payment-terms` | Create payment term |
| PUT | `/payment-terms/:id` | Update payment term |
| DELETE | `/payment-terms/:id` | Delete payment term (soft) |

#### Bank Details

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/bank-details` | Get all bank details |
| GET | `/bank-details/default` | Get default bank |
| GET | `/bank-details/:id` | Get single bank detail |
| POST | `/bank-details` | Create bank detail |
| PUT | `/bank-details/:id` | Update bank detail |
| DELETE | `/bank-details/:id` | Delete bank detail (soft) |

#### Export

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/export/pdf/:id` | Download contract as PDF |
| GET | `/export/docx/:id` | Download contract as DOCX |

### Example API Calls

#### Create Contract

```http
POST /api/contracts
Content-Type: application/json

{
  "buyer": "674a1b2c3d4e5f6a7b8c9d0e",
  "seller": "674a1b2c3d4e5f6a7b8c9d0f",
  "commodity": "674a1b2c3d4e5f6a7b8c9d10",
  "commodityDescription": "Premium Quality Basmati Rice",
  "quantity": 100,
  "unit": "MT",
  "tolerance": 5,
  "origin": "India",
  "packing": "50kg PP bags",
  "unitPrice": 1200,
  "currency": "USD",
  "incoterm": "FOB",
  "portLocation": "Mumbai Port",
  "paymentTerm": "674a1b2c3d4e5f6a7b8c9d11",
  "paymentTermText": "30% advance, 70% against shipping documents",
  "bankDetails": "674a1b2c3d4e5f6a7b8c9d12",
  "shipmentPeriod": "Within 45 days",
  "status": "DRAFT"
}
```

#### Calculate Values

```http
POST /api/contracts/calculate
Content-Type: application/json

{
  "quantity": 100,
  "unitPrice": 1161,
  "tolerance": 5,
  "currency": "USD"
}
```

Response:
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

## 🧮 Calculation Formulas

### Total Amount
```
Total Amount = Quantity × Unit Price
```

### Tolerance Range
```
Tolerance Amount = Base Value × (Tolerance % / 100)
Minimum Value = Base Value - Tolerance Amount
Maximum Value = Base Value + Tolerance Amount
```

Example:
- Quantity: 100 MT
- Tolerance: 5%
- Min Quantity: 100 - (100 × 0.05) = 95 MT
- Max Quantity: 100 + (100 × 0.05) = 105 MT

### Number to Text Conversion
Uses the `number-to-words` library with currency formatting:
```
116100 USD → "US Dollars One Hundred Sixteen Thousand and One Hundred only"
```

## 📸 Screenshots

### Contract Form
![Contract Form](docs/screenshots/contract-form.png)

### Contract List
![Contract List](docs/screenshots/contract-list.png)

### PDF Export
![PDF Export](docs/screenshots/pdf-export.png)

## 🔐 Security Considerations

For production deployment:

1. **Authentication & Authorization**: Implement user login and role-based access control
2. **Input Validation**: Add comprehensive server-side validation
3. **Rate Limiting**: Prevent API abuse
4. **HTTPS**: Use SSL/TLS certificates
5. **Environment Variables**: Never commit `.env` file
6. **Database Security**: Use authentication for MongoDB
7. **CORS**: Configure allowed origins properly

## 🚀 Deployment

### Backend Deployment (Example: Heroku)

```bash
# Login to Heroku
heroku login

# Create app
heroku create export-contract-api

# Set environment variables
heroku config:set MONGODB_URI=<your-mongodb-atlas-uri>

# Deploy
git push heroku main
```

### Frontend Deployment (Example: Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod
```

### Database (MongoDB Atlas)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create cluster
3. Whitelist IP addresses
4. Get connection string
5. Update `MONGODB_URI` in environment variables

## 🛣 Roadmap

- [ ] User authentication and authorization
- [ ] Multi-user support with permissions
- [ ] Email integration for sending contracts
- [ ] Digital signature integration
- [ ] Advanced contract templates
- [ ] DOCX export implementation
- [ ] Audit trail for contract changes
- [ ] Dashboard with analytics
- [ ] Multi-language support
- [ ] Mobile responsive improvements

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Email: support@example.com

---

**Built with ❤️ for streamlining export contract management**
