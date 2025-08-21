const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Comprehensive screen capture based on screen specifications
const screenSpecifications = [
  // Dashboard and Overview Screens
  {
    name: 'main-dashboard',
    url: 'http://localhost:3000/dashboard',
    description: 'Main Dashboard - Executive overview with metrics and charts',
    spec_file: 'main-dashboard-screen.md',
    priority: 'high'
  },
  {
    name: 'operational-dashboard-fractional',
    url: 'http://localhost:3000/operational-planning/dashboard',
    description: 'Operational Dashboard with fractional sales analytics',
    spec_file: 'operational-dashboard-fractional-screen.md',
    priority: 'high'
  },

  // Procurement Module Screens
  {
    name: 'purchase-requests-list',
    url: 'http://localhost:3000/procurement/purchase-requests',
    description: 'Purchase Requests List - Main PR management interface',
    spec_file: 'purchase-requests-list-screen.md',
    priority: 'high'
  },
  {
    name: 'purchase-request-detail',
    url: 'http://localhost:3000/procurement/purchase-requests/PR-2024-001',
    description: 'Purchase Request Detail - Individual PR management',
    spec_file: 'purchase-request-detail-screen.md',
    priority: 'high'
  },
  {
    name: 'purchase-orders-list',
    url: 'http://localhost:3000/procurement/purchase-orders',
    description: 'Purchase Orders List - PO management interface',
    spec_file: 'purchase-orders-list-screen.md',
    priority: 'high'
  },
  {
    name: 'purchase-order-detail',
    url: 'http://localhost:3000/procurement/purchase-orders/PO-2024-001',
    description: 'Purchase Order Detail - Individual PO management',
    spec_file: 'purchase-order-detail-screen.md',
    priority: 'high'
  },
  {
    name: 'goods-received-note-list',
    url: 'http://localhost:3000/procurement/goods-received-note',
    description: 'Goods Received Notes List - GRN tracking',
    spec_file: 'goods-received-note-list-screen.md',
    priority: 'high'
  },
  {
    name: 'goods-received-note-detail',
    url: 'http://localhost:3000/procurement/goods-received-note/GRN-2024-001',
    description: 'Goods Received Note Detail - Individual GRN management',
    spec_file: 'goods-received-note-detail-screen.md',
    priority: 'high'
  },

  // Vendor Management Screens
  {
    name: 'vendor-management-overview',
    url: 'http://localhost:3000/vendor-management',
    description: 'Vendor Management Overview - Main vendor module landing',
    spec_file: 'vendor-management-overview-screen.md',
    priority: 'medium'
  },
  {
    name: 'vendor-list',
    url: 'http://localhost:3000/vendor-management/manage-vendors',
    description: 'Vendor List - Vendor directory and search',
    spec_file: 'vendor-list-screen.md',
    priority: 'high'
  },
  {
    name: 'vendor-detail',
    url: 'http://localhost:3000/vendor-management/manage-vendors/vendor-001',
    description: 'Vendor Detail - Individual vendor profile',
    spec_file: 'vendor-detail-screen.md',
    priority: 'high'
  },

  // Inventory Management Screens
  {
    name: 'inventory-management-overview',
    url: 'http://localhost:3000/inventory-management',
    description: 'Inventory Management Overview - Main inventory module landing',
    spec_file: 'inventory-management-overview-screen.md',
    priority: 'medium'
  },
  {
    name: 'inventory-adjustments-list',
    url: 'http://localhost:3000/inventory-management/inventory-adjustments',
    description: 'Inventory Adjustments List - Stock adjustment tracking',
    spec_file: 'inventory-adjustments-list-screen.md',
    priority: 'high'
  },
  {
    name: 'inventory-adjustment-detail',
    url: 'http://localhost:3000/inventory-management/inventory-adjustments/ADJ-2024-001',
    description: 'Inventory Adjustment Detail - Individual adjustment management',
    spec_file: 'inventory-adjustment-detail-screen.md',
    priority: 'high'
  },
  {
    name: 'stock-balance-report',
    url: 'http://localhost:3000/inventory-management/stock-balance-report',
    description: 'Stock Balance Report - Current inventory levels',
    spec_file: 'stock-balance-report-screen.md',
    priority: 'medium'
  },

  // Store Operations Screens
  {
    name: 'store-operations-overview',
    url: 'http://localhost:3000/store-operations',
    description: 'Store Operations Overview - Main store operations landing',
    spec_file: 'store-operations-overview-screen.md',
    priority: 'medium'
  },
  {
    name: 'store-requisitions-list',
    url: 'http://localhost:3000/store-operations/store-requisitions',
    description: 'Store Requisitions List - Inter-store transfer requests',
    spec_file: 'store-requisitions-list-screen.md',
    priority: 'high'
  },

  // POS Integration and Fractional Sales Screens
  {
    name: 'pos-integration-fractional',
    url: 'http://localhost:3000/system-administration/system-integrations/pos',
    description: 'POS Integration with Fractional Sales - System integration dashboard',
    spec_file: 'pos-integration-fractional-screen.md',
    priority: 'high'
  },
  {
    name: 'pos-recipe-mapping',
    url: 'http://localhost:3000/system-administration/system-integrations/pos/mapping/recipes',
    description: 'POS Recipe Mapping - Fractional sales configuration',
    spec_file: 'pos-recipe-mapping-screen.md',
    priority: 'high'
  },

  // Analytics and Reports
  {
    name: 'consumption-analytics-fractional',
    url: 'http://localhost:3000/reporting-analytics/consumption-analytics',
    description: 'Consumption Analytics with Fractional Sales - Usage reporting',
    spec_file: 'consumption-analytics-fractional-screen.md',
    priority: 'high'
  },

  // Workflow and Approval Screens
  {
    name: 'my-approvals',
    url: 'http://localhost:3000/my-approvals',
    description: 'My Approvals - Personal workflow management',
    spec_file: 'my-approvals-screen.md',
    priority: 'medium'
  }
];

