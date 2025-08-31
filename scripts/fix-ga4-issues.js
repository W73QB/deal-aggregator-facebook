#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing GA4 issues in problematic files...\n');

// Files that have GA4 issues
const problematicFiles = [
  './dist/index.html',
  './dist/test-ga4.html', 
  './src/index.html',
  './test-ga4.html'
];

// Standard GA4 implementation with load guard
const standardGA4Script = `    <!-- Google tag (gtag.js) with duplicate-load guard -->
    <script>
      // GA4 One-time Load Guard
      if (!window.__GA4_LOADED__) {
        window.__GA4_LOADED__ = true;
        
        // Load gtag.js script
        var script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.googletagmanager.com/gtag/js?id=G-9ZVTTTBD03';
        document.head.appendChild(script);
        
        // Initialize GA4
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'G-9ZVTTTBD03', {
          'anonymize_ip': true,
          'send_page_view': true
        });

        // Track outbound clicks for affiliate links
        document.addEventListener('click', function(e) {
          let link = e.target.closest('a');
          if (link && link.hostname !== window.location.hostname) {
            gtag('event', 'click_outbound', {
              'event_category': 'outbound',
              'event_label': link.href,
              'transport_type': 'beacon'
            });
          }
        });
      }
    </script>`;

let fixedFiles = 0;

problematicFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove any existing GA4 scripts
    content = content.replace(/<!-- Google tag \(gtag\.js\).*?<\/script>/gs, '');
    content = content.replace(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[^"]+"><\/script>/g, '');
    content = content.replace(/<script>\s*window\.dataLayer[^<]*<\/script>/gs, '');
    
    // Insert the standardized GA4 script before </head>
    if (content.includes('</head>')) {
      content = content.replace('</head>', standardGA4Script + '\n</head>');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed GA4 in: ${filePath}`);
      fixedFiles++;
    } else {
      console.log(`⚠️ No </head> tag found in: ${filePath}`);
    }
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log(`\n📊 Fixed GA4 issues in ${fixedFiles} files.`);
console.log('🎯 All files now use standardized GA4 with load guard.');