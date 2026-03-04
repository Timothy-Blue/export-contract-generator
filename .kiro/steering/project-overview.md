---
inclusion: auto
---

# Export Contract Generator - Project Overview

## Project Purpose
This is a full-stack MERN application that automates the creation, calculation, and management of commercial export contracts. It replaces manual document handling with a structured web-based system.

## Technology Stack

### Backend
- Node.js v14+ with Express.js
- MongoDB (Atlas cloud) with Mongoose ODM
- PDFKit for PDF generation
- number-to-words for currency text conversion
- Security: API key authentication, rate limiting, input sanitization

### Frontend
- React 18 with functional components and hooks
- React Router for navigation
- React Select for enhanced dropdowns
- Axios for API communication
- CSS3 for styling (no UI framework)

### Development Tools
- nodemon for backend hot reload
- concurrently for running both servers
- dotenv for environment configuration

## Project Structure
```
Root Level:
- server/          Backend API (Express + MongoDB)
- client/          Frontend React app
- docs/            Comprehensive documentation
- scripts/         Utility scripts (setup, health check, etc.)
- .env             Environment configuration (not in git)
```

## Key Features
1. Contract generation with auto-numbering (CON-YYYYMM-XXXXXX)
2. Real-time calculations (total amount, tolerance ranges)
3. Number-to-text conversion for amounts
4. Party management (buyers/sellers)
5. Commodity catalog
6. Payment term templates
7. Bank details management
8. PDF export functionality
9. Contract search and filtering
10. Multi-language support (English/Vietnamese)

## Development Workflow
- Use `npm run dev` to run both frontend and backend
- Backend runs on port 5000
- Frontend runs on port 3000 with proxy to backend
- MongoDB connection required (local or Atlas)

## Important Notes
- API key authentication is implemented but currently disabled for ease of use
- All write operations (POST/PUT/DELETE) can be protected with API keys
- CORS is configured to allow all origins for development
- Rate limiting is set to 100 requests/minute per IP
