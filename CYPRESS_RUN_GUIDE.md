# Cypress UI Test - Quick Start Guide

## Overview

Cypress is now configured to run UI tests only, focusing on the happy path scenario for contract import.

## What's Included

- **Single Test File**: `cypress/e2e/01-happy-path.cy.js`
- **Test Scenario**: Complete contract import workflow through the UI
- **Test URL**: http://localhost:3000

## Prerequisites

1. Your application must be running on `http://localhost:3000`
2. MongoDB must be running and accessible
3. Cypress must be installed (run `npm install` if needed)

## Running the Test

### Option 1: Command Prompt (Recommended)

Open Command Prompt and run:

```cmd
cd C:\Users\ntq\Downloads\export-contract-generator
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/01-happy-path.cy.js"
```

### Option 2: Use the Batch Script

Double-click `run-cypress.cmd` in Windows Explorer

### Option 3: Interactive UI Mode

To see the test running in a visible browser:

```cmd
cd C:\Users\ntq\Downloads\export-contract-generator
node_modules\.bin\cypress.cmd open
```

Or double-click `run-cypress-ui.cmd`

### Option 4: NPM Script

From Command Prompt:

```cmd
npm run test:e2e
```

## Test Flow

The happy path test performs these UI actions:

1. ✓ Visit http://localhost:3000
2. ✓ Navigate to Import Contracts page
3. ✓ Verify upload zone is visible
4. ✓ Upload valid CSV file (valid-contracts.csv)
5. ✓ Click upload button
6. ✓ Wait for file processing
7. ✓ Verify confirmation dialog shows 3 valid contracts
8. ✓ Click confirm import button
9. ✓ Wait for import completion
10. ✓ Verify success message and results summary
11. ✓ Verify contracts are created in database

## Before Running Tests

Make sure your application is running:

```cmd
# Terminal 1: Start the server
npm start

# Terminal 2: Run Cypress test
npm run test:e2e
```

## Troubleshooting

**PowerShell Execution Policy Error**
- Use Command Prompt (cmd.exe) instead of PowerShell
- Or run the `.cmd` batch files directly

**Application Not Running**
- Start your application first: `npm start`
- Verify it's accessible at http://localhost:3000

**Cypress Not Installed**
- Run: `npm install`

**Database Connection Issues**
- Ensure MongoDB is running
- Check connection string in `.env` file

## Test Configuration

- **Base URL**: http://localhost:3000 (configured in `cypress.config.js`)
- **Test File**: `cypress/e2e/01-happy-path.cy.js`
- **Fixtures**: `cypress/fixtures/valid-contracts.csv`
- **Support Files**: `cypress/support/commands.js`, `cypress/support/e2e.js`

## Quick Commands

```cmd
# Run test headless
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/01-happy-path.cy.js"

# Run test in Chrome (visible)
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/01-happy-path.cy.js" --browser chrome --headed

# Open Cypress UI
node_modules\.bin\cypress.cmd open
```

