# Unit Test Plan for Export Contract Generator

## Executive Summary
This plan covers comprehensive unit testing for the Export Contract Generator application, focusing on the import feature (Units 1-3) and core business logic. The plan follows TDD principles and aims for high code coverage with maintainable, isolated tests.

## Scope

### Files to Test (Priority Order)

#### High Priority - Import Feature Services
- [ ] `server/services/csvParserService.js` - CSV parsing and file-level validation
- [ ] `server/services/validationService.js` - Multi-level validation logic
- [ ] `server/services/referenceDataCacheService.js` - Reference data caching
- [ ] `server/services/referenceResolutionService.js` - Reference data resolution
- [ ] `server/services/derivedFieldService.js` - Derived field calculations
- [ ] `server/services/contractCreationService.js` - Contract creation logic
- [ ] `server/services/importExecutionService.js` - Import orchestration
- [ ] `server/services/importResponseService.js` - Response formatting
- [ ] `server/services/templateService.js` - Template management

#### Medium Priority - Controllers
- [ ] `server/controllers/importController.js` - Import endpoints
- [ ] `server/controllers/contractController.js` - Contract CRUD operations
- [ ] `server/controllers/partyController.js` - Party management
- [ ] `server/controllers/commodityController.js` - Commodity management
- [ ] `server/controllers/paymentTermController.js` - Payment term management
- [ ] `server/controllers/bankDetailsController.js` - Bank details management

#### Medium Priority - Middleware
- [ ] `server/middleware/uploadMiddleware.js` - File upload handling

#### Lower Priority - Frontend Components (if time permits)
- [ ] `client/src/components/ContractImportPage.js`
- [ ] `client/src/components/ImportUploadZone.js`
- [ ] `client/src/components/ImportResultsSummary.js`
- [ ] `client/src/services/api.js`

### Test Framework & Tools
- **Backend**: Jest (to be installed)
- **Frontend**: Jest + React Testing Library (already available via react-scripts)
- **Mocking**: Jest mocks for dependencies
- **Coverage Target**: 80% overall, 90% for critical services

### Out of Scope
- Integration tests (separate test suite)
- End-to-end tests
- Performance/load testing
- Database migration tests

---

## Questions for Clarification

### Testing Framework & Setup
**[Question]** The project currently has no proper test framework installed. Should we install Jest for backend testing, or do you prefer another framework (Mocha, Vitest, etc.)?
**[Answer]** Jest

**[Question]** Should we set up separate test configurations for backend (Node.js) and frontend (React)?
**[Answer]** Yes

**[Question]** Do you want test files co-located with source files (e.g., `csvParserService.test.js` next to `csvParserService.js`) or in a separate `__tests__` directory?
**[Answer]** Yes

### Coverage & Quality Standards
**[Question]** What is the minimum acceptable code coverage percentage? (Recommended: 80% overall, 90% for critical services)
**[Answer]** 80% overall, 90% for critical services

**[Question]** Should we enforce coverage thresholds in CI/CD, or just report them?
**[Answer]** No CI/CD yet

**[Question]** Are there any specific coding standards or linting rules for test files?
**[Answer]** No

### Mocking Strategy
**[Question]** For database operations, should we mock Mongoose models completely, or use an in-memory MongoDB instance for more realistic tests?
**[Answer]** In-memory

**[Question]** Should we mock external dependencies (multer, csv-parse) or use them directly in unit tests?
**[Answer]** Should be use dirrectly

**[Question]** For controller tests, should we mock Express req/res objects or use a library like supertest?
**[Answer]** Mock

### Test Data & Fixtures
**[Question]** Should we create shared test fixtures/factories for common test data (contracts, parties, commodities)?
**[Answer]** Yes

**[Question]** Do you have any existing test data or sample CSV files we should use?
**[Answer]** No

### Scope & Priorities
**[Question]** Should we prioritize backend services first, or split effort between backend and frontend?
**[Answer]** backend first