async function captureScreenshots() {
  console.log('🚀 Starting comprehensive screen capture based on specifications...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Set timeout for navigation
  page.setDefaultTimeout(10000);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  console.log(`📋 Found ${screenSpecifications.length} screens to capture`);
  
  for (const screen of screenSpecifications) {
    try {
      console.log(`\n📸 Capturing: ${screen.name}`);
      console.log(`   URL: ${screen.url}`);
      console.log(`   Priority: ${screen.priority}`);
      
      // Navigate to the screen
      try {
        await page.goto(screen.url, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
      } catch (navError) {
        console.log(`   ⚠️ Navigation timeout, proceeding with screenshot...`);
        await page.goto(screen.url, { 
          waitUntil: 'domcontentloaded',
          timeout: 5000 
        });
      }

      // Wait for page to stabilize
      await page.waitForTimeout(1500);

      // Create directory if it doesn't exist
      const imageDir = path.join('docs/prd/output/screens/images', screen.name);
      await fs.mkdir(imageDir, { recursive: true });

      // Take screenshot
      const screenshotPath = path.join(imageDir, `${screen.name}-default.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });

      console.log(`   ✅ Screenshot saved: ${screenshotPath}`);
      
      results.push({
        screen: screen.name,
        url: screen.url,
        status: 'success',
        spec_file: screen.spec_file,
        priority: screen.priority,
        screenshot: screenshotPath
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

  // Generate capture report
  const report = {
    timestamp: new Date().toISOString(),
    total_screens: screenSpecifications.length,
    successful_captures: successCount,
    failed_captures: errorCount,
    success_rate: ((successCount / screenSpecifications.length) * 100).toFixed(1),
    results: results
  };

  const reportPath = 'docs/prd/output/screens/images/capture-report.json';
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log('\n📊 CAPTURE SUMMARY');
  console.log('==================');
  console.log(`Total screens: ${screenSpecifications.length}`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success rate: ${report.success_rate}%`);
  console.log(`📝 Report saved: ${reportPath}`);
  
  // Show priority breakdown
  const priorities = results.reduce((acc, result) => {
    if (!acc[result.priority]) acc[result.priority] = { success: 0, total: 0 };
    acc[result.priority].total++;
    if (result.status === 'success') acc[result.priority].success++;
    return acc;
  }, {});
  
  console.log('\n🎯 PRIORITY BREAKDOWN');
  console.log('=====================');
  Object.entries(priorities).forEach(([priority, stats]) => {
    const rate = ((stats.success / stats.total) * 100).toFixed(1);
    console.log(`${priority.toUpperCase()}: ${stats.success}/${stats.total} (${rate}%)`);
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
  captureScreenshots()
    .then((report) => {
      console.log('\n🎉 Screen capture completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during screen capture:', error);
      process.exit(1);
    });
}

module.exports = { captureScreenshots, screenSpecifications };