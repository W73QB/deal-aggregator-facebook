/**
 * Password Utilities for Auth System
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');

class PasswordUtils {
  constructor() {
    this.saltRounds = 12; // Higher than default for better security
  }

  async hash(password) {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    return await bcrypt.hash(password, this.saltRounds);
  }

  async verify(password, hash) {
    if (!password || !hash) {
      return false;
    }
    
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  generatePasswordResetToken() {
    const token = this.generateSecureToken(32);
    const hash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    return {
      token, // Send this to user via email
      hash,  // Store this in database
      expiresAt
    };
  }

  generateEmailVerificationToken() {
    const token = this.generateSecureToken(32);
    const hash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    return {
      token, // Send this to user via email
      hash,  // Store this in database
      expiresAt
    };
  }

  validatePasswordStrength(password) {
    const errors = [];
    
    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return errors;
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123', 
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }
    
    return errors;
  }
}

module.exports = new PasswordUtils();