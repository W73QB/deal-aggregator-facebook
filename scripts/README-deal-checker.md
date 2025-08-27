# Deal Link Checker

A comprehensive tool to verify affiliate link integrity and detect issues in the DealRadarUS website.

## Features

- ✅ **Link Extraction**: Scans HTML files for affiliate and external links
- ✅ **Affiliate Validation**: Validates required parameters for Amazon, eBay, Best Buy, Woot
- ✅ **Issue Detection**: Identifies placeholder URLs, invalid domains, missing parameters
- 🚧 **HTTP Verification**: Checks link status, redirects, SSL (requires dependencies)
- 📊 **Multi-format Reports**: JSON, CSV, HTML output formats

## Quick Start

### 1. Install Dependencies (Optional for HTTP verification)

```bash
npm install node-fetch p-limit cheerio glob
```

### 2. Run Basic Link Extraction

```bash
node scripts/deal-link-checker.js
```

### 3. Run with Custom Config

```bash
node scripts/deal-link-checker.js ./config/deal-verifier.config.json ./
```

## Configuration

Edit `config/deal-verifier.config.json` to customize:

- **Rate Limiting**: Requests per second, concurrency limits
- **Affiliate Patterns**: Required/optional parameters for each network
- **Validation Rules**: Allowed/blocked domains, SSL requirements
- **Reporting**: Output formats and directories

## Output

The tool generates reports in `./data/verification-reports/`:

- **JSON Report**: Complete detailed results
- **CSV Summary**: Spreadsheet-friendly format
- **HTML Report**: Visual dashboard with issues highlighted

## Affiliate Networks Supported

- **Amazon**: Validates `tag` parameter (dealradarus-20)
- **eBay**: Validates `mkcid` and `campid` parameters
- **Best Buy**: Validates `ref` parameter
- **Woot**: Optional `ref` parameter validation

## Issue Types Detected

- 🚨 **Placeholder URLs**: example.com links that need replacement
- ⚠️ **Missing Parameters**: Required affiliate parameters missing
- 🔒 **Security Issues**: Non-HTTPS URLs, invalid certificates
- 🚫 **Blocked Domains**: localhost, development URLs in production

## Sample Output

```bash
🚀 Starting Deal Link Checker...
✓ Deal Link Checker initialized
✓ Configuration loaded from: ./config/deal-verifier.config.json

📤 Extracting links from HTML files...
✓ Extracted 25 links from 8 files
✓ Found 4 affiliate networks
⚠️  Found 12 issues requiring attention

🔍 Starting HTTP verification...
📋 Would verify 15 non-placeholder links

📊 Generating verification report...
✓ Reports generated:
  📄 JSON: ./data/verification-reports/deal-link-verification-2025-08-26T12-00-00-000Z.json
  📊 CSV:  ./data/verification-reports/deal-link-verification-2025-08-26T12-00-00-000Z-summary.csv
  🌐 HTML: ./data/verification-reports/deal-link-verification-2025-08-26T12-00-00-000Z.html

✅ Deal Link Checker completed successfully!
```

## Development Notes

- **HTTP Verification**: Requires optional dependencies for full functionality
- **Rate Limiting**: Respects 2 req/sec limit for external API compliance
- **Extensible**: Easy to add new affiliate networks and validation rules
- **Test Data**: Uses `data/affiliate-links.json` as reference seed data

## Files

- `scripts/deal-link-checker.js` - Main verification script
- `scripts/utils/link-extract.js` - HTML parsing and link extraction
- `config/deal-verifier.config.json` - Configuration file
- `data/affiliate-links.json` - Seed data and reference links

## Next Steps

1. Install HTTP dependencies for full verification
2. Fix identified placeholder URLs
3. Set up automated reporting schedule
4. Integrate with CI/CD pipeline