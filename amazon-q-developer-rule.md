# Amazon Q Developer Rule: Node.js & React Best Practices

## Project Context
This rule applies to a full-stack MERN (MongoDB, Express, React, Node.js) application for contract management. Follow these patterns and best practices when developing features or fixing issues.

---

## 1. PROJECT ARCHITECTURE

### Technology Stack
- **Backend**: Node.js v14+, Express.js 4.x, MongoDB with Mongoose ODM
- **Frontend**: React 18.x, React Router v6, Axios for API calls
- **Utilities**: PDFKit (PDF generation), number-to-words, date-fns
- **Development**: Nodemon, Concurrently for dev workflow

### Architecture Pattern
- **Backend**: MVC-style with separation of routes, controllers, models, and utilities
- **Frontend**: Component-based architecture with service layer for API integration
- **Database**: MongoDB with Mongoose schemas and middleware hooks

---

## 2. CODE ORGANIZATION & STRUCTURE

### Backend Structure
```
server/
├── config/          # Database and configuration
├── models/          # Mongoose schemas with validation
├── routes/          # Express route definitions
├── controllers/     # Business logic handlers
├── middleware/      # Auth, error handling, sanitization
├── utils/           # Helper functions (calculations, PDF generation)
└── server.js        # Express app initialization
```

### Frontend Structure
```
client/src/
├── components/      # React components with co-located CSS
├── services/        # API integration layer (axios)
├── constants/       # Application constants and enums
├── contexts/        # React Context for state management
├── i18n/           # Internationalization translations
└── App.js          # Main application component
```

---

## 3. BACKEND DEVELOPMENT PATTERNS

### Express Server Setup
```javascript
// ALWAYS include these middleware in order:
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput); // Security middleware

// Route registration
app.use('/api/resource', require('./routes/resource'));

// Error handling MUST be last
app.use(errorHandlerMiddleware);
app.use(notFoundHandler);
```

### Mongoose Model Patterns
```javascript
// ALWAYS include:
// 1. Schema validation with required fields
// 2. Indexes for frequently queried fields
// 3. Timestamps for audit trail
// 4. Pre-save hooks for calculated fields
// 5. References using ObjectId with ref

const schema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    trim: true,
    // Add validation as needed
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModelName',
    required: true
  }
}, {
  timestamps: true  // ALWAYS include
});

// Add indexes for performance
schema.index({ field: 1 });
schema.index({ field: 'text' }); // For text search

// Pre-save hooks for calculations
schema.pre('save', function(next) {
  // Calculate derived fields
  next();
});
```

### Controller Patterns
```javascript
// ALWAYS use async/await with try-catch
// ALWAYS validate input data
// ALWAYS populate references when needed
// ALWAYS return consistent response format

exports.getResource = async (req, res) => {
  try {
    const resource = await Model.findById(req.params.id)
      .populate('reference1')
      .populate('reference2');
    
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    res.json(resource);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createResource = async (req, res) => {
  try {
    // Validate input
    const { isValid, errors } = validateData(req.body);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    const resource = new Model(req.body);
    await resource.save();
    
    res.status(201).json(resource);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
```

### Route Patterns
```javascript
// Group related routes together
// Use descriptive endpoint names
// Include proper HTTP methods

const express = require('express');
const router = express.Router();
const controller = require('../controllers/resourceController');

// GET all with optional query params
router.get('/', controller.getAll);

// GET by ID
router.get('/:id', controller.getById);

// POST create
router.post('/', controller.create);

// PUT update
router.put('/:id', controller.update);

// DELETE (soft delete preferred)
router.delete('/:id', controller.delete);

// Custom actions
router.post('/calculate', controller.calculate);
router.get('/search', controller.search);

module.exports = router;
```

---

## 4. FRONTEND DEVELOPMENT PATTERNS

### API Service Layer
```javascript
// ALWAYS create a centralized API service
// Use axios interceptors for auth and error handling
// Export organized API objects by resource

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor for auth
apiClient.interceptors.request.use((config) => {
  // Add auth headers if needed
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, 429, etc.)
    return Promise.reject(error);
  }
);

// Export resource-specific APIs
export const resourceAPI = {
  getAll: (params) => apiClient.get('/resources', { params }),
  getById: (id) => apiClient.get(`/resources/${id}`),
  create: (data) => apiClient.post('/resources', data),
  update: (id, data) => apiClient.put(`/resources/${id}`, data),
  delete: (id) => apiClient.delete(`/resources/${id}`)
};
```

### React Component Patterns
```javascript
// ALWAYS use functional components with hooks
// Co-locate CSS files with components
// Use descriptive component and variable names
// Handle loading and error states
// Implement proper form validation

import React, { useState, useEffect } from 'react';
import { resourceAPI } from '../services/api';
import './ComponentName.css';

function ComponentName({ prop1, onSuccess }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await resourceAPI.getAll();
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate and submit
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="component-name">
      {/* Component JSX */}
    </div>
  );
}

export default ComponentName;
```

