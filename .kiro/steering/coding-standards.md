---
inclusion: auto
---

# Coding Standards and Best Practices

## JavaScript/Node.js Standards

### Code Style
- Use ES6+ features (const/let, arrow functions, destructuring)
- Use async/await for asynchronous operations (avoid callbacks)
- Use template literals for string interpolation
- Prefer functional programming patterns where appropriate

### Naming Conventions
- **Variables/Functions**: camelCase (e.g., `calculateTotal`, `contractNumber`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_RETRIES`)
- **Classes/Components**: PascalCase (e.g., `ContractForm`, `BankDetails`)
- **Files**: Match the main export (e.g., `ContractForm.js`, `calculations.js`)
- **Database Models**: PascalCase singular (e.g., `Contract`, `Party`)

### Error Handling
- Always use try-catch blocks for async operations
- Return meaningful error messages to the client
- Log errors to console with context
- Use HTTP status codes correctly:
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation errors)
  - 404: Not Found
  - 500: Server Error

### API Response Format
```javascript
// Success
{ data: {...}, message: "Success message" }

// Error
{ message: "Error description", error: "Technical details" }
```

## React Standards

### Component Structure
- Use functional components with hooks (no class components)
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use prop destructuring in function parameters

### State Management
- Use useState for local component state
- Use useEffect for side effects (API calls, subscriptions)
- Use useContext for global state (e.g., LanguageContext)
- Avoid prop drilling - use context when passing data through many levels

### Component Organization
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// 2. Component definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3. State declarations
  const [data, setData] = useState([]);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 7. Export
export default MyComponent;
```

## MongoDB/Mongoose Standards

### Schema Design
- Use descriptive field names
- Add validation rules in schema
- Use enums for fixed value sets
- Include timestamps: `{ timestamps: true }`
- Use soft deletes with `isActive` field

### Query Patterns
- Always use `.lean()` for read-only queries (better performance)
- Use `.populate()` for related data
- Add indexes for frequently queried fields
- Use projection to limit returned fields

### Example Schema
```javascript
const schema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  status: { 
    type: String, 
    enum: ['DRAFT', 'FINALIZED', 'SENT'],
    default: 'DRAFT'
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });
```

## File Organization

### Backend Structure
```
server/
├── config/         # Configuration files (db.js)
├── models/         # Mongoose schemas
├── routes/         # Express route handlers
├── controllers/    # Business logic
├── middleware/     # Custom middleware (auth, error handling)
├── utils/          # Helper functions (calculations, PDF generation)
└── server.js       # Main entry point
```

### Frontend Structure
```
client/src/
├── components/     # React components
├── services/       # API integration (api.js)
├── constants/      # App constants and enums
├── contexts/       # React contexts (LanguageContext)
├── i18n/          # Internationalization (translations)
└── App.js         # Main app component
```

## Security Best Practices

### Input Validation
- Validate all user input on both client and server
- Sanitize input to prevent XSS attacks
- Use Mongoose schema validation
- Check for required fields before processing

### Authentication
- API keys stored in environment variables
- Never commit `.env` files to git
- Use HTTPS in production
- Implement rate limiting to prevent abuse

### Database Security
- Use MongoDB Atlas with authentication
- Store connection strings in environment variables
- Use strong passwords with special characters
- Implement IP whitelisting in production

## Testing Guidelines

### What to Test
- API endpoints (request/response)
- Calculation functions (unit tests)
- Database operations (CRUD)
- Error handling scenarios

### Test Structure
```javascript
// Test file: server/tests/test-controllers.js
const testFunction = async () => {
  try {
    // Arrange
    const input = {...};
    
    // Act
    const result = await functionToTest(input);
    
    // Assert
    console.assert(result === expected, 'Test failed');
    console.log('✓ Test passed');
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
};
```

## Documentation Standards

### Code Comments
- Add JSDoc comments for functions
- Explain complex logic with inline comments
- Document API endpoints with examples
- Keep comments up-to-date with code changes

### Function Documentation
```javascript
/**
 * Calculate total amount with tolerance ranges
 * @param {number} quantity - Quantity in units
 * @param {number} unitPrice - Price per unit
 * @param {number} tolerance - Tolerance percentage (0-100)
 * @returns {Object} Calculation results with min/max ranges
 */
const calculateTotal = (quantity, unitPrice, tolerance) => {
  // Implementation
};
```

## Git Commit Standards

### Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

### Types
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes (formatting)
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

### Examples
```
feat: Add PDF export functionality

Implemented PDF generation using PDFKit library.
Includes contract header, parties, articles, and bank details.

Closes #123
```

## Performance Considerations

### Backend
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Use `.lean()` for read-only queries
- Cache frequently accessed data when appropriate

### Frontend
- Lazy load components when possible
- Debounce search inputs
- Optimize re-renders with React.memo
- Use production build for deployment

## Common Patterns in This Project

### API Call Pattern
```javascript
// In component
const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to fetch data');
  }
};
```

### Form Submission Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const response = await api.post('/endpoint', formData);
    alert('Success!');
    // Reset form or navigate
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to submit');
  }
};
```

### Calculation Pattern
```javascript
// Real-time calculation in useEffect
useEffect(() => {
  if (quantity && unitPrice) {
    const total = quantity * unitPrice;
    setTotalAmount(total);
  }
}, [quantity, unitPrice]);
```
