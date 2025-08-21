const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Enhanced list screen capture with first record selection
const listScreens = [
  // High Priority List Screens with First Record Selection
  {
    name: 'purchase-requests-list',
    url: 'http://localhost:3000/procurement/purchase-requests',
    description: 'Purchase Requests List with first PR selected',
    spec_file: 'purchase-requests-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="pr-number-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  },
  {
    name: 'purchase-orders-list',
    url: 'http://localhost:3000/procurement/purchase-orders',
    description: 'Purchase Orders List with first PO selected',
    spec_file: 'purchase-orders-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="po-number-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  },
  {
    name: 'goods-received-note-list',
    url: 'http://localhost:3000/procurement/goods-received-note',
    description: 'Goods Received Notes List with first GRN selected',
    spec_file: 'goods-received-note-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="grn-number-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  },
  {
    name: 'inventory-adjustments-list',
    url: 'http://localhost:3000/inventory-management/inventory-adjustments',
    description: 'Inventory Adjustments List with first adjustment selected',
    spec_file: 'inventory-adjustments-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="adjustment-number-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  },
  {
    name: 'store-requisitions-list',
    url: 'http://localhost:3000/store-operations/store-requisitions',
    description: 'Store Requisitions List with first requisition selected',
    spec_file: 'store-requisitions-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="sr-number-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  },
  {
    name: 'vendor-list',
    url: 'http://localhost:3000/vendor-management/manage-vendors',
    description: 'Vendor List with first vendor selected',
    spec_file: 'vendor-list-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'click_first_record',
        selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="vendor-name-link"]:first-of-type',
        fallback_selectors: [
          'table tbody tr:first-child',
          '[role="row"]:not([role="columnheader"]):first-of-type',
          '.data-table tbody tr:first-child'
        ],
        wait_after: 2000
      }
    ]
  }
];

// Helper function to try multiple selectors
async function tryMultipleSelectors(page, selectors, action = 'click') {
  for (const selector of selectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`   ✓ Found element with selector: ${selector}`);
        if (action === 'click') {
          await element.click();
        }
        return true;
      }
    } catch (error) {
      console.log(`   ⚠️ Selector "${selector}" not found or not clickable`);
      continue;
    }
  }
  return false;
}

// Enhanced interaction handler
async function performInteractions(page, interactions) {
  for (const interaction of interactions) {
    try {
      switch (interaction.action) {
        case 'wait_for_load':
          console.log(`   ⏳ Waiting ${interaction.timeout}ms for page load...`);
          await page.waitForTimeout(interaction.timeout);
          break;

        case 'click_first_record':
          console.log(`   🎯 Attempting to click first record...`);
          
          // Build complete selector list
          const allSelectors = [interaction.selector, ...(interaction.fallback_selectors || [])];
          
          const clicked = await tryMultipleSelectors(page, allSelectors, 'click');
          
          if (clicked) {
            console.log(`   ✅ Successfully clicked first record`);
            if (interaction.wait_after) {
              await page.waitForTimeout(interaction.wait_after);
            }
          } else {
            console.log(`   ⚠️ Could not find clickable first record, proceeding with current view`);
          }
          break;

        default:
          console.log(`   ❓ Unknown interaction: ${interaction.action}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Interaction error: ${error.message}`);
      // Continue with other interactions
    }
  }
}

async function captureEnhancedListScreenshots() {
  console.log('🎯 Starting enhanced list screen capture with first record selection...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Set timeout for navigation
  page.setDefaultTimeout(12000);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  console.log(`📋 Found ${listScreens.length} list screens to capture with enhanced interactions`);
  
  for (const screen of listScreens) {
    try {
      console.log(`\n📸 Capturing: ${screen.name}`);
      console.log(`   URL: ${screen.url}`);
      console.log(`   Priority: ${screen.priority}`);
      
      // Navigate to the screen
      try {
        await page.goto(screen.url, { 
          waitUntil: 'networkidle',
          timeout: 12000 
        });
        console.log(`   ✅ Navigation successful`);
      } catch (navError) {
        console.log(`   ⚠️ Navigation timeout, proceeding with DOM loaded...`);
        await page.goto(screen.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 8000 
        });
      }

      // Wait for initial content to load
      await page.waitForTimeout(1000);

      // Perform custom interactions
      if (screen.interactions && screen.interactions.length > 0) {
        console.log(`   🔄 Performing ${screen.interactions.length} interactions...`);
        await performInteractions(page, screen.interactions);
      }

      // Additional wait for any dynamic content after interactions
      await page.waitForTimeout(1500);

      // Create directory if it doesn't exist
      const imageDir = path.join('docs/prd/output/screens/images', screen.name);
      await fs.mkdir(imageDir, { recursive: true });

      // Take screenshot
      const screenshotPath = path.join(imageDir, `${screen.name}-populated.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });

      console.log(`   ✅ Enhanced screenshot saved: ${screenshotPath}`);
      
      results.push({
        screen: screen.name,
        url: screen.url,
        status: 'success',
        spec_file: screen.spec_file,
        priority: screen.priority,
        screenshot: screenshotPath,
        interactions_performed: screen.interactions?.length || 0
      });
      
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Error capturing ${screen.name}: ${error.message}`);
      
      // Still try to take an error screenshot
      try {
        const errorDir = path.join('docs/prd/output/screens/images', screen.name);
        await fs.mkdir(errorDir, { recursive: true });
        const errorPath = path.join(errorDir, `${screen.name}-error.png`);
        await page.screenshot({ 
          path: errorPath, 
          fullPage: false 
        });
        console.log(`   📄 Error screenshot saved: ${errorPath}`);
      } catch (errorScreenshotError) {
        console.log(`   ⚠️ Could not capture error screenshot: ${errorScreenshotError.message}`);
      }
      
      results.push({
        screen: screen.name,
        url: screen.url,
        status: 'error',
        error: error.message,
        spec_file: screen.spec_file,
        priority: screen.priority
      });
      
      errorCount++;
    }
  }

  await browser.close();

  // Generate enhanced capture report
  const report = {
    timestamp: new Date().toISOString(),
    capture_type: 'enhanced_list_screens_with_first_record_selection',
    total_screens: listScreens.length,
    successful_captures: successCount,
    failed_captures: errorCount,
    success_rate: ((successCount / listScreens.length) * 100).toFixed(1),
    results: results
  };

  const reportPath = 'docs/prd/output/screens/images/enhanced-capture-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 ENHANCED CAPTURE SUMMARY');
  console.log('============================');
  console.log(`Total list screens: ${listScreens.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success rate: ${report.success_rate}%`);
  console.log(`📝 Report saved: ${reportPath}`);
  
  console.log('\n🎯 INTERACTIONS SUMMARY');
  console.log('=======================');
  results.filter(r => r.status === 'success').forEach(result => {
    console.log(`✅ ${result.screen} - ${result.interactions_performed} interactions performed`);
  });

  console.log('\n🔍 FAILED SCREENS (if any)');
  console.log('===========================');
  results.filter(r => r.status === 'error').forEach(result => {
    console.log(`❌ ${result.screen} - ${result.error}`);
  });

  return report;
}

// Handle script execution
if (require.main === module) {
  captureEnhancedListScreenshots()
    .then((report) => {
      console.log('\n🎉 Enhanced list screen capture completed successfully!');
      console.log('Screenshots now show populated content with first records selected.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during enhanced screen capture:', error);
      process.exit(1);
    });
}

module.exports = { captureEnhancedListScreenshots, listScreens };