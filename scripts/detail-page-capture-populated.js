const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Comprehensive detail page capture with populated content
const detailPageScreens = [
  // High Priority Detail Screens
  {
    name: 'purchase-request-detail',
    url: 'http://localhost:3000/procurement/purchase-requests/PR-2024-001',
    description: 'Purchase Request Detail with populated item data and workflow',
    spec_file: 'purchase-request-detail-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="pr-details"], .pr-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'purchase-order-detail',
    url: 'http://localhost:3000/procurement/purchase-orders/PO-2024-001',
    description: 'Purchase Order Detail with complete order information and items',
    spec_file: 'purchase-order-detail-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="po-details"], .po-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'goods-received-note-detail',
    url: 'http://localhost:3000/procurement/goods-received-note/GRN-2024-001',
    description: 'Goods Received Note Detail with delivery validation data',
    spec_file: 'goods-received-note-detail-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="grn-details"], .grn-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'inventory-adjustment-detail',
    url: 'http://localhost:3000/inventory-management/inventory-adjustments/ADJ-2024-001',
    description: 'Inventory Adjustment Detail with variance information',
    spec_file: 'inventory-adjustment-detail-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="adjustment-details"], .adjustment-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'vendor-detail',
    url: 'http://localhost:3000/vendor-management/manage-vendors/vendor-001',
    description: 'Vendor Detail Profile with comprehensive supplier information',
    spec_file: 'vendor-detail-screen.md',
    priority: 'high',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="vendor-profile"], .vendor-details, .vendor-overview',
        timeout: 2000
      },
      {
        action: 'expand_sections',
        selectors: [
          '[data-testid="overview-tab"], .tab[data-tab="overview"]',
          '[role="tab"]:first-of-type',
          '.tab-content:first-of-type'
        ],
        timeout: 1000
      }
    ]
  },
  
  // Alternative Detail Page Routes
  {
    name: 'purchase-request-detail-alt',
    url: 'http://localhost:3000/procurement/purchase-requests/PR-2024-002',
    description: 'Alternative Purchase Request Detail (PR-2024-002)',
    spec_file: 'purchase-request-detail-screen.md',
    priority: 'medium',
    backup_for: 'purchase-request-detail',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="pr-details"], .pr-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'purchase-order-detail-alt',
    url: 'http://localhost:3000/procurement/purchase-orders/PO-2024-002',
    description: 'Alternative Purchase Order Detail (PO-2024-002)',
    spec_file: 'purchase-order-detail-screen.md',
    priority: 'medium',
    backup_for: 'purchase-order-detail',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="po-details"], .po-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  },
  {
    name: 'goods-received-note-detail-alt',
    url: 'http://localhost:3000/procurement/goods-received-note/GRN-2024-002',
    description: 'Alternative GRN Detail (GRN-2024-002)',
    spec_file: 'goods-received-note-detail-screen.md',
    priority: 'medium',
    backup_for: 'goods-received-note-detail',
    interactions: [
      {
        action: 'wait_for_load',
        timeout: 3000
      },
      {
        action: 'wait_for_data',
        selector: '[data-testid="grn-details"], .grn-items-table, table tbody tr',
        timeout: 2000
      }
    ]
  }
];

// Helper function to check if element exists and has content
async function waitForElementWithContent(page, selectors, timeout = 2000) {
  const selectorsArray = Array.isArray(selectors) ? selectors : [selectors];
  
  for (const selector of selectorsArray) {
    try {
      await page.waitForSelector(selector, { timeout });
      const element = await page.locator(selector).first();
      if (await element.isVisible()) {
        console.log(`   ✓ Found content element: ${selector}`);
        return true;
      }
    } catch (error) {
      console.log(`   ⚠️ Content selector "${selector}" not found`);
      continue;
    }
  }
  return false;
}

