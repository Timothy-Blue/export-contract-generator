---
inclusion: fileMatch
fileMatchPattern: "**/components/*.js"
---

# React Component Patterns

## Component Architecture

### Functional Components with Hooks
Always use functional components with hooks (no class components).

```javascript
import React, { useState, useEffect } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>{/* JSX */}</div>;
};

export default MyComponent;
```

## State Management Patterns

### Local State with useState
```javascript
const [formData, setFormData] = useState({
  field1: '',
  field2: ''
});

// Update single field
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};
```

### Context for Global State
```javascript
// contexts/LanguageContext.js
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
```

## API Integration Pattern

### Using Axios Service
```javascript
import api from '../services/api';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/endpoint');
      setData(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render data */}</div>;
};
```

## Form Handling Pattern

### Controlled Components
```javascript
const ContractForm = () => {
  const [formData, setFormData] = useState({
    buyer: '',
    quantity: '',
    unitPrice: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await api.post('/contracts', formData);
      alert('Contract created successfully!');
      // Reset or navigate
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create contract');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
      />
      <button type="submit">Submit</button>
    </form>
  );
};
```

### React Select Integration
```javascript
import Select from 'react-select';

const [selectedBuyer, setSelectedBuyer] = useState(null);
const [buyers, setBuyers] = useState([]);

// Fetch options
useEffect(() => {
  const fetchBuyers = async () => {
    const response = await api.get('/parties?type=BUYER');
    const options = response.data.map(buyer => ({
      value: buyer._id,
      label: buyer.companyName
    }));
    setBuyers(options);
  };
  fetchBuyers();
}, []);

// Render
<Select
  options={buyers}
  value={selectedBuyer}
  onChange={setSelectedBuyer}
  placeholder="Select Buyer"
/>
```

## Real-time Calculations Pattern

### Dependent State Updates
```javascript
const [quantity, setQuantity] = useState(0);
const [unitPrice, setUnitPrice] = useState(0);
const [tolerance, setTolerance] = useState(0);
const [totalAmount, setTotalAmount] = useState(0);
const [minQuantity, setMinQuantity] = useState(0);
const [maxQuantity, setMaxQuantity] = useState(0);

// Calculate whenever inputs change
useEffect(() => {
  if (quantity && unitPrice) {
    const total = quantity * unitPrice;
    setTotalAmount(total);
    
    if (tolerance > 0) {
      const toleranceAmount = quantity * (tolerance / 100);
      setMinQuantity(quantity - toleranceAmount);
      setMaxQuantity(quantity + toleranceAmount);
    }
  }
}, [quantity, unitPrice, tolerance]);
```

## List Rendering Pattern

### With Search and Pagination
```javascript
const ContractList = () => {
  const [contracts, setContracts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchContracts();
  }, [page, searchQuery]);
  
  const fetchContracts = async () => {
    const response = await api.get(
      `/contracts?page=${page}&search=${searchQuery}`
    );
    setContracts(response.data);
    setTotalPages(response.pagination.pages);
  };
  
  return (
    <div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search..."
      />
      
      <table>
        <tbody>
          {contracts.map(contract => (
            <tr key={contract._id}>
              <td>{contract.contractNumber}</td>
              <td>{contract.buyer?.companyName}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div>
        <button 
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
```

## Modal/Dialog Pattern

### Conditional Rendering
```javascript
const [showModal, setShowModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const openModal = (item) => {
  setSelectedItem(item);
  setShowModal(true);
};

const closeModal = () => {
  setShowModal(false);
  setSelectedItem(null);
};

return (
  <div>
    <button onClick={() => openModal(item)}>Open</button>
    
    {showModal && (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h2>Modal Title</h2>
          <p>{selectedItem?.name}</p>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    )}
  </div>
);
```

## Error Boundary Pattern

### Class Component for Error Handling
```javascript
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Component Communication

### Parent to Child (Props)
```javascript
const Parent = () => {
  const [data, setData] = useState('value');
  
  return <Child data={data} onUpdate={setData} />;
};

const Child = ({ data, onUpdate }) => {
  return (
    <button onClick={() => onUpdate('new value')}>
      {data}
    </button>
  );
};
```

### Child to Parent (Callbacks)
```javascript
const Parent = () => {
  const handleChildEvent = (value) => {
    console.log('Received from child:', value);
  };
  
  return <Child onEvent={handleChildEvent} />;
};

const Child = ({ onEvent }) => {
  return (
    <button onClick={() => onEvent('data')}>
      Click Me
    </button>
  );
};
```

## Performance Optimization

### React.memo for Expensive Components
```javascript
import React, { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  // Only re-renders if data changes
  return <div>{data}</div>;
});
```

### useCallback for Event Handlers
```javascript
import { useCallback } from 'react';

const MyComponent = () => {
  const handleClick = useCallback(() => {
    // Handler logic
  }, [dependencies]);
  
  return <ChildComponent onClick={handleClick} />;
};
```

### useMemo for Expensive Calculations
```javascript
import { useMemo } from 'react';

const MyComponent = ({ items }) => {
  const sortedItems = useMemo(() => {
    return items.sort((a, b) => a.value - b.value);
  }, [items]);
  
  return <div>{sortedItems.map(...)}</div>;
};
```

## Styling Patterns

### CSS Modules (if used)
```javascript
import styles from './Component.module.css';

const MyComponent = () => {
  return <div className={styles.container}>Content</div>;
};
```

### Inline Styles
```javascript
const MyComponent = () => {
  const style = {
    backgroundColor: '#f0f0f0',
    padding: '20px'
  };
  
  return <div style={style}>Content</div>;
};
```

### Conditional Classes
```javascript
const MyComponent = ({ isActive }) => {
  return (
    <div className={`base-class ${isActive ? 'active' : ''}`}>
      Content
    </div>
  );
};
```

## Common Hooks Usage

### useEffect Patterns
```javascript
// Run once on mount
useEffect(() => {
  fetchData();
}, []);

// Run when dependency changes
useEffect(() => {
  updateData();
}, [dependency]);

// Cleanup on unmount
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

### Custom Hooks
```javascript
// hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};

// Usage
const searchQuery = useDebounce(inputValue, 500);
```

## Project-Specific Patterns

### ContractForm Pattern
- Multi-section form with real-time calculations
- Auto-population from master data (buyers, commodities)
- Validation before submission
- Success/error feedback with alerts

### ContractList Pattern
- Table view with search functionality
- Action buttons (Edit, PDF, Delete)
- Pagination for large datasets
- Status filtering

### Language Switching Pattern
```javascript
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../i18n/translations';

const MyComponent = () => {
  const { language } = useLanguage();
  const t = translations[language];
  
  return <h1>{t.title}</h1>;
};
```
