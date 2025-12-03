# Install MongoDB Locally on Windows

## Quick Installation Steps

### 1. Download MongoDB
- Go to https://www.mongodb.com/try/download/community
- Select: Windows, MSI package
- Download the latest version

### 2. Install MongoDB
- Run the downloaded `.msi` file
- Choose "Complete" installation
- Check "Install MongoDB as a Service"
- Check "Install MongoDB Compass" (optional GUI tool)

### 3. Verify Installation
```powershell
mongod --version
```

### 4. Start MongoDB Service
```powershell
# Start service
net start MongoDB

# Check if running
Get-Service MongoDB
```

### 5. Update .env File
```dotenv
MONGODB_URI=mongodb://localhost:27017/export-contracts
```

### 6. Seed Database
```powershell
node server/seed.js
```

### 7. Start Application
```powershell
npm run dev
```

## Troubleshooting

**If MongoDB service doesn't start:**
```powershell
# Create data directory
mkdir C:\data\db

# Start manually
mongod --dbpath C:\data\db
```

**Check if MongoDB is running:**
```powershell
# Test connection
mongosh
```
