/**
 * JWT Utilities for Auth System
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.dealradarus.local' });

class JWTUtils {
  constructor() {
    this.accessSecret = process.env.JWT_SECRET;
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES || '15m';
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES || '7d';
    
    if (!this.accessSecret) {
      throw new Error('JWT_SECRET not found in environment variables');
    }
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
      issuer: 'dealradarus',
      audience: 'dealradarus-users'
    });
  }

  generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.accessSecret, {
        issuer: 'dealradarus',
        audience: 'dealradarus-users'
      });
    } catch (error) {
      throw new Error(`Invalid access token: ${error.message}`);
    }
  }

  generateTokenPair(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      verified: user.email_verified
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken()
    };
  }

  getCookieOptions(isDevelopment = false) {
    return {
      httpOnly: true,
      secure: !isDevelopment,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    };
  }
}

module.exports = new JWTUtils();