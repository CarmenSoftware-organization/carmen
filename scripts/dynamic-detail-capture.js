const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Dynamic detail page capture - navigate through list screens to find working detail links
const listToDetailMappings = [
  {
    list_name: 'purchase-requests',
    list_url: 'http://localhost:3000/procurement/purchase-requests',
    detail_name: 'purchase-request-detail',
    detail_spec_file: 'purchase-request-detail-screen.md',
    link_selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="pr-number-link"]:first-of-type',
    fallback_selectors: [
      'table tbody tr:first-child',
      '[role="row"]:not([role="columnheader"]):first-of-type'
    ],
    priority: 'high',
    description: 'Purchase Request Detail with populated data from first PR'
  },
  {
    list_name: 'purchase-orders',
    list_url: 'http://localhost:3000/procurement/purchase-orders',
    detail_name: 'purchase-order-detail',
    detail_spec_file: 'purchase-order-detail-screen.md',
    link_selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="po-number-link"]:first-of-type',
    fallback_selectors: [
      'table tbody tr:first-child',
      '[role="row"]:not([role="columnheader"]):first-of-type'
    ],
    priority: 'high',
    description: 'Purchase Order Detail with populated data from first PO'
  },
  {
    list_name: 'goods-received-note',
    list_url: 'http://localhost:3000/procurement/goods-received-note',
    detail_name: 'goods-received-note-detail',
    detail_spec_file: 'goods-received-note-detail-screen.md',
    link_selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="grn-number-link"]:first-of-type',
    fallback_selectors: [
      'table tbody tr:first-child',
      '[role="row"]:not([role="columnheader"]):first-of-type'
    ],
    priority: 'high',
    description: 'Goods Received Note Detail with populated delivery data'
  },
  {
    list_name: 'inventory-adjustments',
    list_url: 'http://localhost:3000/inventory-management/inventory-adjustments',
    detail_name: 'inventory-adjustment-detail',
    detail_spec_file: 'inventory-adjustment-detail-screen.md',
    link_selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="adjustment-number-link"]:first-of-type',
    fallback_selectors: [
      'table tbody tr:first-child',
      '[role="row"]:not([role="columnheader"]):first-of-type'
    ],
    priority: 'high',
    description: 'Inventory Adjustment Detail with populated variance data'
  },
  {
    list_name: 'vendor-management',
    list_url: 'http://localhost:3000/vendor-management/manage-vendors',
    detail_name: 'vendor-detail',
    detail_spec_file: 'vendor-detail-screen.md',
    link_selector: 'table tbody tr:first-child td:first-child a, table tbody tr:first-child td:nth-child(2) a, [data-testid="vendor-name-link"]:first-of-type',
    fallback_selectors: [
      'table tbody tr:first-child',
      '[role="row"]:not([role="columnheader"]):first-of-type'
    ],
    priority: 'high',
    description: 'Vendor Detail Profile with comprehensive supplier information'
  }
];

// Helper function to try multiple selectors and click
async function tryClickDetailLink(page, selectors) {
  const allSelectors = Array.isArray(selectors) ? selectors : [selectors];
  
  for (const selector of allSelectors) {
    try {
      const element = await page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        console.log(`   ✓ Found clickable element: ${selector}`);
        await element.click();
        return true;
      }
    } catch (error) {
      console.log(`   ⚠️ Selector "${selector}" not found or not clickable`);
      continue;
    }
  }
  return false;
}

