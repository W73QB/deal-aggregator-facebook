/**
 * Alerts Controllers
 * CRUD operations for user alert configurations
 */

const db = require('../utils/database');
const auditLogger = require('../utils/audit');

class AlertsController {
  // POST /alerts - Create new alert
  async createAlert(req, res) {
    try {
      const { filter_id, frequency, is_active = true } = req.body;
      const userId = req.user.id;

      // Verify filter exists and belongs to user
      const filterResult = await db.query(
        'SELECT id, name, is_active FROM public.saved_filters WHERE id = $1 AND user_id = $2',
        [filter_id, userId]
      );

      if (filterResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Filter not found'
        });
      }

      const filter = filterResult.rows[0];

      // Check if alert already exists for this filter
      const existingAlert = await db.query(
        'SELECT id FROM public.alerts WHERE user_id = $1 AND filter_id = $2',
        [userId, filter_id]
      );

      if (existingAlert.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Alert already exists for this filter',
          code: 'ALERT_EXISTS'
        });
      }

      // Create new alert (trigger will set next_trigger_at automatically)
      const result = await db.query(`
        INSERT INTO public.alerts (user_id, filter_id, frequency, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, user_id, filter_id, frequency, is_active, last_triggered_at, next_trigger_at, created_at, updated_at
      `, [userId, filter_id, frequency, is_active]);

      const alert = result.rows[0];

      console.log(`🔔 Alert created: ${frequency} alert for filter ${filter.name} (user ${userId})`);

      res.status(201).json({
        success: true,
        message: 'Alert created successfully',
        data: {
          alert: {
            id: alert.id,
            filter_id: alert.filter_id,
            frequency: alert.frequency,
            is_active: alert.is_active,
            last_triggered_at: alert.last_triggered_at,
            next_trigger_at: alert.next_trigger_at,
            created_at: alert.created_at,
            updated_at: alert.updated_at
          },
          filter: {
            id: filter.id,
            name: filter.name
          }
        }
      });

    } catch (error) {
      console.error('Create alert error:', error);
      
      if (error.message.includes('frequency')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid frequency. Must be: instant, daily, or weekly'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /alerts - List user's alerts
  async getAlerts(req, res) {
    try {
      const userId = req.user.id;
      const { is_active, frequency, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT 
          a.id, a.filter_id, a.frequency, a.is_active, 
          a.last_triggered_at, a.next_trigger_at, a.created_at, a.updated_at,
          sf.name as filter_name, sf.criteria as filter_criteria
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        WHERE a.user_id = $1
      `;
      const params = [userId];

      // Add filters
      if (is_active !== undefined) {
        query += ` AND a.is_active = $${params.length + 1}`;
        params.push(is_active === 'true');
      }

      if (frequency) {
        query += ` AND a.frequency = $${params.length + 1}`;
        params.push(frequency);
      }

      query += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) 
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        WHERE a.user_id = $1
      `;
      const countParams = [userId];
      
      if (is_active !== undefined) {
        countQuery += ' AND a.is_active = $2';
        countParams.push(is_active === 'true');
      }
      
      if (frequency) {
        countQuery += ` AND a.frequency = $${countParams.length + 1}`;
        countParams.push(frequency);
      }

      const countResult = await db.query(countQuery, countParams);
      const totalCount = parseInt(countResult.rows[0].count);

      // Format response
      const alerts = result.rows.map(row => ({
        id: row.id,
        filter_id: row.filter_id,
        frequency: row.frequency,
        is_active: row.is_active,
        last_triggered_at: row.last_triggered_at,
        next_trigger_at: row.next_trigger_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        filter: {
          name: row.filter_name,
          criteria: row.filter_criteria
        }
      }));

      res.json({
        success: true,
        data: {
          alerts: alerts,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            has_more: (parseInt(offset) + alerts.length) < totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /alerts/:id - Get specific alert
  async getAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await db.query(`
        SELECT 
          a.id, a.filter_id, a.frequency, a.is_active, 
          a.last_triggered_at, a.next_trigger_at, a.created_at, a.updated_at,
          sf.name as filter_name, sf.criteria as filter_criteria, sf.is_active as filter_active
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        WHERE a.id = $1 AND a.user_id = $2
      `, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      const row = result.rows[0];

      res.json({
        success: true,
        data: {
          alert: {
            id: row.id,
            filter_id: row.filter_id,
            frequency: row.frequency,
            is_active: row.is_active,
            last_triggered_at: row.last_triggered_at,
            next_trigger_at: row.next_trigger_at,
            created_at: row.created_at,
            updated_at: row.updated_at,
            filter: {
              name: row.filter_name,
              criteria: row.filter_criteria,
              is_active: row.filter_active
            }
          }
        }
      });

    } catch (error) {
      console.error('Get alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // PUT /alerts/:id - Update alert
  async updateAlert(req, res) {
    try {
      const { id } = req.params;
      const { frequency, is_active } = req.body;
      const userId = req.user.id;

      // Check if alert exists and belongs to user
      const existingResult = await db.query(
        'SELECT id, frequency, is_active FROM public.alerts WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Build dynamic update query
      const updateFields = [];
      const params = [];
      let paramCount = 1;

      if (frequency !== undefined) {
        updateFields.push(`frequency = $${paramCount}`);
        params.push(frequency);
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
        UPDATE public.alerts 
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
        RETURNING id, filter_id, frequency, is_active, last_triggered_at, next_trigger_at, created_at, updated_at
      `;

      const result = await db.query(updateQuery, params);
      const alert = result.rows[0];

      console.log(`🔔 Alert updated: ${alert.frequency} alert ${alert.id} (user ${userId})`);

      res.json({
        success: true,
        message: 'Alert updated successfully',
        data: {
          alert: alert
        }
      });

    } catch (error) {
      console.error('Update alert error:', error);
      
      if (error.message.includes('frequency')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid frequency. Must be: instant, daily, or weekly'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // DELETE /alerts/:id - Delete alert
  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if alert exists and get info before deletion
      const existingResult = await db.query(`
        SELECT a.id, a.frequency, sf.name as filter_name
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        WHERE a.id = $1 AND a.user_id = $2
      `, [id, userId]);

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      const alertInfo = existingResult.rows[0];

      // Delete alert (cascade will handle deliveries)
      await db.query(
        'DELETE FROM public.alerts WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      console.log(`🗑️ Alert deleted: ${alertInfo.frequency} alert for ${alertInfo.filter_name} (user ${userId})`);

      res.json({
        success: true,
        message: 'Alert deleted successfully'
      });

    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /alerts/:id/deliveries - Get delivery history for alert
  async getAlertDeliveries(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      // Verify alert belongs to user
      const alertResult = await db.query(`
        SELECT a.id, a.frequency, sf.name as filter_name
        FROM public.alerts a
        JOIN public.saved_filters sf ON a.filter_id = sf.id
        WHERE a.id = $1 AND a.user_id = $2
      `, [id, userId]);

      if (alertResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Alert not found'
        });
      }

      // Get delivery history
      const deliveriesResult = await db.query(`
        SELECT 
          ad.id, ad.deals_count, ad.trigger_reason, ad.status, ad.created_at,
          ee.subject, ee.message_id, ee.duration_ms
        FROM public.alert_deliveries ad
        LEFT JOIN public.email_events ee ON ad.email_event_id = ee.id
        WHERE ad.alert_id = $1
        ORDER BY ad.created_at DESC
        LIMIT $2 OFFSET $3
      `, [id, parseInt(limit), parseInt(offset)]);

      // Get total count
      const countResult = await db.query(
        'SELECT COUNT(*) FROM public.alert_deliveries WHERE alert_id = $1',
        [id]
      );
      const totalCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: {
          alert: alertResult.rows[0],
          deliveries: deliveriesResult.rows,
          pagination: {
            total: totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset),
            has_more: (parseInt(offset) + deliveriesResult.rows.length) < totalCount
          }
        }
      });

    } catch (error) {
      console.error('Get alert deliveries error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AlertsController();