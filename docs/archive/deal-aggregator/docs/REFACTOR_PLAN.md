# 🔧 REFACTOR PLAN - GIẢM TRÙNG LẶP CODE

## 🎯 MỤC TIÊU
Giảm trùng lặp code từ **60%** xuống **10%** của codebase để cải thiện maintainability và code quality.

## 📊 HIỆN TRẠNG
- **Total files**: 182 files
- **Duplicate code**: ~60% codebase (~1,706 lines)
- **Main duplications**: Facebook API (85%), Core Processing (70%), Config Loading (100%)

## 🚀 HẠNG MỤC ƯU TIÊN 1

### ✅ COMPLETED: Infrastructure Setup
- [x] Tạo `core/utils/` directory structure
- [x] Tạo stub files cho shared utilities
- [x] Cleanup system junk files (.DS_Store)
- [x] Update .gitignore patterns

### 🔥 PRIORITY 1A: Facebook API Consolidation
**Target**: Giảm 85% trùng lặp (~150 lines)

#### Files cần refactor:
- [ ] `platforms/facebook/facebook-post.js`
- [ ] `platforms/facebook/facebook-post-live.js` 
- [ ] `platforms/facebook/test-facebook-access.js`

#### Steps:
- [ ] **Step 1**: Implement `core/utils/facebook-api.js`
  - [ ] Class FacebookAPI với constructor(pageId, accessToken)
  - [ ] Method makeRequest(options, postData)
  - [ ] Method validateCredentials()
  - [ ] Method postMessage(message, link)
  - [ ] Method testAccess()
  - [ ] Standardized error handling & timeout

- [ ] **Step 2**: Refactor facebook-post.js
  - [ ] Import FacebookAPI class
  - [ ] Replace duplicate makeRequest function
  - [ ] Replace credentials validation
  - [ ] Test functionality

- [ ] **Step 3**: Refactor facebook-post-live.js
  - [ ] Same pattern as Step 2
  - [ ] Keep live-specific logic intact

- [ ] **Step 4**: Refactor test-facebook-access.js
  - [ ] Convert to use FacebookAPI.testAccess()
  - [ ] Simplify to single method call

#### Acceptance Criteria:
- [ ] All 3 files use shared FacebookAPI class
- [ ] No duplicate makeRequest functions
- [ ] All existing functionality preserved
- [ ] Tests pass (if any)

### 🔥 PRIORITY 1B: Configuration Loading
**Target**: Giảm 100% trùng lặp (~30 lines)

#### Files cần refactor:
- [ ] `platforms/facebook/facebook-post.js` (lines ~3-6)
- [ ] `platforms/facebook/facebook-post-live.js` (lines ~3-6)
- [ ] `platforms/facebook/test-facebook-access.js` (lines ~3-6)
- [ ] `core/process/process-deals.js` (lines ~3-6)
- [ ] `core/process/enrich-deals.js` (lines ~3-6)

#### Steps:
- [ ] **Step 1**: Implement `core/utils/config.js`
  - [ ] Class ConfigLoader
  - [ ] Static method loadEnvironment(relativePath)
  - [ ] Static method getDateString()
  - [ ] Static method validatePaths(config)
  - [ ] Static method validateFacebookConfig(config)

- [ ] **Step 2**: Update all 5 files
  - [ ] Replace duplicate loading pattern
  - [ ] Use ConfigLoader.loadEnvironment()
  - [ ] Use ConfigLoader.getDateString()
  - [ ] Test each file individually

#### Acceptance Criteria:
- [ ] No duplicate config loading code
- [ ] All files use ConfigLoader utility
- [ ] Date string generation standardized

### 🔥 PRIORITY 1C: File Processing Utilities
**Target**: Giảm 70% trùng lặp (~80 lines)

#### Files cần refactor:
- [ ] `core/process/process-deals.js`
- [ ] `core/process/enrich-deals.js`
- [ ] `scripts/patch-paths.js`
- [ ] `scripts/update-script-paths.js`

#### Steps:
- [ ] **Step 1**: Implement `core/utils/file-processor.js`
  - [ ] Class FileProcessor
  - [ ] Static method loadJSONL(filePath)
  - [ ] Static method saveJSONL(filePath, data)
  - [ ] Static method processFilesInDirectory(directory, extension, processor)
  - [ ] Static method processDeals(inputPath, outputPath, processor)

- [ ] **Step 2**: Refactor process-deals.js
  - [ ] Use FileProcessor.loadJSONL()
  - [ ] Use FileProcessor.saveJSONL()
  - [ ] Keep business logic intact

