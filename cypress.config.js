const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    retries: 1,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });
    },
    env: {
      apiUrl: 'http://localhost:3001',
      testUser: {
        email: 'cypress-test@dealradarus.com',
        password: 'TestPassword123!',
        firstName: 'Cypress',
        lastName: 'Tester'
      },
      adminUser: {
        email: 'cypress-admin@dealradarus.com',
        password: 'AdminPassword123!',
        firstName: 'Cypress',
        lastName: 'Admin'
      }
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    specPattern: 'src/**/*.cy.{js,jsx}',
    supportFile: 'cypress/support/component.js'
  }
});