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
    await page.waitForSelector('[data-testid="sidebar"]', { state: 'visible' });

    // Additional wait for CSS to fully apply
    await page.waitForTimeout(2000);

    // Wait for any loading states to complete
    await page.waitForFunction(() => {
      const loadingElements = document.querySelectorAll('[data-testid*="loading"], .loading, .skeleton');
      return loadingElements.length === 0;
    }, { timeout: 10000 }).catch(() => console.log('Loading elements still present, continuing...'));

    const screenshotPath = path.join('/Users/peak/Documents/GitHub/carmen/docs/documents/pm', filename);

    console.log(`Taking screenshot: ${description}`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log(`Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
  }

  try {
    // 1. Product Management Dashboard
    await capturePageScreenshot(
      'http://localhost:3003/product-management',
      'product-management-dashboard-fixed.png',
      'Product Management Dashboard with proper styling'
    );

    // 2. Products List
    await capturePageScreenshot(
      'http://localhost:3003/product-management/products',
      'product-management-products-list-fixed.png',
      'Products List page with proper styling'
    );

    // 3. Categories Tree
    await capturePageScreenshot(
      'http://localhost:3003/product-management/categories',
      'product-management-categories-tree-fixed.png',
      'Categories Tree page with proper styling'
    );

    // 4. Units Management
    await capturePageScreenshot(
      'http://localhost:3003/product-management/units',
      'product-management-units-management-fixed.png',
      'Units Management page with proper styling'
    );

    console.log('All Product Management screenshots captured successfully!');

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
})();