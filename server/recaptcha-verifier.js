/**
 * reCAPTCHA Server-Side Verifier - DealRadarUS
 * Secure server-side verification for spam protection
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class RecaptchaVerifier {
  constructor() {
    this.config = null;
    this.initConfig();
    
    // Rate limiting storage
    this.rateLimits = new Map();
    this.suspiciousIPs = new Set();
    this.verificationLogs = [];
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 3600000); // Cleanup every hour
  }

  /**
   * Initialize configuration
   */
  async initConfig() {
    try {
      const configPath = path.join(__dirname, '../config/recaptcha-config.json');
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ reCAPTCHA Verifier initialized');
    } catch (error) {
      console.error('❌ Failed to load reCAPTCHA config:', error);
    }
  }

  /**
   * Verify reCAPTCHA token
   */
  async verifyToken(token, remoteIP, formType = 'unknown') {
    if (!this.config) {
      await this.initConfig();
    }

    // Pre-verification checks
    const preCheck = this.preVerificationChecks(remoteIP, formType);
    if (!preCheck.allowed) {
      return {
        success: false,
        error: preCheck.reason,
        action: 'blocked'
      };
    }

    try {
      // Google reCAPTCHA verification
      const verificationResult = await this.callGoogleAPI(token, remoteIP);
      
      if (!verificationResult.success) {
        this.logFailedAttempt(remoteIP, formType, 'google_verification_failed');
        return {
          success: false,
          error: 'reCAPTCHA verification failed',
          details: verificationResult['error-codes']
        };
      }

      // Score-based verification (for v3)
      if (this.config.recaptcha.version === 'v3') {
        const scoreCheck = this.checkScore(verificationResult.score);
        if (!scoreCheck.passed) {
          this.logFailedAttempt(remoteIP, formType, 'low_score', { score: verificationResult.score });
          return {
            success: false,
            error: 'Verification score too low',
            score: verificationResult.score
          };
        }
      }

      // Additional security checks
      const securityCheck = this.performSecurityChecks(remoteIP, verificationResult);
      if (!securityCheck.passed) {
        this.logFailedAttempt(remoteIP, formType, 'security_check_failed', securityCheck);
        return {
          success: false,
          error: 'Security check failed',
          details: securityCheck.reason
        };
      }

      // Log successful verification
      this.logSuccessfulVerification(remoteIP, formType, verificationResult);
      
      return {
        success: true,
        score: verificationResult.score || null,
        hostname: verificationResult.hostname,
        timestamp: verificationResult.challenge_ts
      };

    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      this.logFailedAttempt(remoteIP, formType, 'system_error', { error: error.message });
      
      return {
        success: false,
        error: 'System error during verification'
      };
    }
  }

  /**
   * Call Google reCAPTCHA API
   */
  callGoogleAPI(token, remoteIP) {
    return new Promise((resolve, reject) => {
      const postData = new URLSearchParams({
        secret: this.config.recaptcha.secretKey,
        response: token,
        remoteip: remoteIP
      }).toString();

      const options = {
        hostname: 'www.google.com',
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid JSON response from Google'));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.setTimeout(10000, () => {
        req.abort();
        reject(new Error('Request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Pre-verification security checks
   */
  preVerificationChecks(remoteIP, formType) {
    // Check rate limiting
    const rateLimitCheck = this.checkRateLimit(remoteIP);
    if (!rateLimitCheck.allowed) {
      return {
        allowed: false,
        reason: 'Rate limit exceeded'
      };
    }

    // Check if IP is blocked
    if (this.config.validation.blockSuspiciousIPs && this.suspiciousIPs.has(remoteIP)) {
      return {
        allowed: false,
        reason: 'IP blocked due to suspicious activity'
      };
    }

    // Check VPN blocking (if enabled)
    if (this.config.security.block_vpn) {
      const vpnCheck = this.checkVPN(remoteIP);
      if (vpnCheck.isVPN) {
        return {
          allowed: false,
          reason: 'VPN/Proxy connections not allowed'
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check rate limiting
   */
  checkRateLimit(remoteIP) {
    const now = Date.now();
    const hourAgo = now - 3600000; // 1 hour ago
    
    if (!this.rateLimits.has(remoteIP)) {
      this.rateLimits.set(remoteIP, []);
    }
    
    const requests = this.rateLimits.get(remoteIP);
    
    // Remove old requests
    const recentRequests = requests.filter(timestamp => timestamp > hourAgo);
    this.rateLimits.set(remoteIP, recentRequests);
    
    // Check limit
    if (recentRequests.length >= this.config.validation.rateLimitPerHour) {
      return {
        allowed: false,
        requestCount: recentRequests.length
      };
    }
    
    // Add current request
    recentRequests.push(now);
    this.rateLimits.set(remoteIP, recentRequests);
    
    return {
      allowed: true,
      requestCount: recentRequests.length
    };
  }

  /**
   * Check verification score (for reCAPTCHA v3)
   */
  checkScore(score) {
    const threshold = this.config.security.score_threshold;
    
    return {
      passed: score >= threshold,
      score: score,
      threshold: threshold
    };
  }

  /**
   * Perform additional security checks
   */
  performSecurityChecks(remoteIP, verificationResult) {
    const checks = [];

    // Check hostname match
    if (this.config.security.allowed_domains && this.config.security.allowed_domains.length > 0) {
      const hostname = verificationResult.hostname;
      const isAllowedDomain = this.config.security.allowed_domains.includes(hostname);
      
      if (!isAllowedDomain) {
        return {
          passed: false,
          reason: 'Domain not allowed',
          hostname: hostname
        };
      }
    }

    // Check for repeated failed attempts
    const failedAttempts = this.getFailedAttempts(remoteIP);
    if (failedAttempts >= 5) {
      this.suspiciousIPs.add(remoteIP);
      return {
        passed: false,
        reason: 'Too many failed attempts',
        attempts: failedAttempts
      };
    }

    return { passed: true };
  }

  /**
   * Basic VPN/Proxy detection
   */
  checkVPN(remoteIP) {
    // Basic VPN detection - can be enhanced with external services
    const knownVPNRanges = [
      // Add known VPN IP ranges here
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16'
    ];

    // This is a simplified check - real implementation would use
    // services like MaxMind GeoIP2 or similar
    return { isVPN: false };
  }

  /**
   * Logging methods
   */
  logSuccessfulVerification(remoteIP, formType, result) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: remoteIP,
      formType: formType,
      success: true,
      score: result.score,
      hostname: result.hostname
    };

    this.verificationLogs.push(logEntry);
    
    if (this.config.security.log_attempts) {
      console.log('✅ reCAPTCHA Success:', JSON.stringify(logEntry));
    }
  }

  logFailedAttempt(remoteIP, formType, reason, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ip: remoteIP,
      formType: formType,
      success: false,
      reason: reason,
      ...details
    };

    this.verificationLogs.push(logEntry);
    
    if (this.config.security.log_attempts) {
      console.log('❌ reCAPTCHA Failed:', JSON.stringify(logEntry));
    }
  }

  /**
   * Get failed attempts for IP
   */
  getFailedAttempts(remoteIP) {
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    
    return this.verificationLogs.filter(log => 
      log.ip === remoteIP && 
      !log.success && 
      log.timestamp > hourAgo
    ).length;
  }

  /**
   * Cleanup old data
   */
  cleanup() {
    const dayAgo = new Date(Date.now() - 86400000).toISOString();
    
    // Clean old logs
    this.verificationLogs = this.verificationLogs.filter(log => 
      log.timestamp > dayAgo
    );
    
    // Clean old rate limits
    const hourAgo = Date.now() - 3600000;
    this.rateLimits.forEach((timestamps, ip) => {
      const recent = timestamps.filter(ts => ts > hourAgo);
      if (recent.length === 0) {
        this.rateLimits.delete(ip);
      } else {
        this.rateLimits.set(ip, recent);
      }
    });

    console.log('🧹 reCAPTCHA cleanup completed');
  }

  /**
   * Get verification statistics
   */
  getStats() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000).toISOString();
    const dayAgo = new Date(now.getTime() - 86400000).toISOString();

    const hourLogs = this.verificationLogs.filter(log => log.timestamp > hourAgo);
    const dayLogs = this.verificationLogs.filter(log => log.timestamp > dayAgo);

    return {
      lastHour: {
        total: hourLogs.length,
        successful: hourLogs.filter(log => log.success).length,
        failed: hourLogs.filter(log => !log.success).length
      },
      lastDay: {
        total: dayLogs.length,
        successful: dayLogs.filter(log => log.success).length,
        failed: dayLogs.filter(log => !log.success).length
      },
      rateLimits: {
        activeIPs: this.rateLimits.size,
        blockedIPs: this.suspiciousIPs.size
      }
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

module.exports = RecaptchaVerifier;