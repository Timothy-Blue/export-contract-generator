# Quick Start Guide - Export Contract Generator

## ✅ Fixed: JavaScript Heap Out of Memory Error

The memory error has been resolved by:
1. Increasing Node.js heap size to 4GB
2. Disabling source maps for faster compilation
3. Optimizing React build process

---

## 🚀 Application Status

✅ **MongoDB**: Running on port 27017
✅ **Backend Server**: Running on port 5000
✅ **Frontend**: Running on port 3000
✅ **Database**: Seeded with realistic contract data

---

## 📊 Pre-loaded Sample Data

The database has been seeded with:

### Buyers (3)
- **FORMOSA SHYEN HORNG METAL SDN.BHD** (Malaysia) - from your contract example
- MALAYSIA STEEL WORKS SDN.BHD
- SINGAPORE METALS TRADING PTE LTD

### Sellers (2)
- **HOMI METAL CO., LTD** (Taiwan) - from your contract example  
- TAIWAN STEEL CORPORATION

### Commodities (5)
- **Extrusion 1% attachment** - from your contract example
- Aluminum Scrap 6063
- Copper Scrap
- Stainless Steel Scrap
- Zinc Scrap

### Payment Terms (6)
- **10% Deposit + Balance TT** - from your contract example
- 100% TT on Delivery
- 30% Deposit + 70% L/C
- Cash Against Documents (CAD)
- Net 30 Days
- Letter of Credit 90 Days

### Banks (2)
- **TAIPEI FUBON COMMERCIAL BANK** (Default) - from your contract example
- CATHAY UNITED BANK

---

## 🌐 Access the Application

Open your browser and go to: **http://localhost:3000**

---

## 📝 Testing the Features

### 1. Create New Contract
- Click "New Contract" button
- All dropdowns are now populated with data
- Default values: 100 MT @ USD 1,161 = USD 116,100

### 2. Add New Buyer (Modal Feature)
- Click "Add New Buyer" button
- Fill in company details in the popup modal
- Buyer is saved and auto-selected

### 3. Auto-Calculation
- Change Quantity or Unit Price
- Total Amount updates automatically
- Tolerance range calculates in real-time

### 4. Data Validation
- Try to submit without selecting required fields
- System prevents saving invalid contracts
- Clear error messages guide you

---

## 🛠️ Common Commands

### Start Application
```powershell
cd C:\export-contract-generator
npm run dev
```

### Re-seed Database (if needed)
```powershell
$env:MONGODB_URI='mongodb://localhost:27017/export-contracts'
node server/seed.js
```

### Check System Health
```powershell
.\check-health.ps1
```

---

## ⚠️ If Memory Error Returns

If you see the heap memory error again:

1. Close the application (Ctrl+C)
2. Clear npm cache:
   ```powershell
   npm cache clean --force
   cd client
   npm cache clean --force
   cd ..
   ```
3. Restart:
   ```powershell
   npm run dev
   ```

---

## 📦 Memory Optimizations Applied

### Root package.json
- Increased client memory to 4GB: `set NODE_OPTIONS=--max_old_space_size=4096`

### client/package.json
- React scripts run with 4GB heap: `react-scripts --max_old_space_size=4096`

### client/.env
- Disabled source maps: `GENERATE_SOURCEMAP=false`
- Set Node options: `NODE_OPTIONS=--max_old_space_size=4096`

---

## ✨ All 4 Issues Resolved

✅ **Issue 1**: "Fail to load contracts" → MongoDB is running, contracts load successfully
✅ **Issue 2**: "Fail to load master data" → Database seeded, all dropdowns populated  
✅ **Issue 3**: "No real way to add buyer" → BuyerModal working, saves and auto-selects
✅ **Issue 4**: "Data validation" → Form validates all required fields before submission

---

## 🎯 Next Steps

1. Open http://localhost:3000
2. Click "New Contract"
3. Test the buyer modal by clicking "Add New Buyer"
4. Create your first export contract!

---

**Note**: The application is currently running in a separate PowerShell window. Check that window for server logs and compilation status.
