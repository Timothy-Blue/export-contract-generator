---
inclusion: auto
---

# Common Development Tasks

## Starting the Application

### Full Stack Development
```bash
npm run dev
```
This runs both backend (port 5000) and frontend (port 3000) concurrently.

### Backend Only
```bash
npm run server
```

### Frontend Only
```bash
npm run client
# or
cd client && npm start
```

## Database Operations

### Seed Database with Sample Data
```bash
node server/seed.js
```
Creates sample buyers, commodities, payment terms, and bank details.

### View Database Contents
```bash
node scripts/show-db.js
```

### Connect to MongoDB
```bash
# Local
mongosh mongodb://localhost:27017/export-contracts

# Atlas
mongosh "mongodb+srv://cluster.mongodb.net/export-contracts" --username user
```

## Common Development Tasks

### Add New API Endpoint
1. Create route handler in `server/routes/`
2. Add controller logic in `server/controllers/` (if needed)
3. Register route in `server/server.js`
4. Test with Postman or curl
5. Add frontend API call in `client/src/services/api.js`

### Add New Model Field
1. Update schema in `server/models/`
2. Add validation rules
3. Update seed script if needed
4. Update frontend form to include new field
5. Test create/update operations

### Add New React Component
1. Create component file in `client/src/components/`
2. Import and use in parent component
3. Add CSS file if needed
4. Test rendering and functionality

## Troubleshooting

### Backend Won't Start
- Check MongoDB connection string in `.env`
- Verify MongoDB is running
- Check port 5000 is not in use
- Review console for error messages

### Frontend Won't Start
- Clear node_modules: `rm -rf client/node_modules && cd client && npm install`
- Check port 3000 is not in use
- Verify proxy setting in `client/package.json`

### API Calls Failing
- Check backend is running on port 5000
- Verify CORS configuration in `server/server.js`
- Check API endpoint URLs
- Review browser console for errors
- Check network tab in DevTools

### Database Connection Issues
- Verify MONGODB_URI in `.env`
- Check MongoDB Atlas IP whitelist
- Verify username/password
- Test connection with mongosh

### PDF Generation Not Working
- Check PDFKit installation
- Verify contract has all required fields populated
- Check server logs for errors
- Ensure all references are populated

## Useful Commands

### Install Dependencies
```bash
npm run install-all
```

### Build Frontend for Production
```bash
cd client
npm run build
```

### Check for Vulnerabilities
```bash
npm audit
cd client && npm audit
```

### Update Dependencies
```bash
npm update
cd client && npm update
```

## File Locations Reference

### Configuration
- Backend env: `.env`
- Frontend env: `client/.env.local` or `client/.env.production`
- Package configs: `package.json`, `client/package.json`

### Source Code
- Backend entry: `server/server.js`
- Frontend entry: `client/src/index.js`
- Main app: `client/src/App.js`

### Documentation
- Main README: `README.md`
- API docs: `docs/API.md`
- Architecture: `docs/ARCHITECTURE.md`
- Security: `docs/SECURITY.md`
