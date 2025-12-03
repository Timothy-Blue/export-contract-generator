# AWS Deployment Guide - Export Contract Generator

## 🚀 AWS Deployment Architecture

**Frontend** → AWS Amplify or S3 + CloudFront  
**Backend** → AWS EC2, ECS, or Elastic Beanstalk  
**Database** → MongoDB Atlas

All Vercel, Railway, and Render configurations have been removed. This project is now configured for AWS deployment.

---

## Quick Start - AWS Amplify (Recommended)

1. Push code to GitHub
2. Go to AWS Amplify Console
3. Connect your repository
4. Set environment variables
5. Deploy!

For detailed instructions, see the full deployment options below.

---

## Detailed Deployment Options

### Option 1: AWS Amplify
- Easiest full-stack deployment
- Automatic CI/CD
- ~$15-20/month

### Option 2: S3 + CloudFront + EC2
- More control
- Frontend: ~$1-5/month
- Backend: ~$10-15/month

### Option 3: Elastic Beanstalk  
- Managed platform
- Auto-scaling
- ~$15-30/month

---

## Environment Variables

```env
MONGODB_URI=your-mongodb-atlas-connection-string
NODE_ENV=production
PORT=5000
REACT_APP_API_URL=https://your-backend-url/api
```

---

Ready for AWS deployment! 🚀
