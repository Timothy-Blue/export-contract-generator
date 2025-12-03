# AWS Deployment Guide - Export Contract Generator

## 🎯 Quick Deployment Path (Recommended for Beginners)

### **AWS Amplify - Deploy in 15 Minutes**

This is the easiest way to deploy your full-stack MERN application to AWS.

---

## Step-by-Step: AWS Amplify Deployment

### **Step 1: Push Your Code to GitHub (If Not Already)**

```powershell
cd c:\Projects\export-contract-generator
git add .
git commit -m "Ready for AWS deployment"
git push origin main
```

### **Step 2: Sign in to AWS Console**

1. Go to https://console.aws.amazon.com/
2. Sign in with your new AWS account
3. Make sure you're in a region close to you (top-right dropdown)

### **Step 3: Create IAM User (Security Best Practice)**

1. Search for **IAM** in AWS Console
2. Click **Users** → **Add users**
3. Username: `amplify-deployer`
4. Access type: Check **Programmatic access**
5. Click **Next: Permissions**
6. Click **Attach existing policies directly**
7. Search and select: `AdministratorAccess-Amplify`
8. Click through to **Create user**
9. **IMPORTANT**: Save the Access Key ID and Secret Access Key

### **Step 4: Deploy Backend (API) Using Elastic Beanstalk**

#### A. Install AWS CLI and EB CLI
```powershell
# Install AWS CLI
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# After installation, configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Default region: us-east-1 (or your preferred region)
# Default output format: json

# Install EB CLI
pip install awsebcli
```

#### B. Prepare Backend for Deployment

Create `.ebextensions/nodecommand.config` in your project root:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
```

Create `.npmrc` in project root:
```
scripts-prepend-node-path=true
```

#### C. Initialize and Deploy Backend

```powershell
cd c:\Projects\export-contract-generator

# Initialize Elastic Beanstalk
eb init -p node.js-18 export-contract-api --region us-east-1

# Create environment
eb create export-contract-prod

# Set environment variables
eb setenv MONGODB_URI="mongodb+srv://nguyenminhthinh2405_db_user:Z2f9p8Hytr5BauOb@cluster0.fgpky1p.mongodb.net/export-contracts?retryWrites=true&w=majority&appName=Cluster0"

eb setenv NODE_ENV=production

eb setenv PORT=8080

# Deploy
eb deploy

# Get the URL
eb status
```

Copy the CNAME/URL (e.g., `export-contract-prod.us-east-1.elasticbeanstalk.com`)

### **Step 5: Deploy Frontend Using AWS Amplify**

#### A. Go to AWS Amplify Console

1. In AWS Console, search for **Amplify**
2. Click **New app** → **Host web app**
3. Choose **GitHub** → Click **Continue**
4. Authorize AWS Amplify to access GitHub
5. Select repository: `export-contract-generator`
6. Select branch: `main`
7. Click **Next**

#### B. Configure Build Settings

The build settings should auto-detect. Update to:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd client
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: client/build
    files:
      - '**/*'
  cache:
    paths:
      - client/node_modules/**/*
```

Click **Next**

#### C. Add Environment Variable

Click **Advanced settings** → **Add environment variable**

- Key: `REACT_APP_API_URL`
- Value: `https://your-backend-url-from-step-4/api`
  (e.g., `https://export-contract-prod.us-east-1.elasticbeanstalk.com/api`)

#### D. Deploy

1. Click **Save and deploy**
2. Wait 5-10 minutes for build to complete
3. You'll get a URL like: `https://main.xxxxxx.amplifyapp.com`

### **Step 6: Update CORS in Backend**

Update your `.env` or add to Elastic Beanstalk environment variables:

```powershell
eb setenv CORS_ORIGIN="https://main.xxxxxx.amplifyapp.com"
```

### **Step 7: Verify Deployment**

1. Visit your Amplify URL
2. Application should load
3. Try creating a contract
4. Check if it connects to backend successfully

