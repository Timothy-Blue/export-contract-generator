# US-002: Upload CSV File for Import

## Unit
Unit 2 - File Upload & Validation Service

## User Story
As an admin user
I want to upload a CSV file containing contract data
So that I can import multiple contracts into the system efficiently

## Acceptance Criteria

### AC-001: File Upload Interface
- Given I am logged in as an admin user
- When I navigate to the contract import page
- Then I should see a file upload component with:
  - A "Choose File" or drag-and-drop area
  - Clear instructions about file requirements
  - Accepted file format indication (.csv)

### AC-002: File Selection
- Given I am on the contract import page
- When I click "Choose File" or drag a file into the upload area
- Then I should be able to:
  - Browse my local file system
  - Select a CSV file
  - See the selected filename displayed

### AC-003: File Type Validation
- Given I have selected a file for upload
- When the file is not a CSV file (e.g., .xlsx, .txt, .pdf)
- Then I should see an error message: "Invalid file format. Please upload a CSV file."
- And the upload should not proceed

### AC-004: File Size Validation
- Given I have selected a CSV file for upload
- When the file contains more than 20 data rows (excluding header)
- Then I should see an error message: "File exceeds maximum limit of 20 rows. Please split into multiple files."
- And the upload should not proceed

### AC-005: Empty File Validation
- Given I have selected a CSV file for upload
- When the file contains only headers or is completely empty
- Then I should see an error message: "File is empty. Please add at least one contract row."
- And the upload should not proceed

### AC-006: Automatic Processing After Upload
- Given I have selected a valid CSV file (correct format, within size limit, has data)
- When I click the "Upload" button
- Then the file should be:
  - Uploaded to the server
  - Automatically sent for validation and import
  - No preview or confirmation required
- And I should see a loading state while processing

### AC-007: Simple Loading State
- Given I have initiated a file upload
- When the file is being uploaded and processed
- Then I should see:
  - A simple loading spinner or message
  - Disabled upload button to prevent duplicate submissions

### AC-008: Upload Error Handling
- Given I have initiated a file upload
- When a server error occurs during upload or parsing
- Then I should see:
  - A clear error message explaining what went wrong
  - The ability to select a different file and try again

### AC-009: File Requirements Display
- Given I am on the contract import page
- When I view the upload interface
- Then I should see clear information about:
  - Maximum file size (20 rows)
  - Required file format (CSV, UTF-8)
  - Link to download template (Unit 1)

## Business Rules
- Only admin users can access the upload feature
- Only CSV files are accepted
- Maximum 20 rows per file (excluding header row)
- File must be UTF-8 encoded
- File must contain the required header row
- Only one upload at a time (no concurrent uploads)
- Upload automatically triggers validation and import (no preview step)
- User cannot upload another file until current import completes

## Story Points
2
