---
inclusion: manual
---

# Deployment Guide

## Environment Setup

### Development
- Backend: http://localhost:5000
- Frontend: http://localhost:3000
- MongoDB: Local or Atlas connection

### Production
- Backend: AWS Elastic Beanstalk
- Frontend: AWS S3 + CloudFront or Amplify
- MongoDB: MongoDB Atlas (cloud)

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/export-contracts
NODE_ENV=production
API_KEY=your-secure-production-api-key
CORS_ORIGIN=https://your-frontend-domain.com

SELLER_NAME=Your Company Name
SELLER_ADDRESS=Company Address
SELLER_CONTACT=+1234567890
SELLER_EMAIL=sales@company.com

BANK_NAME=Bank Name
BANK_ACCOUNT_NO=1234567890
BANK_SWIFT_CODE=ABCDEFGH123
BANK_ADDRESS=Bank Address
```

### Frontend (client/.env.production)
```env
REACT_APP_API_URL=https://your-backend-api.com/api
REACT_APP_API_KEY=your-secure-production-api-key
```

## AWS Elastic Beanstalk Deployment

### Initial Setup
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB
eb init -p node.js export-contract-api

# Create environment
eb create export-contract-prod
```

### Set Environment Variables
```bash
eb setenv MONGODB_URI=your-connection-string
eb setenv API_KEY=your-api-key
eb setenv NODE_ENV=production
```

### Deploy Updates
```bash
eb deploy
```
