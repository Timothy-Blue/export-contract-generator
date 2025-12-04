# 🔐 Security Quick Reference

## Current Security Status

### ✅ Implemented Security Features

1. **API Key Authentication**
   - ✅ Protects all write operations (POST, PUT, DELETE)
   - ✅ Production key: `xA7%G9Pe$#MjvYhJnZ2pclbwzQ1iNCmd3DV-XItRqgr+fy54`
   - ✅ Configured on AWS Elastic Beanstalk
   - ✅ Configured in frontend (.env.production)

2. **MongoDB Authentication**
   - ✅ Username: `nguyenminhthinh2405_db_user`
   - ✅ Password: `Z2f9p8Hytr5BauOb`
   - ✅ SSL/TLS encrypted connection
   - ✅ MongoDB Atlas cloud hosting

3. **Rate Limiting**
   - ✅ 100 requests per minute per IP
   - ✅ Prevents DDoS attacks

4. **Input Sanitization**
   - ✅ Removes script tags
   - ✅ Prevents XSS attacks
   - ✅ Applied to all requests

5. **CORS Protection**
   - ✅ Restricted to allowed domains only

## 🔑 Your API Keys

### Production (AWS)
```
API_KEY=xA7%G9Pe$#MjvYhJnZ2pclbwzQ1iNCmd3DV-XItRqgr+fy54
```

### Local Development
```
API_KEY=dev-api-key-change-for-production
```

## 📍 Where Keys Are Stored

### Backend (Server)
- **Local:** `C:\Projects\export-contract-generator\.env`
  ```env
  API_KEY=dev-api-key-change-for-production
  ```

- **AWS Elastic Beanstalk:**
  ```bash
  eb setenv API_KEY=xA7%G9Pe$#MjvYhJnZ2pclbwzQ1iNCmd3DV-XItRqgr+fy54
  ```

### Frontend (Client)
- **Production:** `C:\Projects\export-contract-generator\client\.env.production`
  ```env
  REACT_APP_API_KEY=xA7%G9Pe$#MjvYhJnZ2pclbwzQ1iNCmd3DV-XItRqgr+fy54
  ```

- **Local:** `C:\Projects\export-contract-generator\client\.env.local`
  ```env
  REACT_APP_API_KEY=dev-api-key-change-for-production
  ```

## 🔄 How It Works

### For Users Viewing Data (GET requests)
- ✅ **No authentication required**
- Can view contracts, commodities, buyers, etc.
- Read-only access is open

### For Users Creating/Editing Data (POST/PUT/DELETE)
- 🔒 **API key required**
- Frontend automatically includes the API key
- Without valid key → 401 Unauthorized error
- With invalid key → 403 Forbidden error

## 🛡️ MongoDB Security

### Current Setup
```
Connection String:
mongodb+srv://nguyenminhthinh2405_db_user:Z2f9p8Hytr5BauOb@cluster0.fgpky1p.mongodb.net/export-contracts?retryWrites=true&w=majority&appName=Cluster0

Username: nguyenminhthinh2405_db_user
Password: Z2f9p8Hytr5BauOb
Database: export-contracts
Cluster: cluster0.fgpky1p.mongodb.net
```

### What's Protected
- ✅ All database connections require username/password
- ✅ SSL/TLS encryption on all connections
- ✅ MongoDB Atlas network security
- ✅ Automatic backups and monitoring

### Recommended Next Steps for MongoDB
1. **Add IP Whitelist:**
   - Go to MongoDB Atlas → Network Access
   - Add your Elastic Beanstalk IP addresses
   - Remove "Allow from anywhere" if enabled

2. **Enable Audit Logging** (requires M10+ cluster)
   - Tracks all database access
   - Useful for compliance

## 🚀 Deploying with Security

### Deploy Backend with New API Key
```powershell
# Set new API key on AWS
eb setenv API_KEY=your-new-key-here

# Deploy
eb deploy
```

### Deploy Frontend with API Key
```powershell
cd client

# Update .env.production with new key
# REACT_APP_API_KEY=your-new-key-here

# Build
npm run build

# Deploy to S3
aws s3 sync build/ s3://export-contract-frontend-static --delete
```

## 🔧 Testing Security

### Test API Key Protection
```powershell
# Should FAIL (no API key)
curl -X POST http://export-contract-prod.eba-tn3yzxf3.us.east-1.elasticbeanstalk.com/api/parties `
  -H "Content-Type: application/json" `
  -d '{"companyName":"Test","type":"BUYER"}'

# Should SUCCEED (with API key)
curl -X POST http://export-contract-prod.eba-tn3yzxf3.us-east-1.elasticbeanstalk.com/api/parties `
  -H "Content-Type: application/json" `
  -H "x-api-key: xA7%G9Pe$#MjvYhJnZ2pclbwzQ1iNCmd3DV-XItRqgr+fy54" `
  -d '{"companyName":"Test","type":"BUYER"}'

# Read operations should work WITHOUT key
curl http://export-contract-prod.eba-tn3yzxf3.us-east-1.elasticbeanstalk.com/api/parties
```

## 🆘 Emergency: If API Key is Compromised

### Step 1: Generate New Key
```powershell
$newKey = -join ((65..90) + (97..122) + (48..57) + (33,35,36,37,38,42,43,45,61) | Get-Random -Count 48 | ForEach-Object {[char]$_})
Write-Host $newKey
```

### Step 2: Update on AWS
```powershell
eb setenv API_KEY=$newKey
```

### Step 3: Update Frontend
```powershell
# Update client/.env.production with new key
cd client
npm run build
aws s3 sync build/ s3://export-contract-frontend-static --delete
```

### Step 4: Update Local Development
```
Update .env and client/.env.local files with new key
```

## 📊 Monitoring

### Check for Failed Authentication Attempts
```powershell
# View recent logs
eb logs

# Look for:
# - 401 Unauthorized errors
# - 403 Forbidden errors
# - 429 Rate limit exceeded
```

### View Environment Variables
```powershell
eb printenv
```

## 📞 Quick Commands

### View Security Status
```powershell
# Check EB environment variables
eb printenv

# Check MongoDB connection
# (Look for successful connection in logs)
eb logs --all
```

### Rotate API Key (Every 90 days recommended)
```powershell
# Generate new key
$newKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object {[char]$_})

# Update everywhere
eb setenv API_KEY=$newKey
# Update client/.env.production
# Rebuild and redeploy frontend
```

### Update MongoDB Password
```powershell
# 1. Change in MongoDB Atlas dashboard
# 2. Update connection string
eb setenv MONGODB_URI="mongodb+srv://username:NEW_PASSWORD@cluster..."
# 3. Update local .env file
# 4. Redeploy
eb deploy
```

## ✅ Security Checklist

Weekly:
- [ ] Review CloudWatch/EB logs for suspicious activity
- [ ] Check for 401/403 errors (unauthorized access attempts)

Monthly:
- [ ] Run `npm audit` to check for vulnerabilities
- [ ] Review AWS security groups
- [ ] Check MongoDB Atlas metrics

Quarterly:
- [ ] Rotate API keys
- [ ] Review access controls
- [ ] Update dependencies

## 📚 Additional Resources

- Full Documentation: `docs/SECURITY.md`
- MongoDB Atlas: https://cloud.mongodb.com/
- AWS Elastic Beanstalk Console: https://console.aws.amazon.com/elasticbeanstalk/
- S3 Bucket: https://s3.console.aws.amazon.com/s3/buckets/export-contract-frontend-static

---

**Remember:** Keep your API keys secret! Never commit them to Git or share them publicly.
