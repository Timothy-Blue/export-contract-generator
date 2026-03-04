# Amazon Q Developer Setup Guide

This document explains how to use the Amazon Q Developer rules created for this project.

---

## 📁 Files Created

### 1. **amazon-q-developer-rule.md**
Comprehensive development guide covering:
- Project architecture and technology stack
- Backend patterns (Express, Mongoose, controllers)
- Frontend patterns (React, hooks, API integration)
- Data validation and calculations
- Error handling and security
- Performance optimization
- Naming conventions
- Common patterns specific to this project

**Use this file**: As your primary reference when developing features or fixing bugs.

### 2. **PROJECT_OVERVIEW.md**
Quick reference guide containing:
- Technology stack summary
- Project structure breakdown
- API endpoints reference
- Data model overview
- Development workflow
- Common development tasks
- Where to add new features

**Use this file**: For quick lookups and onboarding new developers.

### 3. **.amazonq/rules.json**
Machine-readable rules configuration for Amazon Q:
- Structured patterns and best practices
- Code examples for common scenarios
- Checklists for new features
- Anti-patterns to avoid
- Performance and security guidelines

**Use this file**: To configure Amazon Q Developer with project-specific rules.

---

## 🚀 How to Use with Amazon Q Developer

### Option 1: Direct Integration (If Supported)

If Amazon Q supports custom rules files:

1. **Place the rules file** in your project root or `.amazonq/` directory
2. **Configure Amazon Q** to read from `.amazonq/rules.json`
3. **Verify** that Amazon Q recognizes the rules

### Option 2: Reference Documentation

Use the markdown files as reference when working with Amazon Q:

1. **Keep files open** in your editor while coding
2. **Reference patterns** when asking Amazon Q for help
3. **Copy examples** from the documentation into your prompts

Example prompts:
```
"Create a new Mongoose model following the patterns in amazon-q-developer-rule.md"

"Add a new API endpoint for managing shipments, following the Express controller pattern from our rules"

"Create a React component for displaying shipment details, following our component patterns"
```

### Option 3: Context Injection

When asking Amazon Q for help, include context from the rules:

```
Context: This is a MERN stack application. We use:
- Express.js with MVC-style architecture
- Mongoose with validation and indexes
- React functional components with hooks
- Centralized axios API service
- Soft delete pattern with isActive flag

Task: Create a new feature for [your feature]
```

---

## 📋 Quick Start Checklist

### For New Developers

- [ ] Read `PROJECT_OVERVIEW.md` for project understanding
- [ ] Review `amazon-q-developer-rule.md` for coding standards
- [ ] Set up development environment (see README.md)
- [ ] Review existing code examples in the project
- [ ] Start with small tasks to familiarize with patterns

### For Adding New Features

- [ ] Review relevant section in `amazon-q-developer-rule.md`
- [ ] Check "Where to Add New Features" in `PROJECT_OVERVIEW.md`
- [ ] Follow the appropriate checklist from `.amazonq/rules.json`
- [ ] Test thoroughly before committing
- [ ] Update documentation if needed

---

## 🎯 Key Patterns to Remember

### Backend Development

```javascript
// 1. Always use async/await with try-catch
exports.getResource = async (req, res) => {
  try {
    const resource = await Model.findById(req.params.id);
    res.json(resource);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 2. Mongoose models with validation
const schema = new mongoose.Schema({
  field: { type: String, required: true, trim: true }
}, { timestamps: true });

schema.index({ field: 1 });

// 3. Populate references
const contract = await Contract.findById(id)
  .populate('buyer')
  .populate('seller')
  .populate('commodity');
```

### Frontend Development

```javascript
// 1. Functional components with hooks
function Component() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getAll();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* JSX */}</div>;
}

// 2. Centralized API service
export const resourceAPI = {
  getAll: (params) => apiClient.get('/resources', { params }),
  getById: (id) => apiClient.get(`/resources/${id}`),
  create: (data) => apiClient.post('/resources', data),
  update: (id, data) => apiClient.put(`/resources/${id}`, data),
  delete: (id) => apiClient.delete(`/resources/${id}`)
};
```

---

## 🔍 Using Amazon Q Effectively

### Good Prompts

✅ **Specific with context**
```
"Create a new Mongoose model for Shipments with fields: shipmentNumber (unique), 
contractId (reference to Contract), shipmentDate, carrier, trackingNumber. 
Follow our project patterns with validation, indexes, and timestamps."
```

✅ **Reference existing patterns**
```
"Add a new API endpoint for shipments following the same pattern as 
contractController.js. Include CRUD operations with error handling."
```

✅ **Include requirements**
```
"Create a React component ShipmentList that displays shipments in a table. 
Include loading state, error handling, search functionality, and pagination. 
Follow the pattern used in ContractList.js."
```

### Poor Prompts

❌ **Too vague**
```
"Create a shipment feature"
```

❌ **No context**
```
"Make an API endpoint"
```

❌ **Missing requirements**
```
"Build a component for shipments"
```

---

## 📚 Documentation Hierarchy

