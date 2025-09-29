// Minimal test API endpoint for Vercel routing issue reproduction

export const config = {
  runtime: 'nodejs'
};

export default function handler(req, res) {
  res.status(200).json({
    endpoint: '/api/simple-test',
    message: 'This should be simple-test response, not blog posts',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
}