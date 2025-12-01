# Quick Setup & MongoDB Installation Guide

## MongoDB Installation (Required)

The application requires MongoDB to run. Follow these steps:

### Option 1: Install MongoDB Community Edition (Recommended)

1. **Download MongoDB**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download the latest version

2. **Install MongoDB**:
   - Run the MSI installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Keep default settings

3. **Verify Installation**:
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**:
   ```powershell
   net start MongoDB
   ```

### Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Create free account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `.env` file:
   ```
   MONGODB_URI=your_atlas_connection_string_here
   ```

## Application Setup

1. **Run Setup Script**:
   ```powershell
   .\setup.ps1
   ```

2. **Seed Database** (answer 'y' when prompted):
   This will populate:
   - 3 Buyers (including FORMOSA SHYEN HORNG METAL SDN.BHD)
   - 2 Sellers (including HOMI METAL CO., LTD)
   - 5 Commodities (including Extrusion 1% attachment)
   - 6 Payment Terms (including 10% Deposit + Balance TT)
   - 2 Bank Details (TAIPEI FUBON COMMERCIAL BANK)

3. **Start Application**:
   ```powershell
   npm run dev
   ```

4. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## New Features Implemented

### 1. Add Buyer On-The-Fly
- Click "Add New Buyer" button next to buyer dropdown
- Fill in buyer details in the modal
- Buyer is automatically saved and selected

### 2. Auto-Calculation
- Total amount updates in real-time as you type
- Changes quantity, unit price, or tolerance
- Displays amount in words automatically

### 3. Pre-Populated Data
Based on the contract example:
- **Default Buyer**: FORMOSA SHYEN HORNG METAL SDN.BHD
- **Default Seller**: HOMI METAL CO., LTD  
- **Sample Commodity**: Extrusion 1% attachment
- **Default Values**:
  - Quantity: 100 MT
  - Unit Price: USD 1,161/MT
  - Tolerance: 10%
  - Total: USD 116,100
  - Incoterm: CIF Port Klang, Malaysia

## Troubleshooting

### MongoDB Connection Error
If you see "Error: connect ECONNREFUSED":

1. **Check if MongoDB is running**:
   ```powershell
   Get-Service MongoDB
   ```

2. **Start MongoDB if stopped**:
   ```powershell
   net start MongoDB
   ```

3. **If service doesn't exist**, install MongoDB Community Edition first

### Port Already in Use
If ports 3000 or 5000 are in use:

1. **Find process using the port**:
   ```powershell
   netstat -ano | findstr :3000
   ```

2. **Kill the process** (use PID from above):
   ```powershell
   taskkill /PID <process_id> /F
   ```

## Manual Database Seeding

If automatic seeding failed:

```powershell
cd C:\export-contract-generator
node server/seed.js
```

## Test the Application

1. Open http://localhost:3000
2. Click "New Contract"
3. Try adding a new buyer using "Add New Buyer" button
4. Select commodity "Extrusion 1% attachment"
5. Enter quantity and unit price - watch total auto-update
6. Save the contract
7. View it in the contract list
8. Export to PDF

## Default Test Contract Values

Use these values to match the contract example:

- **Buyer**: FORMOSA SHYEN HORNG METAL SDN.BHD
- **Seller**: HOMI METAL CO., LTD
- **Commodity**: Extrusion 1% attachment  
- **Quantity**: 100 MT (with 10% tolerance = 90-110 MT)
- **Unit Price**: USD 1,161 per MT
- **Total**: USD 116,100 (One Hundred Sixteen Thousand and One Hundred only)
- **Incoterm**: CIF Port Klang, Malaysia
- **Payment**: 10% Deposit + Balance TT
- **Bank**: TAIPEI FUBON COMMERCIAL BANK, HSINYING BRANCH

Enjoy your Export Contract Generator! 🚀