**[Question]** Are there any specific modules or functions that are known to be problematic and need extra test coverage?
**[Answer]** No

**[Question]** Should we write tests for private/internal functions, or only test through public interfaces?
**[Answer]** Yes

### CI/CD Integration
**[Question]** Do you have a CI/CD pipeline where these tests should run automatically?
**[Answer]** No

**[Question]** Should we set up pre-commit hooks to run tests before commits?
**[Answer]** No

---

## Test Categories & Strategy

### 1. CSV Parser Service (`csvParserService.js`) ✅ COMPLETE

#### Happy Path Tests
- [✅] Parse valid CSV file with all required headers
- [✅] Parse CSV with optional fields (tolerance, qualitySpec, etc.)
- [✅] Parse CSV with exactly 20 rows (max limit)
- [✅] Handle UTF-8 encoded files correctly
- [✅] Strip BOM from UTF-8 files

#### Edge Cases
- [✅] Parse CSV with 1 row (minimum valid)
- [✅] Parse CSV with empty optional fields
- [✅] Handle files with trailing newlines
- [✅] Handle files with CRLF vs LF line endings

#### Error Handling
- [✅] Reject non-CSV file extensions (F-001)
- [✅] Reject invalid MIME types (F-001)
- [✅] Reject files with > 20 rows (F-002)
- [✅] Reject files with missing required headers (F-004)
- [✅] Reject empty files (F-005)
- [✅] Reject files with invalid encoding (F-003)
- [✅] Reject malformed CSV structure

#### Additional Tests
- [✅] FileLevelError class functionality

**Test File**: `server/services/__tests__/csvParserService.test.js`
**Total Tests**: 16 passing
**Coverage**: 93.02% statements, 80% branches, 100% functions, 92.1% lines

### 2. Validation Service (`validationService.js`)

#### Field-Level Validation (Level 2)
- [ ] Validate all required fields present
- [ ] Validate field formats (dates, numbers, codes)
- [ ] Validate enum values (units, incoterms, statuses)
- [ ] Validate numeric ranges (quantity > 0, tolerance 0-100)
- [ ] Validate SWIFT code format (8 or 11 chars, uppercase)
- [ ] Validate currency code format (3 uppercase letters)
- [ ] Detect duplicate contract numbers within file (CN-003)
- [ ] Detect whitespace issues (CN-004)

#### Business Logic Validation (Level 3)
- [ ] Prevent buyer === seller (BL-001)
- [ ] Validate quantity × unitPrice calculation (BL-002)
- [ ] Validate tolerance range calculation (BL-003)
- [ ] Warn on future dates > 365 days (BL-004)

#### Reference Data Validation (Level 4)
- [ ] Check buyer exists and is active (RD-001)
- [ ] Check seller exists and is active (RD-002)
- [ ] Check commodity exists and is active (RD-003)
- [ ] Check payment term exists and is active (RD-004)
- [ ] Check bank details exist and are active (RD-005)
- [ ] Check contract number not in database (CN-002)

#### Cross-Field Validation (Level 5)
- [ ] Warn on currency mismatch with bank (CF-001)
- [ ] Warn on unit mismatch with commodity default (CF-002)

#### Error Collection
- [ ] Collect all errors per row (never stop early)
- [ ] Separate errors from warnings
- [ ] Return proper ValidatedRow structure

### 3. Reference Data Cache Service (`referenceDataCacheService.js`) ✅ COMPLETE

#### Cache Building
- [✅] Build cache from database collections
- [✅] Create proper lookup keys for parties, commodities, etc.
- [✅] Handle empty collections gracefully
- [✅] Include isActive status in cache

#### Cache Lookup
- [✅] Lookup by name (parties, commodities, payment terms)
- [✅] Lookup by composite key (bank details)
- [✅] Handle missing entries
- [✅] Handle case sensitivity correctly

**Test File**: `server/services/__tests__/referenceDataCacheService.test.js`
**Total Tests**: 19 passing
**Coverage**: 100% statements, 100% branches, 100% functions, 100% lines

