# Export Contract Generator - Vercel Deployment Guide

## Important Notes

⚠️ **MongoDB Considerations:**
Your app requires MongoDB. Vercel doesn't provide MongoDB hosting, so you'll need:
- **MongoDB Atlas** (recommended - free tier available)
- Or keep using your local MongoDB (only works for development)

## Deployment Steps

### 1. Set Up MongoDB Atlas (Required for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier M0)
4. Create a database user
5. Whitelist all IP addresses (0.0.0.0/0) for Vercel
6. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/export-contracts`)

### 2. Install Vercel CLI

```powershell
npm install -g vercel
```

### 3. Login to Vercel

```powershell
vercel login
```

### 4. Deploy to Vercel

```powershell
# First deployment (will prompt for configuration)
vercel

# Or deploy directly to production
vercel --prod
```

### 5. Set Environment Variables in Vercel

After first deployment, add these environment variables in Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Settings → Environment Variables
3. Add:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
   - `PORT` = `5000` (optional)

Or set via CLI:
```powershell
vercel env add MONGODB_URI
# Paste your MongoDB Atlas connection string when prompted
```

### 6. Redeploy with Environment Variables

```powershell
vercel --prod
```

## Alternative: Deploy Frontend Only to Vercel

If you prefer to keep the backend separate:

1. **Deploy Backend to:**
   - Railway.app (recommended for Node.js)
   - Render.com
   - Heroku
   - DigitalOcean App Platform

2. **Update Frontend API URL:**
   - In `client/src/services/api.js`, update the base URL
   - Add `REACT_APP_API_URL` environment variable in Vercel

3. **Deploy Only Frontend:**
   ```powershell
   cd client
   vercel --prod
   ```

## Current Configuration

The `vercel.json` file is configured to deploy both:
- Frontend (React) → served at root `/`
- Backend (Express API) → served at `/api/*`

## Common Issues

### 1. MongoDB Connection Fails
- Ensure MongoDB Atlas connection string is correct
- Whitelist IP 0.0.0.0/0 in MongoDB Atlas
- Check environment variables are set in Vercel

### 2. Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json` (not devDependencies)

### 3. API Routes Not Working
- Verify `vercel.json` routing configuration
- Check CORS settings in `server/server.js`

## Recommended Approach for Production

**Option 1: Split Deployment (Recommended)**
- Frontend → Vercel
- Backend → Railway/Render
- Database → MongoDB Atlas

**Option 2: Full Stack on Vercel**
- Both frontend & backend on Vercel
- Database → MongoDB Atlas
- Note: Vercel has serverless function limits (10s timeout on free tier)

## Next Steps

1. Set up MongoDB Atlas
2. Run `vercel` command
3. Configure environment variables
4. Test the deployed application

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