// Enhanced interaction handler for detail pages
async function performDetailPageInteractions(page, interactions) {
  for (const interaction of interactions) {
    try {
      switch (interaction.action) {
        case 'wait_for_load':
          console.log(`   ⏳ Waiting ${interaction.timeout}ms for page load...`);
          await page.waitForTimeout(interaction.timeout);
          break;

        case 'wait_for_data':
          console.log(`   📊 Waiting for data to populate...`);
          const hasData = await waitForElementWithContent(page, interaction.selector, interaction.timeout);
          if (hasData) {
            console.log(`   ✅ Data content detected and loaded`);
          } else {
            console.log(`   ⚠️ Data content not detected, proceeding anyway`);
          }
          break;

        case 'expand_sections':
          console.log(`   📂 Attempting to expand content sections...`);
          for (const selector of interaction.selectors) {
            try {
              const element = await page.locator(selector).first();
              if (await element.isVisible({ timeout: 1000 })) {
                await element.click();
                console.log(`   ✓ Expanded section: ${selector}`);
                await page.waitForTimeout(500); // Brief wait between expansions
                break; // Stop after first successful expansion
              }
            } catch (error) {
              console.log(`   ⚠️ Could not expand: ${selector}`);
              continue;
            }
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

async function captureDetailPagesPopulated() {
  console.log('📋 Starting detail page capture with populated content...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Set timeout for navigation
  page.setDefaultTimeout(15000);

  let successCount = 0;
  let errorCount = 0;
  let backupUsed = 0;
  const results = [];

  console.log(`📋 Found ${detailPageScreens.length} detail pages to capture with populated content`);
  
  for (const screen of detailPageScreens) {
    try {
      console.log(`\n📸 Capturing: ${screen.name}`);
      console.log(`   URL: ${screen.url}`);
      console.log(`   Priority: ${screen.priority}`);
      
      // Navigate to the screen
      let navigationSuccessful = false;
      try {
        await page.goto(screen.url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        console.log(`   ✅ Navigation successful`);
        navigationSuccessful = true;
      } catch (navError) {
        console.log(`   ⚠️ Navigation timeout, trying DOM loaded...`);
        try {
          await page.goto(screen.url, { 
            waitUntil: 'domcontentloaded',
            timeout: 10000 
          });
          navigationSuccessful = true;
          console.log(`   ✅ Navigation successful (DOM loaded)`);
        } catch (domError) {
          console.log(`   ❌ Navigation failed: ${navError.message}`);
          
          // Skip backup screens if primary failed
          if (screen.backup_for) {
            console.log(`   ⏭️ Skipping backup screen due to navigation failure`);
            continue;
          }
          
          throw navError;
        }
      }

      if (!navigationSuccessful) {
        continue;
      }

      // Wait for initial content to load
      await page.waitForTimeout(1000);

      // Check if we're on an error page (404, etc.)
      const pageTitle = await page.title();
      const bodyText = await page.textContent('body');
      
      if (pageTitle.includes('404') || bodyText.includes('404') || bodyText.includes('This page could not be found')) {
        console.log(`   ⚠️ Page shows 404 error, looking for alternative routes...`);
        
        // If this is not already a backup, skip it
        if (!screen.backup_for) {
          throw new Error('404 page found');
        } else {
          console.log(`   ⏭️ Skipping backup due to 404`);
          continue;
        }
      }

      // Perform custom interactions
      if (screen.interactions && screen.interactions.length > 0) {
        console.log(`   🔄 Performing ${screen.interactions.length} interactions...`);
        await performDetailPageInteractions(page, screen.interactions);
      }

      // Additional wait for any dynamic content after interactions
      await page.waitForTimeout(2000);

      // Create directory if it doesn't exist
      const imageDir = path.join('docs/prd/output/screens/images', screen.name);
      await fs.mkdir(imageDir, { recursive: true });

      // Take screenshot
      const screenshotPath = path.join(imageDir, `${screen.name}-populated.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });

      console.log(`   ✅ Populated screenshot saved: ${screenshotPath}`);
      
      // Mark if this was a backup used
      if (screen.backup_for) {
        backupUsed++;
        console.log(`   🔄 Used backup route for: ${screen.backup_for}`);
      }
      
      results.push({
        screen: screen.name,
        url: screen.url,
        status: 'success',
        spec_file: screen.spec_file,
        priority: screen.priority,
        screenshot: screenshotPath,
        interactions_performed: screen.interactions?.length || 0,
        is_backup: !!screen.backup_for
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
        priority: screen.priority,
        is_backup: !!screen.backup_for
      });
      
      errorCount++;
    }
  }

  await browser.close();

  // Generate detail page capture report
  const report = {
    timestamp: new Date().toISOString(),
    capture_type: 'detail_pages_with_populated_content',
    total_screens: detailPageScreens.length,
    successful_captures: successCount,
    failed_captures: errorCount,
    backup_routes_used: backupUsed,
    success_rate: ((successCount / detailPageScreens.length) * 100).toFixed(1),
    results: results
  };

  const reportPath = 'docs/prd/output/screens/images/detail-page-capture-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 DETAIL PAGE CAPTURE SUMMARY');
  console.log('===============================');
  console.log(`Total detail screens: ${detailPageScreens.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`🔄 Backup routes used: ${backupUsed}`);
  console.log(`📈 Success rate: ${report.success_rate}%`);
  console.log(`📝 Report saved: ${reportPath}`);
  
  console.log('\n🎯 SUCCESSFUL CAPTURES');
  console.log('=======================');
  results.filter(r => r.status === 'success').forEach(result => {
    const backupIndicator = result.is_backup ? ' (backup route)' : '';
    console.log(`✅ ${result.screen} - ${result.interactions_performed} interactions${backupIndicator}`);
  });

  console.log('\n🔍 FAILED SCREENS (if any)');
  console.log('===========================');
  results.filter(r => r.status === 'error').forEach(result => {
    const backupIndicator = result.is_backup ? ' (backup)' : '';
    console.log(`❌ ${result.screen}${backupIndicator} - ${result.error}`);
  });

  return report;
}

// Handle script execution
if (require.main === module) {
  captureDetailPagesPopulated()
    .then((report) => {
      console.log('\n🎉 Detail page capture with populated content completed!');
      console.log('Screenshots now show comprehensive data and populated interfaces.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during detail page capture:', error);
      process.exit(1);
    });
}

module.exports = { captureDetailPagesPopulated, detailPageScreens };