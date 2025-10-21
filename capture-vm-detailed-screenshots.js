const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 080 }
  });
  const page = await context.newPage();

  const screenshotDir = '/Users/peak/Documents/GitHub/carmen/docs/documents/vm/screenshots';

  async function captureScreenshot(filename, description) {
    console.log(`📸 ${description}`);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(screenshotDir, filename),
      fullPage: true,
      type: 'png'
    });
    console.log(`   ✅ Saved: ${filename}`);
  }

  try {
    console.log('🚀 Starting detailed VM screenshot capture...\n');

    // Navigate to vendor detail page (use first vendor from mock data)
    console.log('📄 Capturing Vendor Detail Pages...');
    await page.goto('http://localhost:3000/vendor-management/manage-vendors', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click first vendor
    const firstVendor = await page.locator('table tbody tr').first();
    if (await firstVendor.count() > 0) {
      await firstVendor.click();
      await page.waitForTimeout(2000);
      await captureScreenshot('vm-vendor-detail-overview.png', 'Vendor Detail - Overview Tab');

      // Click Pricelists tab
      const pricelistsTab = await page.locator('button:has-text("Pricelists"), button:has-text("Price Lists")').first();
      if (await pricelistsTab.count() > 0) {
        await pricelistsTab.click();
        await page.waitForTimeout(1000);
        await captureScreenshot('vm-vendor-detail-pricelists.png', 'Vendor Detail - Pricelists Tab');
      }

      // Click Contacts tab
      const contactsTab = await page.locator('button:has-text("Contacts")').first();
      if (await contactsTab.count() > 0) {
        await contactsTab.click();
        await page.waitForTimeout(1000);
        await captureScreenshot('vm-vendor-detail-contacts.png', 'Vendor Detail - Contacts Tab');
      }

      // Click Certifications tab
      const certsTab = await page.locator('button:has-text("Certifications")').first();
      if (await certsTab.count() > 0) {
        await certsTab.click();
        await page.waitForTimeout(1000);
        await captureScreenshot('vm-vendor-detail-certifications.png', 'Vendor Detail - Certifications Tab');
      }
    }

    // Go back to list to capture dropdown interactions
    console.log('\n📄 Capturing Dropdown Interactions...');
    await page.goto('http://localhost:3000/vendor-management/manage-vendors', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Capture status filter dropdown
    const statusFilter = await page.locator('button:has-text("Status"), select[name="status"]').first();
    if (await statusFilter.count() > 0) {
      await statusFilter.click();
      await page.waitForTimeout(500);
      await captureScreenshot('vm-vendor-list-status-dropdown.png', 'Vendor List - Status Filter Dropdown Open');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    }

    // Try to open action menu on first row
    const actionButton = await page.locator('button[aria-label*="actions"], button[aria-label*="menu"], td button:has-text("⋮"), td button:has-text("...")').first();
    if (await actionButton.count() > 0) {
      await actionButton.click();
      await page.waitForTimeout(500);
      await captureScreenshot('vm-vendor-list-actions-menu.png', 'Vendor List - Row Actions Menu Open');
      await page.keyboard.press('Escape');
    }

    // Capture view toggle
    const viewToggle = await page.locator('button[aria-label*="view"], button:has-text("Card"), button:has-text("Table")').first();
    if (await viewToggle.count() > 0) {
      await viewToggle.click();
      await page.waitForTimeout(1000);
      await captureScreenshot('vm-vendor-list-card-view.png', 'Vendor List - Card View');
    }

    // Capture templates detail
    console.log('\n📄 Capturing Templates Pages...');
    await page.goto('http://localhost:3000/vendor-management/templates/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await captureScreenshot('vm-template-new.png', 'New Template Creation Form');

    // Capture campaigns detail
    console.log('\n📄 Capturing Campaigns Pages...');
    await page.goto('http://localhost:3000/vendor-management/campaigns/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await captureScreenshot('vm-campaign-new.png', 'New Campaign Creation Form');

    // Capture pricelist pages
    console.log('\n📄 Capturing Pricelist Pages...');
    await page.goto('http://localhost:3000/vendor-management/pricelists/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await captureScreenshot('vm-pricelist-new.png', 'New Pricelist Creation Form');

    await page.goto('http://localhost:3000/vendor-management/pricelists/add', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await captureScreenshot('vm-pricelist-add.png', 'Add Pricelist Form');

    // Capture alternative vendors path
    console.log('\n📄 Capturing Alternative Vendor Paths...');
    await page.goto('http://localhost:3000/vendor-management/vendors/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await captureScreenshot('vm-vendors-new-alt.png', 'New Vendor Form (Alternative Path)');

    console.log('\n✨ Screenshot capture complete!');
    console.log(`📁 All screenshots saved to: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
})();
