#!/usr/bin/env node
const fs = require('fs'); 
const path = require('path');
const { glob } = require('glob');

const globs = [
  '**/.env', '**/.env.*', '**/*.env', '**/*.env.*',
  '**/*.{json,js,ts,yaml,yml}', '.github/workflows/*', 'ci/**/*',
  'Dockerfile*','docker-compose*'
];

const ignore = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/*.log',
  '**/*.backup-*'
];

const KEY_HINT = /(API_KEY|SECRET|TOKEN|DSN|KEY|CLIENT_SECRET|PRIVATE_KEY|WEBHOOK|SIGNING|SMTP_.*PASS|REDIS_URL|DATABASE_URL|GA4_MEASUREMENT_ID|GTM_CONTAINER_ID|STRIPE_.*|SENDGRID_.*|SENTRY_DSN|JWT_.*|EMAIL_.*|OAUTH_.*|NEON_.*|AWS_.*|GCP_.*|AZURE_.*)/i;

const PLACEHOLDER = /(example\.com|YOUR_[A-Z0-9_]+_HERE|G-XXXX|GTM-XXXX|change[_ -]?me|replace[_ -]?me|dummy|sample|test|xxxx|yyyy|zzz)/i;

const VALUE_SHAPES = [
  /[A-Za-z0-9+.-]+:\/\/[^@\s:]+:[^@\s]+@[^/\s]+\/[^\s]*/i,                          // url có user:pass
  /\b(sk|rk|pk|ya29|ghp)_[A-Za-z0-9-_]{20,}\b/i,                                   // bearer-like
  /\bG-[A-Z0-9]{8,}\b/, 
  /\bGTM-[A-Z0-9]{6,}\b/,                                                           // GA/GTM
  /https?:\/\/[^@]+@[^/]+\/\d+/,                                                   // Sentry DSN
  /\b[A-F0-9]{8}(-[A-F0-9]{4}){3}-[A-F0-9]{12}\b/i,                                // uuid
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/m    // private key
];

function parseEnv(content) {
  const obj = {};
  content.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (match) {
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, '');
      obj[key] = value;
    }
  });
  return obj;
}

function looksSecret(key, value) {
  if (!key || !value) return false;
  
  // If key doesn't hint at being a secret, check if value looks like one
  if (!KEY_HINT.test(key)) {
    return VALUE_SHAPES.some(regex => regex.test(value));
  }
  
  // If it's a placeholder, it's not a real secret
  if (PLACEHOLDER.test(value)) return false;
  
  return true;
}