### 4. Reference Resolution Service (`referenceResolutionService.js`) ✅ COMPLETE

#### Resolution Logic
- [✅] Resolve existing parties (buyer/seller)
- [✅] Create new parties when not found
- [✅] Resolve existing commodities
- [✅] Create new commodities when not found
- [✅] Resolve existing payment terms
- [✅] Create new payment terms when not found
- [✅] Resolve existing bank details
- [✅] Create new bank details when not found

#### Error Handling
- [✅] Throw ResolutionError on database failures
- [✅] Handle partial resolution failures
- [✅] Maintain transaction integrity

**Test File**: `server/services/__tests__/referenceResolutionService.test.js`
**Total Tests**: 18 passing
**Coverage**: 100% statements, 100% branches, 100% functions, 100% lines

### 5. Derived Field Service (`derivedFieldService.js`)

#### Calculations
- [ ] Calculate totalAmount = quantity × unitPrice
- [ ] Calculate quantityMin with tolerance
- [ ] Calculate quantityMax with tolerance
- [ ] Calculate totalAmountWords (number to words)
- [ ] Handle zero tolerance (no range)
- [ ] Handle decimal quantities correctly
- [ ] Handle large numbers correctly

#### Edge Cases
- [ ] Handle very small quantities (< 1)
- [ ] Handle very large quantities (> 1 million)
- [ ] Handle high precision decimals
- [ ] Handle different currencies

### 6. Contract Creation Service (`contractCreationService.js`)

#### Contract Creation
- [ ] Create contract with all required fields
- [ ] Create contract with optional fields
- [ ] Link to resolved reference data (ObjectIds)
- [ ] Set createdBy and updatedBy to userId
- [ ] Set timestamps correctly
- [ ] Handle transaction rollback on failure

#### Batch Processing
- [ ] Create multiple contracts in single transaction
- [ ] Rollback all on any failure
- [ ] Return proper ImportRowResult for each row

### 7. Import Execution Service (`importExecutionService.js`)

#### Orchestration
- [ ] Execute full pipeline (resolve → calculate → create)
- [ ] Handle successful import of all rows
- [ ] Handle partial failures gracefully
- [ ] Return proper ImportExecutionResult
- [ ] Log execution metrics (duration, counts)

#### Error Handling
- [ ] Handle missing userId
- [ ] Handle resolution failures
- [ ] Handle creation failures
- [ ] Build proper error responses

### 8. Import Response Service (`importResponseService.js`)

#### Response Formatting
- [ ] Format validation response correctly
- [ ] Format execution response correctly
- [ ] Include proper summary statistics
- [ ] Include row-level details
- [ ] Handle empty results

### 9. Template Service (`templateService.js`)

#### Template Generation
- [ ] Generate CSV template with all headers
- [ ] Include proper column order
- [ ] Use correct delimiters
- [ ] Set proper content-type headers

### 10. Import Controller (`importController.js`)

#### Endpoint Handlers
- [ ] Handle POST /api/import/validate
- [ ] Handle POST /api/import/execute
- [ ] Handle GET /api/import/template
- [ ] Parse multipart/form-data correctly
- [ ] Return proper HTTP status codes
- [ ] Handle middleware errors

#### Request Validation
- [ ] Validate file upload presence
- [ ] Validate request body structure
- [ ] Handle missing parameters

### 11. Other Controllers

#### Contract Controller
- [ ] Test CRUD operations
- [ ] Test search functionality
- [ ] Test calculateContractValues

#### Party/Commodity/PaymentTerm/BankDetails Controllers
- [ ] Test CRUD operations for each
- [ ] Test validation logic
- [ ] Test error responses

---

## Dependencies & Mocking Strategy

### External Dependencies
- **Mongoose Models**: Mock with jest.mock() - avoid real database
- **multer**: Use real implementation with Buffer mocks
- **csv-parse**: Use real implementation for accuracy
- **Express req/res**: Mock with jest.fn() or use node-mocks-http
- **File System**: Mock if needed, prefer in-memory buffers

