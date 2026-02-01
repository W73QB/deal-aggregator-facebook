/**
 * Saved Filters Controllers
 * CRUD operations for user saved filters
 */

const db = require('../utils/database');
const auditLogger = require('../utils/audit');

class FiltersController {
  // POST /filters - Create new saved filter
  async createFilter(req, res) {
    try {
      const { name, criteria, is_active = true } = req.body;
      const userId = req.user.id;

      // Check if filter with same name already exists for user
      const existingFilter = await db.query(
        'SELECT id FROM public.saved_filters WHERE user_id = $1 AND name = $2',
        [userId, name]
      );

      if (existingFilter.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'A filter with this name already exists',
          code: 'FILTER_NAME_EXISTS'
        });
      }

      // Create new filter
      const result = await db.query(`
        INSERT INTO public.saved_filters (user_id, name, criteria, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, name, criteria, is_active, created_at, updated_at
      `, [userId, name, JSON.stringify(criteria), is_active]);

      const filter = result.rows[0];

      // Log creation
      console.log(`📝 Filter created: ${name} for user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Filter created successfully',
        data: {
          filter: {
            id: filter.id,
            name: filter.name,
            criteria: filter.criteria,
            is_active: filter.is_active,
            created_at: filter.created_at,
            updated_at: filter.updated_at
          }
        }
      });

    } catch (error) {
      console.error('Create filter error:', error);
      
      if (error.message.includes('saved_filters_name_length')) {
        return res.status(400).json({
          success: false,
          message: 'Filter name must be between 1 and 100 characters'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /filters - List user's saved filters
  async getFilters(req, res) {
    try {
      const userId = req.user.id;
      const { is_active, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT id, name, criteria, is_active, created_at, updated_at
        FROM public.saved_filters 
        WHERE user_id = $1
      `;
      const params = [userId];

      // Add is_active filter if specified
      if (is_active !== undefined) {
        query += ` AND is_active = $${params.length + 1}`;
        params.push(is_active === 'true');
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM public.saved_filters WHERE user_id = $1';
      const countParams = [userId];
      
      if (is_active !== undefined) {
        countQuery += ' AND is_active = $2';
        countParams.push(is_active === 'true');
      }

      const countResult = await db.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          filters: result.rows,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            has_more: (parseInt(offset) + result.rows.length) < totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get filters error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /filters/:id - Get specific filter
  async getFilter(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await db.query(`
        SELECT id, name, criteria, is_active, created_at, updated_at
        FROM public.saved_filters 
        WHERE id = $1 AND user_id = $2
      `, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Filter not found'
        });
      }

      const filter = result.rows[0];

      res.json({
        success: true,
        data: {
          filter: filter
        }
      });

    } catch (error) {
      console.error('Get filter error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // PUT /filters/:id - Update filter
  async updateFilter(req, res) {
    try {
      const { id } = req.params;
      const { name, criteria, is_active } = req.body;
      const userId = req.user.id;

      // Check if filter exists and belongs to user
      const existingResult = await db.query(
        'SELECT id, name FROM public.saved_filters WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Filter not found'
        });
      }

      // If name is being changed, check for conflicts
      if (name && name !== existingResult.rows[0].name) {
        const nameConflict = await db.query(
          'SELECT id FROM public.saved_filters WHERE user_id = $1 AND name = $2 AND id != $3',
          [userId, name, id]
        );

        if (nameConflict.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'A filter with this name already exists',
            code: 'FILTER_NAME_EXISTS'
          });
        }
      }

      // Build dynamic update query
      const updateFields = [];
      const params = [];
      let paramCount = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramCount}`);
        params.push(name);
        paramCount++;
      }

      if (criteria !== undefined) {
        updateFields.push(`criteria = $${paramCount}`);
        params.push(JSON.stringify(criteria));
        paramCount++;
      }

      if (is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount}`);
        params.push(is_active);
        paramCount++;
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Add WHERE clause parameters
      params.push(id, userId);

      const updateQuery = `
        UPDATE public.saved_filters 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING id, name, criteria, is_active, created_at, updated_at
      `;

      const result = await db.query(updateQuery, params);
      const filter = result.rows[0];

      console.log(`📝 Filter updated: ${filter.name} for user ${userId}`);

      res.json({
        success: true,
        message: 'Filter updated successfully',
        data: {
          filter: filter
        }
      });

    } catch (error) {
      console.error('Update filter error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // DELETE /filters/:id - Delete filter
  async deleteFilter(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if filter exists and get info before deletion
      const existingResult = await db.query(
        'SELECT id, name FROM public.saved_filters WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Filter not found'
        });
      }

      const filterName = existingResult.rows[0].name;

      // Delete filter (cascade will handle alerts and deliveries)
      await db.query(
        'DELETE FROM public.saved_filters WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      console.log(`🗑️ Filter deleted: ${filterName} for user ${userId}`);

      res.json({
        success: true,
        message: 'Filter deleted successfully'
      });

    } catch (error) {
      console.error('Delete filter error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /filters/:id/alerts - Get alerts for specific filter
  async getFilterAlerts(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify filter belongs to user
      const filterResult = await db.query(
        'SELECT id, name FROM public.saved_filters WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (filterResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Filter not found'
        });
      }

      // Get alerts for this filter
      const alertsResult = await db.query(`
        SELECT id, frequency, is_active, last_triggered_at, next_trigger_at, created_at, updated_at
        FROM public.alerts
        WHERE filter_id = $1 AND user_id = $2
        ORDER BY created_at DESC
      `, [id, userId]);

      res.json({
        success: true,
        data: {
          filter: filterResult.rows[0],
          alerts: alertsResult.rows
        }
      });

    } catch (error) {
      console.error('Get filter alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new FiltersController();