async function captureDynamicDetailPages() {
  console.log('🔗 Starting dynamic detail page capture through list navigation...');
  
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
  const results = [];

  console.log(`📋 Found ${listToDetailMappings.length} list → detail page mappings to process`);
  
  for (const mapping of listToDetailMappings) {
    try {
      console.log(`\n📸 Processing: ${mapping.list_name} → ${mapping.detail_name}`);
      console.log(`   List URL: ${mapping.list_url}`);
      console.log(`   Priority: ${mapping.priority}`);
      
      // Step 1: Navigate to list page
      try {
        await page.goto(mapping.list_url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        console.log(`   ✅ List page navigation successful`);
      } catch (navError) {
        console.log(`   ⚠️ List navigation timeout, trying DOM loaded...`);
        await page.goto(mapping.list_url, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
      }

      // Wait for list page to load
      await page.waitForTimeout(3000);

      // Step 2: Try to click the first detail link
      console.log(`   🎯 Looking for first record detail link...`);
      
      const allSelectors = [mapping.link_selector, ...(mapping.fallback_selectors || [])];
      const detailLinkClicked = await tryClickDetailLink(page, allSelectors);
      
      if (!detailLinkClicked) {
        throw new Error('Could not find or click detail link from list page');
      }

      console.log(`   ✅ Successfully navigated to detail page`);
      
      // Step 3: Wait for detail page to load
      await page.waitForTimeout(3000);
      
      // Step 4: Check if we successfully landed on a detail page
      const currentUrl = page.url();
      const pageTitle = await page.title();
      const bodyText = await page.textContent('body');
      
      if (bodyText.includes('404') || bodyText.includes('This page could not be found')) {
        throw new Error('Detail page shows 404 error');
      }
      
      console.log(`   ✅ Detail page loaded successfully: ${currentUrl}`);
      
      // Step 5: Wait for any dynamic content to load
      await page.waitForTimeout(2000);

      // Step 6: Take screenshot
      const imageDir = path.join('docs/prd/output/screens/images', mapping.detail_name);
      await fs.mkdir(imageDir, { recursive: true });

      const screenshotPath = path.join(imageDir, `${mapping.detail_name}-populated.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });

      console.log(`   ✅ Detail page screenshot saved: ${screenshotPath}`);
      
      results.push({
        list_screen: mapping.list_name,
        detail_screen: mapping.detail_name,
        list_url: mapping.list_url,
        detail_url: currentUrl,
        status: 'success',
        spec_file: mapping.detail_spec_file,
        priority: mapping.priority,
        screenshot: screenshotPath,
        description: mapping.description
      });
      
      successCount++;
      
    } catch (error) {
      console.log(`   ❌ Error with ${mapping.list_name} → ${mapping.detail_name}: ${error.message}`);
      
      // Still try to take an error screenshot
      try {
        const errorDir = path.join('docs/prd/output/screens/images', mapping.detail_name);
        await fs.mkdir(errorDir, { recursive: true });
        const errorPath = path.join(errorDir, `${mapping.detail_name}-error.png`);
        await page.screenshot({ 
          path: errorPath, 
          fullPage: false 
        });
        console.log(`   📄 Error screenshot saved: ${errorPath}`);
      } catch (errorScreenshotError) {
        console.log(`   ⚠️ Could not capture error screenshot: ${errorScreenshotError.message}`);
      }
      
      results.push({
        list_screen: mapping.list_name,
        detail_screen: mapping.detail_name,
        list_url: mapping.list_url,
        detail_url: page.url(),
        status: 'error',
        error: error.message,
        spec_file: mapping.detail_spec_file,
        priority: mapping.priority
      });
      
      errorCount++;
    }
  }

  await browser.close();

  // Generate dynamic detail page capture report
  const report = {
    timestamp: new Date().toISOString(),
    capture_type: 'dynamic_detail_pages_via_list_navigation',
    total_mappings: listToDetailMappings.length,
    successful_captures: successCount,
    failed_captures: errorCount,
    success_rate: ((successCount / listToDetailMappings.length) * 100).toFixed(1),
    results: results
  };

  const reportPath = 'docs/prd/output/screens/images/dynamic-detail-capture-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 DYNAMIC DETAIL CAPTURE SUMMARY');
  console.log('==================================');
  console.log(`Total list → detail mappings: ${listToDetailMappings.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success rate: ${report.success_rate}%`);
  console.log(`📝 Report saved: ${reportPath}`);
  
  console.log('\n🎯 SUCCESSFUL DETAIL CAPTURES');
  console.log('==============================');
  results.filter(r => r.status === 'success').forEach(result => {
    console.log(`✅ ${result.detail_screen}`);
    console.log(`   📍 Detail URL: ${result.detail_url}`);
    console.log(`   📁 Screenshot: ${result.screenshot}`);
  });

  console.log('\n🔍 FAILED CAPTURES (if any)');
  console.log('============================');
  results.filter(r => r.status === 'error').forEach(result => {
    console.log(`❌ ${result.list_screen} → ${result.detail_screen}`);
    console.log(`   🚫 Error: ${result.error}`);
  });

  return report;
}

// Handle script execution
if (require.main === module) {
  captureDynamicDetailPages()
    .then((report) => {
      console.log('\n🎉 Dynamic detail page capture completed!');
      console.log('Screenshots captured by navigating through list pages to find working detail URLs.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during dynamic detail page capture:', error);
      process.exit(1);
    });
}

module.exports = { captureDynamicDetailPages, listToDetailMappings };