```
README.md                          # Start here - project overview
    ↓
PROJECT_OVERVIEW.md                # Quick reference for structure
    ↓
amazon-q-developer-rule.md         # Detailed patterns and best practices
    ↓
.amazonq/rules.json                # Machine-readable rules
    ↓
docs/ARCHITECTURE.md               # Deep dive into architecture
docs/API.md                        # API documentation
```

---

## 🛠️ Common Development Scenarios

### Scenario 1: Adding a New Master Data Type

**Steps:**
1. Review "Adding New Features" in `amazon-q-developer-rule.md` section 15
2. Follow the backend feature checklist
3. Create model, controller, routes
4. Add API service methods
5. Create management modal component

**Amazon Q Prompt:**
```
"I need to add a new master data type for [entity name] with fields [list fields]. 
Follow the same pattern as Party.js model and partyController.js. Include:
- Mongoose model with validation and indexes
- Controller with CRUD operations
- Routes with proper endpoints
- API service methods in client/src/services/api.js
- Management modal component similar to BuyerModal.js"
```

### Scenario 2: Adding a New Calculation

**Steps:**
1. Review "Calculation Utilities" in `amazon-q-developer-rule.md` section 5
2. Add function to `server/utils/calculations.js`
3. Use in controller
4. Display in frontend

**Amazon Q Prompt:**
```
"Add a new calculation function to calculate [description]. 
Follow the pattern in server/utils/calculations.js:
- Handle edge cases (null, undefined, zero)
- Use proper decimal precision with toFixed(2)
- Return consistent format
- Add JSDoc comments"
```

### Scenario 3: Adding a New Contract Field

**Steps:**
1. Update Contract model schema
2. Update ContractForm.js
3. Update ContractList.js display
4. Update PDF generator if needed

**Amazon Q Prompt:**
```
"Add a new field [fieldName] to contracts:
1. Update Contract.js model with proper validation
2. Add input field to ContractForm.js with appropriate component
3. Display in ContractList.js table
4. Include in PDF generation if applicable
Follow existing patterns for similar fields."
```

---

## 🎓 Learning Path

### Week 1: Understanding the Codebase
- [ ] Read all documentation files
- [ ] Explore existing models, controllers, and components
- [ ] Run the application and test features
- [ ] Make small CSS or text changes

### Week 2: Simple Modifications
- [ ] Add a new field to an existing model
- [ ] Modify a component's display
- [ ] Add validation to a form
- [ ] Fix a simple bug

### Week 3: New Features
- [ ] Add a new master data type
- [ ] Create a new calculation
- [ ] Build a new component
- [ ] Add a new API endpoint

### Week 4: Complex Features
- [ ] Implement a multi-step feature
- [ ] Optimize performance
- [ ] Add advanced functionality
- [ ] Refactor existing code

---

## 🔧 Troubleshooting Amazon Q

### If Amazon Q doesn't follow patterns:

1. **Be more explicit** in your prompts
   ```
   "IMPORTANT: Follow the exact pattern in [file name]. 
   Use the same structure, error handling, and naming conventions."
   ```

2. **Provide examples** from existing code
   ```
   "Here's an example from our codebase:
   [paste relevant code]
   
   Create something similar for [new feature]"
   ```

3. **Break down requests** into smaller steps
   ```
   "First, create just the Mongoose model.
   Then, I'll ask for the controller.
   Then, the routes."
   ```

4. **Reference the rules explicitly**
   ```
   "According to our amazon-q-developer-rule.md, 
   all controllers must use async/await with try-catch. 
   Please ensure this pattern is followed."
   ```

---

## 📊 Measuring Success

Your code follows the rules if:

- ✅ All async functions use try-catch
- ✅ Mongoose models have validation, indexes, and timestamps
- ✅ API responses use consistent format and status codes
- ✅ React components handle loading and error states
- ✅ Variables and functions have descriptive names
- ✅ No sensitive data in code (uses environment variables)
- ✅ Input validation on both frontend and backend
- ✅ Follows existing file structure and naming conventions

---

## 🤝 Contributing to Rules

If you discover new patterns or best practices:

1. Update `amazon-q-developer-rule.md` with the pattern
2. Add example to `.amazonq/rules.json`
3. Update `PROJECT_OVERVIEW.md` if it affects structure
4. Document in code comments
5. Share with the team

---

## 📞 Getting Help

1. **Check documentation** in this order:
   - PROJECT_OVERVIEW.md (quick reference)
   - amazon-q-developer-rule.md (detailed patterns)
   - Existing code examples
   - docs/ folder

2. **Ask Amazon Q** with proper context:
   - Include relevant patterns from rules
   - Reference similar existing code
   - Be specific about requirements

3. **Review existing implementations**:
   - Find similar features in the codebase
   - Follow the same patterns
   - Adapt to your needs

---

## 🎯 Summary

These rules and documentation files provide:

1. **Consistency**: Everyone follows the same patterns
2. **Quality**: Best practices are built-in
3. **Speed**: Less time deciding how to structure code
4. **Maintainability**: Code is predictable and easy to understand
5. **Onboarding**: New developers get up to speed quickly

Use them as your guide, reference them often, and update them as the project evolves.

---

**Happy Coding! 🚀**
