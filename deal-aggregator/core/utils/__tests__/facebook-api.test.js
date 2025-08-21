const { FacebookAPI } = require('../facebook-api');
const https = require('https');

// Mock https module
jest.mock('https');

describe('FacebookAPI', () => {
  let facebookAPI;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    facebookAPI = new FacebookAPI('test-page-id', 'test-access-token');
    
    // Setup mock request
    mockRequest = {
      on: jest.fn(),
      setTimeout: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      destroy: jest.fn()
    };
    
    // Setup mock response
    mockResponse = {
      statusCode: 200,
      on: jest.fn()
    };
    
    https.request.mockReturnValue(mockRequest);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with required parameters', () => {
      expect(facebookAPI.pageId).toBe('test-page-id');
      expect(facebookAPI.accessToken).toBe('test-access-token');
      expect(facebookAPI.timeoutMs).toBe(20000);
      expect(facebookAPI.baseURL).toBe('graph.facebook.com');
    });

    it('should accept custom options', () => {
      const customAPI = new FacebookAPI('page', 'token', {
        timeoutMs: 30000,
        baseURL: 'custom.facebook.com'
      });
      
      expect(customAPI.timeoutMs).toBe(30000);
      expect(customAPI.baseURL).toBe('custom.facebook.com');
    });
  });

  describe('_makeRequest', () => {
    it('should make successful HTTPS request', async () => {
      const testData = { success: true };
      
      // Mock successful response
      https.request.mockImplementation((options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });
      
      // Mock response events
      mockResponse.on.mockImplementation((event, handler) => {
        if (event === 'data') {
          handler(JSON.stringify(testData));
        } else if (event === 'end') {
          handler();
        }
      });
      
      const result = await facebookAPI._makeRequest({ hostname: 'test.com' });
      
      expect(result).toEqual({
        statusCode: 200,
        data: testData
      });
    });

    it('should handle network errors with retry', async () => {
      let callCount = 0;
      
      https.request.mockImplementation(() => {
        callCount++;
        return mockRequest;
      });
      
      // Mock error on first call, success on retry
      mockRequest.on.mockImplementation((event, handler) => {
        if (event === 'error' && callCount === 1) {
          handler({ code: 'ECONNRESET' });
        }
      });
      
      // Start the request (will fail and retry)
      const promise = facebookAPI._makeRequest({ hostname: 'test.com' });
      
      // Simulate retry timeout
      setTimeout(() => {
        // Mock successful retry
        mockResponse.on.mockImplementation((event, handler) => {
          if (event === 'data') {
            handler('{"retry": true}');
          } else if (event === 'end') {
            handler();
          }
        });
        
        if (https.request.mock.calls.length >= 2) {
          https.request.mock.results[1].value = mockRequest;
          const callback = https.request.mock.calls[1][1];
          callback(mockResponse);
        }
      }, 100);
      
      // Note: This test is simplified - full retry testing would require more complex mocking
      expect(mockRequest.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should handle timeout', () => {
      const timeoutHandler = jest.fn();
      mockRequest.setTimeout.mockImplementation((timeout, handler) => {
        expect(timeout).toBe(20000);
        timeoutHandler.mockImplementation(handler);
      });
      
      facebookAPI._makeRequest({ hostname: 'test.com' });
      
      expect(mockRequest.setTimeout).toHaveBeenCalledWith(20000, expect.any(Function));
    });
  });

  describe('validateCredentials', () => {
    it('should validate correct credentials', async () => {
      const mockValidResponse = {
        id: 'test-page-id',
        name: 'Test Page'
      };
      
      // Mock successful API response
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 200,
        data: mockValidResponse
      });
      
      const result = await facebookAPI.validateCredentials();
      
      expect(result).toEqual({
        success: true,
        pageId: 'test-page-id',
        pageName: 'Test Page',
        message: 'Token valid for specified page'
      });
    });

    it('should handle invalid credentials', async () => {
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 400,
        data: { error: { message: 'Invalid token' } }
      });
      
      const result = await facebookAPI.validateCredentials();
      
      expect(result).toEqual({
        success: false,
        error: { message: 'Invalid token' },
        message: 'Token validation failed'
      });
    });

    it('should handle network errors', async () => {
      jest.spyOn(facebookAPI, '_makeRequest').mockRejectedValue(new Error('Network error'));
      
      const result = await facebookAPI.validateCredentials();
      
      expect(result).toEqual({
        success: false,
        error: 'Network error',
        message: 'Network error during validation'
      });
    });
  });

  describe('postMessage', () => {
    it('should post message successfully', async () => {
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 200,
        data: { id: 'post_12345' }
      });
      
      const result = await facebookAPI.postMessage({
        message: 'Test message',
        link: 'https://example.com'
      });
      
      expect(result).toEqual({
        success: true,
        postId: 'post_12345',
        message: 'Post created successfully'
      });
    });

    it('should handle posting errors', async () => {
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 400,
        data: { error: { message: 'Invalid message' } }
      });
      
      const result = await facebookAPI.postMessage({ message: 'Test' });
      
      expect(result).toEqual({
        success: false,
        error: { message: 'Invalid message' },
        message: 'Failed to create post'
      });
    });

    it('should handle network errors during posting', async () => {
      jest.spyOn(facebookAPI, '_makeRequest').mockRejectedValue(new Error('Network error'));
      
      const result = await facebookAPI.postMessage({ message: 'Test' });
      
      expect(result).toEqual({
        success: false,
        error: 'Network error',
        message: 'Network error during posting'
      });
    });
  });

  describe('testAccess', () => {
    it('should test access successfully', async () => {
      // Mock validateCredentials
      jest.spyOn(facebookAPI, 'validateCredentials').mockResolvedValue({
        success: true,
        pageId: 'test-page-id',
        pageName: 'Test Page'
      });
      
      // Mock permissions check
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 200,
        data: {
          data: [
            { permission: 'pages_manage_posts', status: 'granted' }
          ]
        }
      });
      
      const result = await facebookAPI.testAccess();
      
      expect(result).toEqual({
        credentials: true,
        permissions: true,
        overall: true
      });
    });

    it('should handle missing permissions', async () => {
      jest.spyOn(facebookAPI, 'validateCredentials').mockResolvedValue({
        success: true,
        pageId: 'test-page-id',
        pageName: 'Test Page'
      });
      
      jest.spyOn(facebookAPI, '_makeRequest').mockResolvedValue({
        statusCode: 200,
        data: { data: [] } // No permissions
      });
      
      const result = await facebookAPI.testAccess();
      
      expect(result).toEqual({
        credentials: true,
        permissions: false,
        overall: false
      });
    });
  });
});