#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Centralized pipeline runner for the multi-channel automation framework
console.log('🚀 Deal Aggregator Pipeline Runner');
console.log('=====================================\n');

const commands = {
  crawl: 'node core/crawl/crawl-multi-sources.js',
  process: 'node core/process/process-deals.js', 
  enrich: 'node core/process/enrich-deals.js',
  capture: 'node core/media/capture-screenshots.js',
  schedule: 'node core/schedule/generate-schedule.js',
  'post-facebook': 'node platforms/facebook/facebook-post.js',
  'post-facebook-live': 'node platforms/facebook/facebook-post-live.js',
  'test-facebook': 'node platforms/facebook/test-facebook-access.js'
};

const workflows = {
  full: ['crawl', 'process', 'enrich', 'capture', 'schedule'],
  'content-only': ['crawl', 'process', 'enrich'],
  'facebook-only': ['post-facebook'],
  test: ['test-facebook']
};

function runCommand(cmd, description) {
  console.log(`🔄 ${description}...`);
  try {
    const output = execSync(cmd, { 
      cwd: process.cwd(),
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed:`);
    console.log(error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/run-pipeline.js <command|workflow>');
    console.log('\nAvailable commands:');
    Object.keys(commands).forEach(cmd => {
      console.log(`  ${cmd}`);
    });
    console.log('\nAvailable workflows:');
    Object.keys(workflows).forEach(workflow => {
      console.log(`  ${workflow}: [${workflows[workflow].join(', ')}]`);
    });
    return;
  }
  
  const target = args[0];
  
  if (commands[target]) {
    // Run single command
    runCommand(commands[target], target);
  } else if (workflows[target]) {
    // Run workflow
    console.log(`📋 Running workflow: ${target}`);
    console.log(`   Steps: ${workflows[target].join(' → ')}\n`);
    
    let success = true;
    for (const step of workflows[target]) {
      if (!runCommand(commands[step], step)) {
        success = false;
        break;
      }
    }
    
    if (success) {
      console.log(`🎉 Workflow "${target}" completed successfully!`);
    } else {
      console.log(`💥 Workflow "${target}" failed.`);
      process.exit(1);
    }
  } else {
    console.log(`❌ Unknown command or workflow: ${target}`);
    process.exit(1);
  }
}

main();