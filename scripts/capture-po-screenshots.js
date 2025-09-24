const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Create screenshots directory if it doesn't exist
const screenshotsDir = path.join(__dirname, '../docs/screenshots/purchase-orders');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Common viewport sizes for testing
const viewports = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForLoading(page) {
  // Wait for any loading spinners to disappear
  try {
    await page.waitForSelector('[data-loading="true"]', { timeout: 2000, hidden: true });
  } catch (e) {
    // Spinner might not exist, that's ok
  }

  // Wait for React to settle
  await delay(1000);
}

async function captureScreenshot(page, name, fullPage = false) {
  await waitForLoading(page);
  const filename = `${name}.png`;
  const filepath = path.join(screenshotsDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage,
    captureBeyondViewport: fullPage
  });

  console.log(`✓ Captured: ${filename}`);
  return filename;
}

async function captureElement(page, selector, name) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    const element = await page.$(selector);
    if (element) {
      const filename = `${name}.png`;
      const filepath = path.join(screenshotsDir, filename);

      await element.screenshot({ path: filepath });
      console.log(`✓ Captured element: ${filename}`);
      return filename;
    }
  } catch (error) {
    console.log(`⚠ Could not capture element ${selector}: ${error.message}`);
  }
  return null;
}

async function capturePurchaseOrderScreenshots() {
  console.log('🚀 Starting Carmen ERP Purchase Order screenshot capture...\n');

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    defaultViewport: viewports.desktop,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();

    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navigate to the application
    console.log('📱 Navigating to Carmen ERP...');
    await page.goto('http://localhost:3003', { waitUntil: 'networkidle0' });

    // Wait for the page to load
    await delay(2000);

    // Check if we need to navigate to a specific context/login
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Navigate to Purchase Orders list page
    console.log('\n📋 Capturing Purchase Orders List Page...');
    await page.goto('http://localhost:3003/procurement/purchase-orders', { waitUntil: 'networkidle0' });
    await delay(2000);

    // 1. Purchase Orders List Page (Desktop)
    await captureScreenshot(page, '01-po-list-desktop', true);

    // Capture just the header section
    await captureElement(page, 'h1', '01a-po-list-header');

    // Capture action buttons
    await captureElement(page, '.flex.flex-wrap.gap-2', '01b-po-list-actions');

    // Try to interact with the New PO dropdown
    try {
      await page.click('button:has-text("New PO")');
      await delay(500);
      await captureElement(page, '[role="menu"]', '01c-new-po-dropdown');
      // Click elsewhere to close dropdown
      await page.click('h1');
      await delay(500);
    } catch (error) {
      console.log('⚠ Could not capture New PO dropdown');
    }

    // Capture table/data view
    await captureElement(page, '[role="table"], .data-table, table', '01d-po-data-table');

    // Try to capture filters if they exist
    await captureElement(page, '[data-testid="filter"], .filter, [aria-label*="filter"]', '01e-po-filters');

    // 2. Tablet View
    console.log('\n📱 Capturing Tablet View...');
    await page.setViewport(viewports.tablet);
    await delay(1000);
    await captureScreenshot(page, '02-po-list-tablet', true);

    // 3. Mobile View
    console.log('\n📱 Capturing Mobile View...');
    await page.setViewport(viewports.mobile);
    await delay(1000);
    await captureScreenshot(page, '03-po-list-mobile', true);

    // Reset to desktop for remaining captures
    await page.setViewport(viewports.desktop);
    await delay(1000);

    // 4. Try to open a Purchase Order detail page
    console.log('\n📄 Capturing Purchase Order Detail Page...');

    // Look for the first PO link in the table
    try {
      const poLinks = await page.$$eval('a[href*="/purchase-orders/"], tr a, .po-link', links =>
        links.map(link => link.href).filter(href => href.includes('/purchase-orders/') && !href.includes('/create'))
      );

      if (poLinks.length > 0) {
        const firstPOUrl = poLinks[0];
        console.log(`Navigating to: ${firstPOUrl}`);
        await page.goto(firstPOUrl, { waitUntil: 'networkidle0' });
        await delay(2000);

        // Capture full detail page
        await captureScreenshot(page, '04-po-detail-desktop', true);

        // Capture specific tabs if they exist
        const tabSelectors = [
          'button:has-text("Items"), [role="tab"]:has-text("Items")',
          'button:has-text("General"), [role="tab"]:has-text("General")',
          'button:has-text("Financial"), [role="tab"]:has-text("Financial")',
          'button:has-text("Comments"), [role="tab"]:has-text("Comments")',
          'button:has-text("Activity"), [role="tab"]:has-text("Activity")'
        ];

        for (let i = 0; i < tabSelectors.length; i++) {
          try {
            await page.click(tabSelectors[i]);
            await delay(1000);
            await captureScreenshot(page, `05${String.fromCharCode(97 + i)}-po-detail-tab-${i + 1}`, true);
          } catch (error) {
            console.log(`⚠ Could not capture tab ${i + 1}`);
          }
        }

        // Capture items tab specifically if it exists
        try {
          await page.click('button:has-text("Items"), [role="tab"]:has-text("Items")');
          await delay(1000);
          await captureElement(page, '.items-table, [data-testid="items"], table', '05f-po-items-table');
        } catch (error) {
          console.log('⚠ Could not capture items table');
        }

      } else {
        console.log('⚠ No PO detail links found, will try to create a sample URL');
        await page.goto('http://localhost:3003/procurement/purchase-orders/PO-2024-001', { waitUntil: 'networkidle0' });
        await delay(2000);
        await captureScreenshot(page, '04-po-detail-desktop', true);
      }
    } catch (error) {
      console.log('⚠ Could not navigate to PO detail page:', error.message);
    }

    // 5. Purchase Order Creation Page
    console.log('\n📝 Capturing PO Creation Form...');
    await page.goto('http://localhost:3003/procurement/purchase-orders/create', { waitUntil: 'networkidle0' });
    await delay(2000);

    await captureScreenshot(page, '06-po-create-desktop', true);

    // Try to capture form sections
    await captureElement(page, 'form, .form-container', '06a-po-create-form');

    // Capture mobile view of creation form
    await page.setViewport(viewports.mobile);
    await delay(1000);
    await captureScreenshot(page, '07-po-create-mobile', true);

    // 6. Try to capture modal dialogs
    console.log('\n🔲 Attempting to capture modal dialogs...');
    await page.setViewport(viewports.desktop);
    await page.goto('http://localhost:3003/procurement/purchase-orders', { waitUntil: 'networkidle0' });
    await delay(2000);

    // Try to open "Create from Purchase Requests" modal
    try {
      await page.click('button:has-text("New PO")');
      await delay(500);
      await page.click('span:has-text("Create from Purchase Requests")');
      await delay(1500);

      await captureElement(page, '[role="dialog"], .dialog, .modal', '08-po-create-from-pr-modal');

      // Close modal
      try {
        await page.click('button:has-text("Cancel"), [aria-label="Close"]');
        await delay(500);
      } catch (e) {
        await page.keyboard.press('Escape');
      }
    } catch (error) {
      console.log('⚠ Could not capture modal dialog');
    }

    // 7. Capture any additional UI components
    console.log('\n🎨 Capturing additional UI components...');

    // Try to capture status badges
    await captureElement(page, '.badge, .status, [data-status]', '09-status-badges');

    // Try to capture any search interfaces
    await captureElement(page, 'input[type="search"], .search-input, [placeholder*="search"]', '10-search-interface');

    console.log('\n✅ Screenshot capture completed!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);

  } catch (error) {
    console.error('❌ Error during screenshot capture:', error);
  } finally {
    await browser.close();
  }
}

// Handle cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down screenshot capture...');
  process.exit();
});

// Run the screenshot capture
capturePurchaseOrderScreenshots().catch(console.error);