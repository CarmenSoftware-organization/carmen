const { chromium } = require('playwright');

async function testPR2024001Conversions() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 Starting PR-2024-001 conversion testing...');
    
    // Navigate to the application
    console.log('📍 Navigating to application...');
    await page.goto('http://localhost:3003');
    await page.waitForLoadState('networkidle');
    
    // Navigate to procurement section
    console.log('🏪 Navigating to procurement...');
    await page.click('text=Procurement');
    await page.waitForLoadState('networkidle');
    
    // Navigate to purchase requests
    console.log('📋 Navigating to purchase requests...');
    await page.click('text=Purchase Requests');
    await page.waitForLoadState('networkidle');
    
    // Look for PR-2024-001
    console.log('🔍 Looking for PR-2024-001...');
    await page.click('text=PR-2024-001');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Successfully navigated to PR-2024-001');
    
    // Test each item's conversion display
    const testScenarios = [
      {
        item: 'PR-2024-001-01',
        name: 'Professional Stand Mixer',
        expectUnitConversion: false, // piece = piece
        expectCurrencyConversion: false, // USD = USD
      },
      {
        item: 'PR-2024-001-02', 
        name: 'Organic Atlantic Salmon',
        expectUnitConversion: false, // kg = kg
        expectCurrencyConversion: false, // USD = USD
      },
      {
        item: 'PR-2024-001-03',
        name: 'Premium Olive Oil',
        expectUnitConversion: true, // bottles → liters
        expectCurrencyConversion: true, // EUR → USD
      },
      {
        item: 'PR-2024-001-04',
        name: 'Imported Whiskey Collection',
        expectUnitConversion: true, // cases → bottles
        expectCurrencyConversion: true, // GBP → USD
      },
      {
        item: 'PR-2024-001-05',
        name: 'Belgian Chocolate Blocks',
        expectUnitConversion: false, // kg = kg
        expectCurrencyConversion: false, // USD = USD
      },
      {
        item: 'PR-2024-001-06',
        name: 'Champagne Collection',
        expectUnitConversion: true, // cases → bottles
        expectCurrencyConversion: true, // CAD → USD
      }
    ];
    
    for (const scenario of testScenarios) {
      console.log(`\n🧪 Testing ${scenario.name}...`);
      
      try {
        // Look for the item row and expand it if needed
        const itemRow = page.locator(`tr:has-text("${scenario.name}")`);
        await itemRow.waitFor({ timeout: 5000 });
        
        // Click to expand the item details
        await itemRow.click();
        await page.waitForTimeout(1000);
        
        // Check for unit conversion display
        if (scenario.expectUnitConversion) {
          const unitConversion = await page.locator('text=/\\(≈.*\\)/', { hasText: /liters|bottles/ }).first();
          if (await unitConversion.isVisible()) {
            const conversionText = await unitConversion.textContent();
            console.log(`  ✅ Unit conversion found: ${conversionText}`);
          } else {
            console.log(`  ❌ Expected unit conversion not found`);
          }
        } else {
          const unitConversion = await page.locator('text=/\\(≈.*\\)/', { hasText: /liters|bottles/ }).count();
          if (unitConversion === 0) {
            console.log(`  ✅ No unit conversion displayed (as expected)`);
          } else {
            console.log(`  ❌ Unexpected unit conversion found`);
          }
        }
        
        // Check for currency conversion display  
        if (scenario.expectCurrencyConversion) {
          const currencyConversion = await page.locator('text=/USD.*/', { hasText: /USD\s+[\d,]+\./ }).first();
          if (await currencyConversion.isVisible()) {
            const conversionText = await currencyConversion.textContent();
            console.log(`  ✅ Currency conversion found: ${conversionText}`);
          } else {
            console.log(`  ❌ Expected currency conversion not found`);
          }
        } else {
          // For USD items, there should be no USD conversion display
          const currencyConversion = await page.locator('text=/USD.*/', { hasText: /USD\s+[\d,]+\./ }).count();
          if (currencyConversion === 0) {
            console.log(`  ✅ No currency conversion displayed (as expected)`);
          } else {
            console.log(`  ❌ Unexpected currency conversion found`);
          }
        }
        
      } catch (error) {
        console.log(`  ❌ Error testing ${scenario.name}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 PR-2024-001 conversion testing completed!');
    
    // Keep browser open for manual inspection
    console.log('\n👁️  Browser will remain open for manual inspection...');
    console.log('Press Ctrl+C to close when done.');
    
    // Wait indefinitely so user can inspect
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testPR2024001Conversions().catch(console.error);