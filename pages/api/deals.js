// Next.js API route - /api/deals
import deals from '../../server/data/deals.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');

    try {
      // Filter deals based on query parameters
      const { category, featured, limit } = req.query;
      let filteredDeals = deals;

      if (category) {
        filteredDeals = filteredDeals.filter(deal =>
          deal.category?.toLowerCase() === category.toLowerCase()
        );
      }

      if (featured === 'true') {
        filteredDeals = filteredDeals.filter(deal => deal.featured === true);
      }

      if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
          filteredDeals = filteredDeals.slice(0, limitNum);
        }
      }

      res.status(200).json({
        success: true,
        data: filteredDeals,
        total: filteredDeals.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching deals:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch deals'
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed`
    });
  }
}