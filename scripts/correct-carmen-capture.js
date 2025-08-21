const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

// Correct Carmen ERP screenshot capture
async function captureCorrectCarmenScreenshots() {
  console.log('🚀 Starting CORRECT Carmen ERP screenshot capture...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'docs', 'prd', 'output', 'screens', 'images');
  await fs.mkdir(outputDir, { recursive: true });

  // Carmen ERP screens - starting from the landing page and main dashboard
  const carmenScreens = [
    {
      name: 'landing-page',
      url: 'http://localhost:3000/',
      description: 'Carmen ERP landing page'
    },
    {
      name: 'dashboard',
      url: 'http://localhost:3000/dashboard',
      description: 'Main Carmen ERP dashboard'
    },
    {
      name: 'purchase-requests',
      url: 'http://localhost:3000/procurement/purchase-requests',
      description: 'Purchase requests list view'
    },
    {
      name: 'purchase-request-detail',
      url: 'http://localhost:3000/procurement/purchase-requests/PR-2024-001',
      description: 'Purchase request detail view with fractional sales'
    },
    {
      name: 'pos-integration',
      url: 'http://localhost:3000/system-administration/system-integrations/pos',
      description: 'POS integration dashboard with fractional sales support'
    },
    {
      name: 'vendor-management',
      url: 'http://localhost:3000/vendor-management/manage-vendors',
      description: 'Vendor management interface'
    },
    {
      name: 'inventory-overview',
      url: 'http://localhost:3000/inventory-management/stock-overview',
      description: 'Inventory overview with fractional stock management'
    },
    {
      name: 'help-support',
      url: 'http://localhost:3000/help-support',
      description: 'Help and support main interface'
    }
  ];

  let captured = 0;
  let failed = 0;

  for (const screen of carmenScreens) {
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
  
  console.log(`\n🎯 CORRECT Carmen ERP screenshot capture completed:`);
  console.log(`   ✅ ${captured} screenshots captured successfully`);
  console.log(`   ❌ ${failed} screenshots failed`);
  console.log(`   📁 Screenshots saved to: ${outputDir}`);
  
  return { captured, failed };
}

// Run if called directly
if (require.main === module) {
  captureCorrectCarmenScreenshots().catch(console.error);
}

module.exports = { captureCorrectCarmenScreenshots };