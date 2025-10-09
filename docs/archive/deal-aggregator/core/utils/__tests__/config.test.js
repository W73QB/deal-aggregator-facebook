const { ConfigLoader } = require('../config');
const fs = require('fs');
const path = require('path');

// Mock fs module
jest.mock('fs');

describe('ConfigLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadEnvironment', () => {
    it('should load valid JSON config', () => {
      const mockConfig = {
        PROJECT_ROOT: '/test/path',
        FB_PAGE_ID: 'test-page-id'
      };
      
      fs.readFileSync.mockReturnValue(JSON.stringify(mockConfig));
      
      const result = ConfigLoader.loadEnvironment('test-config.json');
      
      expect(result).toEqual(mockConfig);
      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.resolve(__dirname, '../test-config.json'),
        'utf8'
      );
    });

    it('should throw error for invalid JSON', () => {
      fs.readFileSync.mockReturnValue('invalid json');
      
      expect(() => {
        ConfigLoader.loadEnvironment('test-config.json');
      }).toThrow(/Failed to load config/);
    });

    it('should throw error for missing file', () => {
      fs.readFileSync.mockImplementation(() => {
        throw new Error('ENOENT: no such file');
      });
      
      expect(() => {
        ConfigLoader.loadEnvironment('missing.json');
      }).toThrow(/Failed to load config/);
    });
  });

  describe('getDateString', () => {
    it('should return YYYYMMDD format by default', () => {
      // Mock Date to return consistent value
      const mockDate = new Date('2025-08-21T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const result = ConfigLoader.getDateString();
      
      expect(result).toBe('20250821');
      
      global.Date.mockRestore();
    });

    it('should handle custom format option', () => {
      const mockDate = new Date('2025-08-21T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const result = ConfigLoader.getDateString({ format: 'YYYYMMDD' });
      
      expect(result).toBe('20250821');
      
      global.Date.mockRestore();
    });
  });

  describe('validatePaths', () => {
    beforeEach(() => {
      // Mock fs.existsSync by default
      fs.existsSync = jest.fn();
    });

    it('should return true for valid path config', () => {
      const config = {
        PROJECT_ROOT: '/test',
        DEALS_RAW_DIR: 'data/raw',
        DEALS_ENRICHED_DIR: 'data/enriched',
        MEDIA_DIR: 'media',
        LOGS_DIR: 'logs'
      };
      
      fs.existsSync.mockReturnValue(true);
      
      const result = ConfigLoader.validatePaths(config);
      
      expect(result).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledTimes(4); // 4 required paths
    });

    it('should return false for missing path config', () => {
      const config = {
        PROJECT_ROOT: '/test',
        DEALS_RAW_DIR: 'data/raw'
        // Missing other required paths
      };
      
      const result = ConfigLoader.validatePaths(config);
      
      expect(result).toBe(false);
    });

    it('should return false for non-existent paths', () => {
      const config = {
        PROJECT_ROOT: '/test',
        DEALS_RAW_DIR: 'data/raw',
        DEALS_ENRICHED_DIR: 'data/enriched',
        MEDIA_DIR: 'media',
        LOGS_DIR: 'logs'
      };
      
      fs.existsSync.mockReturnValue(false);
      
      const result = ConfigLoader.validatePaths(config);
      
      expect(result).toBe(false);
    });
  });

  describe('validateFacebookConfig', () => {
    it('should return true for valid Facebook config', () => {
      const config = {
        FB_PAGE_ID: 'valid-page-id-123',
        FB_PAGE_ACCESS_TOKEN: 'EAAG123456789012345678901234567890'
      };
      
      const result = ConfigLoader.validateFacebookConfig(config);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid page ID', () => {
      const config = {
        FB_PAGE_ID: 'YOUR_PAGE_ID', // Default placeholder
        FB_PAGE_ACCESS_TOKEN: 'EAAG123456789012345678901234567890'
      };
      
      const result = ConfigLoader.validateFacebookConfig(config);
      
      expect(result).toBe(false);
    });

    it('should return false for invalid access token', () => {
      const config = {
        FB_PAGE_ID: 'valid-page-id-123',
        FB_PAGE_ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN' // Default placeholder
      };
      
      const result = ConfigLoader.validateFacebookConfig(config);
      
      expect(result).toBe(false);
    });

    it('should return false for missing config', () => {
      const config = {};
      
      const result = ConfigLoader.validateFacebookConfig(config);
      
      expect(result).toBe(false);
    });
  });
});