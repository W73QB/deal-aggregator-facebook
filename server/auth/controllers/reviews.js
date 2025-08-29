/**
 * Reviews & Ratings Controller
 * Handles CRUD operations for user reviews and ratings
 */

const db = require('../utils/database');
const { auditLog } = require('../utils/audit');
const emailService = require('../../email/service');
const { invalidation } = require('../../cache/invalidation');

class ReviewsController {
  
  /**
   * Create a new review
   * POST /reviews
   */
  async createReview(req, res) {
    const { deal_id, rating, title, content, metadata = {} } = req.body;
    const userId = req.user.id;

    try {
      // Check if user already reviewed this deal
      const existingReview = await db.query(
        'SELECT id FROM public.reviews WHERE user_id = $1 AND deal_id = $2',
        [userId, deal_id]
      );

      if (existingReview.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'You have already reviewed this deal',
          code: 'REVIEW_EXISTS'
        });
      }

      // Create the review
      const result = await db.query(`
        INSERT INTO public.reviews 
        (user_id, deal_id, rating, title, content, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, deal_id, rating, title, content, metadata, is_verified, 
                  helpful_count, total_votes, created_at
      `, [userId, deal_id, rating, title, content, JSON.stringify(metadata)]);

      const review = result.rows[0];

      // Audit logging
      await auditLog(userId, 'REVIEW_CREATED', 'reviews', review.id, {
        deal_id,
        rating,
        title: title.substring(0, 50)
      });

      // Invalidate relevant caches
      await invalidation.reviews(deal_id, userId, review.id);

