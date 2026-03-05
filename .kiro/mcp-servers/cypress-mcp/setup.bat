@echo off
echo Setting up Cypress MCP Server...
echo.

npm install

if %errorlevel% equ 0 (
    echo.
    echo [SUCCESS] Dependencies installed successfully
    echo.
    echo Cypress MCP Server is ready!
    echo.
    echo Next steps:
    echo 1. Restart Kiro or reconnect the MCP server from the MCP Server view
    echo 2. Use the Cypress tools through Kiro's MCP integration
    echo.
    echo Available tools:
    echo   - run_cypress_test: Run Cypress tests
    echo   - list_cypress_tests: List all test files
    echo   - open_cypress: Open Cypress UI
    echo   - get_cypress_results: Get test results
) else (
    echo.
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
