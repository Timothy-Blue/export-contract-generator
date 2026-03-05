@echo off
REM Open Cypress UI for interactive testing

echo ========================================
echo   Opening Cypress Test Runner UI
echo ========================================
echo.

cd /d "%~dp0"

echo Opening Cypress UI...
echo You can run tests interactively and see the browser in action.
echo.

node_modules\.bin\cypress.cmd open

pause
