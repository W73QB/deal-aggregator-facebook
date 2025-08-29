/**
 * Reports Controller  
 * Handles abuse reporting and content moderation
 */

const db = require('../utils/database');
const { auditLog } = require('../utils/audit');
const emailService = require('../../email/service');
const { invalidation } = require('../../cache/invalidation');

class ReportsController {

  /**
   * Create a new report (abuse/spam reporting)
   * POST /reports
   */
  async createReport(req, res) {
    const { content_type, content_id, reason, description } = req.body;
    const reporterId = req.user.id;

    try {
      // Check if user already reported this content
      const existingReport = await db.query(
        'SELECT id FROM public.reports WHERE reporter_id = $1 AND content_type = $2 AND content_id = $3',
        [reporterId, content_type, content_id]
      );

      if (existingReport.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'You have already reported this content',
          code: 'REPORT_EXISTS'
        });
      }

      // Verify the content exists
      let contentExists = false;
      if (content_type === 'review') {
        const reviewCheck = await db.query('SELECT id FROM public.reviews WHERE id = $1', [content_id]);
        contentExists = reviewCheck.rows.length > 0;
      } else if (content_type === 'comment') {
        const commentCheck = await db.query('SELECT id FROM public.comments WHERE id = $1', [content_id]);
        contentExists = commentCheck.rows.length > 0;
      }

      if (!contentExists) {
        return res.status(404).json({
          success: false,
          message: 'Content not found'
        });
      }

      // Create the report
      const result = await db.query(`
        INSERT INTO public.reports 
        (reporter_id, content_type, content_id, reason, description)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, content_type, content_id, reason, description, 
                  status, created_at
      `, [reporterId, content_type, content_id, reason, description]);

      const report = result.rows[0];

      // Invalidate reports cache
      await invalidation.reports(content_type, content_id, reporterId);

      // Audit logging
      await auditLog(reporterId, 'REPORT_CREATED', 'reports', report.id, {
        content_type,
        content_id,
        reason
      });

