/**
 * FILE PROCESSOR UTILITY MODULE
 * 
 * Consolidated file processing utilities for JSONL operations and batch processing.
 * Eliminates duplicate patterns across process-deals.js, enrich-deals.js, and scripts.
 */

const fs = require('fs');
const path = require('path');

class FileProcessor {
  /**
   * Load data from JSONL file
   * @param {string} filePath - Path to JSONL file
   * @returns {Array<Object>} Array of parsed JSON objects
   */
  static loadJSONL(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File does not exist: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (!content) {
        return [];
      }

      return content
        .split('\n')
        .filter(line => line.trim()) // Filter empty lines
        .map((line, index) => {
          try {
            return JSON.parse(line);
          } catch (error) {
            throw new Error(`Invalid JSON at line ${index + 1} in ${filePath}: ${error.message}`);
          }
        });
    } catch (error) {
      throw new Error(`Failed to load JSONL from ${filePath}: ${error.message}`);
    }
  }

  /**
   * Save data array to JSONL file
   * @param {string} filePath - Output file path
   * @param {Array<Object>} data - Data array to save
   * @param {Object} options - Save options
   * @param {boolean} options.createDirs - Create directories if they don't exist
   */
  static saveJSONL(filePath, data, options = {}) {
    try {
      const { createDirs = false } = options;

      if (createDirs) {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      if (!Array.isArray(data)) {
        throw new Error('Data must be an array');
      }

      const content = data.map(item => JSON.stringify(item)).join('\n');
      fs.writeFileSync(filePath, content);

      return {
        success: true,
        filePath,
        recordCount: data.length,
        sizeBytes: Buffer.byteLength(content, 'utf8')
      };
    } catch (error) {
      throw new Error(`Failed to save JSONL to ${filePath}: ${error.message}`);
    }
  }

  /**
   * Process files in a directory with specific extension
   * @param {string} directory - Directory to scan
   * @param {string} extension - File extension to match (with or without dot)
   * @param {Function} processor - Processing function for each file
   * @returns {Array<any>} Results from processor function
   */
  static processFilesInDirectory(directory, extension, processor) {
    try {
      if (!fs.existsSync(directory)) {
        throw new Error(`Directory does not exist: ${directory}`);
      }

      const normalizedExt = extension.startsWith('.') ? extension : `.${extension}`;
      const files = fs.readdirSync(directory)
        .filter(file => path.extname(file) === normalizedExt)
        .map(file => path.join(directory, file));

      const results = [];
      for (const filePath of files) {
        try {
          const result = processor(filePath);
          results.push({ filePath, result });
        } catch (error) {
          results.push({ filePath, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to process files in ${directory}: ${error.message}`);
    }
  }

  /**
   * Process deals from input JSONL to output JSONL with transformation
   * @param {string} inputPath - Input JSONL file path
   * @param {string} outputPath - Output JSONL file path  
   * @param {Function} processor - Deal transformation function
   * @param {Object} options - Processing options
   * @returns {Object} Processing summary
   */
  static processDeals(inputPath, outputPath, processor, options = {}) {
    try {
      const { 
        logProgress = false,
        validateInput = true,
        validateOutput = true,
        createDirs = true
      } = options;

      // Load input data
      const inputDeals = this.loadJSONL(inputPath);
      
      if (logProgress) {
        console.log(`Loaded ${inputDeals.length} deals from ${inputPath}`);
      }

      if (validateInput && inputDeals.length === 0) {
        console.warn(`Warning: No deals found in ${inputPath}`);
      }

      // Process deals
      const processedDeals = [];
      const errors = [];

      for (let i = 0; i < inputDeals.length; i++) {
        try {
          const processed = processor(inputDeals[i], i, inputDeals);
          if (processed !== null && processed !== undefined) {
            processedDeals.push(processed);
          }
        } catch (error) {
          errors.push({ index: i, deal: inputDeals[i], error: error.message });
          if (logProgress) {
            console.warn(`Error processing deal ${i}: ${error.message}`);
          }
        }
      }

      if (validateOutput && processedDeals.length === 0) {
        throw new Error('No deals survived processing - check processor function');
      }

      // Save output
      const saveResult = this.saveJSONL(outputPath, processedDeals, { createDirs });

      if (logProgress) {
        console.log(`Saved ${processedDeals.length} processed deals to ${outputPath}`);
        if (errors.length > 0) {
          console.warn(`${errors.length} deals failed processing`);
        }
      }

      return {
        inputPath,
        outputPath,
        inputCount: inputDeals.length,
        outputCount: processedDeals.length,
        errorCount: errors.length,
        errors: errors.slice(0, 5), // First 5 errors for debugging
        sizeBytes: saveResult.sizeBytes,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to process deals: ${error.message}`);
    }
  }

  /**
   * Batch process multiple JSONL files with same processor
   * @param {Array<string>} inputPaths - Array of input file paths
   * @param {Function} outputPathGenerator - Function to generate output path from input path
   * @param {Function} processor - Deal transformation function
   * @param {Object} options - Processing options
   * @returns {Array<Object>} Array of processing results
   */
  static batchProcessDeals(inputPaths, outputPathGenerator, processor, options = {}) {
    const results = [];
    
    for (const inputPath of inputPaths) {
      try {
        const outputPath = outputPathGenerator(inputPath);
        const result = this.processDeals(inputPath, outputPath, processor, options);
        results.push(result);
      } catch (error) {
        results.push({
          inputPath,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Get file processing statistics
   * @param {string} filePath - Path to JSONL file
   * @returns {Object} File statistics
   */
  static getFileStats(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return { exists: false };
      }

      const stats = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim() ? content.trim().split('\n').length : 0;

      return {
        exists: true,
        path: filePath,
        sizeBytes: stats.size,
        sizeKB: Math.round(stats.size / 1024 * 100) / 100,
        recordCount: lines,
        lastModified: stats.mtime,
        created: stats.birthtime
      };
    } catch (error) {
      return {
        exists: true,
        error: error.message
      };
    }
  }
}

module.exports = {
  FileProcessor
};