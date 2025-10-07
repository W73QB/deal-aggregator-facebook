// Diagnostic endpoint to verify which code is running
export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  res.status(200).json({
    endpoint: '/api/diagnostic',
    message: 'This is the DIAGNOSTIC endpoint',
    timestamp: new Date().toISOString(),
    buildId: process.env.BUILD_ID || 'unknown',
    vercelEnv: process.env.VERCEL_ENV || 'unknown',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    fileIdentifier: 'DIAGNOSTIC_V1_20251007'
  });
}
