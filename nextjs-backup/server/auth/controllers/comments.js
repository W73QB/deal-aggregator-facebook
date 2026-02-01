/**
 * Comments Controller
 * Handles threaded comments on deals and reviews
 */

const db = require('../utils/database');
const { auditLog } = require('../utils/audit');
const emailService = require('../../email/service');
const { invalidation } = require('../../cache/invalidation');

class CommentsController {

  /**
   * Create a new comment
   * POST /comments
   */
  async createComment(req, res) {
    const { deal_id, review_id, parent_id, content } = req.body;
    const userId = req.user.id;

    try {
      // Validate that either deal_id or review_id is provided
      if (!deal_id && !review_id) {
        return res.status(400).json({
          success: false,
          message: 'Either deal_id or review_id must be provided'
        });
      }

      // If parent_id is provided, verify it exists
      if (parent_id) {
        const parentExists = await db.query(
          'SELECT id FROM public.comments WHERE id = $1',
          [parent_id]
        );

        if (parentExists.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Parent comment not found'
          });
        }
      }

      // Create the comment
      const result = await db.query(`
        INSERT INTO public.comments 
        (user_id, deal_id, review_id, parent_id, content)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, deal_id, review_id, parent_id, content, 
                  helpful_count, total_votes, created_at
      `, [userId, deal_id || null, review_id || null, parent_id || null, content]);

      const comment = result.rows[0];

      // Invalidate relevant caches
      await invalidation.comments(deal_id, review_id, userId);

      // Audit logging
      await auditLog(userId, 'COMMENT_CREATED', 'comments', comment.id, {
        deal_id: deal_id || null,
        review_id: review_id || null,
        parent_id: parent_id || null,
        content_preview: content.substring(0, 50)
      });

