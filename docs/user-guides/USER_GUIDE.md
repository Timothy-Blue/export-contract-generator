# User Guide - Export Contract Generator

## 🎯 Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Your First Contract](#creating-your-first-contract)
3. [Understanding Calculations](#understanding-calculations)
4. [Searching Contracts](#searching-contracts)
5. [Editing Contracts](#editing-contracts)
6. [Exporting Contracts](#exporting-contracts)
7. [Managing Master Data](#managing-master-data)
8. [Tips & Best Practices](#tips--best-practices)

---

## 🚀 Getting Started

### Accessing the Application

1. Ensure the server is running:
   ```powershell
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. You'll see the main interface with two tabs:
   - **Contracts** - View and manage existing contracts
   - **New Contract** - Create a new contract

---

## 📝 Creating Your First Contract

### Step 1: Open the Contract Form

Click the **"New Contract"** button or the **"New Contract"** tab in the navigation.

### Step 2: Select Parties

**Buyer:**
- Click the "Buyer" dropdown
- Select from the list (e.g., "Global Trading Inc.")
- The buyer's details are automatically retrieved

**Seller:**
- Automatically populated with your company information
- Pre-configured in the system

💡 **Tip:** If you don't see a buyer, you'll need to add one first (see [Managing Master Data](#managing-master-data))

### Step 3: Article 1 - Commodity Details

**Select Commodity:**
```
Commodity: [Dropdown] → Select "Basmati Rice"
```
When selected, these fields auto-fill:
- Description: "Premium quality aged basmati rice..."
- Unit: MT
- Origin: India
- Packing: 50kg PP bags

**Enter Quantity:**
```
Quantity: 100
Unit: MT (already selected)
Tolerance: 5 (optional - for ±5%)
```

**Result:**
If tolerance is 5%, you'll see:
```
📊 Quantity Range: 95 - 105 MT
```

**Review/Edit:**
- Origin: India ✓
- Packing: 50kg PP bags ✓
- Quality Spec: (Optional) Add if needed

### Step 4: Article 2 - Price

**Enter Pricing:**
```
Unit Price: 1200
Currency: USD
```

**Watch the Magic! ✨**

As soon as you enter both values, the system automatically calculates:

```
╔════════════════════════════════════════════╗
║  💰 AUTOMATIC CALCULATIONS                 ║
╠════════════════════════════════════════════╣
║  Total Amount: USD 120,000.00              ║
║                                            ║
║  In Words: US Dollars One Hundred Twenty   ║
║            Thousand only                   ║
║                                            ║
║  Amount Range: USD 114,000.00 - 126,000.00 ║
║  (with 5% tolerance)                       ║
╚════════════════════════════════════════════╝
```

**Set Terms:**
```
Incoterm: [Dropdown] → Select "FOB"
Port/Location: Mumbai Port
```

### Step 5: Article 3 - Payment

**Select Payment Term:**
```
Payment Terms: [Dropdown] → Select "30/70 TT"
```

The payment text automatically fills:
```
"30% payment by TT in advance, balance 70% 
against copy of shipping documents within 7 days"
```

💡 **Tip:** You can edit the payment text if needed!

### Step 6: Bank Details

**Select Bank:**
```
Bank Details: [Dropdown] → Select "International Commercial Bank"
```

The default bank is pre-selected. All bank information is stored securely.

### Step 7: Additional Information (Optional)

```
Shipment Period: Within 30 days from L/C receipt
Additional Terms: (Add any special terms)
Status: DRAFT
```

### Step 8: Create Contract

Click **"Create Contract"** button.

You'll see a success message:
```
✅ Contract created successfully!
```

The contract is saved and you're redirected to the contract list.

---

## 🧮 Understanding Calculations

### Real-Time Calculation Flow

```
┌─────────────────────────────────────────────┐
│  YOU TYPE                                   │
├─────────────────────────────────────────────┤
│  Quantity: 100                              │
│  Unit Price: 1161                           │
│  Tolerance: 5%                              │
└─────────────────┬───────────────────────────┘
                  │
                  │ Instant Calculation
                  ▼
┌─────────────────────────────────────────────┐
│  SYSTEM CALCULATES                          │
├─────────────────────────────────────────────┤
│  ✓ Total = 100 × 1161 = 116,100            │
│  ✓ Min Qty = 100 - 5 = 95 MT               │
│  ✓ Max Qty = 100 + 5 = 105 MT              │
│  ✓ Min Amt = 116,100 × 0.95 = 110,295     │
│  ✓ Max Amt = 116,100 × 1.05 = 121,905     │
│  ✓ Text = "One Hundred Sixteen Thousand..." │
└─────────────────────────────────────────────┘
```

### Number to Text Examples

| Amount | Currency | Result |
|--------|----------|--------|
| 116,100 | USD | US Dollars One Hundred Sixteen Thousand and One Hundred only |
| 50,000 | EUR | Euros Fifty Thousand only |
| 1,500.50 | GBP | British Pounds One Thousand Five Hundred and Fifty Cents only |
| 250,000 | AED | UAE Dirhams Two Hundred Fifty Thousand only |

### Tolerance Calculation Examples

**Example 1: 5% tolerance on 100 MT @ $1,200/MT**
```
Quantity Range: 95 - 105 MT
Amount Range: $114,000 - $126,000
```

**Example 2: 10% tolerance on 50 MT @ $800/MT**
```
Quantity Range: 45 - 55 MT
Amount Range: $36,000 - $44,000
```

**Example 3: No tolerance (0%)**
```
Quantity Range: 100 - 100 MT (fixed)
Amount Range: $120,000 - $120,000 (fixed)
```

---

## 🔍 Searching Contracts

### Using the Search Box

1. Go to the **"Contracts"** tab
2. You'll see a search box at the top
3. Type any of these:
   - Contract number: `CON-202512`
   - Buyer name: `Global Trading`
   - Partial match: `CON` or `Global`

4. Press **Enter** or click **Search** button

### Filtering by Status

Use the **Status** dropdown to filter:
- All (default)
- Draft
- Finalized
- Sent
- Signed
- Cancelled

### Reading the Contract List

```
┌──────────────┬────────────┬──────────────────┬──────────┬─────────────┬────────┬─────────┐
│ Contract No. │ Date       │ Buyer            │ Commodity│ Total Amount│ Status │ Actions │
├──────────────┼────────────┼──────────────────┼──────────┼─────────────┼────────┼─────────┤
│ CON-202512-  │ 12/01/2025 │ Global Trading   │ Basmati  │ USD 120,000 │ DRAFT  │ ✏️📄🗑️ │
│   123456     │            │ Inc.             │ Rice     │             │        │         │
└──────────────┴────────────┴──────────────────┴──────────┴─────────────┴────────┴─────────┘
```

**Status Badges:**
- 🔘 DRAFT - Gray
- 🔵 FINALIZED - Blue
- 🟠 SENT - Orange
- 🟢 SIGNED - Green
- 🔴 CANCELLED - Red

---

## ✏️ Editing Contracts

### How to Edit

1. Find the contract in the list
2. Click the **✏️ Edit** button
3. The contract form opens with all fields populated
4. Make your changes
5. Calculations update automatically
6. Click **"Update Contract"**

### What Happens When You Edit

- ✅ Contract number is preserved
- ✅ Calculations re-run automatically
- ✅ Last modified timestamp updates
- ✅ You can change any field except contract number
- ✅ Tolerance ranges recalculate if you change quantity/price

### Example Edit Flow

```
Original Contract:
  Quantity: 100 MT
  Unit Price: $1,200
  Total: $120,000

You Edit:
  Quantity: 150 MT (increased)

System Auto-Updates:
  Total: $180,000 (recalculated)
  Total Text: "One Hundred Eighty Thousand..."
  Qty Range: 142.5 - 157.5 MT (with 5% tolerance)
  Amount Range: $171,000 - $189,000
```

---

## 📄 Exporting Contracts

### Export as PDF

1. Find your contract in the list
2. Click the **📄 PDF** button
3. PDF opens in a new browser tab
4. You can:
   - View in browser
   - Download to your computer
   - Print directly
   - Email as attachment

### PDF Contents

The PDF includes:
```
╔══════════════════════════════════════════╗
║         SALES CONTRACT                   ║
╠══════════════════════════════════════════╣
║ Contract No: CON-202512-123456          ║
║ Date: December 1, 2025                  ║
║                                         ║
║ SELLER: [Your Company Details]          ║
║ BUYER: [Selected Buyer Details]         ║
║                                         ║
║ ARTICLE 1: COMMODITY                    ║
║ - Full commodity description            ║
║ - Quantity with tolerance               ║
║ - Origin and packing                    ║
║                                         ║
║ ARTICLE 2: PRICE                        ║
║ - Unit price                            ║
║ - Total amount (with text)              ║
║ - Incoterm and location                 ║
║                                         ║
║ ARTICLE 3: PAYMENT                      ║
║ - Payment terms                         ║
║                                         ║
║ SELLER'S BANK DETAILS                   ║
║ - Complete bank information             ║
║                                         ║
║ [Signature spaces for both parties]     ║
╚══════════════════════════════════════════╝
```

### Professional Use

The PDF is:
- ✅ Ready to send to buyers
- ✅ Professionally formatted
- ✅ Non-editable (secure)
- ✅ Printable
- ✅ Legally presentable

---

## 🗄 Managing Master Data

### Adding a New Buyer

**Via API (Recommended for bulk):**

```powershell
# Using PowerShell
$body = @{
    type = "BUYER"
    companyName = "New Import Co. Ltd"
    address = "123 Trade Street, New York, USA"
    email = "contact@newimport.com"
    phone = "+1-555-1234"
    country = "USA"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/parties" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Adding a New Commodity

```powershell
$commodity = @{
    name = "Green Tea"
    description = "Premium organic green tea leaves"
    hsCode = "0902.10.00"
    defaultUnit = "KG"
    defaultOrigin = "China"
    defaultPacking = "5kg sealed bags"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/commodities" `
    -Method POST `
    -Body $commodity `
    -ContentType "application/json"
```

### Adding a Payment Term

```powershell
$payment = @{
    name = "50/50 TT"
    description = "50% advance, 50% on shipment"
    terms = "50% by TT in advance, balance 50% against copy of Bill of Lading"
    depositPercentage = 50
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/payment-terms" `
    -Method POST `
    -Body $payment `
    -ContentType "application/json"
```

### Adding Bank Details

```powershell
$bank = @{
    bankName = "Global Trade Bank"
    accountName = "Your Company Export Account"
    accountNumber = "9876543210"
    swiftCode = "GTBKUS44XXX"
    bankAddress = "100 Finance Ave, NYC, USA"
    currency = "USD"
    isDefault = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bank-details" `
    -Method POST `
    -Body $bank `
    -ContentType "application/json"
```

---

## 💡 Tips & Best Practices

### Contract Creation

1. **Use Templates**
   - Set up payment term templates for common scenarios
   - Pre-define commodities with standard descriptions
   - Save frequently used buyers

2. **Double-Check Calculations**
   - Verify the total amount looks correct
   - Check tolerance ranges make sense
   - Review the amount in words

3. **Status Management**
   - Start with DRAFT for work-in-progress
   - Move to FINALIZED when ready
   - Mark as SENT after emailing to buyer
   - Change to SIGNED when executed

### Search & Organization

1. **Use Descriptive Contract Numbers**
   - The system auto-generates numbers
   - Numbers include date for easy sorting
   - Format: CON-YYYYMM-XXXXXX

2. **Filter Effectively**
   - Use status filters to focus on active contracts
   - Search by buyer for customer-specific views
   - Combine search and filter for precision

### Data Management

1. **Keep Master Data Clean**
   - Regularly update buyer information
   - Remove inactive commodities
   - Archive old payment terms

2. **Backup Important Data**
   - Export contracts to PDF regularly
   - Keep copies of finalized contracts
   - Maintain buyer contact information

### Workflow Suggestions

**Typical Contract Flow:**
```
1. Create (DRAFT) → Review internally
2. Update (FINALIZED) → Get approval
3. Export PDF → Send to buyer
4. Update (SENT) → Track communication
5. Update (SIGNED) → Archive
```

### Common Scenarios

**Scenario 1: Rush Order**
```
1. Select buyer
2. Select commodity
3. Enter quantity and price
4. Use "100% Advance" payment term
5. Set status to FINALIZED
6. Export and send immediately
```

**Scenario 2: Negotiation**
```
1. Create with DRAFT status
2. Export PDF for discussion
3. Edit based on feedback
4. Keep updating until agreed
5. Change to FINALIZED
6. Export final version
```

**Scenario 3: Contract Modification**
```
1. Find original contract
2. Click Edit
3. Adjust price/quantity
4. Review recalculations
5. Save as new version (optional)
6. Or update existing
```

---

## ❓ Frequently Asked Questions

**Q: Can I change the contract number?**
A: No, contract numbers are auto-generated and unique. This ensures no duplicates.

**Q: What if I need a different currency?**
A: Select from 10 supported currencies. For others, use USD equivalent and note in terms.

**Q: Can I delete a contract?**
A: Yes, click the 🗑️ delete button. Confirm when prompted.

**Q: How do I add my company logo to PDFs?**
A: This requires modifying the PDF generator code in `server/utils/pdfGenerator.js`.

**Q: Can multiple users access the system?**
A: Currently no authentication. For multi-user, implement user auth (future enhancement).

**Q: Where is the data stored?**
A: In MongoDB database on your server. Regular backups recommended.

**Q: Can I customize the contract template?**
A: Yes! Edit `server/utils/pdfGenerator.js` for PDF layout changes.

**Q: What if calculations seem wrong?**
A: Check browser console (F12) for errors. Verify quantity and price are numbers.

**Q: How do I print a contract?**
A: Export to PDF, then use browser's print function (Ctrl+P).

**Q: Can I email contracts directly?**
A: Not yet. Export PDF and attach to your email. (Future enhancement planned)

---

## 🆘 Troubleshooting

### Issue: Calculations Not Updating

**Solution:**
- Ensure quantity and unit price are both filled
- Check if values are numeric (no letters)
- Refresh the page and try again
- Check browser console for JavaScript errors

### Issue: Can't Create Contract

**Solution:**
- Verify all required fields (marked with *) are filled
- Check if MongoDB is running
- Review backend console for errors
- Ensure buyer, commodity, payment term, and bank are selected

### Issue: PDF Download Not Working

**Solution:**
- Check if pop-up blocker is enabled (allow pop-ups)
- Verify contract exists (try viewing in list first)
- Check backend logs for errors
- Try a different browser

### Issue: Search Returns No Results

**Solution:**
- Verify contracts exist (check total count)
- Try broader search terms
- Remove status filter
- Check spelling

---

## 📞 Getting More Help

- **Quick Start**: See `QUICKSTART.md`
- **API Details**: See `docs/API.md`
- **Architecture**: See `docs/ARCHITECTURE.md`
- **Full Documentation**: See `README.md`

---

**Happy Contract Generating! 📄✨**

Start creating professional export contracts in minutes!
