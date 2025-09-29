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
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    retries: {
      runMode: 2,
      openMode: 1
    },
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    numTestsKeptInMemory: 5,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        log(message) {
          console.log(message);
          return null;
        }
      });

      // Optimize memory usage
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--max_old_space_size=4096');
        }
        return launchOptions;
      });
    },
    env: {
      apiUrl: 'http://localhost:5000',
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