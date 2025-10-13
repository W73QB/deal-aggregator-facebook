/**
 * @jest-environment node
 */
const request = require('supertest');
const express = require('express');
const router = require('../../server/routes/deals.js');
const db = require('../../server/auth/utils/database');

const app = express();
app.use(express.json());
app.use('/api/deals', router);

// Mock the database module
jest.mock('../../server/auth/utils/database', () => ({
  query: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(),
}));

describe('GET /api/deals/:id', () => {
    it('should return a single deal with the correct structure', async () => {
        const mockDeal = {
          id: 1,
          title: 'Test Deal',
          description: 'A great deal',
          image: 'http://example.com/image.png',
          original_price: '100.00',
          sale_price: '50.00',
          discount: 50,
          rating: 4.5,
          category: 'Electronics',
          featured: true,
          store: 'Test Store',
          affiliate_url: 'http://example.com/deal',
          tags: 'test,deal',
          stock_count: 10,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          savings_amount: '50.00',
        };

        db.query.mockResolvedValue({ rows: [mockDeal] });

        const response = await request(app).get('/api/deals/1');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('id', 1);
        expect(response.body.data).toHaveProperty('title', 'Test Deal');
        expect(response.body.data).toHaveProperty('image', 'http://example.com/image.png');
      });

    it('should return a 404 error when the deal is not found', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const response = await request(app).get('/api/deals/999');

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.error).toBe('Deal not found');
    });
});

describe('GET /api/deals', () => {
    it('should return deals with the correct discount value from search', async () => {
        const mockDeals = [{
          id: 1,
          title: 'Test Deal',
          description: 'A great deal',
          image: 'http://example.com/image.png',
          original_price: '100.00',
          sale_price: '50.00',
          discount_percentage: 50,
          rating: 4.5,
          category: 'Electronics',
          featured: true,
          store: 'Test Store',
          affiliate_url: 'http://example.com/deal',
          tags: 'test,deal',
          stock_count: 10,
          expires_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          savings_amount: '50.00',
        }];

        db.query.mockResolvedValueOnce({ rows: mockDeals }).mockResolvedValueOnce({ rows: [{ total: 1 }] });

        const response = await request(app).get('/api/deals?search=Test');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data[0]).toHaveProperty('discount', 50);
    });
});