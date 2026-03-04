---
inclusion: fileMatch
fileMatchPattern: "**/utils/calculations.js"
---

# Calculation Logic Reference

## Core Formulas

### Total Amount Calculation
```javascript
totalAmount = quantity × unitPrice
```

Example:
- Quantity: 100 MT
- Unit Price: USD 1,161
- Total: USD 116,100

### Tolerance Range Calculation
```javascript
toleranceAmount = baseValue × (tolerance / 100)
minValue = baseValue - toleranceAmount
maxValue = baseValue + toleranceAmount
```

Example (5% tolerance on 100 MT):
- Tolerance Amount: 100 × 0.05 = 5 MT
- Min Quantity: 100 - 5 = 95 MT
- Max Quantity: 100 + 5 = 105 MT

### Amount Range with Tolerance
```javascript
minAmount = minQuantity × unitPrice
maxAmount = maxQuantity × unitPrice
```

Example:
- Min: 95 × 1,161 = USD 110,295
- Max: 105 × 1,161 = USD 121,905

## Number to Text Conversion

### Implementation
Uses `number-to-words` library with custom currency formatting.

```javascript
const toWords = require('number-to-words');

const convertToWords = (amount, currency) => {
  const words = toWords.toWords(amount);
  const currencyName = getCurrencyName(currency);
  return `${currencyName} ${capitalize(words)} only`;
};
```

### Supported Currencies
- USD → "US Dollars"
- EUR → "Euros"
- GBP → "British Pounds"
- JPY → "Japanese Yen"
- CNY → "Chinese Yuan"
- INR → "Indian Rupees"
- AED → "UAE Dirhams"
- SGD → "Singapore Dollars"
- THB → "Thai Baht"
- VND → "Vietnamese Dong"
