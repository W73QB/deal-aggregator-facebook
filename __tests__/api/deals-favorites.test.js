/**
 * @jest-environment node
 */
const express = require('express');
const request = require('supertest');

jest.mock('express-rate-limit', () => jest.fn(() => (req, res, next) => next()));

jest.mock('../../server/auth/middleware/auth', () => ({
  authGuard: () => (req, res, next) => {
    req.user = { id: 1, email: 'test@example.com', email_verified: true };
    next();
  },
  optionalAuth: (req, res, next) => next(),
  adminOnly: () => (req, res, next) => next(),
}));

jest.mock('../../server/auth/utils/database', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(),
}));

const db = require('../../server/auth/utils/database');
const dealsRouter = require('../../server/routes/deals');

const getFavoritesHandlers = () => {
  const favoritesLayer = dealsRouter.stack.find(
    (layer) =>
      layer.route &&
      layer.route.path === '/favorites' &&
      layer.route.methods.get
  );

  if (!favoritesLayer) {
    throw new Error('Favorites route not found on deals router');
  }

  return favoritesLayer.route.stack.map((stackLayer) => stackLayer.handle);
};

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/api/deals/favorites', ...getFavoritesHandlers());
  return app;
};

describe('GET /api/deals/favorites', () => {
  let app;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    app = createApp();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('returns favorites with image alias and uses correct SQL', async () => {
    const timestamp = new Date().toISOString();
    db.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 42,
            title: 'Test Deal',
            description: 'Great discount',
            image: 'https://example.com/image.jpg',
            original_price: '100.00',
            sale_price: '75.00',
            discount: 25,
            rating: 4.5,
            category: 'electronics',
            featured: true,
            store: 'Test Store',
            affiliate_url: 'https://example.com/deal',
            tags: 'tag1,tag2',
            stock_count: 5,
            expires_at: null,
            created_at: timestamp,
            updated_at: timestamp,
            favorited_at: timestamp,
            savings_amount: '25.00',
          },
        ],
      })
      .mockResolvedValueOnce({ rows: [{ total: '1' }] });

    const response = await request(app).get('/api/deals/favorites');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: 42,
      image: 'https://example.com/image.jpg',
      isFavorite: true,
    });

    const favoritesQuery = db.query.mock.calls[0][0];
    expect(favoritesQuery).toContain('d.image_url as image');
    expect(favoritesQuery).not.toMatch(/d\.image[,\s]/);
  });

  it('passes pagination parameters to the database query', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [{ total: '0' }] });

    await request(app)
      .get('/api/deals/favorites')
      .query({ limit: 10, offset: 5 });

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.arrayContaining([1, 10, 5])
    );
  });

  it('handles empty favorites list', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });
    db.query.mockResolvedValueOnce({ rows: [{ total: '0' }] });

    const response = await request(app).get('/api/deals/favorites');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.total).toBe(0);
  });

  it('returns 500 when database query fails', async () => {
    db.query.mockRejectedValueOnce(new Error('column "image" does not exist'));

    const response = await request(app).get('/api/deals/favorites');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Failed to fetch favorite deals');
  });
});