---

## Alternative: Full Manual Deployment

### **Option A: Backend on EC2**

1. **Launch EC2 Instance**
   - Go to EC2 → Launch Instance
   - Choose: Amazon Linux 2
   - Instance type: t2.micro (free tier)
   - Create key pair for SSH
   - Security group: Allow ports 22, 80, 5000
   - Launch instance

2. **Connect and Setup**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ec2-user@your-ec2-ip
   
   # Install Node.js
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   
   # Install Git and clone
   sudo yum install git -y
   git clone https://github.com/Timothy-Blue/export-contract-generator.git
   cd export-contract-generator
   
   # Install dependencies
   npm install
   
   # Create .env file
   cat > .env << EOF
   MONGODB_URI=your-connection-string
   NODE_ENV=production
   PORT=5000
   EOF
   
   # Install PM2
   npm install -g pm2
   pm2 start server/server.js --name api
   pm2 startup
   pm2 save
   ```

### **Option B: Frontend on S3 + CloudFront**

1. **Build React App**
   ```powershell
   cd c:\Projects\export-contract-generator\client
   $env:REACT_APP_API_URL="https://your-backend-url/api"
   npm run build
   ```

2. **Create S3 Bucket**
   - Go to S3 → Create bucket
   - Bucket name: `export-contract-frontend`
   - Uncheck "Block all public access"
   - Create bucket

3. **Upload Files**
   ```powershell
   aws s3 sync build/ s3://export-contract-frontend --acl public-read
   ```

4. **Enable Static Website Hosting**
   - Bucket → Properties → Static website hosting
   - Enable it
   - Index: `index.html`
   - Error: `index.html`

5. **Create CloudFront Distribution**
   - Go to CloudFront → Create distribution
   - Origin domain: Your S3 bucket website endpoint
   - Default root object: `index.html`
   - Create distribution

---

## Cost Breakdown

### Free Tier (First 12 Months)
- **Elastic Beanstalk (EC2 t2.micro)**: FREE
- **Amplify**: 1000 build minutes FREE/month
- **S3**: 5GB storage FREE
- **CloudFront**: 50GB transfer FREE
- **MongoDB Atlas M0**: FREE forever

**Estimated Monthly Cost (Free Tier): $0-5**

### After Free Tier
- **Elastic Beanstalk**: ~$15/month
- **Amplify**: ~$5/month (with custom domain)
- **Total**: ~$20/month

---

## Troubleshooting

### Backend Won't Start
```powershell
# Check logs
eb logs

# SSH into instance
eb ssh
pm2 logs
```

### Frontend Build Fails
- Check build logs in Amplify console
- Verify Node version is 18+
- Check environment variables are set

### Database Connection Error
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string is correct
- Test connection string locally first

### CORS Errors
- Update backend CORS_ORIGIN environment variable
- Include your Amplify URL

---

## Next Steps After Deployment

1. ✅ **Custom Domain** (Route 53)
   - Buy domain in Route 53
   - Connect to Amplify or CloudFront
   - SSL certificate auto-configured

2. ✅ **CI/CD** (Already enabled with Amplify)
   - Auto-deploys on git push

3. ✅ **Monitoring**
   - CloudWatch for logs
   - Set up alarms for errors

4. ✅ **Backup**
   - MongoDB Atlas automatic backups
   - S3 versioning for static files

---

## Quick Commands Reference

```powershell
# Backend (Elastic Beanstalk)
eb status              # Check status
eb logs                # View logs
eb deploy              # Deploy updates
eb open                # Open in browser
eb terminate           # Delete environment

# Frontend (Amplify)
# Auto-deploys on git push to main branch

# AWS CLI
aws s3 ls              # List S3 buckets
aws ec2 describe-instances  # List EC2 instances
aws configure          # Reconfigure credentials
```

---

**You're ready to deploy!** 🚀

Start with **Elastic Beanstalk for backend** and **Amplify for frontend** - it's the easiest path!
