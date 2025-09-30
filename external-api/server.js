/**
 * Deal Aggregator External API Server
 *
 * Purpose: Workaround for Vercel API routing issue
 * All API endpoints are served from this Express server instead of Vercel
 *
 * Date: September 30, 2025
 * Status: Workaround Implementation
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================================================
// MIDDLEWARE
// ============================================================================

// CORS Configuration
// Allow requests from Vercel domains and localhost
app.use(cors({
  origin: [
    'https://dealradarus.com',
    'https://www.dealradarus.com',
    'https://*.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Deal Aggregator API Server',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/health',
      '/api/posts',
      '/api/deals',
      '/api/analytics',
      '/api/errors',
      '/api/newsletter',
      '/api/auth/me',
      '/api/simple-test'
    ]
  });
});

// Import and mount API routes
try {
  const healthRouter = require('./routes/health');
  app.use('/api/health', healthRouter);
  console.log('✅ Mounted /api/health');
} catch (err) {
  console.error('❌ Failed to load health router:', err.message);
}

try {
  const postsRouter = require('./routes/posts');
  app.use('/api/posts', postsRouter);
  console.log('✅ Mounted /api/posts');
} catch (err) {
  console.error('❌ Failed to load posts router:', err.message);
}

try {
  const dealsRouter = require('./routes/deals');
  app.use('/api/deals', dealsRouter);
  console.log('✅ Mounted /api/deals');
} catch (err) {
  console.error('❌ Failed to load deals router:', err.message);
}

try {
  const analyticsRouter = require('./routes/analytics');
  app.use('/api/analytics', analyticsRouter);
  console.log('✅ Mounted /api/analytics');
} catch (err) {
  console.error('❌ Failed to load analytics router:', err.message);
}

try {
  const errorsRouter = require('./routes/errors');
  app.use('/api/errors', errorsRouter);
  console.log('✅ Mounted /api/errors');
} catch (err) {
  console.error('❌ Failed to load errors router:', err.message);
}

try {
  const newsletterRouter = require('./routes/newsletter');
  app.use('/api/newsletter', newsletterRouter);
  console.log('✅ Mounted /api/newsletter');
} catch (err) {
  console.error('❌ Failed to load newsletter router:', err.message);
}

try {
  const authRouter = require('./routes/auth');
  app.use('/api/auth', authRouter);
  console.log('✅ Mounted /api/auth');
} catch (err) {
  console.error('❌ Failed to load auth router:', err.message);
}

try {
  const simpleTestRouter = require('./routes/simple-test');
  app.use('/api/simple-test', simpleTestRouter);
  console.log('✅ Mounted /api/simple-test');
} catch (err) {
  console.error('❌ Failed to load simple-test router:', err.message);
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    path: req.path
  });
});

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Deal Aggregator API Server');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Port: ${PORT}`);
  console.log(`  Started: ${new Date().toISOString()}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});