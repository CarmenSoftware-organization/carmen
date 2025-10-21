const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();

  // Set a reasonable timeout and wait for network idle
  page.setDefaultTimeout(30000);

  const baseUrl = 'http://localhost:3004';

  const pages = [
    {
      url: `${baseUrl}/product-management`,
      filename: 'product-management-dashboard.png',
      name: 'Product Management Dashboard'
    },
    {
      url: `${baseUrl}/product-management/products`,
      filename: 'products-list-table-view.png',
      name: 'Products List (Table View)'
    },
    {
      url: `${baseUrl}/product-management/categories`,
      filename: 'categories-management.png',
      name: 'Categories Management'
    },
    {
      url: `${baseUrl}/product-management/units`,
      filename: 'units-management.png',
      name: 'Units Management'
    },
    {
      url: `${baseUrl}/product-management/products/PRD001`,
      filename: 'product-detail-page.png',
      name: 'Product Detail Page'
    }
  ];

  for (const pageInfo of pages) {
    try {
      console.log(`Navigating to ${pageInfo.name}...`);
      await page.goto(pageInfo.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Wait a bit more for any dynamic content to load
      await page.waitForTimeout(2000);

      // Take full page screenshot
      const screenshotPath = path.join(screenshotsDir, pageInfo.filename);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
        type: 'png'
      });

      console.log(`✓ Captured: ${pageInfo.filename}`);
    } catch (error) {
      console.error(`✗ Failed to capture ${pageInfo.name}:`, error.message);
    }
  }

  // Special handling for card view - navigate to products page and toggle view
  try {
    console.log('Capturing Products List (Card View)...');
    await page.goto(`${baseUrl}/product-management/products`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Look for view toggle button and click it to switch to card view
    const viewToggleSelector = '[data-testid="view-toggle"], [aria-label*="card"], button[title*="card"], button[title*="Card"]';

    try {
      await page.waitForSelector(viewToggleSelector, { timeout: 5000 });
      await page.click(viewToggleSelector);
      await page.waitForTimeout(1000); // Wait for view to change
    } catch (toggleError) {
      console.log('View toggle not found, trying alternative selectors...');
      // Try clicking any button that might be a view toggle
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent || '', button);
        const title = await page.evaluate(el => el.title || '', button);
        if (text.toLowerCase().includes('card') || title.toLowerCase().includes('card')) {
          await button.click();
          await page.waitForTimeout(1000);
          break;
        }
      }
    }

    const screenshotPath = path.join(screenshotsDir, 'products-list-card-view.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
      type: 'png'
    });

    console.log('✓ Captured: products-list-card-view.png');
  } catch (error) {
    console.error('✗ Failed to capture Products List (Card View):', error.message);
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
  console.log(`Screenshots saved to: ${screenshotsDir}`);
}

captureScreenshots().catch(console.error);