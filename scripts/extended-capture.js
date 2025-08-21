const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Extended screenshot capture for Carmen ERP additional screens
async function captureAdditionalScreenshots() {
  console.log('🚀 Starting extended screenshot capture...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'docs', 'prd', 'output', 'screens', 'images');
  await fs.mkdir(outputDir, { recursive: true });

  // Additional key screens to capture
  const additionalScreens = [
    {
      name: 'purchase-orders',
      url: 'http://localhost:3000/procurement/purchase-orders',
      description: 'Purchase orders list view with fractional sales'
    },
    {
      name: 'goods-received-note',
      url: 'http://localhost:3000/procurement/goods-received-note',
      description: 'Goods received note list view'
    },
    {
      name: 'vendor-detail',
      url: 'http://localhost:3000/vendor-management/manage-vendors/VENDOR-001',
      description: 'Vendor detail view with pricing management'
    },
    {
      name: 'store-requisitions',
      url: 'http://localhost:3000/store-operations/store-requisitions',
      description: 'Store requisitions with fractional quantities'
    },
    {
      name: 'inventory-adjustments',
      url: 'http://localhost:3000/inventory-management/inventory-adjustments',
      description: 'Inventory adjustments with fractional support'
    },
    {
      name: 'pos-mapping',
      url: 'http://localhost:3000/system-administration/system-integrations/pos/mapping/recipes',
      description: 'POS recipe mapping with fractional sales variants'
    },
    {
      name: 'user-manuals',
      url: 'http://localhost:3000/help-support/user-manuals',
      description: 'User manuals interface'
    },
    {
      name: 'faqs',
      url: 'http://localhost:3000/help-support/faqs',
      description: 'FAQ interface'
    }
  ];

  let captured = 0;
  let failed = 0;

  for (const screen of additionalScreens) {
    try {
      console.log(`📸 Capturing: ${screen.name}`);
      
      // Navigate to the page
      await page.goto(screen.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait a bit more for dynamic content
      await page.waitForTimeout(3000);

      // Hide scrollbars and loading indicators
      await page.addStyleTag({
        content: `
          * { scrollbar-width: none !important; }
          *::-webkit-scrollbar { display: none !important; }
          .loading-spinner, .loading, [data-loading] { display: none !important; }
        `
      });

      // Create screen directory
      const screenDir = path.join(outputDir, screen.name);
      await fs.mkdir(screenDir, { recursive: true });

      // Capture screenshot
      const screenshotPath = path.join(screenDir, `${screen.name}-default.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        animations: 'disabled'
      });

      console.log(`✅ Captured: ${screenshotPath}`);
      captured++;

    } catch (error) {
      console.error(`❌ Failed to capture ${screen.name}: ${error.message}`);
      failed++;
    }
  }

  await browser.close();
  
  console.log(`\n🎯 Extended screenshot capture completed:`);
  console.log(`   ✅ ${captured} additional screenshots captured successfully`);
  console.log(`   ❌ ${failed} screenshots failed`);
  console.log(`   📁 Screenshots saved to: ${outputDir}`);
  
  return { captured, failed };
}

// Run if called directly
if (require.main === module) {
  captureAdditionalScreenshots().catch(console.error);
}

module.exports = { captureAdditionalScreenshots };