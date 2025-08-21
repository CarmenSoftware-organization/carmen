const { chromium } = require('playwright');

async function simplePRTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for better visibility
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Opening application...');
    
    // Navigate directly to the PR page
    await page.goto('http://localhost:3003/procurement/purchase-requests/PR-2024-001');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    console.log('✅ Page loaded successfully!');
    
    // Take a screenshot
    await page.screenshot({ path: 'pr-2024-001-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as pr-2024-001-screenshot.png');
    
    // Look for the items table
    console.log('🔍 Looking for items table...');
    await page.waitForSelector('table', { timeout: 10000 });
    
    // Count the number of items
    const itemRows = await page.locator('tr:has-text("PR-2024-001")').count();
    console.log(`📋 Found ${itemRows} items in PR-2024-001`);
    
    // Look for our specific test items
    const testItems = [
      'Professional Stand Mixer',
      'Organic Atlantic Salmon', 
      'Premium Olive Oil',
      'Imported Whiskey Collection',
      'Belgian Chocolate Blocks',
      'Champagne Collection'
    ];
    
    for (const itemName of testItems) {
      const itemExists = await page.locator(`text=${itemName}`).count() > 0;
      console.log(`${itemExists ? '✅' : '❌'} Item found: ${itemName}`);
    }
    
    // Look for conversion displays
    console.log('\n🔍 Checking for conversion displays...');
    
    // Look for unit conversions (≈ symbol)
    const unitConversions = await page.locator('text=/\\(≈.*\\)/').count();
    console.log(`📊 Unit conversions found: ${unitConversions}`);
    
    // Look for currency conversions (USD amounts)
    const currencyConversions = await page.locator('text=/USD\\s+[\\d,]+\\./').count();
    console.log(`💱 Currency conversions found: ${currencyConversions}`);
    
    // Look for EUR, GBP, CAD prices
    const eurPrices = await page.locator('text=/EUR\\s+[\\d,]+\\./').count();
    const gbpPrices = await page.locator('text=/GBP\\s+[\\d,]+\\./').count();
    const cadPrices = await page.locator('text=/CAD\\s+[\\d,]+\\./').count();
    
    console.log(`🇪🇺 EUR prices found: ${eurPrices}`);
    console.log(`🇬🇧 GBP prices found: ${gbpPrices}`);
    console.log(`🇨🇦 CAD prices found: ${cadPrices}`);
    
    console.log('\n🎉 Basic inspection completed!');
    console.log('👁️  Browser window is open for manual inspection.');
    console.log('Press any key to close...');
    
    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', () => {
      process.exit();
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'error-screenshot.png' });
    console.log('📸 Error screenshot saved as error-screenshot.png');
    
    // Show page content for debugging
    const content = await page.content();
    console.log('📄 Page content preview:', content.substring(0, 500) + '...');
  }
}

// Handle cleanup
process.on('exit', async () => {
  console.log('\n👋 Closing browser...');
});

process.on('SIGINT', () => {
  process.exit();
});

// Run the test
simplePRTest().catch(console.error);