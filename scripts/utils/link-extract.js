const fs = require('fs').promises;
const path = require('path');

class LinkExtractor {
  constructor(config) {
    this.config = config;
    this.extractedLinks = new Map();
  }

  async extractFromFiles(baseDir) {
    const results = [];
    
    try {
      const files = await this.findHtmlFiles(baseDir);

      for (const file of files) {
        const links = await this.extractFromFile(file);
        if (links.length > 0) {
          results.push({
            file: path.relative(baseDir, file),
            links: links,
            count: links.length
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to extract links from files: ${error.message}`);
    }
  }

  async findHtmlFiles(dir, files = []) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip unwanted directories
        if (entry.isDirectory()) {
          if (!['node_modules', 'backup', '.git', 'reports'].includes(entry.name) && 
              !entry.name.includes('cachebak')) {
            await this.findHtmlFiles(fullPath, files);
          }
        } else if (entry.isFile() && entry.name.endsWith('.html') && 
                   !entry.name.includes('.backup') && !entry.name.includes('.cachebak')) {
          files.push(fullPath);
        }
      }
      
      return files;
    } catch (error) {
      console.warn(`Could not read directory ${dir}: ${error.message}`);
      return files;
    }
  }

  async extractFromFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return this.extractFromHTML(content, filePath);
    } catch (error) {
      console.warn(`Could not read file ${filePath}: ${error.message}`);
      return [];
    }
  }

  extractFromHTML(html, sourcePath = 'unknown') {
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].trim();
      
      if (this.shouldIncludeLink(url)) {
        const linkInfo = this.analyzeLinkInfo(url, text, sourcePath);
        links.push(linkInfo);
      }
    }

    return links;
  }

  shouldIncludeLink(url) {
    // Skip internal links and non-http links
    if (url.startsWith('#') || url.startsWith('/') || !url.startsWith('http')) {
      return false;
    }

    // Check if it's from an allowed or affiliate domain
    const allowedDomains = this.config.validation.allowedDomains;
    const blockedDomains = this.config.validation.blockedDomains;
    
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();

      // Block explicitly blocked domains
      if (blockedDomains.some(domain => hostname.includes(domain))) {
        return true; // Include blocked domains to flag them as issues
      }

      // Include affiliate domains
      if (allowedDomains.some(domain => hostname.includes(domain))) {
        return true;
      }

      // Include any external links for review
      return true;
    } catch (e) {
      return false;
    }
  }

  analyzeLinkInfo(url, linkText, sourcePath) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const params = Object.fromEntries(urlObj.searchParams.entries());
      
      // Determine affiliate network and validation
      const affiliate = this.determineAffiliateNetwork(hostname, params);
      const validation = this.validateAffiliateParams(affiliate, params);
      const issues = this.detectIssues(url, hostname, params);

      return {
        url,
        originalUrl: url,
        domain: hostname,
        linkText,
        sourcePath,
        affiliate,
        params,
        validation,
        issues,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        url,
        originalUrl: url,
        domain: 'invalid',
        linkText,
        sourcePath,
        affiliate: null,
        params: {},
        validation: { isValid: false, missingParams: [], extraParams: [] },
        issues: [`Invalid URL format: ${error.message}`],
        extractedAt: new Date().toISOString()
      };
    }
  }

  determineAffiliateNetwork(hostname, params) {
    const patterns = this.config.affiliatePatterns;
    
    for (const [network, config] of Object.entries(patterns)) {
      if (config.domains.some(domain => hostname.includes(domain))) {
        return {
          network,
          domains: config.domains,
          detectedDomain: hostname
        };
      }
    }

    return null;
  }

  validateAffiliateParams(affiliate, params) {
    if (!affiliate) {
      return { isValid: false, missingParams: [], extraParams: [] };
    }

    const pattern = this.config.affiliatePatterns[affiliate.network];
    const requiredParams = pattern.requiredParams || [];
    const optionalParams = pattern.optionalParams || [];
    const allValidParams = [...requiredParams, ...optionalParams];

    const presentParams = Object.keys(params);
    const missingParams = requiredParams.filter(param => !presentParams.includes(param));
    const extraParams = presentParams.filter(param => !allValidParams.includes(param));

    return {
      isValid: missingParams.length === 0,
      missingParams,
      extraParams,
      requiredParams,
      optionalParams,
      presentParams
    };
  }

  detectIssues(url, hostname, params) {
    const issues = [];

    // Check for blocked domains
    if (this.config.validation.blockedDomains.some(domain => hostname.includes(domain))) {
      issues.push(`Blocked domain detected: ${hostname}`);
    }

    // Check for placeholder URLs
    if (hostname.includes('example.com') || url.includes('example.com')) {
      issues.push('Placeholder URL - needs to be replaced with real affiliate link');
    }

    // Check for localhost/development URLs
    if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
      issues.push('Development URL detected in production code');
    }

    // Check for missing HTTPS
    if (!url.startsWith('https://')) {
      issues.push('Non-HTTPS URL may cause security warnings');
    }

    return issues;
  }

  async saveResults(results, outputPath) {
    try {
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, JSON.stringify(results, null, 2), 'utf8');
      return outputPath;
    } catch (error) {
      throw new Error(`Failed to save results: ${error.message}`);
    }
  }
}

module.exports = LinkExtractor;