(async () => {
  console.log('🔍 Starting M3.9 Secrets Discovery...');
  console.log('=' .repeat(50));
  
  try {
    const files = (await glob(globs, { ignore, dot: true }))
      .filter(f => {
        try {
          return fs.statSync(f).isFile();
        } catch {
          return false;
        }
      });
    
    console.log(`📁 Found ${files.length} files to analyze`);
    
    const seen = new Map(); // key -> {value, sources[]}
    const placeholders = [];
    const sources = [];
    
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      let text = '';
      
      try {
        text = fs.readFileSync(file, 'utf8');
      } catch (error) {
        console.log(`⚠️ Warning: Could not read ${file}: ${error.message}`);
        continue;
      }
      
      // Handle environment files specially
      if (file.match(/\.env($|\.)/i)) {
        const envVars = parseEnv(text);
        
        for (const [key, value] of Object.entries(envVars)) {
          const isPlaceholder = !value || PLACEHOLDER.test(value);
          
          if (isPlaceholder) {
            placeholders.push({ key, value, file });
            continue;
          }
          
          if (looksSecret(key, value)) {
            if (!seen.has(key)) {
              seen.set(key, { value, sources: [] });
            }
            
            const existingInfo = seen.get(key);
            if (!existingInfo.sources.includes(file)) {
              existingInfo.sources.push(file);
            }
          }
        }
        continue;
      }
      
      // Handle JSON/YAML/JS/TS files by scanning lines
      const lines = text.split(/\r?\n/);
      lines.forEach((line, idx) => {
        // Match patterns like KEY: "value" or "KEY"="value"
        const keyValueMatch = line.match(/([A-Z0-9_]{3,})["']?\s*[:=]\s*["']([^"']+)["']/i);
        if (keyValueMatch) {
          const key = keyValueMatch[1];
          const value = keyValueMatch[2];
          
          if (!PLACEHOLDER.test(value) && looksSecret(key, value)) {
            if (!seen.has(key)) {
              seen.set(key, { value, sources: [] });
            }
            
            const existingInfo = seen.get(key);
            if (!existingInfo.sources.includes(file)) {
              existingInfo.sources.push(file);
            }
          }
          
          if (PLACEHOLDER.test(value)) {
            placeholders.push({ key, value, file, line: idx + 1 });
          }
        }
        
        // Look for standalone GA/GTM patterns
        const gaMatch = line.match(/\bG-[A-Z0-9]{8,}\b/);
        if (gaMatch) {
          const key = 'GA4_MEASUREMENT_ID';
          const value = gaMatch[0];
          
          if (!seen.has(key)) {
            seen.set(key, { value, sources: [] });
          }
          
          const existingInfo = seen.get(key);
          if (!existingInfo.sources.includes(file)) {
            existingInfo.sources.push(file);
          }
        }
        
        const gtmMatch = line.match(/\bGTM-[A-Z0-9]{6,}\b/);
        if (gtmMatch) {
          const key = 'GTM_CONTAINER_ID';
          const value = gtmMatch[0];
          
          if (!seen.has(key)) {
            seen.set(key, { value, sources: [] });
          }
          
          const existingInfo = seen.get(key);
          if (!existingInfo.sources.includes(file)) {
            existingInfo.sources.push(file);
          }
        }
        
        // Look for Sentry DSN patterns
        const dsnMatch = line.match(/https?:\/\/[^@]+@[^/]+\/\d+/);
        if (dsnMatch) {
          const key = 'SENTRY_DSN';
          const value = dsnMatch[0];
          
          if (!seen.has(key)) {
            seen.set(key, { value, sources: [] });
          }
          
          const existingInfo = seen.get(key);
          if (!existingInfo.sources.includes(file)) {
            existingInfo.sources.push(file);
          }
        }
      });
      
      sources.push(file);
    }
    
    // Export complete JSON of all secrets
    const allSecrets = {};
    for (const [key, info] of seen.entries()) {
      allSecrets[key] = info.value;
    }
    
    fs.writeFileSync('secrets/all-secrets.json', JSON.stringify(allSecrets, null, 2));
    
    // Generate comprehensive Markdown report
    let markdown = `# 🔐 Secrets Discovery Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Files Analyzed:** ${files.length}\n`;
    markdown += `**Secrets Found:** ${Object.keys(allSecrets).length}\n`;
    markdown += `**Placeholders Found:** ${placeholders.length}\n\n`;
    
    markdown += `## ✅ Collected Secrets (${Object.keys(allSecrets).length})\n\n`;
    markdown += `| Key | Value Preview | Sources |\n`;
    markdown += `|-----|---------------|----------|\n`;
    
    for (const [key, info] of seen.entries()) {
      const valuePreview = info.value.length > 50 
        ? info.value.slice(0, 47) + '...'
        : info.value;
      
      const sourcesList = info.sources
        .map(source => `\`${source}\``)
        .join('<br>');
      
      markdown += `| **${key}** | \`${valuePreview}\` | ${sourcesList} |\n`;
    }
    
    if (placeholders.length > 0) {
      markdown += `\n## ⚠️ Placeholders Still Detected (${placeholders.length})\n\n`;
      markdown += `| Key | Placeholder Value | File | Line |\n`;
      markdown += `|-----|-------------------|------|------|\n`;
      
      placeholders.forEach(placeholder => {
        const valuePreview = (placeholder.value || '').length > 80
          ? (placeholder.value || '').slice(0, 77) + '...'
          : (placeholder.value || '');
        
        const location = placeholder.line 
          ? `\`${placeholder.file}:${placeholder.line}\``
          : `\`${placeholder.file}\``;
        
        markdown += `| **${placeholder.key}** | \`${valuePreview}\` | ${location} | ${placeholder.line || ''} |\n`;
      });
    }
    
    // Add security recommendations
    markdown += `\n## 🛡️ Security Recommendations\n\n`;
    
    if (placeholders.length > 0) {
      markdown += `### Immediate Actions Required\n`;
      markdown += `- **${placeholders.length} placeholders** need to be replaced with real values\n`;
      markdown += `- Run \`npm run audit:placeholders:fix\` to apply automatic fixes\n`;
      markdown += `- Review and validate all automatically replaced values\n\n`;
    }
    
    markdown += `### Security Best Practices\n`;
    markdown += `- Store production secrets in environment variables, not in files\n`;
    markdown += `- Use secret management services for production deployments\n`;
    markdown += `- Regular audit runs to prevent placeholder commits\n`;
    markdown += `- Implement pre-commit hooks to catch placeholder values\n\n`;
    
    markdown += `---\n`;
    markdown += `*Generated by M3.9 Secrets Discovery Tool*\n`;
    
    fs.writeFileSync('SECRETS-DISCOVERY-REPORT.md', markdown);
    
    // Display summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SECRETS DISCOVERY RESULTS');
    console.log('='.repeat(60));
    console.log(`📁 Files Analyzed: ${files.length}`);
    console.log(`🔑 Secrets Found: ${Object.keys(allSecrets).length}`);
    console.log(`⚠️  Placeholders: ${placeholders.length}`);
    
    if (Object.keys(allSecrets).length > 0) {
      console.log('\n🔐 Key Categories Found:');
      const categories = {
        'Analytics': Object.keys(allSecrets).filter(k => /GA4|GTM|ANALYTICS/i.test(k)),
        'Database': Object.keys(allSecrets).filter(k => /DATABASE|REDIS|MONGO|POSTGRES/i.test(k)),
        'Email': Object.keys(allSecrets).filter(k => /EMAIL|SMTP|SENDGRID/i.test(k)),
        'Security': Object.keys(allSecrets).filter(k => /JWT|SECRET|TOKEN|KEY/i.test(k)),
        'External APIs': Object.keys(allSecrets).filter(k => /API_KEY|STRIPE|SENTRY|OAUTH/i.test(k))
      };
      
      Object.entries(categories).forEach(([category, keys]) => {
        if (keys.length > 0) {
          console.log(`   ${category}: ${keys.length} secrets`);
        }
      });
    }
    
    console.log('='.repeat(60));
    console.log(`\n✅ Reports generated:`);
    console.log(`   📄 secrets/all-secrets.json`);
    console.log(`   📄 SECRETS-DISCOVERY-REPORT.md\n`);
    
    // Exit with appropriate code
    process.exit(placeholders.length > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('❌ Secrets discovery failed:', error.message);
    if (process.env.VERBOSE) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();