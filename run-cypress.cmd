@echo off
REM Cypress UI Test Runner Script
REM Runs the happy path UI test for contract import

echo ========================================
echo   Cypress UI Test - Happy Path
echo ========================================
echo.

REM Change to project directory
cd /d "%~dp0"

echo Starting Cypress UI test...
echo Test URL: http://localhost:3000
echo.
echo NOTE: Make sure your application is running on localhost:3000
echo.

REM Run Cypress test
node_modules\.bin\cypress.cmd run --spec "cypress/e2e/01-happy-path.cy.js"

echo.
echo ========================================
echo   Test execution completed!
echo ========================================
pause
