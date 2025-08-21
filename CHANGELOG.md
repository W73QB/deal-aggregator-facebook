# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v0.2.0] — Duplicate reduction & utilities — 2025-08-21

### Added
- **ConfigLoader**: Unified configuration loading with validation and error handling
- **FacebookAPI**: Centralized Facebook API interactions with token validation and error handling
- **FileProcessor**: JSONL file processing utilities with batch operations and error recovery
- **DOMUtils**: DOM manipulation utilities for website scripts with localStorage and URL sync

### Changed
- **Configuration Management**: Refactored 5 files to use ConfigLoader utility
  - `deal-aggregator/core/process/process-deals.js`
  - `deal-aggregator/core/process/enrich-deals.js`
  - `deal-aggregator/platforms/facebook/facebook-post.js`
  - `deal-aggregator/platforms/facebook/facebook-post-live.js`
  - `deal-aggregator/platforms/facebook/test-facebook-access.js`
- **Facebook API**: Consolidated Facebook API calls through FacebookAPI class
  - Eliminated duplicate request handling across 3 platform files
  - Improved error messages without exposing tokens
- **File Processing**: Standardized JSONL operations through FileProcessor
  - Enhanced error handling with line-by-line validation
  - Added batch processing capabilities
- **Website Scripts**: Refactored DOM manipulation patterns
  - `deal-aggregator/platforms/website/js/script.js` 
  - `deal-aggregator/platforms/website/js/blog.js`

### Security
- **No Secrets Committed**: All utilities handle sensitive data securely
- **Token Validation**: Facebook API utilities validate without logging tokens
- **Error Handling**: Improved error messages without exposing sensitive information
- **Recommendation**: Enable GitHub Secret scanning & Push protection

### Testing
- **Test Coverage**: 43/43 tests passing across all utility modules
- **Test Environments**: Jest + jsdom for DOM utilities, mocking for API tests
- **Validation**: Comprehensive input validation and error handling tests

### Impact (Estimated Lines Reduced)
- **ConfigLoader**: -30 duplicate lines across configuration loading
- **FacebookAPI**: -150 duplicate lines across Facebook platform modules  
- **FileProcessor**: -80 duplicate lines across JSONL processing
- **DOMUtils**: -27 duplicate lines across website scripts
- **Total**: ~287 lines of duplicate code eliminated

### Migration Notes
- **Backward Compatible**: All changes maintain existing CLI behavior
- **Dependencies**: New dev dependency `jest-environment-jsdom` for DOM testing
- **Configuration**: Existing `.env.local.json` format unchanged

### Pull Requests Merged
- [#2](https://github.com/W73QB/deal-aggregator-facebook/pull/2): Setup testing and linting toolchain
- [#3](https://github.com/W73QB/deal-aggregator-facebook/pull/3): ConfigLoader + unify config loading (Priority 1B)
- **Simulated PRs** (branches available for manual creation):
  - `feat/facebook-api-refactor`: Facebook API consolidation (Priority 1A)
  - `feat/file-processor-utilities`: FileProcessor + unify processing (Priority 1C)  
  - `feat/dom-utils`: DOM utils + dedupe website scripts (Priority 1D)

---

## [v0.1.0] — Initial release — 2025-08-20

### Added
- Initial project structure for deal aggregation and Facebook posting
- Basic Facebook posting capabilities with live/scheduled modes
- Deal processing pipeline with raw data handling
- Website platform with blog and deal listings
- Configuration management via JSON files

### Infrastructure
- ESLint and Prettier configuration for code quality
- Jest testing framework setup
- GitHub repository structure with .gitignore