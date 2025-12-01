# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v14+ installed (`node --version`)
- ✅ MongoDB v4.4+ installed and running
- ✅ npm or yarn package manager

### Installation Steps

#### 1. Install Dependencies

```powershell
# In the root directory
npm install

# Install client dependencies
cd client
npm install
cd ..
```

#### 2. Configure Environment

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env file with your settings
notepad .env
```

**Minimum required configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/export-contracts
```

#### 3. Start MongoDB

```powershell
# If MongoDB is installed as a service
net start MongoDB

# Or if you need to start it manually
mongod --dbpath C:\data\db
```

#### 4. Seed the Database (Optional but Recommended)

```powershell
# This creates sample data for testing
node server/seed.js
```

You should see output like:
```
✓ Seller created
✓ 3 Buyers created
✓ 5 Commodities created
✓ 6 Payment Terms created
✓ 2 Bank Details created
✅ Database seeded successfully!
```

#### 5. Start the Application

```powershell
# Development mode (runs both frontend and backend)
npm run dev
```

**OR run separately:**

Terminal 1 (Backend):
```powershell
npm run server
```

Terminal 2 (Frontend):
```powershell
cd client
npm start
```

#### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

---

## 📝 First Contract

### Step-by-Step: Create Your First Contract

1. **Open the application** at http://localhost:3000

2. **Click "New Contract"** button

3. **Fill in the form:**

   **Parties:**
   - Buyer: Select from dropdown (e.g., "Global Trading Inc.")
   - Seller: Auto-populated

   **Article 1 - Commodity:**
   - Commodity: "Basmati Rice"
   - Quantity: 100
   - Unit: MT
   - Tolerance: 5%
   - Origin: India (auto-filled)
   - Packing: 50kg PP bags (auto-filled)

   **Article 2 - Price:**
   - Unit Price: 1200
   - Currency: USD
   - Incoterm: FOB
   - Port/Location: Mumbai Port
   - ✨ Total automatically calculated: USD 120,000.00

   **Article 3 - Payment:**
   - Payment Terms: "30/70 TT"
   - Text is auto-filled

   **Bank Details:**
   - Default bank auto-selected

4. **Click "Create Contract"**

5. **View your contract** in the list

6. **Export as PDF** by clicking the 📄 icon

---

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solution:**
```powershell
# Check if MongoDB is running
Get-Service MongoDB

# If not running, start it
net start MongoDB

# Or verify connection string in .env
# MONGODB_URI=mongodb://localhost:27017/export-contracts
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change PORT in .env file
```

### React App Won't Start

**Error:** Module not found or dependency issues

**Solution:**
```powershell
cd client
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start
```

### Calculations Not Working

**Issue:** Total amount not updating

**Solution:**
- Ensure both quantity and unit price are entered
- Check browser console for errors (F12)
- Verify backend is running on port 5000

---

## 📚 Common Tasks

### Add a New Buyer

**Method 1: Via API**
```powershell
# Using curl (Windows)
curl -X POST http://localhost:5000/api/parties `
  -H "Content-Type: application/json" `
  -d '{\"type\":\"BUYER\",\"companyName\":\"New Company Ltd\",\"address\":\"123 Street, City\",\"email\":\"contact@newco.com\",\"phone\":\"+1234567890\"}'
```

**Method 2: Using Postman**
- POST to `http://localhost:5000/api/parties`
- Body (JSON):
```json
{
  "type": "BUYER",
  "companyName": "New Company Ltd",
  "address": "123 Street, City",
  "email": "contact@newco.com",
  "phone": "+1234567890"
}
```

### Add a New Commodity

```powershell
curl -X POST http://localhost:5000/api/commodities `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Green Tea\",\"description\":\"Premium organic green tea\",\"defaultUnit\":\"KG\",\"defaultOrigin\":\"China\",\"defaultPacking\":\"5kg boxes\"}'
```

### Add a Payment Term

```powershell
curl -X POST http://localhost:5000/api/payment-terms `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"20/80 TT\",\"description\":\"20% advance, 80% on shipment\",\"terms\":\"20% advance payment, balance 80% against BL copy\",\"depositPercentage\":20}'
```

### View All Contracts

```powershell
# Using curl
curl http://localhost:5000/api/contracts

# Or open in browser
start http://localhost:5000/api/contracts
```

### Search for a Contract

```powershell
curl "http://localhost:5000/api/contracts/search?query=CON"
```

---

## 🎯 Next Steps

1. **Customize Seller Information**
   - Edit `.env` file with your company details
   - Re-run seed script: `node server/seed.js`

2. **Add Your Commodities**
   - Use API or create admin interface
   - Add products you actually export

3. **Configure Bank Details**
   - Add your actual bank account information
   - Set one as default

4. **Test Contract Generation**
   - Create multiple contracts
   - Export to PDF
   - Review formatting

5. **Deploy to Production**
   - See README.md deployment section
   - Use MongoDB Atlas for database
   - Deploy backend to Heroku/Railway
   - Deploy frontend to Vercel/Netlify

---

## 📖 Additional Resources

- **Full Documentation**: See `README.md`
- **API Reference**: See `docs/API.md`
- **Data Models**: See README.md Data Model section

---

## 🆘 Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check `.env` configuration
5. Review the API logs in terminal

For persistent issues:
- Check existing GitHub issues
- Create a new issue with:
  - Error message
  - Steps to reproduce
  - Environment details (OS, Node version, etc.)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] MongoDB connection successful
- [ ] Seed data populated (3 buyers, 5 commodities, etc.)
- [ ] Can create a new contract
- [ ] Calculations work in real-time
- [ ] Can search for contracts
- [ ] Can export contract as PDF
- [ ] Can edit existing contract

If all checked, you're ready to go! 🎉

---

**Happy Contract Generating! 📄✨**
