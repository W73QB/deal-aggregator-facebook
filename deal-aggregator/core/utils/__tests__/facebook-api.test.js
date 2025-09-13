const { FacebookAPI } = require('../facebook-api');
const axios = require('axios');

// Mock axios module
jest.mock('axios');

describe('FacebookAPI', () => {
  let facebookAPI;
  let mockApi;

  beforeEach(() => {
    // Setup mock axios instance
    mockApi = {
      get: jest.fn(),
      post: jest.fn(),
    };
    axios.create.mockReturnValue(mockApi);
    
    facebookAPI = new FacebookAPI('test-page-id', 'test-access-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required parameters and default options', () => {
      expect(facebookAPI.pageId).toBe('test-page-id');
      expect(facebookAPI.accessToken).toBe('test-access-token');
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://graph.facebook.com/v19.0',
        timeout: 30000,
        headers: { 'User-Agent': 'DealAggregator/1.1' },
      });
    });

    it('should accept custom options', () => {
        new FacebookAPI('page', 'token', {
            timeoutMs: 10000,
            apiVersion: 'v18.0'
        });
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'https://graph.facebook.com/v18.0',
        timeout: 10000,
        headers: { 'User-Agent': 'DealAggregator/1.1' },
      });
    });

    it('should throw an error if pageId or accessToken is missing', () => {
        expect(() => new FacebookAPI()).toThrow('Page ID and Access Token are required.');
        expect(() => new FacebookAPI('page-id-only')).toThrow('Page ID and Access Token are required.');
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const mockValidResponse = {
        id: 'test-page-id',
        name: 'Test Page'
      };
      mockApi.get.mockResolvedValue({ data: mockValidResponse });
      
      const result = await facebookAPI.validateCredentials();
      
      expect(mockApi.get).toHaveBeenCalledWith('/me', {
        params: { fields: 'id,name', access_token: 'test-access-token' }
      });
      expect(result).toEqual({
        success: true,
        pageId: 'test-page-id',
        pageName: 'Test Page',
        message: 'Token valid for specified page'
      });
    });

    it('should handle token valid for a different page', async () => {
        mockApi.get.mockResolvedValue({ data: { id: 'different-page-id', name: 'Wrong Page' } });
        const result = await facebookAPI.validateCredentials();
        expect(result).toEqual({
            success: false,
            pageId: 'different-page-id',
            pageName: 'Wrong Page',
            message: 'Token valid but for different page'
        });
    });

    it('should handle API errors', async () => {
      const errorResponse = { response: { data: { error: { message: 'Invalid token' } } } };
      mockApi.get.mockRejectedValue(errorResponse);
      
      const result = await facebookAPI.validateCredentials();
      
      expect(result).toEqual({
        success: false,
        error: { error: { message: 'Invalid token' } },
        message: 'Token validation failed'
      });
    });
  });

  describe('postMessage', () => {
    it('should post message successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { id: 'post_12345' } });
      
      const result = await facebookAPI.postMessage({
        message: 'Test message',
        link: 'https://example.com'
      });
      
      expect(mockApi.post).toHaveBeenCalledWith('/test-page-id/feed', {
        message: 'Test message',
        link: 'https://example.com',
        access_token: 'test-access-token'
      });
      expect(result).toEqual({
        success: true,
        postId: 'post_12345',
        message: 'Post created successfully'
      });
    });

    it('should handle posting errors', async () => {
      const errorResponse = { response: { data: { error: { message: 'Invalid message' } } } };
      mockApi.post.mockRejectedValue(errorResponse);
      
      const result = await facebookAPI.postMessage({ message: 'Test' });
      
      expect(result).toEqual({
        success: false,
        error: { error: { message: 'Invalid message' } },
        message: 'Failed to create post'
      });
    });
  });

  describe('testAccess', () => {
    it('should return overall success if all checks pass', async () => {
      // Mock validateCredentials to be successful
      jest.spyOn(facebookAPI, 'validateCredentials').mockResolvedValue({ success: true, pageName: 'Test Page', pageId: 'test-page-id' });
      
      // Mock permissions check
      mockApi.get.mockResolvedValue({
        data: {
          data: [
            { permission: 'pages_manage_posts', status: 'granted' },
            { permission: 'pages_read_engagement', status: 'granted' }
          ]
        }
      });
      
      const result = await facebookAPI.testAccess();
      
      expect(result).toEqual({
        credentials: true,
        permissions: true,
        overall: true
      });
      expect(mockApi.get).toHaveBeenCalledWith('/me/permissions', {
        params: { access_token: 'test-access-token' }
      });
    });

    it('should handle missing permissions', async () => {
      jest.spyOn(facebookAPI, 'validateCredentials').mockResolvedValue({ success: true });
      mockApi.get.mockResolvedValue({ data: { data: [{ permission: 'pages_read_engagement', status: 'granted' }] } }); // Missing one permission
      
      const result = await facebookAPI.testAccess();
      
      expect(result).toEqual({
        credentials: true,
        permissions: false,
        overall: false
      });
    });

    it('should handle credential failure', async () => {
        jest.spyOn(facebookAPI, 'validateCredentials').mockResolvedValue({ success: false, message: 'Bad token' });

        const result = await facebookAPI.testAccess();

        // Permissions check should not even be called
        expect(mockApi.get).not.toHaveBeenCalled();
        expect(result.overall).toBe(false);
        expect(result.credentials).toBe(false);
    });
  });
});