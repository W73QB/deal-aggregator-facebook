# Deal Aggregator - Multi-Channel Automation Framework

A modular affiliate deal aggregation and posting system designed for multiple platforms (Website, Facebook, TikTok, YouTube).

## Project Structure

```
deal-aggregator/
├── core/                    # Core pipeline modules
│   ├── crawl/              # Data collection scripts
│   ├── process/            # Deal processing and filtering
│   ├── media/              # Screenshot and media capture
│   ├── schedule/           # Posting schedule generation
│   └── utils/              # Shared utilities
├── platforms/              # Platform-specific modules
│   ├── website/            # Website files
│   │   ├── pages/          # HTML pages
│   │   ├── css/            # Stylesheets
│   │   ├── js/             # JavaScript files
│   │   └── assets/         # Images and media
│   ├── facebook/           # Facebook automation
│   ├── tiktok/             # TikTok automation (future)
│   └── youtube/            # YouTube automation (future)
├── data/                   # Data storage
│   ├── raw/                # Raw scraped data
│   ├── enriched/           # Processed deal data
│   ├── selected/           # Curated deals for posting
│   └── logs/               # System logs
├── config/                 # Configuration files
├── docs/                   # Documentation
├── scripts/                # Utility and automation scripts
└── tests/                  # Test files
```

## Quick Start

### Prerequisites
- Node.js 16+ 
- Valid Facebook API credentials (for Facebook posting)

### Setup
1. Configure your environment:
   ```bash
   cp config/.env.local.json.example config/.env.local.json
   # Edit config/.env.local.json with your API keys
   ```

2. Install dependencies (if using external packages):
   ```bash
   npm install
   ```

### Usage

#### Pipeline Runner
Use the centralized pipeline runner for common workflows:

```bash
# Run full pipeline (crawl → process → enrich → capture → schedule)
node scripts/run-pipeline.js full

# Run content-only workflow (no media capture)
node scripts/run-pipeline.js content-only

# Test Facebook API access
node scripts/run-pipeline.js test-facebook

# Post to Facebook
node scripts/run-pipeline.js facebook-only

# Run individual commands
node scripts/run-pipeline.js crawl
node scripts/run-pipeline.js process
```

#### Individual Scripts
Run scripts directly from the project root:

```bash
# Core pipeline
node core/crawl/crawl-multi-sources.js
node core/process/process-deals.js  
node core/process/enrich-deals.js
node core/media/capture-screenshots.js
node core/schedule/generate-schedule.js

# Facebook platform
node platforms/facebook/test-facebook-access.js
node platforms/facebook/facebook-post.js
node platforms/facebook/facebook-post-live.js
```

#### Website
Open `platforms/website/pages/index.html` in a browser to view the local website.

### Testing
```bash
# Test all functionality after setup/changes
node scripts/test-functionality.js
```

## Configuration

### Environment Variables (.env.local.json)
```json
{
  "PROJECT_ROOT": "/path/to/deal-aggregator",
  "DEALS_RAW_DIR": "/path/to/deal-aggregator/data/raw",
  "DEALS_ENRICHED_DIR": "/path/to/deal-aggregator/data/enriched", 
  "MEDIA_DIR": "/path/to/deal-aggregator/media",
  "LOGS_DIR": "/path/to/deal-aggregator/data/logs",
  "CONFIG_DIR": "/path/to/deal-aggregator/config",
  "FB_PAGE_ID": "your_page_id",
  "FB_PAGE_ACCESS_TOKEN": "your_access_token",
  "FB_APP_ID": "your_app_id",
  "FB_APP_SECRET": "your_app_secret"
}
```

### Sources Configuration (sources.json)
Configure deal sources, merchants, and scraping targets.

## Data Flow

1. **Crawl** (`core/crawl/`) - Scrape deals from configured sources
2. **Process** (`core/process/`) - Filter and select quality deals  
3. **Enrich** (`core/process/`) - Add affiliate links and metadata
4. **Capture** (`core/media/`) - Generate product screenshots
5. **Schedule** (`core/schedule/`) - Create posting schedule
6. **Post** (`platforms/`) - Publish to social platforms

## Future Platforms

The modular structure supports easy addition of new platforms:
- `platforms/tiktok/` - TikTok automation
- `platforms/youtube/` - YouTube automation  
- `platforms/instagram/` - Instagram automation

## Development

### Adding a New Platform
1. Create directory: `platforms/[platform-name]/`
2. Implement posting scripts following the Facebook platform pattern
3. Add commands to `scripts/run-pipeline.js`
4. Update configuration as needed

### Project Principles
- **Modular**: Each platform and core function is separate
- **Configurable**: All settings externalized to config files
- **Extensible**: Easy to add new platforms and data sources
- **Robust**: Comprehensive logging and error handling