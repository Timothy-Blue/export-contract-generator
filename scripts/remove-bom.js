const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../client/src/components/ContractForm.js');

// Read file
const content = fs.readFileSync(filePath, 'utf8');

// Remove BOM if present
const cleanContent = content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;

// Write back without BOM
fs.writeFileSync(filePath, cleanContent, 'utf8');

console.log('BOM removed from ContractForm.js');
