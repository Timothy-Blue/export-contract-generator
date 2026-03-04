# Contract Import Feature - Unit Grouping Plan

## Objective
Group the user stories from the import-feature folder into multiple independent units that can be built by separate teams. Each unit should contain highly cohesive user stories with loose coupling between units.

## Analysis Summary

After reviewing the 5 user stories (US-001 through US-005), I've identified the following characteristics:
- **US-001**: Download CSV Template (1 point) - Static file download
- **US-002**: Upload CSV File (2 points) - File upload and basic validation
- **US-003**: Validate and Import Data (13 points) - Core validation and conditional import
- **US-004**: Import Execution and Results (8 points) - Transaction management and results display
- **US-005**: Handle Import Errors (2 points) - Error message display

**Total Story Points**: 26

## Proposed Unit Grouping

### [Question] Unit Grouping Strategy
Based on the analysis, I see two possible approaches for grouping:

**Option A: Functional Separation (3 Units)**
- Unit 1: Template Management (US-001)
- Unit 2: File Upload & Validation (US-002, US-003, US-005)
- Unit 3: Import Execution & Results (US-004)

**Option B: Vertical Slice (2 Units)**
- Unit 1: Frontend & File Handling (US-001, US-002, US-005)
- Unit 2: Backend Processing (US-003, US-004)

**Option C: Single Integrated Unit (1 Unit)**
- Unit 1: Complete Import Feature (US-001 through US-005)

Which grouping strategy do you prefer? Or would you like a different approach?

**[Answer]**: Option A: Functional Separation (3 Units)

---

### [Question] Integration Points
The user stories have the following dependencies:
- US-002 depends on US-001 (users need template to prepare data)
- US-003 depends on US-002 (validation happens after upload)
- US-004 depends on US-003 (import happens after validation)
- US-005 is used by US-003 and US-004 (error display)

Should the integration contract focus on:
1. API endpoints between frontend and backend?
2. Service boundaries within the backend?
3. Both frontend-backend and internal service boundaries?

**[Answer]**: 3. Both frontend-backend and internal service boundaries?

---

### [Question] Reference Data Creation
US-003 and US-004 mention automatic creation of reference data (Buyer, Seller, Commodity, PaymentTerm, BankDetails). Should this be:
1. Part of the import unit (tightly coupled)
2. A separate "Reference Data Service" unit that import calls
3. Handled by existing reference data management features

**[Answer]**: 3. Handled by existing reference data management features

---

### [Question] Scope Clarification
Should the unit grouping include:
1. Only the 5 user stories in the import-feature folder?
2. Also consider integration with existing contract management features?
3. Consider future enhancements mentioned in the README?

**[Answer]**: 1. Only the 5 user stories in the import-feature folder?

---

## Finalized Unit Grouping (Step 1 Complete)

### Unit 1: Template Management Service
**Purpose**: Provide CSV template for contract import preparation

**User Stories**:
- US-001: Download CSV Template (1 point)

**Responsibilities**:
- Serve static CSV template file
- Provide template with sample data and proper formatting
- Ensure template matches current CSV specification

**Story Points**: 1

**Team Size**: Can be handled by 1 developer (minimal effort)

---

### Unit 2: File Upload & Validation Service
**Purpose**: Handle file upload, validation, and error reporting

**User Stories**:
- US-002: Upload CSV File for Import (2 points)
- US-003: Validate and Import CSV Data (13 points)
- US-005: Handle Import Errors (2 points)

**Responsibilities**:
- Accept CSV file uploads from frontend
- Perform file-level validation (format, size, encoding)
- Execute 5-level validation (field, business logic, reference data, cross-field)
- Display validation results and errors
- Trigger import for valid rows (conditional or automatic)
- Provide clear error messages to users

**Story Points**: 17

**Team Size**: Requires 2-3 developers (most complex unit)

---

### Unit 3: Import Execution & Results Service
**Purpose**: Execute contract import with transaction management and format results (Backend Internal Only)

**User Stories**:
- US-004: Import Execution and Results (8 points)

**Responsibilities**:
- Execute import for validated contracts (called by Unit 2)
- Manage transactions for data integrity
- Create contracts and link to reference data
- Handle reference data creation via existing services
- Format import results and statistics
- Generate error reports
- Provide data for frontend to redirect to contract list

**Exposure**: Internal functions only (no public APIs)

**Story Points**: 8

**Team Size**: Requires 1-2 developers

---

## Unit Boundaries & Dependencies

### Unit Dependencies:
1. **Unit 1** → Standalone (no dependencies on other units)
2. **Unit 2** → Calls Unit 3 functions internally for import execution
3. **Unit 3** → Depends on existing Reference Data services and Contract Management

### External Dependencies:
- **Reference Data Services**: Party (Buyer/Seller), Commodity, PaymentTerm, BankDetails
- **Contract Management**: Contract creation and storage
- **Authentication**: Admin role verification

### Integration Points:

**Public APIs (Frontend ↔ Backend):**
- Frontend → Unit 1: `GET /api/import/template` - Download CSV template
- Frontend → Unit 2: `POST /api/import/upload` - Upload CSV file, validate, import, and return results

