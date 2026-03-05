const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    setupNodeEvents(on, config) {
      // Implement node event listeners here
      on('task', {
        async seedDatabase() {
          const mongoose = require('mongoose');
          const { seedReferenceData } = require('./cypress/support/dbHelpers');
          
          if (!mongoose.connection.readyState) {
            await mongoose.connect(config.env.mongoUri);
          }
          
          await seedReferenceData();
          return null;
        },
        
        async cleanupDatabase() {
          const mongoose = require('mongoose');
          const { cleanupTestData } = require('./cypress/support/dbHelpers');
          
          if (!mongoose.connection.readyState) {
            await mongoose.connect(config.env.mongoUri);
          }
          
          await cleanupTestData();
          return null;
        },
        
        async resetDatabase() {
          const mongoose = require('mongoose');
          const { cleanupTestData, seedReferenceData } = require('./cypress/support/dbHelpers');
          
          if (!mongoose.connection.readyState) {
            await mongoose.connect(config.env.mongoUri);
          }
          
          await cleanupTestData();
          await seedReferenceData();
          return null;
        },
        
        log(message) {
          console.log(message);
          return null;
        }
      });
    },
    
    env: {
      apiUrl: 'http://localhost:5000/api',
      mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/test-db'
    },
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    
    // Retries for flaky tests
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Video and screenshots
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    
    // Viewport
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test isolation
    testIsolation: true,
    
    // Experimental features
    experimentalStudio: true
  },
});
