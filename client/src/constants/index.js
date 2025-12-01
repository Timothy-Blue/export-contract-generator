export const INCOTERMS = [
  { value: 'EXW', label: 'EXW - Ex Works' },
  { value: 'FCA', label: 'FCA - Free Carrier' },
  { value: 'FAS', label: 'FAS - Free Alongside Ship' },
  { value: 'FOB', label: 'FOB - Free On Board' },
  { value: 'CFR', label: 'CFR - Cost and Freight' },
  { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
  { value: 'CPT', label: 'CPT - Carriage Paid To' },
  { value: 'CIP', label: 'CIP - Carriage and Insurance Paid To' },
  { value: 'DAP', label: 'DAP - Delivered At Place' },
  { value: 'DPU', label: 'DPU - Delivered at Place Unloaded' },
  { value: 'DDP', label: 'DDP - Delivered Duty Paid' }
];

export const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' }
];

export const UNITS = [
  { value: 'MT', label: 'MT - Metric Tons' },
  { value: 'KG', label: 'KG - Kilograms' },
  { value: 'TONS', label: 'TONS - Tons' },
  { value: 'BAGS', label: 'BAGS - Bags' },
  { value: 'PIECES', label: 'PIECES - Pieces' },
  { value: 'CARTONS', label: 'CARTONS - Cartons' },
  { value: 'CBM', label: 'CBM - Cubic Meters' }
];

export const CONTRACT_STATUS = [
  { value: 'DRAFT', label: 'Draft', color: '#808080' },
  { value: 'FINALIZED', label: 'Finalized', color: '#0066cc' },
  { value: 'SENT', label: 'Sent', color: '#ff9900' },
  { value: 'SIGNED', label: 'Signed', color: '#00cc00' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#cc0000' }
];

export const PARTY_TYPES = [
  { value: 'BUYER', label: 'Buyer' },
  { value: 'SELLER', label: 'Seller' }
];
