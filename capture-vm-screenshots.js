const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Function to wait for proper styling and take screenshot
  async function capturePageScreenshot(url, filename, description) {
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Wait for the main content to be visible and styled
    await page.waitForSelector('main', { state: 'visible' });

    // Wait for sidebar to be properly loaded
    await page.waitForSelector('[data-testid="sidebar"]', { state: 'visible' }).catch(() => {
      console.log('Sidebar not found, continuing...');
    });

    // Additional wait for CSS to fully apply
    await page.waitForTimeout(2000);

    // Wait for any loading states to complete
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .skeleton');
      return loadingElements.length === 0;
    }, { timeout: 10000 }).catch(() => console.log('Loading elements still present, continuing...'));

    const screenshotPath = path.join('/Users/peak/Documents/GitHub/carmen/docs/documents/vm/screenshots', filename);

    console.log(`Taking screenshot: ${description}`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  // Function to capture dropdown/interaction screenshots
  async function captureInteractionScreenshot(selector, filename, description, clickFirst = false) {
    console.log(`Capturing interaction: ${description}`);

    if (clickFirst) {
      await page.click(selector);
      await page.waitForTimeout(500);
    }

    const screenshotPath = path.join('/Users/peak/Documents/GitHub/carmen/docs/documents/vm/screenshots', filename);

    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  try {
    // 1. Vendor Management Landing Page
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management',
      'vm-landing.png',
      'Vendor Management Landing Page'
    );

    // 2. Vendor List Page
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/manage-vendors',
      'vm-vendor-list.png',
      'Vendor List Page'
    );

    // 3. Vendor List with Search
    await page.goto('http://localhost:3000/vendor-management/manage-vendors', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const searchInput = await page.locator('input[placeholder*="Search"], input[type="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('supplier');
      await page.waitForTimeout(1000);
      await captureInteractionScreenshot('', 'vm-vendor-list-search.png', 'Vendor List with Search Active');
    }

    // 4. New Vendor Form
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/manage-vendors/new',
      'vm-new-vendor-form.png',
      'New Vendor Form'
    );

    // 5. Templates List (Prototype)
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/templates',
      'vm-templates-list.png',
      'Pricelist Templates List'
    );

    // 6. Campaigns List (Prototype)
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/campaigns',
      'vm-campaigns-list.png',
      'RFP Campaigns List'
    );

    // 7. Pricelists List (Prototype)
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/pricelists',
      'vm-pricelists-list.png',
      'Pricelists Management'
    );

    // 8. Vendor Portal Demo
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/vendor-portal/sample',
      'vm-vendor-portal.png',
      'Vendor Self-Service Portal Demo'
    );

    // 9. Alternative Vendor List Path
    await capturePageScreenshot(
      'http://localhost:3000/vendor-management/vendors',
      'vm-vendors-alt-list.png',
      'Vendor List (Alternative Path)'
    );

    console.log('\n✅ All Vendor Management screenshots captured successfully!');
    console.log('Screenshots saved to: docs/documents/vm/screenshots/');

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
})();