**Internal Functions (Backend Only):**
- Unit 2 → Unit 3: `executeImport(validatedData)` - Execute import for validated rows
- Unit 2 → Unit 3: `generateResults(importResults)` - Format results for response

**Note**: Unit 3 has NO public APIs. It exposes only internal functions callable by Unit 2. The upload API handles the entire workflow and returns complete results in a single request/response.

---

## Rationale for Grouping Decisions

### Why Functional Separation (Option A)?
1. **Clear Separation of Concerns**: Each unit has a distinct responsibility
2. **Independent Development**: Teams can work on different aspects simultaneously
3. **Scalability**: Validation logic (Unit 2) can be scaled independently if needed
4. **Testability**: Each unit can be tested in isolation
5. **Maintainability**: Changes to validation rules don't affect import execution

**Status**: ⏳ Step 1 Complete - Awaiting Confirmation  
**Next Action**: Review Step 1 results and approve to proceed to Step 2  
**Created**: March 4, 2026  
**Last Updated**: March 4, 2026ny developer
- Could be served directly from frontend if needed

### Why Unit 2 Combines Upload, Validation, and Errors?
- High cohesion: All related to data validation workflow
- Validation and error handling are tightly coupled
- Upload triggers validation immediately
- Single team can own the entire validation experience

### Why Unit 3 is Separate?
- Import execution has different concerns than validation
- Transaction management is complex and isolated
- Can be optimized independently for performance
- Clear handoff point after validation completes

### Deployment Strategy:
- All 3 units deployed together as a monolithic backend
- Internal communication via function calls (not HTTP)
- Only 2 public APIs exposed for frontend integration:
  - GET /api/import/template (Unit 1)
  - POST /api/import/upload (Unit 2, which internally calls Unit 3)
- Unit 3 has no public APIs - backend internal only
- Shared database and transaction context
- Single request/response cycle for upload → validate → import → results

---

## Plan Steps

### Step 1: Finalize Unit Grouping Strategy ✅
- [x] Review answers to questions above
- [x] Confirm the unit grouping approach
- [x] Identify unit boundaries and responsibilities
- [x] Document rationale for grouping decisions

### Step 2: Create Unit Definitions ⬜
- [ ] Define each unit with clear purpose and scope
- [ ] List user stories included in each unit
- [ ] Identify unit dependencies
- [ ] Define unit interfaces (APIs, events, data contracts)

### Step 3: Write Unit User Stories ⬜
For each unit:
- [ ] Create /inception/units/[unit-name]/ folder
- [ ] Write unit_overview.md with unit description
- [ ] Copy and adapt relevant user stories to unit folder
- [ ] Ensure acceptance criteria are unit-specific
- [ ] Document any changes from original user stories

### Step 4: Define Integration Contracts ⬜
- [ ] Identify all integration points between units
- [ ] Define API endpoints for each unit
- [ ] Specify request/response formats
- [ ] Define error handling contracts
- [ ] Document authentication/authorization requirements
- [ ] Create /inception/units/integration_contract.md

### Step 5: Validate Unit Independence ⬜
- [ ] Verify each unit can be built independently
- [ ] Check that units are loosely coupled
- [ ] Ensure high cohesion within each unit
- [ ] Validate that integration contracts are complete
- [ ] Review for missing dependencies

### Step 6: Review and Approval ⬜
- [ ] Self-review all unit definitions
- [ ] Verify alignment with original user stories
- [ ] Check completeness of integration contracts
- [ ] Request user review and approval
- [ ] Address any feedback

### Step 7: Finalize Documentation ⬜
- [ ] Create index file for units folder
- [ ] Update references in main README
- [ ] Ensure all files are properly formatted
- [ ] Add any additional documentation needed

## Deliverables

Upon completion, the following structure will be created:

```
/inception/units/
├── README.md (index of all units)
├── integration_contract.md (API definitions)
├── unit-1-[name]/
│   ├── unit_overview.md
│   ├── user_story_1.md
│   └── user_story_2.md
├── unit-2-[name]/
│   ├── unit_overview.md
│   └── user_story_3.md
└── unit-3-[name]/
    ├── unit_overview.md
    └── user_story_4.md
```

## Success Criteria

- [ ] All user stories are grouped into logical units
- [ ] Each unit has clear boundaries and responsibilities
- [ ] Units are loosely coupled with well-defined interfaces
- [ ] User stories within each unit are highly cohesive
- [ ] Integration contracts are complete and unambiguous
- [ ] Each unit can be built by a single team independently
- [ ] No technical design details included (as per requirements)

## Notes

- This plan focuses on grouping and organizing user stories only
- No technical systems design will be performed at this stage
- Integration contracts will define "what" APIs are needed, not "how" they're implemented
- Unit grouping should enable parallel development by multiple teams
- Each unit should be deployable and testable independently (where possible)

---

**Status**: ⏳ Awaiting Answers to Questions  
**Next Action**: Please answer the questions above so I can proceed with the appropriate grouping strategy  
**Created**: March 4, 2026  
**Last Updated**: March 4, 2026
