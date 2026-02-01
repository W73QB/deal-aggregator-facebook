/**
 * @jest-environment node
 */

const express = require('express');
const request = require('supertest');

jest.mock('../../server/auth/utils/database', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue()
}));

jest.mock('../../server/auth/middleware/auth', () => ({
  authGuard: () => (req, res, next) => next(),
  optionalAuth: (req, res, next) => {
    const userId = req.headers['x-test-user-id'];
    if (userId) {
      req.user = { id: parseInt(userId, 10), preferences: {} };
    }
    next();
  },
  adminOnly: () => (req, res, next) => next()
}));

const db = require('../../server/auth/utils/database');
const dealsRouter = require('../../server/routes/deals');

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/deals', dealsRouter);
  return app;
};

describe('GET /api/deals cache personalization', () => {
  const app = createApp();

  beforeEach(() => {
    db.query.mockReset();
  });

  it('does not leak another user favorites via cache', async () => {
    const dealRow = {
      id: 1,
      title: 'Cached Deal',
      description: 'A cached deal',
      image: 'https://example.com/deal.png',
      original_price: '200.00',
      sale_price: '150.00',
      discount_percentage: 25,
      rating: 4.5,
      category: 'electronics',
      featured: true,
      store: 'Test Store',
      affiliate_url: 'https://example.com/deal',
      tags: 'tag1,tag2',
      stock_count: 5,
      expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      savings_amount: '50.00'
    };

    // Authenticated request populates cache with personalized data
    db.query
      .mockResolvedValueOnce({ rows: [dealRow] })       // deals query
      .mockResolvedValueOnce({ rows: [{ total: '1' }] }) // count query
      .mockResolvedValueOnce({ rows: [{ deal_id: 1 }] }); // favorites for user 1

    const firstResponse = await request(app)
      .get('/api/deals')
      .set('x-test-user-id', '1');

    expect(firstResponse.status).toBe(200);
    expect(firstResponse.body.data[0].isFavorite).toBe(true);

    // Anonymous request should not receive cached personalized data
    db.query.mockReset();
    db.query
      .mockResolvedValueOnce({ rows: [dealRow] })
      .mockResolvedValueOnce({ rows: [{ total: '1' }] });

    const secondResponse = await request(app).get('/api/deals');

    expect(secondResponse.status).toBe(200);
    expect(secondResponse.body.data[0].isFavorite).toBeUndefined();
  });
});
