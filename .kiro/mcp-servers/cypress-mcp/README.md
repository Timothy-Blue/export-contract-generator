# Cypress MCP Server

This MCP server provides tools to run and manage Cypress end-to-end tests from within Kiro.

## Setup

1. Install dependencies:
   ```bash
   cd .kiro/mcp-servers/cypress-mcp
   npm install
   ```

2. The MCP server is already configured in `.kiro/settings/mcp.json`

3. Restart Kiro or reconnect the MCP server from the MCP Server view

## Available Tools

### 1. run_cypress_test
Run Cypress end-to-end tests with various options.

**Parameters:**
- `spec` (optional): Specific test file to run (e.g., "cypress/e2e/01-happy-path.cy.js")
- `browser` (optional): Browser to use (chrome, firefox, edge, electron). Default: electron
- `headed` (optional): Run in headed mode (visible browser). Default: false
- `record` (optional): Record test run to Cypress Dashboard. Default: false

**Examples:**
- Run all tests: `{}`
- Run specific test: `{ "spec": "cypress/e2e/01-happy-path.cy.js" }`
- Run in Chrome headed mode: `{ "browser": "chrome", "headed": true }`

### 2. list_cypress_tests
List all available Cypress test files in the project.

**Parameters:** None

### 3. open_cypress
Open Cypress Test Runner UI for interactive test development.

**Parameters:**
- `browser` (optional): Browser to open (chrome, firefox, edge, electron). Default: electron

**Note:** This provides the command to run manually as it opens an interactive UI.

### 4. get_cypress_results
Get the latest Cypress test results summary.

**Parameters:** None

## Usage in Kiro

Once the MCP server is running, you can use these tools through Kiro's MCP integration:

```
"Run all Cypress tests"
"Run the happy path test in Chrome"
"List all available Cypress tests"
"Show me the latest test results"
```

## Troubleshooting

If the MCP server doesn't connect:
1. Check that dependencies are installed: `npm install` in this directory
2. Verify the configuration in `.kiro/settings/mcp.json`
3. Check the MCP Server view in Kiro for connection status
4. Restart Kiro or use the "Reconnect" option in the MCP Server view
