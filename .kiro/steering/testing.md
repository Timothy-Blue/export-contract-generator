---
inclusion: manual
---

# Testing Guidelines

## Running Tests

### Backend Tests
```bash
npm run test
# or
node server/tests/test-controllers.js
```

### Frontend Tests
```bash
cd client
npm test
```

## Test Structure

### API Endpoint Testing
```javascript
const testCreateContract = async () => {
  try {
    const testData = {
      buyer: buyerId,
      quantity: 100,
      unitPrice: 1161
    };
    
    const response = await api.post('/contracts', testData);
    console.assert(response.status === 201, 'Should return 201');
    console.assert(response.data._id, 'Should have ID');
    console.log('✓ Create contract test passed');
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
};
```

### Calculation Testing
```javascript
const testCalculations = () => {
  const result = calculateTotal(100, 1161, 5);
  
  console.assert(result.totalAmount === 116100);
  console.assert(result.minQuantity === 95);
  console.assert(result.maxQuantity === 105);
  
  console.log('✓ Calculation tests passed');
};
```

## Manual Testing Checklist

### Contract Creation
- [ ] Create contract with all fields
- [ ] Verify auto-generated contract number
- [ ] Check real-time calculations
- [ ] Verify number-to-text conversion
- [ ] Test form validation

### Contract Management
- [ ] Search by contract number
- [ ] Search by buyer name
- [ ] Edit existing contract
- [ ] Delete contract
- [ ] Filter by status

### PDF Export
- [ ] Generate PDF
- [ ] Verify all data appears correctly
- [ ] Check formatting and layout