      // Send moderation notification (async, don't block response)
      // Disabled for testing - can be re-enabled after basic functionality is verified
      // const reviewsController = this;
      // reviewsController.sendNewContentNotification('review', {
      //   ...review,
      //   user: req.user
      // }).catch(err => console.error('Failed to send review notification:', err));

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        review: {
          ...review,
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name
          }
        }
      });

    } catch (error) {
      console.error('Create review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get reviews for a specific deal
   * GET /reviews/:dealId
   */
  async getReviewsByDeal(req, res) {
    const { dealId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (page - 1) * limit;

    try {
      // Build sort clause
      let sortClause = 'r.created_at DESC'; // default: newest
      switch (sort) {
        case 'oldest':
          sortClause = 'r.created_at ASC';
          break;
        case 'highest':
          sortClause = 'r.rating DESC, r.created_at DESC';
          break;
        case 'lowest':
          sortClause = 'r.rating ASC, r.created_at DESC';
          break;
        case 'helpful':
          sortClause = 'r.helpful_count DESC, r.total_votes DESC, r.created_at DESC';
          break;
      }

      // Get reviews with user info
      const reviewsResult = await db.query(`
        SELECT 
          r.id, r.deal_id, r.rating, r.title, r.content, r.metadata,
          r.is_verified, r.helpful_count, r.total_votes, r.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.reviews r
        JOIN public.users u ON r.user_id = u.id
        WHERE r.deal_id = $1 AND r.is_approved = true
        ORDER BY ${sortClause}
        LIMIT $2 OFFSET $3
      `, [dealId, limit, offset]);

      // Get total count for pagination
      const countResult = await db.query(
        'SELECT COUNT(*) FROM public.reviews WHERE deal_id = $1 AND is_approved = true',
        [dealId]
      );

      // Get deal statistics
      const statsResult = await db.query(
        'SELECT * FROM public.deal_stats WHERE deal_id = $1',
        [dealId]
      );

      const totalReviews = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalReviews / limit);
      const dealStats = statsResult.rows[0] || {
        avg_rating: 0,
        review_count: 0,
        comment_count: 0
      };

      res.json({
        success: true,
        data: {
          reviews: reviewsResult.rows.map(review => ({
            ...review,
            user: {
              id: review.user_id,
              first_name: review.first_name,
              last_name: review.last_name
            },
            metadata: typeof review.metadata === 'string' ? 
              JSON.parse(review.metadata) : review.metadata
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalReviews,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          },
          deal_stats: {
            avg_rating: parseFloat(dealStats.avg_rating || 0),
            review_count: parseInt(dealStats.review_count || 0),
            comment_count: parseInt(dealStats.comment_count || 0)
          }
        }
      });

    } catch (error) {
      console.error('Get reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get single review by ID
   * GET /reviews/review/:id
   */
  async getReviewById(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(`
        SELECT 
          r.id, r.deal_id, r.rating, r.title, r.content, r.metadata,
          r.is_verified, r.helpful_count, r.total_votes, r.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.reviews r
        JOIN public.users u ON r.user_id = u.id
        WHERE r.id = $1 AND r.is_approved = true
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const review = result.rows[0];

      res.json({
        success: true,
        review: {
          ...review,
          user: {
            id: review.user_id,
            first_name: review.first_name,
            last_name: review.last_name
          },
          metadata: typeof review.metadata === 'string' ? 
            JSON.parse(review.metadata) : review.metadata
        }
      });

    } catch (error) {
      console.error('Get review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update user's own review
   * PUT /reviews/:id
   */
  async updateReview(req, res) {
    const { id } = req.params;
    const { rating, title, content, metadata } = req.body;
    const userId = req.user.id;

    try {
      // Check if review exists and belongs to user
      const existingReview = await db.query(
        'SELECT user_id, deal_id FROM public.reviews WHERE id = $1',
        [id]
      );

      if (existingReview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (existingReview.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own reviews'
        });
      }

      // Update the review
      const result = await db.query(`
        UPDATE public.reviews 
        SET rating = $1, title = $2, content = $3, metadata = $4, updated_at = NOW()
        WHERE id = $5 AND user_id = $6
        RETURNING id, deal_id, rating, title, content, metadata, 
                  helpful_count, total_votes, created_at, updated_at
      `, [rating, title, content, JSON.stringify(metadata || {}), id, userId]);

      const updatedReview = result.rows[0];

      // Invalidate relevant caches
      await invalidation.reviews(existingReview.rows[0].deal_id, userId, id);

      // Audit logging
      await auditLog(userId, 'REVIEW_UPDATED', 'reviews', id, {
        deal_id: existingReview.rows[0].deal_id,
        rating,
        title: title.substring(0, 50)
      });

      res.json({
        success: true,
        message: 'Review updated successfully',
        review: {
          ...updatedReview,
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name
          }
        }
      });

    } catch (error) {
      console.error('Update review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete user's own review
   * DELETE /reviews/:id
   */
  async deleteReview(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Check if review exists and belongs to user
      const existingReview = await db.query(
        'SELECT user_id, deal_id, title FROM public.reviews WHERE id = $1',
        [id]
      );

      if (existingReview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (existingReview.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own reviews'
        });
      }

      // Delete the review (triggers will update deal stats)
      await db.query('DELETE FROM public.reviews WHERE id = $1', [id]);

      // Invalidate relevant caches
      await invalidation.reviews(existingReview.rows[0].deal_id, userId, id);

      // Audit logging
      await auditLog(userId, 'REVIEW_DELETED', 'reviews', id, {
        deal_id: existingReview.rows[0].deal_id,
        title: existingReview.rows[0].title.substring(0, 50)
      });

      res.json({
        success: true,
        message: 'Review deleted successfully'
      });

    } catch (error) {
      console.error('Delete review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete review',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vote on review helpfulness
   * POST /reviews/:id/vote
   */
  async voteOnReview(req, res) {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    const userId = req.user.id;

    try {
      // Check if review exists first
      const reviewExists = await db.query('SELECT id FROM public.reviews WHERE id = $1', [id]);
      
      if (reviewExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      // Update vote counts - fix SQL syntax by building query properly
      let query, params;
      if (helpful) {
        query = `
          UPDATE public.reviews 
          SET total_votes = total_votes + 1, helpful_count = helpful_count + 1, updated_at = NOW()
          WHERE id = $1
          RETURNING helpful_count, total_votes
        `;
        params = [id];
      } else {
        query = `
          UPDATE public.reviews 
          SET total_votes = total_votes + 1, updated_at = NOW()
          WHERE id = $1
          RETURNING helpful_count, total_votes
        `;
        params = [id];
      }

      const result = await db.query(query, params);

      res.json({
        success: true,
        message: 'Vote recorded successfully',
        vote_counts: result.rows[0]
      });

    } catch (error) {
      console.error('Vote review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user's own reviews
   * GET /reviews/my-reviews
   */
  async getMyReviews(req, res) {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const result = await db.query(`
        SELECT 
          id, deal_id, rating, title, content, metadata,
          is_verified, helpful_count, total_votes, 
          created_at, updated_at
        FROM public.reviews
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM public.reviews WHERE user_id = $1',
        [userId]
      );

      const totalReviews = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalReviews / limit);

      res.json({
        success: true,
        data: {
          reviews: result.rows.map(review => ({
            ...review,
            metadata: typeof review.metadata === 'string' ? 
              JSON.parse(review.metadata) : review.metadata
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalReviews,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get my reviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your reviews',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // === EMAIL NOTIFICATION HELPERS ===

  /**
   * Send notification for new content to admins/moderators
   */
  async sendNewContentNotification(contentType, content) {
    try {
      // Get all admin users for moderation alerts
      const adminQuery = await db.query(`
        SELECT id, email, first_name, last_name 
        FROM public.users 
        WHERE role = 'admin' AND email_verified = true
      `);

      if (adminQuery.rows.length > 0) {
        await emailService.sendBulkContentAlerts(adminQuery.rows, contentType, content);
        console.log(`Sent new ${contentType} alerts to ${adminQuery.rows.length} admins`);
      }
    } catch (error) {
      console.error('Failed to send new content notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification for reported content to admins
   */
  async sendReportNotification(report, content) {
    try {
      // Get all admin users for abuse reports (high priority)
      const adminQuery = await db.query(`
        SELECT id, email, first_name, last_name 
        FROM public.users 
        WHERE role = 'admin' AND email_verified = true
      `);

      if (adminQuery.rows.length > 0) {
        await emailService.sendBulkReportAlerts(adminQuery.rows, report, content);
        console.log(`Sent content report alerts to ${adminQuery.rows.length} admins`);
      }
    } catch (error) {
      console.error('Failed to send report notifications:', error);
      throw error;
    }
  }

  /**
   * Send moderation action notification to user
   */
  async sendModerationNotification(user, action, content, reason = null) {
    try {
      await emailService.sendModerationActionNotification(user, action, content, reason);
      console.log(`Sent moderation ${action} notification to user ${user.id}`);
    } catch (error) {
      console.error('Failed to send moderation notification:', error);
      throw error;
    }
  }
}

module.exports = new ReviewsController();