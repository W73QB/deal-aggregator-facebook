/**
 * Auth Audit Logging Utilities
 */

const db = require('./database');

class AuditLogger {
  async logAuthEvent({
    userId = null,
    email = null,
    action,
    status,
    ipAddress = null,
    userAgent = null,
    sessionId = null,
    errorCode = null,
    metadata = {}
  }) {
    try {
      const result = await db.query(`
        INSERT INTO public.auth_audit (
          user_id, email, action, status, ip_address, user_agent, 
          session_id, error_code, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, created_at
      `, [
        userId,
        email,
        action,
        status,
        ipAddress,
        userAgent,
        sessionId,
        errorCode,
        JSON.stringify(metadata)
      ]);

      const auditEntry = result.rows[0];
      
      console.log(`📝 Auth audit: ${action} ${status} for ${email || 'unknown'} (${auditEntry.id})`);
      
      return auditEntry;
    } catch (error) {
      console.error('❌ Failed to log auth event:', error.message);
      // Don't throw error to avoid breaking the main auth flow
    }
  }

  // Convenience methods for common auth events
  async logSignup(user, req, status = 'success', errorCode = null) {
    return this.logAuthEvent({
      userId: user?.id,
      email: user?.email || req.body?.email,
      action: 'signup',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode,
      metadata: {
        newsletter_subscribed: req.body?.newsletter_subscribed || false,
        has_name: !!(req.body?.first_name || req.body?.last_name)
      }
    });
  }

  async logLogin(user, req, status = 'success', errorCode = null, sessionId = null) {
    return this.logAuthEvent({
      userId: user?.id,
      email: user?.email || req.body?.email,
      action: 'login',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId,
      errorCode,
      metadata: {
        login_method: 'password',
        email_verified: user?.email_verified
      }
    });
  }

  async logFailedLogin(email, req, errorCode) {
    return this.logAuthEvent({
      email,
      action: 'failed_login',
      status: 'failed',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode,
      metadata: {
        attempt_timestamp: new Date().toISOString()
      }
    });
  }

  async logLogout(user, req, sessionId = null) {
    return this.logAuthEvent({
      userId: user.id,
      email: user.email,
      action: 'logout',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      sessionId,
      metadata: {
        logout_timestamp: new Date().toISOString()
      }
    });
  }

  async logRefreshToken(user, req, status = 'success', errorCode = null) {
    return this.logAuthEvent({
      userId: user?.id,
      email: user?.email,
      action: 'refresh',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode
    });
  }

  async logEmailVerification(user, req, status = 'success', errorCode = null) {
    return this.logAuthEvent({
      userId: user?.id,
      email: user?.email,
      action: 'verify_email',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode,
      metadata: {
        verification_timestamp: new Date().toISOString()
      }
    });
  }

  async logForgotPassword(email, req, status = 'success', errorCode = null) {
    return this.logAuthEvent({
      email,
      action: 'forgot_password',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode,
      metadata: {
        request_timestamp: new Date().toISOString()
      }
    });
  }

  async logPasswordReset(user, req, status = 'success', errorCode = null) {
    return this.logAuthEvent({
      userId: user?.id,
      email: user?.email,
      action: 'reset_password',
      status,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      errorCode,
      metadata: {
        reset_timestamp: new Date().toISOString()
      }
    });
  }

  // Analytics methods
  async getFailedLoginsByIP(ipAddress, hours = 24) {
    const result = await db.query(`
      SELECT COUNT(*) as failed_attempts, MAX(created_at) as latest_attempt
      FROM public.auth_audit
      WHERE ip_address = $1 
        AND action = 'failed_login' 
        AND created_at > NOW() - INTERVAL '${hours} hours'
    `, [ipAddress]);

    return result.rows[0];
  }

  async getRecentAuthActivity(userId, limit = 10) {
    const result = await db.query(`
      SELECT action, status, ip_address, user_agent, created_at, metadata
      FROM public.auth_audit
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [userId, limit]);

    return result.rows;
  }

  async getAuthStats(hours = 24) {
    const result = await db.query(`
      SELECT 
        action,
        status,
        COUNT(*) as count,
        COUNT(DISTINCT COALESCE(user_id::text, email)) as unique_users
      FROM public.auth_audit
      WHERE created_at > NOW() - INTERVAL '${hours} hours'
      GROUP BY action, status
      ORDER BY action, status
    `);

    return result.rows;
  }

  // General audit logging for UGC actions
  async auditLog(userId, action, resourceType, resourceId, metadata = {}) {
    try {
      // For now, log to console. This could be extended to a separate UGC audit table
      console.log(`📝 UGC audit: ${action} on ${resourceType}:${resourceId} by user ${userId}`, metadata);
      
      // You could extend this to insert into a ugc_audit table if needed
      // const result = await db.query(`
      //   INSERT INTO public.ugc_audit (user_id, action, resource_type, resource_id, metadata)
      //   VALUES ($1, $2, $3, $4, $5)
      // `, [userId, action, resourceType, resourceId, JSON.stringify(metadata)]);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to log UGC audit event:', error.message);
      return { success: false };
    }
  }
}

// Create instance and add auditLog as a standalone function for backward compatibility
const auditLogger = new AuditLogger();
const auditLog = auditLogger.auditLog.bind(auditLogger);

module.exports = auditLogger;
module.exports.auditLog = auditLog;