### State Management
```javascript
// Use React Context for global state (language, theme, auth)
// Use local state for component-specific data
// Lift state up when needed by multiple components

// Context pattern
import React, { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialValue);
  
  const value = {
    state,
    updateState: (newValue) => setState(newValue)
  };
  
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

---

## 5. DATA VALIDATION & CALCULATIONS

### Input Validation
```javascript
// ALWAYS validate on both frontend and backend
// Use consistent validation patterns
// Return descriptive error messages

const validateData = (data) => {
  const errors = [];
  
  if (!data.field) errors.push('Field is required');
  if (data.number && data.number <= 0) {
    errors.push('Number must be positive');
  }
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
```

### Calculation Utilities
```javascript
// Create reusable calculation functions
// Handle edge cases (null, undefined, zero)
// Use proper decimal precision

const calculateTotal = (quantity, unitPrice) => {
  if (!quantity || !unitPrice) return 0;
  return parseFloat((quantity * unitPrice).toFixed(2));
};

const calculateRange = (baseValue, tolerancePercent) => {
  if (!baseValue || !tolerancePercent) {
    return { min: baseValue, max: baseValue };
  }
  
  const tolerance = (baseValue * tolerancePercent) / 100;
  return {
    min: parseFloat((baseValue - tolerance).toFixed(2)),
    max: parseFloat((baseValue + tolerance).toFixed(2))
  };
};
```

---

## 6. ERROR HANDLING

### Backend Error Handling
```javascript
// ALWAYS use try-catch in async functions
// Log errors for debugging
// Return user-friendly error messages
// Use appropriate HTTP status codes

try {
  // Operation
} catch (error) {
  console.error('Error context:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: error.errors 
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? error.message : undefined 
  });
}
```

### Frontend Error Handling
```javascript
// Display user-friendly error messages
// Provide retry mechanisms
// Log errors for debugging

try {
  const response = await api.call();
} catch (error) {
  let errorMessage = 'An error occurred';
  
  if (error.response) {
    errorMessage = error.response.data.message || errorMessage;
  } else if (error.request) {
    errorMessage = 'Network error. Please check your connection.';
  }
  
  setError(errorMessage);
  console.error('Error:', error);
}
```

---

## 7. SECURITY BEST PRACTICES

### Input Sanitization
```javascript
// ALWAYS sanitize user input
// Use middleware for consistent sanitization
// Validate and escape special characters

const sanitizeInput = (req, res, next) => {
  // Sanitize req.body, req.params, req.query
  next();
};
```

### CORS Configuration
```javascript
// Configure CORS properly for production
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
};

app.use(cors(corsOptions));
```

### Environment Variables
```javascript
// NEVER commit .env files
// Use .env.example as template
// Access via process.env

// .env.example
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dbname
NODE_ENV=development
API_KEY=your_api_key_here
```

---

## 8. DATABASE PATTERNS

### Query Optimization
```javascript
// Use indexes for frequently queried fields
// Populate only needed references
// Use lean() for read-only queries
// Implement pagination for large datasets

const results = await Model.find(query)
  .populate('reference1', 'field1 field2') // Select specific fields
  .select('field1 field2 field3') // Limit returned fields
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
  .lean(); // Returns plain JS objects (faster)
```

### Soft Delete Pattern
```javascript
// Prefer soft delete over hard delete
// Add isActive or deletedAt field

const schema = new mongoose.Schema({
  isActive: { type: Boolean, default: true }
});

// Soft delete
exports.delete = async (req, res) => {
  await Model.findByIdAndUpdate(req.params.id, { isActive: false });
};

// Query only active records
const activeRecords = await Model.find({ isActive: true });
```

---

## 9. TESTING & DEBUGGING

### Logging
```javascript
// Use consistent logging format
// Include timestamps and context
// Log errors with stack traces

console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
console.error('Error in operation:', error.stack);
```

### API Testing
```javascript
// Test all CRUD operations
// Test edge cases and error scenarios
// Verify response formats

// Example test structure
const testCreate = async () => {
  try {
    const response = await api.create(testData);
    console.log('✓ Create test passed');
  } catch (error) {
    console.error('✗ Create test failed:', error);
  }
};
```

---

## 10. NAMING CONVENTIONS

### File Naming
- **Backend**: camelCase for files (userController.js, authMiddleware.js)
- **Frontend**: PascalCase for components (ContractForm.js, UserProfile.js)
- **CSS**: Match component name (ContractForm.css)
- **Utilities**: camelCase (calculations.js, pdfGenerator.js)

### Variable Naming
```javascript
// Use descriptive names
const contractNumber = generateContractNumber(); // Good
const cn = genNum(); // Bad

// Boolean variables start with is/has/should
const isActive = true;
const hasPermission = false;