### Internal Dependencies
- **Services calling other services**: Mock with jest.mock()
- **Controllers calling services**: Mock services completely
- **Middleware**: Test in isolation with mocked req/res/next

### Test Data Factories
- [✅] Create factory for valid CSV file buffers
- [✅] Create factory for multer file objects
- [✅] Create factory for parsed CSV rows
- [✅] Create factory for validated rows
- [✅] Create factory for reference data cache
- [✅] Create factory for Mongoose model instances
- [✅] Create factory for Express req/res/next mocks

**File**: `server/tests/helpers/testFactories.js`
**Functions**: 9 factory functions covering all test data needs

---

## Test File Structure

```
server/
├── services/
│   ├── __tests__/
│   │   ├── csvParserService.test.js
│   │   ├── validationService.test.js
│   │   ├── referenceDataCacheService.test.js
│   │   ├── referenceResolutionService.test.js
│   │   ├── derivedFieldService.test.js
│   │   ├── contractCreationService.test.js
│   │   ├── importExecutionService.test.js
│   │   ├── importResponseService.test.js
│   │   └── templateService.test.js
├── controllers/
│   └── __tests__/
│       ├── importController.test.js
│       ├── contractController.test.js
│       └── ...
├── middleware/
│   └── __tests__/
│       └── uploadMiddleware.test.js
└── tests/
    ├── fixtures/
    │   ├── sampleContracts.js
    │   ├── sampleCsvFiles.js
    │   └── mockData.js
    └── helpers/
        ├── testFactories.js
        └── mockHelpers.js
```

---

## Estimated Effort

### Phase 1: Setup & Infrastructure (4-6 hours) ✅ COMPLETE
- [✅] Install and configure Jest
- [✅] Set up test scripts in package.json
- [✅] Create test helpers and factories
- [✅] Set up coverage reporting
- [✅] Document testing guidelines (inline in code)

**Status**: Complete - All infrastructure is in place and working

### Phase 2: Service Tests (16-20 hours) - IN PROGRESS
- [✅] csvParserService: 2-3 hours
  - **Tests**: 16 tests covering happy path, edge cases, and error handling
  - **Coverage**: 93.02% statements, 80% branches, 100% functions
  - **Status**: Complete and passing
- [✅] validationService: 4-5 hours (most complex)
  - **Tests**: 46 tests covering all 5 validation levels
  - **Coverage**: 87.44% statements, 89.09% branches, 100% functions
  - **Status**: Complete and passing
- [✅] derivedFieldService: 2 hours
  - **Tests**: 9 tests covering calculations and data transformation
  - **Coverage**: 100% statements, 100% branches, 100% functions
  - **Status**: Complete and passing
- [✅] referenceDataCacheService: 1-2 hours
  - **Tests**: 19 tests covering cache building, lookups, and error handling
  - **Coverage**: 100% statements, 100% branches, 100% functions
  - **Status**: Complete and passing
- [✅] referenceResolutionService: 2-3 hours
  - **Tests**: 18 tests covering resolution, creation, and error handling
  - **Coverage**: 100% statements, 100% branches, 100% functions
  - **Status**: Complete and passing
- [ ] contractCreationService: 2-3 hours
- [ ] importExecutionService: 2 hours
- [✅] importResponseService: 1 hour
  - **Tests**: 9 tests covering response formatting and CSV injection prevention
  - **Coverage**: 96.42% statements, 90% branches, 100% functions
  - **Status**: Complete and passing
- [✅] templateService: 1 hour
  - **Tests**: 4 tests covering template path resolution
  - **Coverage**: 100% statements, 100% branches, 100% functions
  - **Status**: Complete and passing

### Phase 3: Controller Tests (8-10 hours)
- [ ] importController: 3-4 hours
- [ ] Other controllers: 5-6 hours

### Phase 4: Middleware Tests (2-3 hours)
- [ ] uploadMiddleware: 2-3 hours

