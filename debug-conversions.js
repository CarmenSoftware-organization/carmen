const { chromium } = require('playwright');

async function debugConversions() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🔍 Debugging conversion data in PR-2024-001...');
    
    await page.goto('http://localhost:3004/procurement/purchase-requests/PR-2024-001');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    console.log('✅ Page loaded');
    
    // Take a screenshot first
    await page.screenshot({ path: 'debug-before.png', fullPage: true });
    console.log('📸 Screenshot saved as debug-before.png');
    
    // Look for specific test items
    console.log('\\n🧪 Looking for conversion test items...');
    
    // Check for Whiskey item specifically
    const whiskeyRow = page.locator('tr:has-text("Imported Whiskey Collection")');
    if (await whiskeyRow.count() > 0) {
      console.log('✅ Found Whiskey Collection item');
      
      // Click to expand
      await whiskeyRow.click();
      await page.waitForTimeout(1000);
      
      // Look for any GBP text
      const gbpElements = await page.locator('text=/GBP/').count();
      console.log(`   GBP elements found: ${gbpElements}`);
      
      // Look for any USD conversion text
      const usdElements = await page.locator('text=/USD\\s+[\\d,]+\\./').count();
      console.log(`   USD conversion elements found: ${usdElements}`);
      
      // Look for "cases" and "bottles" text
      const casesElements = await page.locator('text=/cases/').count();
      const bottlesElements = await page.locator('text=/bottles/').count();
      console.log(`   Cases elements found: ${casesElements}`);
      console.log(`   Bottles elements found: ${bottlesElements}`);
      
      // Look for conversion symbols (≈)
      const conversionSymbols = await page.locator('text=/\\\\(≈/').count();
      console.log(`   Conversion symbols (≈) found: ${conversionSymbols}`);
      
    } else {
      console.log('❌ Whiskey Collection item not found');
    }
    
    // Check for Champagne item specifically
    const champagneRow = page.locator('tr:has-text("Champagne Collection")');
    if (await champagneRow.count() > 0) {
      console.log('\\n✅ Found Champagne Collection item');
      
      // Click to expand
      await champagneRow.click();
      await page.waitForTimeout(1000);
      
      // Look for any CAD text
      const cadElements = await page.locator('text=/CAD/').count();
      console.log(`   CAD elements found: ${cadElements}`);
      
      // Look for any USD conversion text
      const usdElements = await page.locator('text=/USD\\s+[\\d,]+\\./').count();
      console.log(`   USD conversion elements found: ${usdElements}`);
      
      // Look for conversion symbols (≈)
      const conversionSymbols = await page.locator('text=/\\\\(≈/').count();
      console.log(`   Conversion symbols (≈) found: ${conversionSymbols}`);
      
    } else {
      console.log('❌ Champagne Collection item not found');
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'debug-after.png', fullPage: true });
    console.log('\\n📸 Final screenshot saved as debug-after.png');
    
    // Check the page source for data debugging
    console.log('\\n🔍 Checking raw data presence...');
    const pageContent = await page.content();
    
    const hasGBP = pageContent.includes('GBP');
    const hasCAD = pageContent.includes('CAD');
    const hasWhiskey = pageContent.includes('Imported Whiskey');
    const hasChampagne = pageContent.includes('Champagne Collection');
    
    console.log(`   Raw content contains GBP: ${hasGBP}`);
    console.log(`   Raw content contains CAD: ${hasCAD}`);
    console.log(`   Raw content contains Whiskey: ${hasWhiskey}`);
    console.log(`   Raw content contains Champagne: ${hasChampagne}`);
    
    console.log('\\n👁️  Browser staying open for inspection...');
    console.log('Press Ctrl+C when done.');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    await page.screenshot({ path: 'debug-error.png' });
  }
}

process.on('SIGINT', () => {
  console.log('\\n👋 Closing...');
  process.exit();
});

debugConversions().catch(console.error);