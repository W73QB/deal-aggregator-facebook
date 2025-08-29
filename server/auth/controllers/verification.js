/**
 * Email Verification & Password Reset Controllers
 */

const db = require('../utils/database');
const passwordUtils = require('../utils/password');
const auditLogger = require('../utils/audit');
const emailService = require('../../email/service');

class VerificationController {
  // POST /auth/verify-email
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;
      const tokenHash = passwordUtils.hashToken(token);

      // Find verification record
      const verificationResult = await db.query(`
        SELECT ev.id, ev.user_id, ev.expires_at, u.email, u.email_verified, u.first_name, u.last_name
        FROM public.email_verifications ev
        JOIN public.users u ON ev.user_id = u.id
        WHERE ev.token_hash = $1 AND ev.verified_at IS NULL AND ev.expires_at > NOW()
      `, [tokenHash]);

      if (verificationResult.rows.length === 0) {
        await auditLogger.logEmailVerification(null, req, 'failed', 'INVALID_TOKEN');
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token',
          code: 'INVALID_TOKEN'
        });
      }

      const verification = verificationResult.rows[0];
      const user = {
        id: verification.user_id,
        email: verification.email,
        first_name: verification.first_name,
        last_name: verification.last_name
      };

      // Check if already verified
      if (verification.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
          code: 'ALREADY_VERIFIED'
        });
      }

      // Transaction to update verification and user
      await db.transaction(async (client) => {
        // Mark verification as completed
        await client.query(
          'UPDATE public.email_verifications SET verified_at = NOW() WHERE id = $1',
          [verification.id]
        );

        // Mark user email as verified
        await client.query(
          'UPDATE public.users SET email_verified = true WHERE id = $1',
          [user.id]
        );
      });

      // Send welcome email
      const emailResult = await emailService.sendWelcomeEmail(user);

      // Log successful verification
      await auditLogger.logEmailVerification(user, req, 'success');

      res.json({
        success: true,
        message: 'Email verified successfully! Welcome to DealRadarUS.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            email_verified: true,
            first_name: user.first_name,
            last_name: user.last_name
          },
          welcome_email_sent: emailResult.success
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      await auditLogger.logEmailVerification(null, req, 'failed', 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  // POST /auth/resend-verification
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const userResult = await db.query(
        'SELECT id, email, email_verified, first_name, last_name FROM public.users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If an account with this email exists and is not verified, a verification email will be sent.'
        });
      }

      const user = userResult.rows[0];

      if (user.email_verified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified',
          code: 'ALREADY_VERIFIED'
        });
      }

      // Check for recent verification attempts (prevent spam)
      const recentAttempt = await db.query(`
        SELECT id FROM public.email_verifications
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '5 minutes'
        ORDER BY created_at DESC LIMIT 1
      `, [user.id]);

      if (recentAttempt.rows.length > 0) {
        return res.status(429).json({
          success: false,
          message: 'Verification email was sent recently. Please wait 5 minutes before requesting another.',
          code: 'TOO_FREQUENT'
        });
      }

      // Generate new verification token
      const { token, hash, expiresAt } = passwordUtils.generateEmailVerificationToken();

      // Store new verification token (invalidates previous ones)
      await db.query(
        'INSERT INTO public.email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, hash, expiresAt]
      );

      // Send verification email
      const emailResult = await emailService.sendVerificationEmail(user, token);

      res.json({
        success: true,
        message: 'Verification email sent. Please check your inbox.',
        data: {
          email_sent: emailResult.success
        }
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user (always return success to prevent user enumeration)
      const userResult = await db.query(
        'SELECT id, email, first_name, last_name FROM public.users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        await auditLogger.logForgotPassword(email, req, 'failed', 'USER_NOT_FOUND');
        // Don't reveal if email exists
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset link will be sent.'
        });
      }

      const user = userResult.rows[0];

      // Check for recent password reset attempts
      const recentAttempt = await db.query(`
        SELECT id FROM public.password_resets
        WHERE user_id = $1 AND created_at > NOW() - INTERVAL '5 minutes'
        ORDER BY created_at DESC LIMIT 1
      `, [user.id]);

      if (recentAttempt.rows.length > 0) {
        return res.status(429).json({
          success: false,
          message: 'Password reset email was sent recently. Please wait 5 minutes before requesting another.',
          code: 'TOO_FREQUENT'
        });
      }

      // Generate password reset token
      const { token, hash, expiresAt } = passwordUtils.generatePasswordResetToken();

      // Store reset token (invalidates previous ones by expiry)
      await db.query(
        'INSERT INTO public.password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [user.id, hash, expiresAt]
      );

      // Send password reset email
      const emailResult = await emailService.sendPasswordResetEmail(user, token);

      // Log password reset request
      await auditLogger.logForgotPassword(email, req, 'success');

      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link will be sent.',
        data: {
          email_sent: emailResult.success
        }
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      await auditLogger.logForgotPassword(req.body.email, req, 'failed', 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /auth/reset-password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const tokenHash = passwordUtils.hashToken(token);

      // Validate password strength
      const passwordErrors = passwordUtils.validatePasswordStrength(password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet security requirements',
          errors: passwordErrors
        });
      }

      // Find valid reset token
      const resetResult = await db.query(`
        SELECT pr.id, pr.user_id, pr.used_at, u.email, u.first_name, u.last_name
        FROM public.password_resets pr
        JOIN public.users u ON pr.user_id = u.id
        WHERE pr.token_hash = $1 AND pr.expires_at > NOW() AND pr.used_at IS NULL
      `, [tokenHash]);

      if (resetResult.rows.length === 0) {
        await auditLogger.logPasswordReset(null, req, 'failed', 'INVALID_TOKEN');
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token',
          code: 'INVALID_TOKEN'
        });
      }

      const reset = resetResult.rows[0];
      const user = {
        id: reset.user_id,
        email: reset.email,
        first_name: reset.first_name,
        last_name: reset.last_name
      };

      // Hash new password
      const newPasswordHash = await passwordUtils.hash(password);

      // Transaction to update password and mark token as used
      await db.transaction(async (client) => {
        // Update user password
        await client.query(
          'UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
          [newPasswordHash, user.id]
        );

        // Mark reset token as used
        await client.query(
          'UPDATE public.password_resets SET used_at = NOW() WHERE id = $1',
          [reset.id]
        );

        // Invalidate all user sessions (force re-login)
        await client.query(
          'DELETE FROM public.sessions WHERE user_id = $1',
          [user.id]
        );
      });

      // Log successful password reset
      await auditLogger.logPasswordReset(user, req, 'success');

      res.json({
        success: true,
        message: 'Password reset successfully. Please log in with your new password.',
        data: {
          user: {
            id: user.id,
            email: user.email
          }
        }
      });

    } catch (error) {
      console.error('Reset password error:', error);
      await auditLogger.logPasswordReset(null, req, 'failed', 'SERVER_ERROR');
      
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  // POST /auth/change-password (for logged-in users)
  async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      // Validate new password strength
      const passwordErrors = passwordUtils.validatePasswordStrength(new_password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'New password does not meet security requirements',
          errors: passwordErrors
        });
      }

      // Get current password hash
      const userResult = await db.query(
        'SELECT password_hash FROM public.users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = userResult.rows[0];

      // Verify current password
      const isValidPassword = await passwordUtils.verify(current_password, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
          code: 'INVALID_CURRENT_PASSWORD'
        });
      }

      // Hash new password
      const newPasswordHash = await passwordUtils.hash(new_password);

      // Update password
      await db.query(
        'UPDATE public.users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

module.exports = new VerificationController();