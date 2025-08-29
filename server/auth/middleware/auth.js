/**
 * Authentication Middleware
 */

const jwt = require('../utils/jwt');
const db = require('../utils/database');

function authGuard(requiredRole = null) {
  return async (req, res, next) => {
    try {
      const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      // Verify and decode token
      const decoded = jwt.verifyAccessToken(token);
      
      // Get fresh user data from database
      const userResult = await db.query(
        'SELECT id, email, role, email_verified, created_at FROM public.users WHERE id = $1',
        [decoded.sub]
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token - user not found'
        });
      }

      const user = userResult.rows[0];

      // Check if email is verified (for routes that require it)
      if (req.route?.path !== '/verify-email' && !user.email_verified) {
        return res.status(403).json({
          success: false,
          message: 'Email verification required',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Check role if specified
      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${requiredRole} role required`
        });
      }

      // Attach user to request
      req.user = user;
      req.tokenPayload = decoded;
      
      next();
    } catch (error) {
      if (error.message.includes('jwt expired')) {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message
      });
    }
  };
}

async function optionalAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verifyAccessToken(token);
      const userResult = await db.query(
        'SELECT id, email, role, email_verified FROM public.users WHERE id = $1',
        [decoded.sub]
      );

      if (userResult.rows.length > 0) {
        req.user = userResult.rows[0];
        req.tokenPayload = decoded;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, continue even if token is invalid
    next();
  }
}

async function adminOnly(req, res, next) {
  return authGuard('admin')(req, res, next);
}

module.exports = {
  authGuard,
  optionalAuth,
  adminOnly
};