// Functions use verbs
const calculateTotal = () => {};
const fetchData = async () => {};
const handleSubmit = () => {};
```

### API Endpoint Naming
```
GET    /api/resources          # Get all
GET    /api/resources/:id      # Get one
POST   /api/resources          # Create
PUT    /api/resources/:id      # Update
DELETE /api/resources/:id      # Delete
GET    /api/resources/search   # Custom action
POST   /api/resources/calculate # Custom action
```

---

## 11. PERFORMANCE OPTIMIZATION

### Backend
- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use lean() for read-only queries
- Cache frequently accessed data
- Limit payload size with field selection

### Frontend
- Lazy load components with React.lazy()
- Debounce search inputs
- Memoize expensive calculations with useMemo
- Use React.memo for pure components
- Optimize re-renders with useCallback

```javascript
// Debounce search
const debouncedSearch = useCallback(
  debounce((query) => performSearch(query), 300),
  []
);

// Memoize calculations
const calculatedValue = useMemo(
  () => expensiveCalculation(data),
  [data]
);
```

---

## 12. DOCUMENTATION

### Code Comments
```javascript
/**
 * Calculate total amount from quantity and unit price
 * @param {number} quantity - The quantity of items
 * @param {number} unitPrice - Price per unit
 * @returns {number} Total amount rounded to 2 decimals
 */
const calculateTotal = (quantity, unitPrice) => {
  return parseFloat((quantity * unitPrice).toFixed(2));
};
```

### API Documentation
- Document all endpoints with method, path, params, and response
- Include example requests and responses
- Document error codes and messages

---

## 13. COMMON PATTERNS IN THIS PROJECT

### Contract Number Generation
```javascript
// Format: PREFIX-YYYYMM-TIMESTAMP
const generateContractNumber = (prefix = 'CON') => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${year}${month}-${timestamp}`;
};
```

### Number to Text Conversion
```javascript
// Use number-to-words library
const numberToText = (amount, currency = 'USD') => {
  const currencyName = getCurrencyName(currency);
  const wholePart = Math.floor(amount);
  const decimalPart = Math.round((amount - wholePart) * 100);
  
  let text = currencyName + ' ';
  text += capitalizeFirstLetter(numberToWords.toWords(wholePart));
  
  if (decimalPart > 0) {
    text += ' and ' + capitalizeFirstLetter(numberToWords.toWords(decimalPart)) + ' Cents';
  }
  
  return text + ' only';
};
```

### Tolerance Calculations
```javascript
// Calculate min/max based on tolerance percentage
const calculateToleranceRange = (baseValue, tolerancePercent) => {
  const tolerance = (baseValue * tolerancePercent) / 100;
  return {
    min: parseFloat((baseValue - tolerance).toFixed(2)),
    max: parseFloat((baseValue + tolerance).toFixed(2))
  };
};
```

---

## 14. DEPLOYMENT CONSIDERATIONS

### Environment-Specific Configuration
```javascript
// Use environment variables for all config
const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.REACT_APP_API_URL
};
```

### Build Process
```bash
# Backend: No build needed, runs directly
npm start

# Frontend: Build for production
npm run build --prefix client

# Development: Run both concurrently
npm run dev
```

---

## 15. WHEN ADDING NEW FEATURES

### Backend Feature Checklist
1. Create Mongoose model with validation and indexes
2. Create controller with CRUD operations
3. Create routes and register in server.js
4. Add utility functions if needed
5. Test all endpoints
6. Update API documentation

### Frontend Feature Checklist
1. Create component with co-located CSS
2. Add API service methods
3. Implement loading and error states
4. Add form validation if applicable
5. Update navigation/routing if needed
6. Test user interactions

---

## 16. CODE QUALITY STANDARDS

### General Principles
- Write self-documenting code with clear names
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3 levels)
- Use async/await over callbacks
- Handle all error cases
- Validate all inputs
- Use consistent formatting (2-space indentation)

### React-Specific
- One component per file
- Extract reusable logic into custom hooks
- Use prop-types or TypeScript for type checking
- Avoid inline styles (use CSS files)
- Keep components under 300 lines

### Node.js-Specific
- Use const by default, let when needed, avoid var
- Use arrow functions for callbacks
- Destructure objects and arrays
- Use template literals for strings
- Prefer async/await over promises

---

## SUMMARY

This rule ensures consistent, maintainable, and scalable code across the MERN stack application. Always prioritize:

1. **Security**: Validate inputs, sanitize data, use environment variables
2. **Performance**: Index databases, paginate results, optimize queries
3. **Maintainability**: Clear naming, proper structure, documentation
4. **Error Handling**: Try-catch blocks, user-friendly messages, logging
5. **Consistency**: Follow established patterns, use same libraries/approaches

When in doubt, refer to existing code in the project as examples of these patterns in action.
