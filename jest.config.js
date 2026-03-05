module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Coverage configuration
  collectCoverageFrom: [
    'server/**/*.js',
    '!server/tests/**',
    '!server/**/__tests__/**',
    '!server/server.js',
    '!server/seed.js',
    '!server/config/**',
    '!**/node_modules/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical services need 90% coverage
    './server/services/csvParserService.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './server/services/validationService.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './server/services/importExecutionService.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],

  // Module paths
  moduleDirectories: ['node_modules', 'server'],

  // Verbose output
  verbose: true,

  // Test timeout
  testTimeout: 10000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
