# Security Configuration Guide

## Overview
This document outlines the security measures implemented in the Export Contract Generator application to protect data and prevent unauthorized access.

## 🔐 Security Features Implemented

### 1. API Key Authentication
**Purpose:** Protect all write operations (POST, PUT, DELETE) to the database.

**How it works:**
- Read operations (GET) are public and don't require authentication
- All create, update, and delete operations require a valid API key
- API key must be sent in the `x-api-key` header or `Authorization: Bearer <key>` header

**Implementation:**
- Server: `server/middleware/auth.js` - `authenticateAPIKey` function
- Client: `client/src/services/api.js` - Axios interceptor adds API key automatically

### 2. Rate Limiting
**Purpose:** Prevent abuse and DDoS attacks.

**Configuration:**
- Default: 100 requests per minute per IP address
- Returns 429 status code when limit exceeded
- Automatically cleans up old request records

**Implementation:**
- Server: `server/middleware/auth.js` - `rateLimit` function

### 3. Input Sanitization
**Purpose:** Prevent XSS (Cross-Site Scripting) and injection attacks.

**Features:**
- Removes script tags from all input
- Strips HTML tags from text inputs
- Recursively sanitizes nested objects
- Applied to all request bodies automatically

**Implementation:**
- Server: `server/middleware/auth.js` - `sanitizeInput` function

### 4. CORS Protection
**Purpose:** Control which domains can access your API.

**Allowed Origins:**
- http://localhost:3000 (development)
- http://export-contract-frontend-static.s3-website-us-east-1.amazonaws.com (production S3)
- *.amplifyapp.com (Amplify deployments)
- *.amazonaws.com (AWS services)

**Configuration:**
- Server: `server/server.js` - CORS middleware

### 5. MongoDB Authentication
**Current Setup:**
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** Username/Password
- **User:** nguyenminhthinh2405_db_user
- **Connection:** SSL/TLS encrypted connection string
- **Database Name:** export-contracts

**Security Features:**
- Network access controlled by IP whitelist in MongoDB Atlas
- Strong password with special characters
- Connection pooling and retry logic
- Automatic failover with replica sets

## 🔑 Setting Up API Keys

### For Development (Local)

1. **Generate a secure API key:**
   ```bash
   # On Windows PowerShell
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Or use online generator: https://www.uuidgenerator.net/api/guid
   ```

2. **Update `.env` file:**
   ```env
   API_KEY=your-generated-secure-key-here
   ```

3. **Update `client/.env.local` file:**
   ```env
   REACT_APP_API_KEY=your-generated-secure-key-here
   ```

### For Production (AWS Elastic Beanstalk)

1. **Generate a production API key** (different from development)

2. **Set environment variable on Elastic Beanstalk:**
   ```bash
   eb setenv API_KEY=your-production-api-key-here
   ```

3. **Build and deploy frontend with API key:**
   ```bash
   cd client
   $env:REACT_APP_API_KEY="your-production-api-key-here"
   $env:REACT_APP_API_URL="http://export-contract-prod.eba-tn3yzxf3.us-east-1.elasticbeanstalk.com/api"
   npm run build
   aws s3 sync build/ s3://export-contract-frontend-static --delete
   ```

## 📋 MongoDB Security Checklist

### Current Security Status ✅
- ✅ Username/Password authentication enabled
- ✅ SSL/TLS encryption for connections
- ✅ MongoDB Atlas cloud hosting (automatic backups, monitoring)
- ✅ Connection string secured in environment variables
- ✅ Strong password with special characters

### Recommended Additional Security

1. **IP Whitelist in MongoDB Atlas:**
   - Log in to MongoDB Atlas: https://cloud.mongodb.com/
   - Navigate to Network Access
   - Add your Elastic Beanstalk IP addresses
   - Remove "Allow access from anywhere" if enabled

2. **Database User Permissions:**
   - Current user has full access (readWrite)
   - Consider creating separate users for:
     - Read-only user for reporting
     - Admin user for maintenance
     - Application user with limited permissions

