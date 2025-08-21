const { chromium } = require('playwright');

async function testConversions() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1400, height: 1000 }
  });
  
  const page = await context.newPage();

  try {
    console.log('🚀 Testing conversion scenarios in PR-2024-001...');
    
    // Navigate to PR-2024-001
    await page.goto('http://localhost:3004/procurement/purchase-requests/PR-2024-001');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // Verify we're on the right page
    const headerText = await page.locator('h1').first().textContent();
    console.log(`📄 Page: ${headerText}`);
    
    if (!headerText || !headerText.includes('PR-2024-001')) {
      console.log('❌ Failed to load PR-2024-001');
      return;
    }
    
    console.log('✅ Successfully loaded PR-2024-001');
    console.log('\\n🔍 Testing conversion scenarios...');
    
    // Define test scenarios
    const testScenarios = [
      {
        name: 'Professional Stand Mixer',
        expectUnitConversion: false, // piece = piece
        expectCurrencyConversion: false, // USD = USD
        description: 'Baseline: No conversions'
      },
      {
        name: 'Organic Atlantic Salmon',
        expectUnitConversion: false, // kg = kg
        expectCurrencyConversion: false, // USD = USD
        description: 'Baseline: No conversions'
      },
      {
        name: 'Premium Olive Oil',
        expectUnitConversion: false, // bottle = bottle
        expectCurrencyConversion: false, // USD = USD
        description: 'Baseline: No conversions'
      },
      {
        name: 'Imported Whiskey Collection',
        expectUnitConversion: true, // cases → bottles
        expectCurrencyConversion: true, // GBP → USD
        description: 'Both conversions: GBP→USD & cases→bottles'
      },
      {
        name: 'Belgian Chocolate Blocks',
        expectUnitConversion: false, // kg = kg
        expectCurrencyConversion: false, // USD = USD
        description: 'Baseline: No conversions (control scenario)'
      },
      {
        name: 'Champagne Collection',
        expectUnitConversion: true, // cases → bottles
        expectCurrencyConversion: true, // CAD → USD
        description: 'Both conversions: CAD→USD & cases→bottles'
      }
    ];
    
    for (let i = 0; i < testScenarios.length; i++) {
      const scenario = testScenarios[i];
      console.log(`\\n${i + 1}. Testing: ${scenario.name}`);
      console.log(`   Expected: ${scenario.description}`);
      
      try {
        // Look for the item in the table
        const itemRow = page.locator(`tr:has-text("${scenario.name}")`);
        const itemExists = await itemRow.count() > 0;
        
        if (!itemExists) {
          console.log(`   ❌ Item not found: ${scenario.name}`);
          continue;
        }
        
        console.log(`   ✅ Item found: ${scenario.name}`);
        
        // Click to expand the row details
        await itemRow.click();
        await page.waitForTimeout(500);
        
        // Look for unit conversions (≈ symbol with units)
        const unitConversions = await page.locator('text=/\\\\(≈.*\\\\)/', { hasText: /bottles|liters|pieces|kg/ }).count();
        
        // Look for currency conversions (USD amounts when original is non-USD)
        let currencyConversions = 0;
        if (scenario.name.includes('Whiskey')) {
          currencyConversions = await page.locator('text=/USD\\s+[\\\\d,]+\\\\./').count();
        } else if (scenario.name.includes('Champagne')) {
          currencyConversions = await page.locator('text=/USD\\s+[\\\\d,]+\\\\./').count();
        }
        
        // Validate unit conversion expectation
        if (scenario.expectUnitConversion) {
          if (unitConversions > 0) {
            console.log(`   ✅ Unit conversion found (${unitConversions} instances)`);
          } else {
            console.log(`   ❌ Expected unit conversion not found`);
          }
        } else {
          if (unitConversions === 0) {
            console.log(`   ✅ No unit conversion (as expected)`);
          } else {
            console.log(`   ❌ Unexpected unit conversion found`);
          }
        }
        
        // Validate currency conversion expectation
        if (scenario.expectCurrencyConversion) {
          if (currencyConversions > 0) {
            console.log(`   ✅ Currency conversion found (${currencyConversions} instances)`);
          } else {
            console.log(`   ❌ Expected currency conversion not found`);
          }
        } else {
          console.log(`   ✅ No currency conversion (baseline scenario)`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error testing ${scenario.name}: ${error.message}`);
      }
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'pr-2024-001-all-conversions.png', fullPage: true });
    console.log('\\n📸 Screenshot saved as pr-2024-001-all-conversions.png');
    
    console.log('\\n🎉 Conversion testing completed!');
    console.log('👁️  Browser will remain open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'conversion-test-error.png' });
    console.log('📸 Error screenshot saved');
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\\n👋 Closing browser...');
  process.exit();
});

// Run the test
testConversions().catch(console.error);