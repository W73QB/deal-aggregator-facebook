const { FileProcessor } = require('../file-processor');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock fs module
jest.mock('fs');

describe('FileProcessor', () => {
  let tempDir;
  
  beforeEach(() => {
    jest.clearAllMocks();
    tempDir = '/tmp/test';
  });

  describe('loadJSONL', () => {
    it('should load valid JSONL file', () => {
      const testData = [
        { id: 1, name: 'Deal 1' },
        { id: 2, name: 'Deal 2' }
      ];
      const jsonlContent = testData.map(item => JSON.stringify(item)).join('\n');

      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(jsonlContent);

      const result = FileProcessor.loadJSONL('/test/file.jsonl');

      expect(result).toEqual(testData);
      expect(fs.readFileSync).toHaveBeenCalledWith('/test/file.jsonl', 'utf8');
    });

    it('should handle empty file', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('');

      const result = FileProcessor.loadJSONL('/test/empty.jsonl');

      expect(result).toEqual([]);
    });

    it('should filter empty lines', () => {
      const jsonlContent = '{"id": 1}\n\n{"id": 2}\n';
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(jsonlContent);

      const result = FileProcessor.loadJSONL('/test/file.jsonl');

      expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('should throw error for non-existent file', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => {
        FileProcessor.loadJSONL('/nonexistent/file.jsonl');
      }).toThrow('File does not exist: /nonexistent/file.jsonl');
    });

    it('should throw error for invalid JSON', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('{"valid": true}\n{invalid json}');

      expect(() => {
        FileProcessor.loadJSONL('/test/invalid.jsonl');
      }).toThrow('Invalid JSON at line 2');
    });
  });

  describe('saveJSONL', () => {
    it('should save data to JSONL file', () => {
      const testData = [
        { id: 1, name: 'Deal 1' },
        { id: 2, name: 'Deal 2' }
      ];
      const expectedContent = '{"id":1,"name":"Deal 1"}\n{"id":2,"name":"Deal 2"}';

      fs.writeFileSync.mockImplementation(() => {});

      const result = FileProcessor.saveJSONL('/test/output.jsonl', testData);

      expect(fs.writeFileSync).toHaveBeenCalledWith('/test/output.jsonl', expectedContent);
      expect(result).toEqual({
        success: true,
        filePath: '/test/output.jsonl',
        recordCount: 2,
        sizeBytes: Buffer.byteLength(expectedContent, 'utf8')
      });
    });

    it('should create directories when createDirs option is true', () => {
      fs.existsSync.mockReturnValue(false);
      fs.mkdirSync.mockImplementation(() => {});
      fs.writeFileSync.mockImplementation(() => {});

      FileProcessor.saveJSONL('/test/subdir/output.jsonl', [{ id: 1 }], { createDirs: true });

      expect(fs.mkdirSync).toHaveBeenCalledWith('/test/subdir', { recursive: true });
    });

    it('should throw error for non-array data', () => {
      expect(() => {
        FileProcessor.saveJSONL('/test/output.jsonl', 'not-an-array');
      }).toThrow('Data must be an array');
    });
  });

  describe('processFilesInDirectory', () => {
    it('should process files with specified extension', () => {
      const mockFiles = ['file1.jsonl', 'file2.jsonl', 'other.txt'];
      const mockProcessor = jest.fn().mockReturnValue('processed');

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(mockFiles);

      const results = FileProcessor.processFilesInDirectory('/test/dir', '.jsonl', mockProcessor);

      expect(mockProcessor).toHaveBeenCalledTimes(2);
      expect(mockProcessor).toHaveBeenCalledWith('/test/dir/file1.jsonl');
      expect(mockProcessor).toHaveBeenCalledWith('/test/dir/file2.jsonl');
      expect(results).toEqual([
        { filePath: '/test/dir/file1.jsonl', result: 'processed' },
        { filePath: '/test/dir/file2.jsonl', result: 'processed' }
      ]);
    });

    it('should handle processor errors gracefully', () => {
      const mockFiles = ['file1.jsonl'];
      const mockProcessor = jest.fn().mockImplementation(() => {
        throw new Error('Processing failed');
      });

      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(mockFiles);

      const results = FileProcessor.processFilesInDirectory('/test/dir', '.jsonl', mockProcessor);

      expect(results).toEqual([
        { filePath: '/test/dir/file1.jsonl', error: 'Processing failed' }
      ]);
    });

    it('should throw error for non-existent directory', () => {
      fs.existsSync.mockReturnValue(false);

      expect(() => {
        FileProcessor.processFilesInDirectory('/nonexistent', '.jsonl', jest.fn());
      }).toThrow('Directory does not exist: /nonexistent');
    });
  });

  describe('processDeals', () => {
    it('should process deals with transformation', () => {
      const inputDeals = [
        { id: 1, price: 100 },
        { id: 2, price: 200 }
      ];
      const processor = jest.fn().mockImplementation(deal => ({
        ...deal,
        discountedPrice: deal.price * 0.9
      }));

      // Mock loadJSONL
      jest.spyOn(FileProcessor, 'loadJSONL').mockReturnValue(inputDeals);
      jest.spyOn(FileProcessor, 'saveJSONL').mockReturnValue({
        success: true,
        filePath: '/test/output.jsonl',
        recordCount: 2,
        sizeBytes: 150
      });

      const result = FileProcessor.processDeals(
        '/test/input.jsonl',
        '/test/output.jsonl',
        processor,
        { logProgress: false }
      );

      expect(processor).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        inputPath: '/test/input.jsonl',
        outputPath: '/test/output.jsonl',
        inputCount: 2,
        outputCount: 2,
        errorCount: 0,
        errors: [],
        sizeBytes: 150,
        success: true
      });
    });

    it('should handle processing errors gracefully', () => {
      const inputDeals = [
        { id: 1, price: 100 },
        { id: 2, price: 'invalid' }
      ];
      const processor = jest.fn().mockImplementation(deal => {
        if (typeof deal.price !== 'number') {
          throw new Error('Invalid price');
        }
        return deal;
      });

      jest.spyOn(FileProcessor, 'loadJSONL').mockReturnValue(inputDeals);
      jest.spyOn(FileProcessor, 'saveJSONL').mockReturnValue({
        success: true,
        filePath: '/test/output.jsonl',
        recordCount: 1,
        sizeBytes: 50
      });

      const result = FileProcessor.processDeals(
        '/test/input.jsonl',
        '/test/output.jsonl',
        processor
      );

      expect(result.inputCount).toBe(2);
      expect(result.outputCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Invalid price');
    });

    it('should throw error when no deals survive processing', () => {
      const inputDeals = [{ id: 1 }];
      const processor = jest.fn().mockReturnValue(null); // Filter out all deals

      jest.spyOn(FileProcessor, 'loadJSONL').mockReturnValue(inputDeals);

      expect(() => {
        FileProcessor.processDeals('/test/input.jsonl', '/test/output.jsonl', processor);
      }).toThrow('No deals survived processing');
    });
  });

  describe('batchProcessDeals', () => {
    it('should process multiple files', () => {
      const inputPaths = ['/test/input1.jsonl', '/test/input2.jsonl'];
      const outputPathGenerator = (input) => input.replace('input', 'output');
      const processor = jest.fn().mockImplementation(deal => deal);

      jest.spyOn(FileProcessor, 'processDeals').mockReturnValue({
        success: true,
        inputCount: 1,
        outputCount: 1
      });

      const results = FileProcessor.batchProcessDeals(
        inputPaths,
        outputPathGenerator,
        processor
      );

      expect(FileProcessor.processDeals).toHaveBeenCalledTimes(2);
      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
    });
  });

  describe('getFileStats', () => {
    it('should return file statistics', () => {
      const mockStats = {
        size: 1024,
        mtime: new Date('2023-01-01'),
        birthtime: new Date('2023-01-01')
      };

      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockReturnValue(mockStats);
      fs.readFileSync.mockReturnValue('{"id":1}\n{"id":2}');

      const result = FileProcessor.getFileStats('/test/file.jsonl');

      expect(result).toEqual({
        exists: true,
        path: '/test/file.jsonl',
        sizeBytes: 1024,
        sizeKB: 1,
        recordCount: 2,
        lastModified: mockStats.mtime,
        created: mockStats.birthtime
      });
    });

    it('should handle non-existent file', () => {
      fs.existsSync.mockReturnValue(false);

      const result = FileProcessor.getFileStats('/nonexistent.jsonl');

      expect(result).toEqual({ exists: false });
    });

    it('should handle file read errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.statSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = FileProcessor.getFileStats('/test/file.jsonl');

      expect(result).toEqual({
        exists: true,
        error: 'Permission denied'
      });
    });
  });
});