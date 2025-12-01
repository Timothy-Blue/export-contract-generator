# Complete Deployment Guide - Export Contract Generator

## ✅ Build Status: SUCCESSFUL

Your app builds successfully! Minor linting warnings don't prevent deployment.

---

## 🚀 Recommended Deployment Strategy

### **Frontend → Vercel**
### **Backend → Railway or Render**
### **Database → MongoDB Atlas**

This approach is best for your MERN stack because:
- ✅ No serverless timeout issues
- ✅ Better for long-running processes (PDF generation)
- ✅ Easier debugging and monitoring
- ✅ Free tiers available on all platforms

---

## 📋 Step-by-Step Deployment

### **1. Deploy Database (MongoDB Atlas)**

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster:** Choose FREE tier (M0)
3. **Create Database User:**
   - Security → Database Access → Add New User
   - Username: `admin` (or your choice)
   - Password: Generate secure password
4. **Whitelist IPs:**
   - Security → Network Access → Add IP Address
   - Allow access from anywhere: `0.0.0.0/0`
5. **Get Connection String:**
   - Click "Connect" → "Connect your application"
   - Copy connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/export-contracts
   ```
   - Replace `<username>` and `<password>` with your credentials

---

### **2. Deploy Backend**

#### **Option A: Railway.app (Recommended)**

1. **Install Railway CLI:**
   ```powershell
   npm install -g @railway/cli
   ```

2. **Login:**
   ```powershell
   railway login
   ```

3. **Initialize:**
   ```powershell
   railway init
   ```

4. **Set Environment Variables:**
   ```powershell
   railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```powershell
   railway up
   ```

6. **Get Backend URL:**
   ```powershell
   railway open
   ```
   Copy the URL (e.g., `https://your-app.up.railway.app`)

#### **Option B: Render.com**

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name:** export-contract-api
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server/server.js`
5. Add Environment Variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = production
6. Click "Create Web Service"
7. Copy the deployed URL

---

### **3. Deploy Frontend (Vercel)**

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Login:**
   ```powershell
   vercel login
   ```

3. **Set Backend URL Environment Variable:**
   Create `.env.production` in client folder:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app/api
   ```
   
   Or set in Vercel Dashboard later.

4. **Deploy from client folder:**
   ```powershell
   cd client
   vercel --prod
   ```

5. **Or deploy via Vercel Dashboard:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Set Root Directory: `client`
   - Add Environment Variable:
     - `REACT_APP_API_URL` = `https://your-backend-url/api`
   - Deploy

---

## 🔧 Environment Variables Summary

### **Backend (Railway/Render):**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `NODE_ENV` - `production`
- `PORT` - `5000` (optional, Railway/Render auto-assign)

### **Frontend (Vercel):**
- `REACT_APP_API_URL` - Your backend URL + `/api`
  - Example: `https://export-contract-api.up.railway.app/api`

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user and password created
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables set
- [ ] Backend URL tested (visit `/api/health`)
- [ ] Frontend environment variable configured
- [ ] Frontend deployed to Vercel
- [ ] Frontend can connect to backend

---

## 🧪 Testing Deployment

### **Test Backend:**
```powershell
# Health check
curl https://your-backend-url/api/health

# Should return: {"status":"OK","message":"Server is running"}
```

### **Test Frontend:**
Visit your Vercel URL and:
1. Try creating a contract
2. Check if data loads
3. Generate a PDF

---

## 🐛 Troubleshooting

### **Frontend can't connect to backend:**
- ✅ Check `REACT_APP_API_URL` is set correctly
- ✅ Verify CORS settings in `server/server.js`
- ✅ Test backend URL directly in browser

### **Backend can't connect to MongoDB:**
- ✅ Verify MongoDB connection string
- ✅ Check username/password are correct
- ✅ Ensure IP whitelist includes 0.0.0.0/0
- ✅ Database name in connection string matches

### **Build fails:**
- ✅ Run `npm run build` locally first
- ✅ Check all dependencies are in `package.json`
- ✅ Clear cache: `npm cache clean --force`

---

## 💰 Cost Estimate

All free tiers:
- **MongoDB Atlas:** M0 Free (512 MB storage)
- **Railway:** $5 credit/month (free tier)
- **Vercel:** Free for hobby projects
- **Total:** $0/month for starter usage

---

## 📚 Useful Links

- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

---

## 🔄 Redeployment

**Backend updates:**
```powershell
git push origin main
# Railway/Render auto-deploys
```

**Frontend updates:**
```powershell
git push origin main
# Vercel auto-deploys
```

Both platforms support automatic deployment from GitHub!