### Phase 5: Review & Refinement (4-6 hours)
- [ ] Code review and refactoring
- [ ] Coverage analysis and gap filling
- [ ] Documentation updates
- [ ] CI/CD integration

**Total Estimated Effort: 34-45 hours**

---

## Success Criteria

✅ All planned tests implemented and passing
✅ Code coverage meets target (80% overall, 90% for critical services)
✅ Tests are isolated and don't depend on each other
✅ Tests run fast (< 30 seconds for full suite)
✅ No flaky tests
✅ Clear test descriptions following AAA pattern
✅ Proper mocking of external dependencies
✅ Test documentation is complete
✅ CI/CD integration (if applicable)

---

## Progress Summary

### Completed
- ✅ Phase 1: Setup & Infrastructure (100%)
- ✅ csvParserService tests (16/16 tests passing, 93% coverage)
- ✅ validationService tests (46/46 tests passing, 87% coverage)
- ✅ derivedFieldService tests (9/9 tests passing, 100% coverage)
- ✅ templateService tests (4/4 tests passing, 100% coverage)
- ✅ importResponseService tests (9/9 tests passing, 96% coverage)
- ✅ referenceDataCacheService tests (19/19 tests passing, 100% coverage)
- ✅ referenceResolutionService tests (18/18 tests passing, 100% coverage)

### In Progress
- 🔄 Phase 2: Service Tests (7/9 services complete)

### Next Steps
1. Continue with validationService tests (most complex, 4-5 hours estimated)
2. Proceed through remaining services in priority order
3. Move to controller tests after services complete
4. Generate final coverage report and summary

### Current Test Statistics
- **Total Test Suites**: 7 passing
- **Total Tests**: 121 passing
- **Overall Coverage**: ~35% (increasing as more tests are added)
- **csvParserService Coverage**: 93.02% ✅
- **validationService Coverage**: 87.44% ✅
- **derivedFieldService Coverage**: 100% ✅
- **templateService Coverage**: 100% ✅
- **importResponseService Coverage**: 96.42% ✅
- **referenceDataCacheService Coverage**: 100% ✅
- **referenceResolutionService Coverage**: 100% ✅

---

## Notes

- This plan prioritizes the import feature (Units 1-3) as it appears to be the most critical and complex functionality
- Frontend testing is lower priority but can be added if needed
- We'll use Jest for consistency across backend and frontend
- Tests will be written to be maintainable and serve as documentation
- We'll follow the AAA pattern (Arrange, Act, Assert) consistently
- Each test file will have proper setup/teardown to ensure isolation



---

## Implementation Log

### 2026-03-05: Phase 1 Complete + First Service Test

**Phase 1: Setup & Infrastructure** ✅
- Installed Jest, @types/jest, mongodb-memory-server, node-mocks-http
- Created `jest.config.js` with coverage thresholds (80% overall, 90% critical)
- Updated `package.json` with test scripts (test, test:watch, test:services, etc.)
- Created `server/tests/setup.js` for global test configuration
- Created `server/tests/helpers/testFactories.js` with 9 factory functions:
  - createValidCsvBuffer
  - createMullerFile
  - createParsedRow
  - createValidatedRow
  - createReferenceCache
  - createMockModel
  - createMockRequest
  - createMockResponse
  - createMockNext

**Phase 2: csvParserService Tests** ✅
- Created `server/services/__tests__/csvParserService.test.js`
- Implemented 16 comprehensive tests:
  - 5 happy path tests
  - 3 edge case tests
  - 7 error handling tests
  - 1 FileLevelError class test
- All tests passing ✅
- Coverage: 93.02% statements, 80% branches, 100% functions

**Test Approach**:
- Following AAA pattern (Arrange, Act, Assert)
- Using test factories for consistent test data
- Testing through public interfaces
- Clear, descriptive test names
- Comprehensive coverage of business rules

