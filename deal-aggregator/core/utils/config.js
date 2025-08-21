/**
 * TODO: CONFIG UTILITY MODULE
 * 
 * MỤC TIÊU: Hợp nhất logic load config từ các file hiện có
 * 
 * HIỆN TẠI TRÙNG LẶP Ở:
 * - deal-aggregator/platforms/facebook/facebook-post.js (line ~3-6)
 * - deal-aggregator/platforms/facebook/facebook-post-live.js (line ~3-6) 
 * - deal-aggregator/platforms/facebook/test-facebook-access.js (line ~3-6)
 * - deal-aggregator/core/process/process-deals.js (line ~3-6)
 * - deal-aggregator/core/process/enrich-deals.js (line ~3-6)
 * 
 * PATTERN TRÙNG LẶP:
 * ```javascript
 * const fs = require('fs');
 * const path = require('path');
 * const env = JSON.parse(fs.readFileSync("../../config/.env.local.json", 'utf8'));
 * const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
 * ```
 * 
 * TODO IMPLEMENTATION:
 * - [ ] Tạo class ConfigLoader với methods:
 *   - loadEnvironment(relativePath)
 *   - getDateString()
 *   - validatePaths(config)
 *   - validateFacebookConfig(config)
 * - [ ] Export module
 * - [ ] Update tất cả files sử dụng pattern trên
 * 
 * ESTIMATED REDUCTION: ~30 lines duplicate code
 */

const fs = require('fs');
const path = require('path');

class ConfigLoader {
  /**
   * Load environment configuration from JSON file
   * @param {string} relativePath - Relative path to config file
   * @returns {Object} Parsed configuration object
   */
  static loadEnvironment(relativePath = '../../config/.env.local.json') {
    try {
      const configPath = path.resolve(__dirname, relativePath);
      const configContent = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load config from ${relativePath}: ${error.message}`);
    }
  }

  /**
   * Generate date string in YYYYMMDD format
   * @param {Object} options - Options for date generation
   * @param {string} options.tz - Timezone (default: system timezone)
   * @param {string} options.format - Format pattern (default: YYYYMMDD)
   * @returns {string} Formatted date string
   */
  static getDateString(options = {}) {
    const { format = 'YYYYMMDD' } = options;
    const date = new Date();
    
    if (format === 'YYYYMMDD') {
      return date.toISOString().slice(0, 10).replace(/-/g, '');
    }
    
    // Add more formats as needed
    return date.toISOString().slice(0, 10).replace(/-/g, '');
  }

  /**
   * Validate that required paths exist in config
   * @param {Object} config - Configuration object
   * @returns {boolean} True if all paths are valid
   */
  static validatePaths(config) {
    const requiredPaths = [
      'DEALS_RAW_DIR',
      'DEALS_ENRICHED_DIR', 
      'MEDIA_DIR',
      'LOGS_DIR'
    ];

    for (const pathKey of requiredPaths) {
      if (!config[pathKey]) {
        console.warn(`Missing required path config: ${pathKey}`);
        return false;
      }
      
      try {
        const fullPath = path.resolve(config.PROJECT_ROOT || '', config[pathKey]);
        if (!fs.existsSync(fullPath)) {
          console.warn(`Path does not exist: ${pathKey} = ${fullPath}`);
          return false;
        }
      } catch (error) {
        console.warn(`Invalid path config: ${pathKey} - ${error.message}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate Facebook configuration
   * @param {Object} config - Configuration object
   * @returns {boolean} True if Facebook config is valid
   */
  static validateFacebookConfig(config) {
    const hasValidPageId = !!(config.FB_PAGE_ID && 
                            config.FB_PAGE_ID !== 'YOUR_PAGE_ID' &&
                            config.FB_PAGE_ID !== '1234567890');
                          
    const hasValidToken = !!(config.FB_PAGE_ACCESS_TOKEN && 
                           config.FB_PAGE_ACCESS_TOKEN !== 'YOUR_ACCESS_TOKEN' &&
                           config.FB_PAGE_ACCESS_TOKEN !== 'EAAG..long-lived..' &&
                           (config.FB_PAGE_ACCESS_TOKEN?.length || 0) > 20);

    if (!hasValidPageId) {
      console.warn('Invalid or missing FB_PAGE_ID');
    }
    
    if (!hasValidToken) {
      console.warn('Invalid or missing FB_PAGE_ACCESS_TOKEN');
    }

    return hasValidPageId && hasValidToken;
  }
}

module.exports = {
  ConfigLoader
};