- [ ] **Step 3**: Refactor enrich-deals.js
  - [ ] Same pattern as Step 2

- [ ] **Step 4**: Consider merging patch-paths.js & update-script-paths.js
  - [ ] Analyze if they can be unified
  - [ ] Use FileProcessor.processFilesInDirectory()

#### Acceptance Criteria:
- [ ] No duplicate JSONL processing code
- [ ] Standardized file operations
- [ ] All data processing works correctly

### 🔥 PRIORITY 1D: Website DOM Utilities
**Target**: Giảm 60% trùng lặp (~40 lines)

#### Files cần refactor:
- [ ] `platforms/website/js/script.js`
- [ ] `platforms/website/js/blog.js`

#### Steps:
- [ ] **Step 1**: Implement `platforms/website/js/shared/dom-utils.js`
  - [ ] DOMUtils object với $ và $$ selectors
  - [ ] debounce function
  - [ ] syncURL(params) method
  - [ ] loadState(key), saveState(key, state) methods
  - [ ] Export for modules + window assignment

- [ ] **Step 2**: Refactor script.js
  - [ ] Import/use DOMUtils
  - [ ] Remove duplicate functions
  - [ ] Test website functionality

- [ ] **Step 3**: Refactor blog.js
  - [ ] Same pattern as Step 2

#### Acceptance Criteria:
- [ ] No duplicate DOM helper functions
- [ ] Website functionality preserved
- [ ] Code is more maintainable

## 🎯 HẠNG MỤC ƯU TIÊN 2

### ⚡ PRIORITY 2A: Config Consolidation
- [ ] **Issue**: Có thể có configs trùng lặp khác
- [ ] Audit tất cả JSON config files
- [ ] Identify và merge duplicates

### ⚡ PRIORITY 2B: Script Utilities Merging
- [ ] **Target**: `scripts/patch-paths.js` + `scripts/update-script-paths.js`
- [ ] Analyze overlap (65% similarity)
- [ ] Consider merging into single utility

### ⚡ PRIORITY 2C: Documentation Cleanup
- [ ] Review docs/ folder for duplicates
- [ ] Consolidate related documentation
- [ ] Update outdated info

## 📈 EXPECTED IMPACT

### Before Refactoring:
- **Total Lines**: ~2,847 lines
- **Duplicate Code**: ~1,706 lines (60%)
- **Maintenance Burden**: High

### After Priority 1 Completion:
- **Estimated Total Lines**: ~1,850 lines
- **Duplicate Code**: ~185 lines (10%)
- **Code Reduction**: 60% reduction in duplicates
- **Maintenance Burden**: Low

### Benefits:
- ✅ **Maintainability**: Single source of truth
- ✅ **Consistency**: Standardized patterns
- ✅ **Testing**: Easier to unit test
- ✅ **Performance**: Smaller codebase
- ✅ **Developer Experience**: Clearer structure

## ⏱️ ESTIMATED TIMELINE

| Phase | Tasks | Time Estimate |
|-------|-------|---------------|
| Priority 1A | Facebook API consolidation | 2-3 hours |
| Priority 1B | Config loading utilities | 1-2 hours |
| Priority 1C | File processing utilities | 2-3 hours |
| Priority 1D | DOM utilities | 1-2 hours |
| **TOTAL PRIORITY 1** | **Core refactoring** | **6-10 hours** |
| Priority 2 | Additional improvements | 2-4 hours |
| **GRAND TOTAL** | **Complete refactor** | **8-14 hours** |

## 🧪 TESTING STRATEGY

### Per-Component Testing:
- [ ] Test each utility module independently
- [ ] Verify all existing functionality preserved
- [ ] Check no regression in Facebook posting
- [ ] Verify website still works correctly
- [ ] Test data processing pipeline

### Integration Testing:
- [ ] Full pipeline run after each priority phase
- [ ] Cross-component compatibility check
- [ ] Performance verification

## 📋 SUCCESS CRITERIA

- [x] **Phase 0**: Infrastructure & cleanup complete
- [ ] **Phase 1**: Core duplicate elimination (Priority 1A-1D)
- [ ] **Phase 2**: Additional optimizations
- [ ] **Final**: Code duplication < 15%
- [ ] **Final**: All tests passing
- [ ] **Final**: Documentation updated

---
*Tạo ngày: 2025-08-21*  
*Status: 🟡 In Progress - Phase 0 Complete*