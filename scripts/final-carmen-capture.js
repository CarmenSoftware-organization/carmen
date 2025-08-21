const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Final Carmen ERP screenshot capture for remaining key screens
async function captureRemainingCarmenScreenshots() {
  console.log('🚀 Starting final Carmen ERP screenshot capture...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'docs', 'prd', 'output', 'screens', 'images');
  await fs.mkdir(outputDir, { recursive: true });

  // Additional Carmen ERP screens to complete coverage
  const additionalScreens = [
    {
      name: 'purchase-orders',
      url: 'http://localhost:3000/procurement/purchase-orders',
      description: 'Purchase orders list with fractional sales'
    },
    {
      name: 'goods-received-note',
      url: 'http://localhost:3000/procurement/goods-received-note',
      description: 'Goods received note interface'
    },
    {
      name: 'inventory-adjustments',
      url: 'http://localhost:3000/inventory-management/inventory-adjustments',
      description: 'Inventory adjustments with fractional support'
    },
    {
      name: 'store-requisitions',
      url: 'http://localhost:3000/store-operations/store-requisitions',
      description: 'Store requisitions with fractional quantities'
    },
    {
      name: 'pos-mapping',
      url: 'http://localhost:3000/system-administration/system-integrations/pos/mapping/recipes',
      description: 'POS recipe mapping with fractional sales variants'
    },
    {
      name: 'vendor-detail',
      url: 'http://localhost:3000/vendor-management/manage-vendors/VENDOR-001',
      description: 'Vendor detail with pricing management'
    }
  ];

  let captured = 0;
  let failed = 0;

  for (const screen of additionalScreens) {
    try {
      console.log(`📸 Capturing: ${screen.name} (${screen.url})`);
      
      // Navigate to the page
      await page.goto(screen.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait a bit more for dynamic content
      await page.waitForTimeout(5000);

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
      
      // Try to capture what we can see anyway
      try {
        const errorScreenDir = path.join(outputDir, screen.name);
        await fs.mkdir(errorScreenDir, { recursive: true });
        const errorScreenshotPath = path.join(errorScreenDir, `${screen.name}-error.png`);
        await page.screenshot({
          path: errorScreenshotPath,
          fullPage: true,
          animations: 'disabled'
        });
        console.log(`⚠️  Captured error state: ${errorScreenshotPath}`);
      } catch (e) {
        // Silent fail for error screenshot
      }
    }
  }

  await browser.close();
  
  console.log(`\n🎯 Final Carmen ERP screenshot capture completed:`);
  console.log(`   ✅ ${captured} additional screenshots captured successfully`);
  console.log(`   ❌ ${failed} screenshots failed`);
  console.log(`   📁 Screenshots saved to: ${outputDir}`);
  
  return { captured, failed };
}

// Run if called directly
if (require.main === module) {
  captureRemainingCarmenScreenshots().catch(console.error);
}

module.exports = { captureRemainingCarmenScreenshots };