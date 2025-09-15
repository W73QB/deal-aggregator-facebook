const DealRadarUSApp = require('../server/app.js');

// This is the entrypoint for Vercel Serverless Functions.
// We initialize our Express app class but do not call app.start().
// Vercel handles the server lifecycle.

const appInstance = new DealRadarUSApp();

// Export the raw Express app instance for Vercel to use.
module.exports = appInstance.app;
