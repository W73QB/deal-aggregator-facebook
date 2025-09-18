// Next.js API route - /api/deals
// Enhanced with PostgreSQL integration and fallback to static data
import staticDeals from '../../server/data/deals.js';

// Dynamic import for CommonJS database module
let DatabaseConnection = null;

async function loadDatabaseModule() {
  if (!DatabaseConnection) {
    try {
      const module = await import('../../server/auth/utils/database.js');
      DatabaseConnection = module.default || module.DatabaseConnection;
    } catch (error) {
      console.warn('Could not load database module:', error.message);
      return null;
    }
  }
  return DatabaseConnection;
}

let dbInstance = null;

async function getDbConnection() {
  if (!dbInstance) {
    const DbClass = await loadDatabaseModule();
    if (!DbClass) {
      return { useFallback: true };
    }
    dbInstance = new DbClass();
    if (dbInstance.initialize) {
      await dbInstance.initialize();
    }
  }
  return dbInstance;
}

async function fetchDealsFromDB(filters = {}) {
  try {
    const db = await getDbConnection();

    if (db.useFallback) {
      // Fallback to static data when database is unavailable
      console.log('Using static data fallback for deals');
      return applyFiltersToStaticData(staticDeals, filters);
    }

    let query = `
      SELECT
        id, title, description, image, original_price, sale_price,
        discount, rating, category, featured, store, affiliate_url,
        created_at, updated_at
      FROM deals
      WHERE active = true
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add category filter
    if (filters.category) {
      query += ` AND LOWER(category) = $${paramIndex}`;
      queryParams.push(filters.category.toLowerCase());
      paramIndex++;
    }

    // Add featured filter
    if (filters.featured === 'true') {
      query += ` AND featured = true`;
    }

    // Add ordering
    query += ` ORDER BY created_at DESC`;

    // Add limit
    if (filters.limit && !isNaN(parseInt(filters.limit))) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(parseInt(filters.limit));
    }

    const result = await db.query(query, queryParams);

    // Transform database results to match expected format
    return result.rows.map(deal => ({
      id: deal.id,
      title: deal.title,
      description: deal.description,
      image: deal.image,
      originalPrice: deal.original_price,
      salePrice: deal.sale_price,
      discount: deal.discount,
      rating: deal.rating,
      category: deal.category,
      featured: deal.featured,
      store: deal.store,
      affiliateUrl: deal.affiliate_url,
      createdAt: deal.created_at,
      updatedAt: deal.updated_at
    }));

  } catch (error) {
    console.error('Database error, falling back to static data:', error);
    return applyFiltersToStaticData(staticDeals, filters);
  }
}

function applyFiltersToStaticData(deals, filters) {
  let filteredDeals = [...deals];

  if (filters.category) {
    filteredDeals = filteredDeals.filter(deal =>
      deal.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }

  if (filters.featured === 'true') {
    filteredDeals = filteredDeals.filter(deal => deal.featured === true);
  }

  if (filters.limit) {
    const limitNum = parseInt(filters.limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      filteredDeals = filteredDeals.slice(0, limitNum);
    }
  }

  return filteredDeals;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Set cache headers for better performance
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/json');

    try {
      // Extract query parameters
      const { category, featured, limit } = req.query;
      const filters = { category, featured, limit };

      // Fetch deals from database or fallback to static data
      const deals = await fetchDealsFromDB(filters);

      // Calculate additional metrics
      const totalSavings = deals.reduce((sum, deal) => {
        const savings = (deal.originalPrice || deal.original_price || 0) - (deal.salePrice || deal.sale_price || 0);
        return sum + Math.max(0, savings);
      }, 0);

      const avgRating = deals.length > 0
        ? (deals.reduce((sum, deal) => sum + (deal.rating || 0), 0) / deals.length).toFixed(1)
        : 0;

      res.status(200).json({
        success: true,
        data: deals,
        meta: {
          total: deals.length,
          totalSavings: totalSavings,
          averageRating: parseFloat(avgRating),
          filters: filters,
          timestamp: new Date().toISOString(),
          source: dbInstance?.useFallback ? 'static' : 'database'
        }
      });

    } catch (error) {
      console.error('API Error fetching deals:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch deals',
        timestamp: new Date().toISOString()
      });
    }
  } else {
    // Method not allowed
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: `Method ${req.method} not allowed on /api/deals`,
      allowedMethods: ['GET']
    });
  }
}