      // Send urgent notification to admins (async, don't block response)
      // Disabled for testing - can be re-enabled after basic functionality is verified
      // const reportsController = this;
      // reportsController.sendReportNotification({
      //   ...report,
      //   reporter: req.user
      // }, content_type, content_id).catch(err => console.error('Failed to send report notification:', err));

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully',
        report: {
          ...report,
          reporter: {
            id: req.user.id,
            first_name: req.user.first_name,
            last_name: req.user.last_name
          }
        }
      });

    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all reports (admin only)
   * GET /reports
   */
  async getReports(req, res) {
    const { status = 'all', content_type = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      // Build WHERE clause
      let whereClause = '1=1';
      const queryParams = [];
      
      if (status !== 'all') {
        queryParams.push(status);
        whereClause += ` AND r.status = $${queryParams.length}`;
      }
      
      if (content_type !== 'all') {
        queryParams.push(content_type);
        whereClause += ` AND r.content_type = $${queryParams.length}`;
      }

      // Add pagination params
      queryParams.push(limit, offset);

      const result = await db.query(`
        SELECT 
          r.id, r.content_type, r.content_id, r.reason, r.description,
          r.status, r.action_taken, r.created_at, r.reviewed_at,
          reporter.first_name as reporter_first_name,
          reporter.last_name as reporter_last_name,
          reviewer.first_name as reviewer_first_name,
          reviewer.last_name as reviewer_last_name
        FROM public.reports r
        JOIN public.users reporter ON r.reporter_id = reporter.id
        LEFT JOIN public.users reviewer ON r.reviewed_by = reviewer.id
        WHERE ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
      `, queryParams);

      // Get total count for pagination
      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const countResult = await db.query(`
        SELECT COUNT(*) FROM public.reports r
        WHERE ${whereClause}
      `, countParams);

      const totalReports = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalReports / limit);

      res.json({
        success: true,
        data: {
          reports: result.rows.map(report => ({
            ...report,
            reporter: {
              first_name: report.reporter_first_name,
              last_name: report.reporter_last_name
            },
            reviewer: report.reviewer_first_name ? {
              first_name: report.reviewer_first_name,
              last_name: report.reviewer_last_name
            } : null
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalReports,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          },
          summary: await this.getReportsSummary()
        }
      });

    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reports',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get single report with content details (admin only)
   * GET /reports/:id
   */
  async getReportById(req, res) {
    const { id } = req.params;

    try {
      const result = await db.query(`
        SELECT 
          r.id, r.content_type, r.content_id, r.reason, r.description,
          r.status, r.action_taken, r.created_at, r.reviewed_at,
          reporter.id as reporter_id,
          reporter.first_name as reporter_first_name,
          reporter.last_name as reporter_last_name,
          reporter.email as reporter_email,
          reviewer.first_name as reviewer_first_name,
          reviewer.last_name as reviewer_last_name
        FROM public.reports r
        JOIN public.users reporter ON r.reporter_id = reporter.id
        LEFT JOIN public.users reviewer ON r.reviewed_by = reviewer.id
        WHERE r.id = $1
      `, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      const report = result.rows[0];

      // Get the reported content details
      let reportedContent = null;
      if (report.content_type === 'review') {
        const contentResult = await db.query(`
          SELECT r.id, r.title, r.content, r.rating, r.is_approved,
                 u.first_name, u.last_name
          FROM public.reviews r
          JOIN public.users u ON r.user_id = u.id
          WHERE r.id = $1
        `, [report.content_id]);
        
        if (contentResult.rows.length > 0) {
          reportedContent = {
            type: 'review',
            ...contentResult.rows[0]
          };
        }
      } else if (report.content_type === 'comment') {
        const contentResult = await db.query(`
          SELECT c.id, c.content, c.is_approved, c.is_deleted,
                 u.first_name, u.last_name
          FROM public.comments c
          JOIN public.users u ON c.user_id = u.id
          WHERE c.id = $1
        `, [report.content_id]);
        
        if (contentResult.rows.length > 0) {
          reportedContent = {
            type: 'comment',
            ...contentResult.rows[0]
          };
        }
      }

      res.json({
        success: true,
        data: {
          report: {
            ...report,
            reporter: {
              id: report.reporter_id,
              first_name: report.reporter_first_name,
              last_name: report.reporter_last_name,
              email: report.reporter_email
            },
            reviewer: report.reviewer_first_name ? {
              first_name: report.reviewer_first_name,
              last_name: report.reviewer_last_name
            } : null,
            reported_content: reportedContent
          }
        }
      });

    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update report status (admin only)
   * PUT /reports/:id
   */
  async updateReport(req, res) {
    const { id } = req.params;
    const { status, action_taken } = req.body;
    const reviewerId = req.user.id;

    try {
      // Check if report exists
      const existingReport = await db.query(
        'SELECT content_type, content_id FROM public.reports WHERE id = $1',
        [id]
      );

      if (existingReport.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }

      // Update the report
      const result = await db.query(`
        UPDATE public.reports 
        SET status = $1, action_taken = $2, reviewed_by = $3, 
            reviewed_at = NOW(), updated_at = NOW()
        WHERE id = $4
        RETURNING id, status, action_taken, reviewed_at
      `, [status, action_taken, reviewerId, id]);

      const updatedReport = result.rows[0];

      // If action was taken, update the reported content
      if (status === 'action_taken') {
        const contentType = existingReport.rows[0].content_type;
        const contentId = existingReport.rows[0].content_id;

        if (contentType === 'review') {
          // Disable the review
          await db.query(
            'UPDATE public.reviews SET is_approved = false, updated_at = NOW() WHERE id = $1',
            [contentId]
          );
        } else if (contentType === 'comment') {
          // Disable the comment
          await db.query(
            'UPDATE public.comments SET is_approved = false, updated_at = NOW() WHERE id = $1',
            [contentId]
          );
        }
      }

      // Audit logging
      await auditLog(reviewerId, 'REPORT_REVIEWED', 'reports', id, {
        status,
        action_taken,
        content_type: existingReport.rows[0].content_type
      });

      res.json({
        success: true,
        message: 'Report updated successfully',
        report: updatedReport
      });

    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get user's own reports
   * GET /reports/my-reports
   */
  async getMyReports(req, res) {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const result = await db.query(`
        SELECT 
          id, content_type, content_id, reason, description,
          status, action_taken, created_at, reviewed_at
        FROM public.reports
        WHERE reporter_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [userId, limit, offset]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM public.reports WHERE reporter_id = $1',
        [userId]
      );

      const totalReports = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalReports / limit);

      res.json({
        success: true,
        data: {
          reports: result.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total_items: totalReports,
            total_pages: totalPages,
            has_next: page < totalPages,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get my reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch your reports',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get reports summary statistics (admin only)
   * GET /reports/summary
   */
  async getReportsSummary() {
    try {
      const result = await db.query(`
        SELECT 
          status,
          content_type,
          COUNT(*) as count
        FROM public.reports
        GROUP BY status, content_type
        ORDER BY status, content_type
      `);

      const summary = {
        total: 0,
        by_status: {},
        by_content_type: {},
        pending_count: 0
      };

      result.rows.forEach(row => {
        summary.total += parseInt(row.count);
        
        if (!summary.by_status[row.status]) {
          summary.by_status[row.status] = 0;
        }
        summary.by_status[row.status] += parseInt(row.count);

        if (!summary.by_content_type[row.content_type]) {
          summary.by_content_type[row.content_type] = 0;
        }
        summary.by_content_type[row.content_type] += parseInt(row.count);

        if (row.status === 'pending') {
          summary.pending_count += parseInt(row.count);
        }
      });

      return summary;
    } catch (error) {
      console.error('Get reports summary error:', error);
      return {
        total: 0,
        by_status: {},
        by_content_type: {},
        pending_count: 0
      };
    }
  }

  /**
   * Bulk update reports (admin only)
   * PUT /reports/bulk
   */
  async bulkUpdateReports(req, res) {
    const { report_ids, status, action_taken } = req.body;
    const reviewerId = req.user.id;

    try {
      if (!Array.isArray(report_ids) || report_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'report_ids must be a non-empty array'
        });
      }

      // Update all specified reports
      const result = await db.query(`
        UPDATE public.reports 
        SET status = $1, action_taken = $2, reviewed_by = $3, 
            reviewed_at = NOW(), updated_at = NOW()
        WHERE id = ANY($4::uuid[])
        RETURNING id, content_type, content_id
      `, [status, action_taken, reviewerId, report_ids]);

      // If action was taken, update the reported content
      if (status === 'action_taken') {
        for (const report of result.rows) {
          if (report.content_type === 'review') {
            await db.query(
              'UPDATE public.reviews SET is_approved = false, updated_at = NOW() WHERE id = $1',
              [report.content_id]
            );
          } else if (report.content_type === 'comment') {
            await db.query(
              'UPDATE public.comments SET is_approved = false, updated_at = NOW() WHERE id = $1',
              [report.content_id]
            );
          }
        }
      }

      // Audit logging
      await auditLog(reviewerId, 'REPORTS_BULK_UPDATED', 'reports', null, {
        report_count: result.rows.length,
        status,
        action_taken
      });

      res.json({
        success: true,
        message: `${result.rows.length} reports updated successfully`,
        updated_count: result.rows.length
      });

    } catch (error) {
      console.error('Bulk update reports error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk update reports',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // === EMAIL NOTIFICATION HELPERS ===

  /**
   * Send urgent report notification to all admins
   */
  async sendReportNotification(report, contentType, contentId) {
    try {
      // Get the reported content details
      const content = await this.getContentDetails(contentType, contentId);
      if (!content) {
        console.warn(`Content not found for report: ${contentType} ${contentId}`);
        return;
      }

      // Get all admin users for urgent abuse reports
      const adminQuery = await db.query(`
        SELECT id, email, first_name, last_name 
        FROM public.users 
        WHERE role = 'admin' AND email_verified = true
      `);

      if (adminQuery.rows.length > 0) {
        await emailService.sendBulkReportAlerts(adminQuery.rows, report, content);
        console.log(`Sent urgent report alerts to ${adminQuery.rows.length} admins for ${contentType} ${contentId}`);
      }
    } catch (error) {
      console.error('Failed to send report notifications:', error);
      throw error;
    }
  }

  /**
   * Send moderation action notification to user
   */
  async sendModerationNotification(userId, action, contentType, contentId, reason = null) {
    try {
      // Get user and content details
      const userQuery = await db.query(
        'SELECT id, email, first_name, last_name FROM public.users WHERE id = $1 AND email_verified = true',
        [userId]
      );

      if (userQuery.rows.length === 0) {
        console.warn(`User not found or email not verified: ${userId}`);
        return;
      }

      const content = await this.getContentDetails(contentType, contentId);
      if (!content) {
        console.warn(`Content not found for moderation notification: ${contentType} ${contentId}`);
        return;
      }

      await emailService.sendModerationActionNotification(userQuery.rows[0], action, content, reason);
      console.log(`Sent moderation ${action} notification to user ${userId}`);
    } catch (error) {
      console.error('Failed to send moderation notification:', error);
      throw error;
    }
  }

  /**
   * Get content details for notifications
   */
  async getContentDetails(contentType, contentId) {
    try {
      let query, params;
      
      if (contentType === 'review') {
        query = `
          SELECT r.id, r.title, r.content, r.rating, r.deal_id, r.created_at,
                 u.id as user_id, u.email, u.first_name, u.last_name
          FROM public.reviews r
          JOIN public.users u ON r.user_id = u.id
          WHERE r.id = $1
        `;
        params = [contentId];
      } else if (contentType === 'comment') {
        query = `
          SELECT c.id, c.content, c.deal_id, c.review_id, c.created_at,
                 u.id as user_id, u.email, u.first_name, u.last_name
          FROM public.comments c
          JOIN public.users u ON c.user_id = u.id
          WHERE c.id = $1
        `;
        params = [contentId];
      } else {
        return null;
      }

      const result = await db.query(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        title: row.title || null,
        content: row.content,
        rating: row.rating || null,
        deal_id: row.deal_id || null,
        review_id: row.review_id || null,
        created_at: row.created_at,
        user: {
          id: row.user_id,
          email: row.email,
          first_name: row.first_name,
          last_name: row.last_name
        }
      };
    } catch (error) {
      console.error('Failed to get content details:', error);
      return null;
    }
  }
}

module.exports = new ReportsController();