3. **Enable Audit Logging:**
   - Available in MongoDB Atlas M10+ clusters
   - Tracks all database access and changes
   - Useful for compliance and security monitoring

4. **Regular Password Rotation:**
   - Change MongoDB password every 90 days
   - Update environment variables on all environments
   - Update connection string in `.env` and AWS EB

## 🛡️ AWS Elastic Beanstalk Security

### Current Configuration
- **Environment:** export-contract-prod
- **Load Balancer:** Application Load Balancer
- **Health Check:** /api/health endpoint
- **Environment Variables:** Stored securely in EB configuration

### Security Recommendations

1. **Enable HTTPS:**
   ```bash
   # Request SSL certificate in AWS Certificate Manager
   # Then configure HTTPS listener on load balancer
   ```

2. **Restrict Security Group:**
   - Only allow HTTP/HTTPS traffic
   - Close unused ports
   - Limit SSH access to specific IPs

3. **Enable CloudWatch Logs:**
   - Monitor application logs
   - Set up alerts for errors
   - Track authentication failures

4. **Regular Updates:**
   - Keep Node.js platform version updated
   - Update dependencies regularly
   - Monitor security advisories

## 🔒 S3 Bucket Security

### Current Configuration
- **Bucket:** export-contract-frontend-static
- **Access:** Public read for static website hosting
- **CORS:** Configured for API access

### Security Best Practices
- ✅ Block public write access
- ✅ Enable versioning for recovery
- ✅ Configure bucket policy for read-only public access
- ✅ Enable server-side encryption
- ⚠️ Consider CloudFront CDN for HTTPS and caching

## 🚨 Security Incident Response

### If API Key is Compromised:

1. **Immediately rotate the API key:**
   ```bash
   # Generate new key
   $newKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
   
   # Update on Elastic Beanstalk
   eb setenv API_KEY=$newKey
   
   # Update locally
   # Update .env and client/.env.local files
   ```

2. **Rebuild and deploy frontend:**
   ```bash
   cd client
   $env:REACT_APP_API_KEY=$newKey
   npm run build
   aws s3 sync build/ s3://export-contract-frontend-static --delete
   ```

3. **Monitor logs for suspicious activity:**
   ```bash
   eb logs
   ```

### If MongoDB Credentials are Compromised:

1. **Change password in MongoDB Atlas**
2. **Update connection string everywhere:**
   - Local `.env` file
   - Elastic Beanstalk: `eb setenv MONGODB_URI=new-connection-string`
3. **Restart application:**
   ```bash
   eb deploy
   ```

## 📊 Monitoring and Logging

### Current Logging
- Console logs for all API requests
- Error logging for failed operations
- MongoDB connection status

### Recommended Monitoring
1. **Set up CloudWatch Alarms:**
   - High error rate
   - High request rate (DDoS detection)
   - Failed authentication attempts

2. **Application Performance Monitoring:**
   - Consider tools like New Relic, DataDog, or AWS X-Ray
   - Track API response times
   - Monitor database query performance

3. **Security Scanning:**
   - Use npm audit for dependency vulnerabilities
   - Regular security scans of AWS infrastructure
   - Code review for security issues

## 🔄 Regular Security Maintenance

### Weekly
- [ ] Review CloudWatch logs for anomalies
- [ ] Check for failed authentication attempts

### Monthly
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review AWS security group rules
- [ ] Check MongoDB Atlas metrics

### Quarterly
- [ ] Rotate API keys
- [ ] Review and update access controls
- [ ] Conduct security audit
- [ ] Update dependencies

### Annually
- [ ] Change MongoDB password
- [ ] Review and update security policies
- [ ] Penetration testing (if budget allows)

## 📞 Support and Questions

For security-related questions or to report vulnerabilities:
- Review this documentation
- Check AWS security best practices
- Consult MongoDB Atlas security documentation

**Remember:** Security is an ongoing process, not a one-time setup. Regularly review and update your security measures.
