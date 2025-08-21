const { chromium } = require('playwright');

async function testRoutingFix() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Testing routing fix for PR-2024-001...');
    
    // Navigate directly to the PR-2024-001 URL
    await page.goto('http://localhost:3004/procurement/purchase-requests/PR-2024-001');
    
    console.log('⏳ Waiting for page to load...');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Check if the page title shows PR-2024-001 (not PR-2023-001)
    const headerText = await page.locator('h1').first().textContent();
    console.log(`📄 Page header: ${headerText}`);
    
    if (headerText && headerText.includes('PR-2024-001')) {
      console.log('✅ SUCCESS: Routing fix works! PR-2024-001 is displayed correctly.');
    } else if (headerText && headerText.includes('PR-2023-001')) {
      console.log('❌ FAILED: Still showing PR-2023-001 instead of PR-2024-001');
    } else {
      console.log(`⚠️  UNKNOWN: Header shows "${headerText}"`);
    }
    
    // Check for the test items we added to PR-2024-001
    console.log('\\n🧪 Checking for test items...');
    const testItems = [
      'Professional Stand Mixer',
      'Premium Olive Oil',
      'Imported Whiskey Collection',
      'Belgian Chocolate Blocks',
      'Champagne Collection'
    ];
    
    let itemsFound = 0;
    for (const itemName of testItems) {
      const itemExists = await page.locator(`text=${itemName}`).count() > 0;
      if (itemExists) {
        itemsFound++;
        console.log(`✅ Found: ${itemName}`);
      } else {
        console.log(`❌ Missing: ${itemName}`);
      }
    }
    
    console.log(`\\n📊 Test Results:`);
    console.log(`   Items found: ${itemsFound}/${testItems.length}`);
    console.log(`   Page header: ${headerText}`);
    
    if (headerText && headerText.includes('PR-2024-001') && itemsFound >= 3) {
      console.log('🎉 ROUTING FIX SUCCESSFUL!');
    } else {
      console.log('🚨 Something still needs fixing...');
    }
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'routing-fix-verification.png', fullPage: true });
    console.log('📸 Screenshot saved as routing-fix-verification.png');
    
    console.log('\\n👁️  Browser will stay open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    // Keep browser open for inspection
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Take error screenshot
    await page.screenshot({ path: 'routing-error-screenshot.png' });
    console.log('📸 Error screenshot saved');
    
  } finally {
    // Don't close - let user inspect
  }
}

// Handle cleanup on Ctrl+C
process.on('SIGINT', () => {
  console.log('\\n👋 Closing browser...');
  process.exit();
});

// Run the test
testRoutingFix().catch(console.error);