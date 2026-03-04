# US-001: Download CSV Template

## User Story
As an admin user  
I want to download a CSV template with sample data  
So that I can understand the required format and prepare my contract data for import

## Description
The system should provide a downloadable CSV template that includes:
- All required and optional column headers
- Sample data rows demonstrating proper formatting
- Clear examples of reference data (buyer, seller, commodity, etc.)

## Acceptance Criteria

### AC-001: Template Download Button
- Given I am logged in as an admin user
- When I navigate to the contract import page
- Then I should see a "Download CSV Template" button prominently displayed

### AC-002: Template File Download
- Given I click the "Download CSV Template" button
- When the download initiates
- Then the static CSV file "contract_import_template.csv" should be downloaded to my device

### AC-003: Template Structure
- Given I open the downloaded template file
- When I view the contents
- Then I should see:
  - A header row with all 25 required column names
  - At least 2 sample data rows with realistic example values
  - Proper CSV formatting (UTF-8 encoding, comma-delimited)

### AC-004: Template Column Headers
- Given I open the downloaded template file
- When I examine the header row
- Then it should contain exactly these columns in order:
  - contractNumber
  - contractDate
  - buyerName
  - sellerName
  - commodityName
  - commodityDescription
  - quantity
  - unit
  - tolerance
  - origin
  - packing
  - qualitySpec
  - unitPrice
  - currency
  - incoterm
  - portLocation
  - paymentTermName
  - bankName
  - accountName
  - accountNumber
  - swiftCode
  - shipmentPeriod
  - additionalTerms
  - releaseType
  - status

### AC-005: Sample Data Quality
- Given I open the downloaded template file
- When I review the sample data rows
- Then each sample should:
  - Demonstrate proper date format (YYYY-MM-DD)
  - Show valid enum values (incoterm, unit, status, releaseType)
  - Include realistic business data
  - Pass all validation rules defined in the system

### AC-006: Template Accessibility
- Given I am on the contract import page
- When I look for the download template option
- Then it should be:
  - Clearly labeled and easy to find
  - Available before I upload any file
  - Accessible without requiring any prior data entry

## Business Rules
- Template is a static CSV file stored in the application
- Sample data should use realistic but fictional company names
- Template file should be updated manually when CSV specification changes
- No authentication token or sensitive data should be included in the template

## Dependencies
- CSV template specification document
- Contract model schema
- Reference data models (Party, Commodity, PaymentTerm, BankDetails)

## Notes
- Template serves as both documentation and a starting point for users
- Sample data helps users understand expected formats without reading documentation
- Users can delete sample rows and add their own data
- Template file should be updated manually when CSV specification changes
- Static file approach is simpler and faster than dynamic generation

## Priority
High - This is the entry point for the import feature

## Estimated Story Points
1

## Estimation Rationale
**Reduced from 3 to 1 points** due to static file approach:
- No dynamic generation logic needed
- Simple file download link/button
- Static CSV file stored in public assets
- Minimal backend involvement (or none if served from frontend)
- Very low complexity and effort