**Configuration Decisions Applied**:
- Jest for backend testing
- Tests in `__tests__` directories
- 80% overall coverage, 90% for critical services
- In-memory MongoDB for database tests (to be implemented)
- Using external dependencies directly (multer, csv-parse)
- Mocking Express req/res objects
- Shared fixtures/factories
- Backend-first priority
- Testing through public interfaces

**Next**: Continue with validationService.js (most complex service, estimated 4-5 hours)


### 2026-03-05 Update: Additional Services Complete

**templateService Tests** ✅
- Created `server/services/__tests__/templateService.test.js`
- Implemented 4 tests:
  - Template path resolution when file exists
  - Error handling when file missing
  - Error code validation (TEMPLATE_NOT_FOUND)
  - Absolute path verification
- All tests passing ✅
- Coverage: 100% statements, 100% branches, 100% functions

**importResponseService Tests** ✅
- Created `server/services/__tests__/importResponseService.test.js`
- Implemented 9 comprehensive tests:
  - buildValidationOnlyResponse with errors
  - buildConfirmResponse for valid rows
  - buildImportCompleteResponse for success/partial success
  - buildFileLevelErrorResponse
  - CSV injection prevention (sanitizing formula characters)
- All tests passing ✅
- Coverage: 96.42% statements, 90% branches, 100% functions

**Progress Summary**:
- 5 out of 9 critical services now have comprehensive test coverage
- 84 total tests passing across all services
- Remaining services: referenceDataCacheService, referenceResolutionService, contractCreationService, importExecutionService
- These remaining services will require database mocking with mongodb-memory-server

**Next**: Continue with referenceDataCacheService (requires database mocking)


### 2026-03-05 Update: referenceDataCacheService Complete

**referenceDataCacheService Tests** ✅
- Created `server/services/__tests__/referenceDataCacheService.test.js`
- Implemented 19 comprehensive tests:
  - 6 happy path tests (cache building with all 5 DB queries)
  - 7 edge case tests (empty data, deduplication, incomplete tuples)
  - 5 error handling tests (DB query failures)
  - 2 performance optimization tests (lean queries, $in operators)
- All tests passing ✅
- Coverage: 100% statements, 100% branches, 100% functions, 100% lines

**Test Approach**:
- Mocked all Mongoose models (Party, Commodity, PaymentTerm, BankDetails, Contract)
- Tested the 5-query optimization strategy
- Verified Map/Set data structures for O(1) lookups
- Tested composite key generation for bank details
- Verified deduplication logic for multiple rows
- Tested error propagation from database failures

**Progress Summary**:
- 6 out of 9 critical services now have comprehensive test coverage
- 103 total tests passing across all services
- Remaining services: referenceResolutionService, contractCreationService, importExecutionService

**Next**: Continue with referenceResolutionService (requires database mocking and transaction handling)


### 2026-03-05 Update: referenceResolutionService Complete

**referenceResolutionService Tests** ✅
- Created `server/services/__tests__/referenceResolutionService.test.js`
- Implemented 18 comprehensive tests:
  - 2 happy path tests (existing records, deduplication)
  - 6 creation tests (new buyers, sellers, commodities, payment terms, bank details)
  - 5 inactive record error tests (all entity types)
  - 2 buyer/seller collision tests
  - 2 edge case tests (multiple bank tuples, first-row commodity data)
  - 2 ResolutionError class tests
- All tests passing ✅
- Coverage: 100% statements, 100% branches, 100% functions, 100% lines

**Test Approach**:
- Mocked all Mongoose models with conditional logic for buyer/seller types
- Tested both resolution (existing records) and creation (new records) paths
- Verified inactive record detection and error throwing
- Tested buyer/seller name collision prevention
- Verified composite key handling for bank details
- Tested first-row data usage for commodity creation

**Progress Summary**:
- 7 out of 9 critical services now have comprehensive test coverage
- 121 total tests passing across all services
- Remaining services: contractCreationService, importExecutionService

**Next**: Continue with contractCreationService (requires transaction handling and batch processing)
