# Functional Design Plan — Unit 3: Import Execution & Results Service

## Unit
Unit 3 — Import Execution & Results Service  
Stories: US-004  
Story Points: 8

---

## Plan Steps

- [x] Step 1: Clarify business logic ambiguities (questions below)
- [x] Step 2: Define domain entities and data structures
- [x] Step 3: Model the import execution workflow
- [x] Step 4: Define reference data resolution logic
- [x] Step 5: Define transaction and error handling rules
- [x] Step 6: Define result formatting logic
- [x] Step 7: Generate functional design artifacts

---

## Questions for Clarification

### Business Logic — Impact of All-or-Nothing Strategy

**Q1 — Transaction Scope**
Unit 2 uses all-or-nothing: if any row is invalid, no import happens. Given that Unit 3 only receives fully-validated rows, should Unit 3 also apply all-or-nothing at the DB level?

[Answer]: Yes

> Option A: All-or-nothing — wrap all contract creations in a single transaction; if any contract fails to save, roll back everything
> Option B: Per-row independent — each contract is its own transaction; if one fails, others still commit (partial success possible at DB level)

---

**Q2 — Reference Data Creation: Case Sensitivity**
Unit 2 uses exact case-sensitive lookup for validation. Unit 3 creates or reuses reference data. When Unit 3 looks up existing reference data before creating, should it use:

[Answer]: Exact case-sensitive match (consistent with Unit 2)

> Option A: Exact case-sensitive match (consistent with Unit 2)
> Option B: Case-insensitive match (more forgiving at creation time)

---

**Q3 — Reference Data Creation: Buyer/Seller Party Type**
The Party model has a `type` field: BUYER or SELLER. If a name appears as both a buyer in one row and a seller in another row of the same import file, should Unit 3:

[Answer]: Fail both rows — same name cannot be both buyer and seller

> Option A: Create two separate Party records (one BUYER, one SELLER) with the same name
> Option B: Reuse the same Party record regardless of type (ignore type field)
> Option C: Fail both rows — same name cannot be both buyer and seller

---

**Q4 — Reference Data Creation: PaymentTerm Fields**
The PaymentTerm model requires `name`, `description`, and `terms` fields. The CSV only provides `paymentTermName`. When creating a new PaymentTerm:

[Answer]: Set `name` to `paymentTermName`, set `description` and `terms` to a placeholder like "Imported"

> Option A: Set all three fields (`name`, `description`, `terms`) to the value of `paymentTermName`
> Option B: Set `name` to `paymentTermName`, leave `description` and `terms` empty/null
> Option C: Set `name` to `paymentTermName`, set `description` and `terms` to a placeholder like "Imported"

---

**Q5 — Reference Data Creation: Party Address**
The Party model requires an `address` field (required: true in schema). The CSV does not include address. When creating a new Party (buyer/seller):

[Answer]: Option A: Set address to a placeholder like "To be updated"

> Option A: Set address to a placeholder like "To be updated"
> Option B: Set address to empty string "" (may violate schema required constraint)
> Option C: Make address optional in the import context — skip the required constraint

---

**Q6 — Audit Trail: createdBy Field**
US-004 AC-013 says each imported contract should have `createdBy` set to the current admin user. How is the admin user identity passed to Unit 3?

[Answer]: Unit 2 passes the userId as a parameter to `executeImport(validatedRows, userId)

> Option A: Unit 2 passes the userId as a parameter to `executeImport(validatedRows, userId)`
> Option B: Unit 3 reads the user from the request context/session directly
> Option C: Set `createdBy` to a fixed string like "import" for all imported contracts

---

**Q7 — Post-Import Navigation**
US-004 AC-012 says the user should be redirected to the contract list page after import. Since Unit 3 is backend-only, this is a frontend concern. Should Unit 3's response include any redirect hint?

[Answer]:  No — the frontend handles navigation after receiving the success response from Unit 2

> Option A: No — the frontend handles navigation after receiving the success response from Unit 2
> Option B: Yes — include a `redirectTo` field in the response (e.g., `"/contracts"`)

---

**Q8 — totalAmountText Calculation**
The Contract model has a `totalAmountText` field (amount in words, e.g., "Four Hundred Fifty Thousand US Dollars"). The existing `numberToText` utility generates this. Should Unit 3 use this utility?

[Answer]: Yes — call the existing `numberToText(totalAmount, currency)` utility

> Option A: Yes — call the existing `numberToText(totalAmount, currency)` utility
> Option B: No — leave `totalAmountText` empty for imported contracts
> Option C: Set `totalAmountText` to the numeric string (e.g., "450000 USD")

---

**Q9 — paymentTermText Field**
The Contract model requires `paymentTermText`. When creating a contract via import, what should this field be set to?

[Answer]:  Set to the `paymentTermName` value from the CSV row

> Option A: Set to the `paymentTermName` value from the CSV row
> Option B: Set to the PaymentTerm's `terms` field value after lookup/creation
> Option C: Set to empty string

---

## Storage Location
This plan is stored at: `aidlc-docs/construction/plans/unit-3-import-execution-functional-design-plan.md`

---

**Created**: March 4, 2026
**Unit**: Unit 3 — Import Execution & Results Service
**Status**: ⏳ Awaiting answers to questions above
