# MongoDB Quick Install Guide for Windows

## The Problem
Your application needs MongoDB to store and retrieve data. Currently you're seeing:
- "Failed to load master data"
- "Failed to load contracts"  
- Error: connect ECONNREFUSED 127.0.0.1:27017

## Quick Solution (Choose ONE option)

### Option 1: Install MongoDB Locally (Recommended for Development)

**Step 1: Download MongoDB**
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 8.0.4 (or latest)
   - Platform: Windows
   - Package: MSI
3. Click Download

**Step 2: Install MongoDB**
1. Run the downloaded MSI file
2. Choose "Complete" installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. **IMPORTANT**: Check "Install MongoDB Compass" (optional but useful GUI)
5. Keep all default settings
6. Click Install

**Step 3: Verify Installation**
Open PowerShell and run:
```powershell
mongod --version
```

You should see version information.

**Step 4: Start MongoDB Service**
```powershell
net start MongoDB
```

**Step 5: Seed Your Database**
```powershell
cd C:\export-contract-generator
node server/seed.js
```

You should see:
```
Created 3 buyers
Created 2 sellers
Created 5 commodities
Created 6 payment terms
Created 2 bank details
```

**Step 6: Restart Your Application**
```powershell
npm run dev
```

Now open http://localhost:3000 and everything should work!

---

### Option 2: Use MongoDB Atlas (Cloud - Free)

**Step 1: Create Free Account**
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Create a free M0 cluster (512MB)

**Step 2: Get Connection String**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

**Step 3: Update Your Application**
Edit `C:\export-contract-generator\.env`:
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/export-contracts?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
```

**Step 4: Whitelist Your IP**
1. In Atlas, go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Confirm

**Step 5: Seed Database**
```powershell
cd C:\export-contract-generator
node server/seed.js
```

**Step 6: Start Application**
```powershell
npm run dev
```

---

## Verify Everything Works

After setup, test these:

1. **Check MongoDB Connection**:
   - Open http://localhost:5000
   - You should see: `{"message":"Export Contract Generator API","version":"1.0.0"}`

2. **Check Master Data Loaded**:
   - Open: http://localhost:5000/api/parties
   - You should see JSON with buyers and sellers

3. **Open Application**:
   - Open: http://localhost:3000
   - Click "New Contract"
   - All dropdowns should have options
   - "Add New Buyer" button should work

## Troubleshooting

### "MongoDB service not found"
You didn't check "Install as Service" during installation. Reinstall MongoDB or run:
```powershell
mongod --dbpath C:\data\db
```
(Keep this terminal open)

### "Access denied" when starting service
Run PowerShell as Administrator:
```powershell
Start-Process powershell -Verb RunAs
net start MongoDB
```

### Still can't connect
Check if MongoDB is listening:
```powershell
netstat -ano | findstr :27017
```

If nothing shows, MongoDB isn't running.

### Port 27017 already in use
Another program is using the port. Find and kill it:
```powershell
$processId = (Get-NetTCPConnection -LocalPort 27017).OwningProcess
Stop-Process -Id $processId -Force
net start MongoDB
```

## What Happens After Setup?

Once MongoDB is running and seeded, your application will have:

✅ **3 Buyers** ready to select:
- FORMOSA SHYEN HORNG METAL SDN.BHD (Malaysia)
- MALAYSIA STEEL WORKS SDN.BHD (Malaysia)
- SINGAPORE METALS TRADING PTE LTD (Singapore)

✅ **2 Sellers** ready to select:
- HOMI METAL CO., LTD (Taiwan) - auto-selected
- TAIWAN STEEL CORPORATION (Taiwan)

✅ **5 Commodities**:
- Extrusion 1% attachment
- Aluminum Scrap 6063
- Copper Scrap Millberry
- Stainless Steel Scrap 304
- Zinc Scrap

✅ **6 Payment Terms**:
- 10% Deposit + Balance TT (matches your contract)
- 100% TT in Advance
- 30% Deposit + 70% at sight
- CAD (Cash Against Documents)
- Net 30 days
- L/C 90 days

✅ **2 Bank Accounts**:
- TAIPEI FUBON COMMERCIAL BANK, HSINYING BRANCH (default, matches contract)
- CATHAY UNITED BANK

✅ **Working Features**:
- Add new buyers with modal
- Auto-calculation of totals
- Pre-filled default values
- Real-time amount updates
- PDF export

Need more help? Check the error logs or ask!
