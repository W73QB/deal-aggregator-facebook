// Next.js API route - /api/auth/me
// Basic authentication endpoint to prevent console errors

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Set CORS and cache headers
    const origin = req.headers.origin || '';
    const allowed = ['http://localhost:3000', 'https://dealradarus.com'];
    try {
      const host = origin ? new URL(origin).hostname : '';
      const isVercel = /\.vercel\.app$/i.test(host);
      if (allowed.includes(origin) || isVercel) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
      }
    } catch (_) {
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Content-Type', 'application/json');

    try {
      // For now, return a basic response to prevent frontend errors
      // TODO: Implement proper JWT validation when auth system is fully integrated
      res.status(200).json({
        success: true,
        user: null,
        authenticated: false,
        message: 'Authentication service available'
      });

    } catch (error) {
      console.error('Auth API Error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Authentication service temporarily unavailable'
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed on /api/auth/me`,
      allowedMethods: ['GET']
    });
  }
}
