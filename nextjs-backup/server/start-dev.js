/**
 * Development Server Starter
 * Enhanced with hot reload and development features
 */

const DealRadarUSApp = require('./app');

console.log('🔧 Starting DealRadarUS in development mode...\n');

// Create and start the application
const app = new DealRadarUSApp();
app.start().then(() => {
  console.log('\n🎯 Development server ready!');
  console.log('📝 API Documentation:');
  console.log('   POST /auth/signup - Create new account');
  console.log('   POST /auth/login - Login with email/password');
  console.log('   POST /auth/verify-email - Verify email address');
  console.log('   POST /auth/forgot-password - Request password reset');
  console.log('   POST /auth/reset-password - Reset password with token');
  console.log('   GET /auth/me - Get current user info (authenticated)');
  console.log('   POST /auth/logout - Logout user');
  console.log('   POST /auth/refresh - Refresh access token');
  console.log('\n💡 Use Postman collection or curl for testing');
}).catch(error => {
  console.error('❌ Failed to start development server:', error);
  process.exit(1);
});