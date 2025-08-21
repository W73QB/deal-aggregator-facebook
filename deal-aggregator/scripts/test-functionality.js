const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test script to verify all functionality after restructuring
console.log('🧪 Testing Deal Aggregator functionality after restructuring...\n');

const testsToRun = [
  {
    name: 'Config files accessibility',
    test: () => {
      const configFiles = [
        'config/.env.local.json',
        'config/sources.json', 
        'config/pipeline-paths.json'
      ];
      
      configFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          throw new Error(`Missing config file: ${file}`);
        }
        console.log(`  ✓ ${file} exists`);
      });
    }
  },
  {
    name: 'Directory structure',
    test: () => {
      const requiredDirs = [
        'core/crawl',
        'core/process', 
        'core/media',
        'core/schedule',
        'platforms/website/pages',
        'platforms/website/css',
        'platforms/website/js',
        'platforms/website/assets',
        'platforms/facebook',
        'data/raw',
        'data/enriched',
        'data/selected',
        'data/logs',
        'media'
      ];
      
      requiredDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          throw new Error(`Missing directory: ${dir}`);
        }
        console.log(`  ✓ ${dir}/ exists`);
      });
    }
  },
  {
    name: 'Website files',
    test: () => {
      const websiteFiles = [
        'platforms/website/pages/index.html',
        'platforms/website/pages/deals.html', 
        'platforms/website/pages/blog.html',
        'platforms/website/css/styles.css',
        'platforms/website/css/blog.css',
        'platforms/website/js/script.js',
        'platforms/website/js/blog.js',
        'platforms/website/assets/logo-concept.svg'
      ];
      
      websiteFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          throw new Error(`Missing website file: ${file}`);
        }
        console.log(`  ✓ ${file} exists`);
      });
    }
  },
  {
    name: 'Core scripts',
    test: () => {
      const coreScripts = [
        'core/crawl/crawl-multi-sources.js',
        'core/process/process-deals.js',
        'core/process/enrich-deals.js', 
        'core/media/capture-screenshots.js',
        'core/schedule/generate-schedule.js'
      ];
      
      coreScripts.forEach(script => {
        if (!fs.existsSync(script)) {
          throw new Error(`Missing core script: ${script}`);
        }
        console.log(`  ✓ ${script} exists`);
      });
    }
  },
  {
    name: 'Platform scripts',
    test: () => {
      const platformScripts = [
        'platforms/facebook/facebook-post.js',
        'platforms/facebook/facebook-post-live.js',
        'platforms/facebook/test-facebook-access.js'
      ];
      
      platformScripts.forEach(script => {
        if (!fs.existsSync(script)) {
          throw new Error(`Missing platform script: ${script}`);
        }
        console.log(`  ✓ ${script} exists`);
      });
    }
  },
  {
    name: 'Website asset paths',
    test: () => {
      const htmlFiles = [
        'platforms/website/pages/index.html',
        'platforms/website/pages/deals.html',
        'platforms/website/pages/blog.html'
      ];
      
      htmlFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for old relative paths (should be updated)
        if (content.includes('href="styles.css"') || 
            content.includes('src="script.js"') ||
            content.includes('src="logo-concept.svg"')) {
          throw new Error(`${file} still contains old relative paths`);
        }
        
        // Check for new relative paths
        if (!content.includes('../css/styles.css')) {
          throw new Error(`${file} missing updated CSS path`);
        }
        
        console.log(`  ✓ ${file} paths updated correctly`);
      });
    }
  }
];

// Run all tests
let passed = 0;
let failed = 0;

testsToRun.forEach(testCase => {
  try {
    console.log(`🔍 Testing: ${testCase.name}`);
    testCase.test();
    console.log(`✅ PASSED: ${testCase.name}\n`);
    passed++;
  } catch (error) {
    console.log(`❌ FAILED: ${testCase.name}`);
    console.log(`   Error: ${error.message}\n`);
    failed++;
  }
});

console.log('📊 Test Summary:');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! The restructuring was successful.');
} else {
  console.log(`\n⚠️  ${failed} test(s) failed. Please review and fix the issues.`);
  process.exit(1);
}