      // Send notifications (async, don't block response)
      // Disabled for testing - can be re-enabled after basic functionality is verified
      // const commentsController = this;
      // commentsController.sendCommentNotifications({
      //   ...comment,
      //   user: req.user
      // }, review_id).catch(err => console.error('Failed to send comment notifications:', err));

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        comment: {
          ...comment,
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name
          }
        }
      });

    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get comments for a deal (threaded)
   * GET /comments/deal/:dealId
   */
  async getCommentsByDeal(req, res) {
    const { dealId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      // Get top-level comments first
      const topLevelResult = await db.query(`
        SELECT 
          c.id, c.deal_id, c.review_id, c.parent_id, c.content,
          c.helpful_count, c.total_votes, c.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.comments c
        JOIN public.users u ON c.user_id = u.id
        WHERE c.deal_id = $1 AND c.parent_id IS NULL 
          AND c.is_approved = true AND c.is_deleted = false
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
      `, [dealId, limit, offset]);

      // For each top-level comment, get its replies
      const commentsWithReplies = [];
      for (const comment of topLevelResult.rows) {
        const repliesResult = await db.query(`
          SELECT 
            c.id, c.deal_id, c.review_id, c.parent_id, c.content,
            c.helpful_count, c.total_votes, c.created_at,
            u.first_name, u.last_name, u.id as user_id
          FROM public.comments c
          JOIN public.users u ON c.user_id = u.id
          WHERE c.parent_id = $1 AND c.is_approved = true AND c.is_deleted = false
          ORDER BY c.created_at ASC
          LIMIT 10
        `, [comment.id]);

        commentsWithReplies.push({
          ...comment,
          user: {
            id: comment.user_id,
            first_name: comment.first_name,
            last_name: comment.last_name
          },
          replies: repliesResult.rows.map(reply => ({
            ...reply,
            user: {
              id: reply.user_id,
              first_name: reply.first_name,
              last_name: reply.last_name
            }
          }))
        });
      }

      // Get total count for pagination
      const countResult = await db.query(`
        SELECT COUNT(*) FROM public.comments 
        WHERE deal_id = $1 AND parent_id IS NULL 
          AND is_approved = true AND is_deleted = false
      `, [dealId]);

      const totalComments = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalComments / limit);

      res.json({
        success: true,
        data: {
          comments: commentsWithReplies,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalComments,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get comments by deal error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get comments for a review
   * GET /comments/review/:reviewId
   */
  async getCommentsByReview(req, res) {
    const { reviewId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const result = await db.query(`
        SELECT 
          c.id, c.deal_id, c.review_id, c.parent_id, c.content,
          c.helpful_count, c.total_votes, c.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.comments c
        JOIN public.users u ON c.user_id = u.id
        WHERE c.review_id = $1 AND c.is_approved = true AND c.is_deleted = false
        ORDER BY c.created_at ASC
        LIMIT $2 OFFSET $3
      `, [reviewId, limit, offset]);

      // Get total count
      const countResult = await db.query(`
        SELECT COUNT(*) FROM public.comments 
        WHERE review_id = $1 AND is_approved = true AND is_deleted = false
      `, [reviewId]);

      const totalComments = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalComments / limit);

      res.json({
        success: true,
        data: {
          comments: result.rows.map(comment => ({
            ...comment,
            user: {
              id: comment.user_id,
              first_name: comment.first_name,
              last_name: comment.last_name
            }
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalComments,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get comments by review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update user's own comment
   * PUT /comments/:id
   */
  async updateComment(req, res) {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    try {
      // Check if comment exists and belongs to user
      const existingComment = await db.query(
        'SELECT user_id, deal_id, review_id FROM public.comments WHERE id = $1 AND is_deleted = false',
        [id]
      );

      if (existingComment.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (existingComment.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own comments'
        });
      }

      // Update the comment
      const result = await db.query(`
        UPDATE public.comments 
        SET content = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING id, deal_id, review_id, parent_id, content, 
                  helpful_count, total_votes, created_at, updated_at
      `, [content, id, userId]);

      const updatedComment = result.rows[0];

      // Audit logging
      await auditLog(userId, 'COMMENT_UPDATED', 'comments', id, {
        deal_id: existingComment.rows[0].deal_id,
        review_id: existingComment.rows[0].review_id,
        content_preview: content.substring(0, 50)
      });

      res.json({
        success: true,
        message: 'Comment updated successfully',
        comment: {
          ...updatedComment,
          user: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name
          }
        }
      });

    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete user's own comment (soft delete)
   * DELETE /comments/:id
   */
  async deleteComment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
      // Check if comment exists and belongs to user
      const existingComment = await db.query(
        'SELECT user_id, deal_id, review_id, content FROM public.comments WHERE id = $1 AND is_deleted = false',
        [id]
      );

      if (existingComment.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      if (existingComment.rows[0].user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own comments'
        });
      }

      // Soft delete the comment
      await db.query(
        'UPDATE public.comments SET is_deleted = true, updated_at = NOW() WHERE id = $1',
        [id]
      );

      // Audit logging
      await auditLog(userId, 'COMMENT_DELETED', 'comments', id, {
        deal_id: existingComment.rows[0].deal_id,
        review_id: existingComment.rows[0].review_id,
        content_preview: existingComment.rows[0].content.substring(0, 50)
      });

      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });

    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete comment',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Vote on comment helpfulness
   * POST /comments/:id/vote
   */
  async voteOnComment(req, res) {
    const { id } = req.params;
    const { helpful } = req.body; // true for helpful, false for not helpful
    const userId = req.user.id;

    try {
      // Update vote counts (in full implementation, track individual votes)
      const result = await db.query(`
        UPDATE public.comments 
        SET total_votes = total_votes + 1, 
            ${helpful ? 'helpful_count = helpful_count + 1,' : ''}
            updated_at = NOW()
        WHERE id = $1 AND is_deleted = false
        RETURNING helpful_count, total_votes
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      res.json({
        success: true,
        message: 'Vote recorded successfully',
        vote_counts: result.rows[0]
      });

    } catch (error) {
      console.error('Vote comment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record vote',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user's own comments
   * GET /comments/my-comments
   */
  async getMyComments(req, res) {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const result = await db.query(`
        SELECT 
          id, deal_id, review_id, parent_id, content,
          helpful_count, total_votes, is_deleted,
          created_at, updated_at
        FROM public.comments
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM public.comments WHERE user_id = $1',
        [userId]
      );

      const totalComments = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalComments / limit);

      res.json({
        success: true,
        data: {
          comments: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalComments,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get my comments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your comments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get comment thread (comment with all its replies)
   * GET /comments/thread/:id
   */
  async getCommentThread(req, res) {
    const { id } = req.params;

    try {
      // Get the main comment
      const mainCommentResult = await db.query(`
        SELECT 
          c.id, c.deal_id, c.review_id, c.parent_id, c.content,
          c.helpful_count, c.total_votes, c.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.comments c
        JOIN public.users u ON c.user_id = u.id
        WHERE c.id = $1 AND c.is_approved = true AND c.is_deleted = false
      `, [id]);

      if (mainCommentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found'
        });
      }

      // Get all replies recursively (for now, just 2 levels deep)
      const repliesResult = await db.query(`
        SELECT 
          c.id, c.deal_id, c.review_id, c.parent_id, c.content,
          c.helpful_count, c.total_votes, c.created_at,
          u.first_name, u.last_name, u.id as user_id
        FROM public.comments c
        JOIN public.users u ON c.user_id = u.id
        WHERE c.parent_id = $1 AND c.is_approved = true AND c.is_deleted = false
        ORDER BY c.created_at ASC
      `, [id]);

      const mainComment = mainCommentResult.rows[0];

      res.json({
        success: true,
        data: {
          comment: {
            ...mainComment,
            user: {
              id: mainComment.user_id,
              first_name: mainComment.first_name,
              last_name: mainComment.last_name
            },
            replies: repliesResult.rows.map(reply => ({
              ...reply,
              user: {
                id: reply.user_id,
                first_name: reply.first_name,
                last_name: reply.last_name
              }
            }))
          }
        }
      });

    } catch (error) {
      console.error('Get comment thread error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch comment thread',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // === EMAIL NOTIFICATION HELPERS ===

  /**
   * Send comment notifications to relevant parties
   */
  async sendCommentNotifications(comment, reviewId) {
    try {
      // 1. Notify admins/moderators about new comment
      await this.sendNewContentNotification('comment', comment);

      // 2. If this is a reply to a review, notify the original reviewer
      if (reviewId) {
        await this.sendReviewReplyNotification(comment, reviewId);
      }

      // 3. If this is a reply to another comment, notify the parent comment author
      if (comment.parent_id) {
        await this.sendCommentReplyNotification(comment);
      }

    } catch (error) {
      console.error('Failed to send comment notifications:', error);
      throw error;
    }
  }

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
   * Send notification to original reviewer when someone comments on their review
   */
  async sendReviewReplyNotification(comment, reviewId) {
    try {
      // Get the original review and reviewer info
      const reviewQuery = await db.query(`
        SELECT r.id, r.title, r.rating, r.content, r.deal_id, r.created_at,
               u.id as user_id, u.email, u.first_name, u.last_name
        FROM public.reviews r
        JOIN public.users u ON r.user_id = u.id
        WHERE r.id = $1 AND u.id != $2 AND u.email_verified = true
      `, [reviewId, comment.user.id]); // Don't notify if replying to own review

      if (reviewQuery.rows.length > 0) {
        const review = reviewQuery.rows[0];
        const reviewer = {
          id: review.user_id,
          email: review.email,
          first_name: review.first_name,
          last_name: review.last_name
        };

        await emailService.sendReviewReplyNotification(reviewer, comment, review);
        console.log(`Sent review reply notification to user ${reviewer.id}`);
      }
    } catch (error) {
      console.error('Failed to send review reply notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to parent comment author when someone replies
   */
  async sendCommentReplyNotification(comment) {
    try {
      // Get the parent comment and author info
      const parentQuery = await db.query(`
        SELECT c.id, c.content, c.created_at,
               u.id as user_id, u.email, u.first_name, u.last_name
        FROM public.comments c
        JOIN public.users u ON c.user_id = u.id
        WHERE c.id = $1 AND u.id != $2 AND u.email_verified = true
      `, [comment.parent_id, comment.user.id]); // Don't notify if replying to own comment

      if (parentQuery.rows.length > 0) {
        const parentComment = parentQuery.rows[0];
        const parentAuthor = {
          id: parentComment.user_id,
          email: parentComment.email,
          first_name: parentComment.first_name,
          last_name: parentComment.last_name
        };

        // Use custom email for comment replies (simpler than review replies)
        await this.sendSimpleReplyNotification(parentAuthor, comment, parentComment);
        console.log(`Sent comment reply notification to user ${parentAuthor.id}`);
      }
    } catch (error) {
      console.error('Failed to send comment reply notification:', error);
      throw error;
    }
  }

  /**
   * Send simple notification for comment replies
   */
  async sendSimpleReplyNotification(recipient, reply, originalComment) {
    const subject = `💬 ${reply.user.first_name} replied to your comment - DealRadarUS`;
    const html = `
      <p>Hi ${recipient.first_name},</p>
      
      <p>${reply.user.first_name} ${reply.user.last_name} replied to your comment:</p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8;">
        <strong>Your comment:</strong><br>
        ${originalComment.content.substring(0, 200)}${originalComment.content.length > 200 ? '...' : ''}
      </div>
      
      <div style="background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
        <strong>${reply.user.first_name}'s reply:</strong><br>
        ${reply.content}
      </div>
      
      <p>Thanks for being part of the DealRadarUS community!</p>
    `;
    
    const text = `
Hi ${recipient.first_name},

${reply.user.first_name} ${reply.user.last_name} replied to your comment:

YOUR COMMENT:
${originalComment.content.substring(0, 200)}${originalComment.content.length > 200 ? '...' : ''}

${reply.user.first_name.toUpperCase()}'S REPLY:
${reply.content}

Thanks for being part of the DealRadarUS community!
    `;

    await emailService.sendCustomEmail({
      to: recipient.email,
      subject,
      html,
      text,
      userId: recipient.id,
      emailType: 'community_notification'
    });
  }
}

module.exports = new CommentsController();