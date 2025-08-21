#!/usr/bin/env node

/**
 * Carmen ERP Screenshot Runner
 * Utility script to run Playwright screenshot capture with various options
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// Configuration
const PLAYWRIGHT_CONFIG = path.join(__dirname, '..', 'playwright.config.js');
const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'prd', 'output', 'screens', 'images');

// Command line argument parsing
const args = process.argv.slice(2);
const options = {
  device: 'desktop', // desktop, tablet, mobile, all
  screens: [], // specific screens to capture, empty = all
  modals: true, // include modal capture
  states: true, // include state variations
  parallel: false, // run in parallel (faster but less reliable)
  verbose: false, // detailed logging
  clean: false, // clean existing screenshots
  dry: false // dry run (don't actually capture)
};

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  
  switch (arg) {
    case '--device':
    case '-d':
      options.device = args[++i] || 'desktop';
      break;
    case '--screens':
    case '-s':
      options.screens = (args[++i] || '').split(',').filter(s => s.length > 0);
      break;
    case '--no-modals':
      options.modals = false;
      break;
    case '--no-states':
      options.states = false;
      break;
    case '--parallel':
    case '-p':
      options.parallel = true;
      break;
    case '--verbose':
    case '-v':
      options.verbose = true;
      break;
    case '--clean':
    case '-c':
      options.clean = true;
      break;
    case '--dry-run':
      options.dry = true;
      break;
    case '--help':
    case '-h':
      showHelp();
      process.exit(0);
    default:
      if (arg.startsWith('-')) {
        console.error(`Unknown option: ${arg}`);
        showHelp();
        process.exit(1);
      }
  }
}

function showHelp() {
  console.log(`
Carmen ERP Screenshot Capture Tool

Usage: node run-screenshots.js [options]

Options:
  -d, --device <type>     Target device: desktop, tablet, mobile, all (default: desktop)
  -s, --screens <list>    Comma-separated list of specific screens to capture
      --no-modals         Skip modal capture
      --no-states         Skip state variations
  -p, --parallel          Run tests in parallel (faster but less reliable)
  -v, --verbose           Enable verbose logging
  -c, --clean             Clean existing screenshots before capture
      --dry-run           Show what would be captured without actually running
  -h, --help              Show this help message

Examples:
  node run-screenshots.js                                    # Capture all desktop screenshots
  node run-screenshots.js -d all                            # Capture for all devices
  node run-screenshots.js -s dashboard,purchase-requests    # Capture specific screens
  node run-screenshots.js -d tablet --no-modals            # Tablet screenshots without modals
  node run-screenshots.js --clean -v                        # Clean and capture with verbose output

Available screens:
  dashboard, purchase-requests, purchase-request-detail, purchase-orders,
  purchase-order-detail, goods-received-note, goods-received-note-detail,
  vendor-management, vendor-detail, vendor-pricelists, inventory-overview,
  inventory-adjustments, store-requisitions, store-requisition-detail,
  pos-integration, pos-mapping, help-support, user-manuals, video-tutorials,
  faqs, support-tickets
`);
}

async function cleanScreenshots() {
  if (options.verbose) {
    console.log('🧹 Cleaning existing screenshots...');
  }
  
  try {
    await fs.rmdir(SCREENSHOTS_DIR, { recursive: true });
    if (options.verbose) {
      console.log('✅ Screenshots directory cleaned');
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`⚠ Could not clean screenshots: ${error.message}`);
    }
  }
}

async function ensureServerRunning() {
  // Check if development server is running
  try {
    const response = await fetch('http://localhost:3000');
    return response.ok;
  } catch {
    return false;
  }
}

function buildPlaywrightCommand() {
  const cmd = 'npx';
  const baseArgs = ['playwright', 'test', '--config', PLAYWRIGHT_CONFIG];
  
  // Add project filter based on device
  if (options.device !== 'all') {
    if (options.device === 'desktop') {
      baseArgs.push('--project', 'desktop-chrome');
    } else if (options.device === 'tablet') {
      baseArgs.push('--project', 'tablet');
    } else if (options.device === 'mobile') {
      baseArgs.push('--project', 'mobile');
    }
  }
  
  // Add test file filter for specific screens
  if (options.screens.length > 0) {
    // This would need custom test filtering implementation
    if (options.verbose) {
      console.log(`Specific screens requested: ${options.screens.join(', ')}`);
    }
  }
  
  // Parallel execution
  if (options.parallel) {
    baseArgs.push('--workers', '3');
  } else {
    baseArgs.push('--workers', '1');
  }
  
  // Verbose output
  if (options.verbose) {
    baseArgs.push('--reporter', 'line');
  }
  
  return { cmd, args: baseArgs };
}

async function runScreenshots() {
  console.log('🚀 Starting Carmen ERP Screenshot Capture');
  console.log(`   Device: ${options.device}`);
  console.log(`   Modals: ${options.modals ? 'enabled' : 'disabled'}`);
  console.log(`   States: ${options.states ? 'enabled' : 'disabled'}`);
  console.log(`   Parallel: ${options.parallel ? 'enabled' : 'disabled'}`);
  
  if (options.screens.length > 0) {
    console.log(`   Screens: ${options.screens.join(', ')}`);
  }
  
  if (options.dry) {
    console.log('\n🏃 DRY RUN - No screenshots will be captured');
    const { cmd, args } = buildPlaywrightCommand();
    console.log(`Command: ${cmd} ${args.join(' ')}`);
    return;
  }
  
  // Clean screenshots if requested
  if (options.clean) {
    await cleanScreenshots();
  }
  
  // Check if server is running
  console.log('\n🔍 Checking development server...');
  const serverRunning = await ensureServerRunning();
  
  if (!serverRunning) {
    console.log('⚠ Development server not detected at http://localhost:3000');
    console.log('Please start the server with: npm run dev');
    console.log('Then run this script again.');
    process.exit(1);
  }
  
  console.log('✅ Development server is running');
  
  // Build and execute Playwright command
  const { cmd, args } = buildPlaywrightCommand();
  
  console.log('\n📸 Starting screenshot capture...');
  if (options.verbose) {
    console.log(`Executing: ${cmd} ${args.join(' ')}`);
  }
  
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true
  });
  
  child.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Screenshot capture completed successfully!');
      console.log(`📁 Screenshots saved to: ${SCREENSHOTS_DIR}`);
    } else {
      console.error(`\n❌ Screenshot capture failed with code ${code}`);
      process.exit(code);
    }
  });
  
  child.on('error', (error) => {
    console.error(`❌ Failed to start screenshot capture: ${error.message}`);
    process.exit(1);
  });
}

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Screenshot capture interrupted');
  process.exit(1);
});

// Main execution
if (require.main === module) {
  runScreenshots().catch((error) => {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runScreenshots,
  options
};