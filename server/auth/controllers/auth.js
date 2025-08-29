/**
 * Authentication Controllers
 */

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../utils/database');
const jwt = require('../utils/jwt');
const passwordUtils = require('../utils/password');
const auditLogger = require('../utils/audit');
const emailService = require('../../email/service');

class AuthController {
  // POST /auth/signup
  async signup(req, res) {
    try {
      const { email, password, first_name, last_name, newsletter_subscribed } = req.body;

      // Validate password strength
      const passwordErrors = passwordUtils.validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        await auditLogger.logSignup(null, req, 'failed', 'WEAK_PASSWORD');
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          errors: passwordErrors
        });
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id, email_verified FROM public.users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        const user = existingUser.rows[0];
        await auditLogger.logSignup(user, req, 'failed', 'EMAIL_EXISTS');
        
        if (user.email_verified) {
          return res.status(409).json({
            success: false,
            message: 'Account already exists. Please log in instead.',
            code: 'EMAIL_EXISTS'
          });
        } else {
          return res.status(409).json({
            success: false,
            message: 'Account exists but email not verified. Please check your email or request a new verification.',
            code: 'EMAIL_NOT_VERIFIED'
          });
        }
      }

      // Hash password
      const passwordHash = await passwordUtils.hash(password);

      // Create user
      const userResult = await db.query(`
        INSERT INTO public.users (
          email, password_hash, first_name, last_name, newsletter_subscribed
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, first_name, last_name, newsletter_subscribed, created_at
      `, [email, passwordHash, first_name || null, last_name || null, newsletter_subscribed || false]);

      const user = userResult.rows[0];

      // Generate email verification token
      const { token, hash, expiresAt } = passwordUtils.generateEmailVerificationToken();

      // Store verification token
      await db.query(`
        INSERT INTO public.email_verifications (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
      `, [user.id, hash, expiresAt]);

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(user, token);
      
      // Log successful signup
      await auditLogger.logSignup(user, req, 'success');

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            email_verified: false,
            created_at: user.created_at
          },
          email_sent: emailResult.success
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      await auditLogger.logSignup(null, req, 'failed', 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  // POST /auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const userResult = await db.query(
        'SELECT id, email, password_hash, role, email_verified, first_name, last_name FROM public.users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        await auditLogger.logFailedLogin(email, req, 'USER_NOT_FOUND');
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const user = userResult.rows[0];

      // Verify password
      const isValidPassword = await passwordUtils.verify(password, user.password_hash);
      if (!isValidPassword) {
        await auditLogger.logFailedLogin(email, req, 'INVALID_PASSWORD');
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = jwt.generateTokenPair(user);

      // Store refresh token in sessions table
      const sessionResult = await db.query(`
        INSERT INTO public.sessions (user_id, refresh_token, user_agent, ip_address, expires_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        user.id,
        refreshToken,
        req.get('User-Agent'),
        req.ip,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      ]);

      const sessionId = sessionResult.rows[0].id;

      // Update last login
      await db.query(
        'UPDATE public.users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      // Set cookies
      const isDevelopment = process.env.NODE_ENV === 'development';
      const cookieOptions = jwt.getCookieOptions(isDevelopment);
      
      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, cookieOptions);

      // Log successful login
      await auditLogger.logLogin(user, req, 'success', null, sessionId);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            email_verified: user.email_verified,
            first_name: user.first_name,
            last_name: user.last_name
          },
          tokens: {
            access_token: accessToken,
            expires_in: '15m'
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      await auditLogger.logFailedLogin(req.body.email, req, 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /auth/refresh
  async refresh(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Find session
      const sessionResult = await db.query(`
        SELECT s.user_id, s.expires_at, u.email, u.role, u.email_verified, u.first_name, u.last_name
        FROM public.sessions s
        JOIN public.users u ON s.user_id = u.id
        WHERE s.refresh_token = $1 AND s.expires_at > NOW()
      `, [refreshToken]);

      if (sessionResult.rows.length === 0) {
        await auditLogger.logRefreshToken(null, req, 'failed', 'INVALID_TOKEN');
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      const user = sessionResult.rows[0];

      // Generate new access token
      const { accessToken } = jwt.generateTokenPair(user);

      // Update session last used
      await db.query(
        'UPDATE public.sessions SET last_used_at = NOW() WHERE refresh_token = $1',
        [refreshToken]
      );

      // Set new access token cookie
      const isDevelopment = process.env.NODE_ENV === 'development';
      const cookieOptions = jwt.getCookieOptions(isDevelopment);
      res.cookie('accessToken', accessToken, cookieOptions);

      // Log successful refresh
      await auditLogger.logRefreshToken(user, req, 'success');

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          access_token: accessToken,
          expires_in: '15m'
        }
      });

    } catch (error) {
      console.error('Refresh error:', error);
      await auditLogger.logRefreshToken(null, req, 'failed', 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /auth/logout
  async logout(req, res) {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        // Remove session from database
        await db.query('DELETE FROM public.sessions WHERE refresh_token = $1', [refreshToken]);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      // Log logout
      if (req.user) {
        await auditLogger.logLogout(req.user, req);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // GET /auth/me
  async me(req, res) {
    try {
      // Get fresh user data
      const userResult = await db.query(
        'SELECT id, email, role, email_verified, first_name, last_name, newsletter_subscribed, preferences, created_at, last_login_at FROM public.users WHERE id = $1',
        [req.user.id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      res.json({
        success: true,
        data: {
          user: user
        }
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new AuthController();