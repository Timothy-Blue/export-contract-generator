#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class CypressMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'cypress-e2e',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'run_cypress_test',
          description: 'Run Cypress end-to-end tests. Can run all tests, specific test file, or tests matching a pattern.',
          inputSchema: {
            type: 'object',
            properties: {
              spec: {
                type: 'string',
                description: 'Specific test file to run (e.g., "cypress/e2e/01-happy-path.cy.js"). Leave empty to run all tests.',
              },
              browser: {
                type: 'string',
                description: 'Browser to use for testing (chrome, firefox, edge, electron). Default: electron',
                enum: ['chrome', 'firefox', 'edge', 'electron'],
              },
              headed: {
                type: 'boolean',
                description: 'Run tests in headed mode (visible browser). Default: false (headless)',
              },
              record: {
                type: 'boolean',
                description: 'Record test run to Cypress Dashboard. Default: false',
              },
            },
          },
        },
        {
          name: 'list_cypress_tests',
          description: 'List all available Cypress test files in the project',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'open_cypress',
          description: 'Open Cypress Test Runner UI for interactive test development',
          inputSchema: {
            type: 'object',
            properties: {
              browser: {
                type: 'string',
                description: 'Browser to open (chrome, firefox, edge, electron). Default: electron',
                enum: ['chrome', 'firefox', 'edge', 'electron'],
              },
            },
          },
        },
        {
          name: 'get_cypress_results',
          description: 'Get the latest Cypress test results summary',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'run_cypress_test':
            return await this.runCypressTest(args);
          case 'list_cypress_tests':
            return await this.listCypressTests();
          case 'open_cypress':
            return await this.openCypress(args);
          case 'get_cypress_results':
            return await this.getCypressResults();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async runCypressTest(args) {
    const { spec, browser = 'electron', headed = false, record = false } = args;

    let command = 'npx cypress run';
    
    if (spec) {
      command += ` --spec "${spec}"`;
    }
    
    command += ` --browser ${browser}`;
    
    if (headed) {
      command += ' --headed';
    }
    
    if (record) {
      command += ' --record';
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 300000, // 5 minutes timeout
      });

      return {
        content: [
          {
            type: 'text',
            text: `Cypress Test Execution:\n\n${stdout}\n${stderr ? `\nErrors/Warnings:\n${stderr}` : ''}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Cypress test execution failed:\n\nCommand: ${command}\n\nOutput:\n${error.stdout || ''}\n\nError:\n${error.stderr || error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async listCypressTests() {
    try {
      const e2eDir = path.join(process.cwd(), 'cypress', 'e2e');
      const files = await this.getTestFiles(e2eDir);
      
      if (files.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No Cypress test files found in cypress/e2e directory.',
            },
          ],
        };
      }

      const fileList = files.map(f => `- ${f}`).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `Available Cypress Tests:\n\n${fileList}\n\nTotal: ${files.length} test file(s)`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error listing tests: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getTestFiles(dir, fileList = []) {
    const files = await fs.readdir(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await this.getTestFiles(filePath, fileList);
      } else if (file.endsWith('.cy.js') || file.endsWith('.cy.ts')) {
        const relativePath = path.relative(process.cwd(), filePath);
        fileList.push(relativePath);
      }
    }
    
    return fileList;
  }

  async openCypress(args) {
    const { browser = 'electron' } = args;
    
    const command = `npx cypress open --browser ${browser}`;

    return {
      content: [
        {
          type: 'text',
          text: `Opening Cypress Test Runner...\n\nCommand: ${command}\n\nNote: This will open the Cypress UI. Run this command manually in your terminal:\n\n${command}`,
        },
      ],
    };
  }

  async getCypressResults() {
    try {
      const resultsPath = path.join(process.cwd(), 'cypress', 'results');
      
      try {
        await fs.access(resultsPath);
      } catch {
        return {
          content: [
            {
              type: 'text',
              text: 'No Cypress results found. Run tests first to generate results.',
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: 'Cypress results directory exists. Check cypress/results for detailed test reports.',
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error getting results: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Cypress MCP server running on stdio');
  }
}

const server = new CypressMCPServer();
server.run().catch(console.error);
