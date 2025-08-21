const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function capturePurchaseOrderDetail() {
  console.log('🔧 Fixing Purchase Order Detail screenshot...');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  page.setDefaultTimeout(15000);

  try {
    console.log('📋 Step 1: Navigate to Purchase Orders List...');
    
    // Navigate to PO list
    await page.goto('http://localhost:3000/procurement/purchase-orders', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    console.log('✅ PO List loaded successfully');
    
    // Wait for the list to populate
    await page.waitForTimeout(3000);
    
    console.log('🔍 Step 2: Looking for clickable PO links...');
    
    // Try multiple approaches to find a working PO detail link
    const linkSelectors = [
      // Direct table cell links
      'table tbody tr:first-child td:first-child a',
      'table tbody tr:first-child td:nth-child(2) a', 
      // PO number links
      '[data-testid*="po-number"]',
      'a[href*="/purchase-orders/"]:not([href*="/purchase-orders$"])',
      // Any link in first row that contains PO
      'table tbody tr:first-child a[href*="PO"]',
      // Fallback - any link in first data row
      'table tbody tr:first-child a'
    ];
    
    let detailPageFound = false;
    let finalUrl = '';
    
    for (const selector of linkSelectors) {
      try {
        console.log(`   🎯 Trying selector: ${selector}`);
        
        const element = await page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          const href = await element.getAttribute('href');
          console.log(`   ✓ Found link with href: ${href}`);
          
          // Click the link
          await element.click();
          await page.waitForTimeout(3000);
          
          // Check if we landed on a proper detail page
          const currentUrl = page.url();
          const bodyText = await page.textContent('body');
          
          console.log(`   📍 Current URL: ${currentUrl}`);
          
          if (!bodyText.includes('404') && 
              !bodyText.includes('This page could not be found') &&
              !bodyText.includes('Loading... (Data not found)') &&
              currentUrl.includes('purchase-orders/') &&
              !currentUrl.endsWith('purchase-orders')) {
            
            console.log('   ✅ Valid detail page found!');
            detailPageFound = true;
            finalUrl = currentUrl;
            break;
          } else {
            console.log('   ⚠️ Page shows error or loading state, trying next selector...');
            // Go back to list page
            await page.goBack();
            await page.waitForTimeout(2000);
          }
        }
      } catch (error) {
        console.log(`   ❌ Selector ${selector} failed: ${error.message}`);
        continue;
      }
    }
    
    if (!detailPageFound) {
      // Try alternative approach - check if there's a "Create New" or demo PO
      console.log('🔄 Step 3: Trying alternative approaches...');
      
      // Look for "New Purchase Order" or similar buttons that might lead to a populated form
      const createButtons = [
        'button:has-text("New Purchase Order")',
        'button:has-text("Create")',
        '[data-testid="create-po"]',
        'a[href*="new"]'
      ];
      
      for (const buttonSelector of createButtons) {
        try {
          const button = await page.locator(buttonSelector).first();
          if (await button.isVisible({ timeout: 1000 })) {
            console.log(`   🎯 Found create button: ${buttonSelector}`);
            await button.click();
            await page.waitForTimeout(3000);
            
            const currentUrl = page.url();
            const bodyText = await page.textContent('body');
            
            if (!bodyText.includes('404') && 
                (currentUrl.includes('purchase-order') || currentUrl.includes('po'))) {
              console.log('   ✅ Create form loaded successfully');
              detailPageFound = true;
              finalUrl = currentUrl;
              break;
            }
          }
        } catch (error) {
          console.log(`   ⚠️ Create button approach failed: ${error.message}`);
          continue;
        }
      }
    }
    
    if (detailPageFound) {
      console.log('📸 Step 4: Capturing enhanced screenshot...');
      
      // Wait for content to fully load
      await page.waitForTimeout(3000);
      
      // Try to interact with any tabs or sections to show more content
      try {
        const tabSelectors = [
          '[role="tab"]',
          '.tab-trigger',
          '[data-tab]',
          'button[id*="tab"]'
        ];
        
        for (const tabSelector of tabSelectors) {
          try {
            const tab = await page.locator(tabSelector).first();
            if (await tab.isVisible({ timeout: 1000 })) {
              await tab.click();
              await page.waitForTimeout(1000);
              console.log(`   ✓ Activated tab: ${tabSelector}`);
              break;
            }
          } catch (tabError) {
            continue;
          }
        }
      } catch (tabInteractionError) {
        console.log('   ⚠️ Tab interaction not available, proceeding...');
      }
      
      // Take the screenshot
      const imageDir = path.join('docs/prd/output/screens/images', 'purchase-order-detail');
      await fs.mkdir(imageDir, { recursive: true });
      
      const screenshotPath = path.join(imageDir, 'purchase-order-detail-populated.png');
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: false 
      });
      
      console.log(`✅ Enhanced PO detail screenshot saved: ${screenshotPath}`);
      console.log(`📍 Captured from URL: ${finalUrl}`);
      
      // Also update the default one
      const defaultPath = path.join(imageDir, 'purchase-order-detail-default.png');
      await page.screenshot({ 
        path: defaultPath, 
        fullPage: false 
      });
      console.log(`✅ Default screenshot also updated: ${defaultPath}`);
      
      return {
        success: true,
        url: finalUrl,
        screenshot: screenshotPath
      };
      
    } else {
      throw new Error('Could not find any working Purchase Order detail page or create form');
    }
    
  } catch (error) {
    console.log(`❌ Error during PO detail capture: ${error.message}`);
    
    // Take error screenshot for debugging
    const errorDir = path.join('docs/prd/output/screens/images', 'purchase-order-detail');
    await fs.mkdir(errorDir, { recursive: true });
    const errorPath = path.join(errorDir, 'purchase-order-detail-debug.png');
    await page.screenshot({ 
      path: errorPath, 
      fullPage: false 
    });
    console.log(`📄 Debug screenshot saved: ${errorPath}`);
    
    return {
      success: false,
      error: error.message,
      debug_screenshot: errorPath
    };
  } finally {
    await browser.close();
  }
}

// Handle script execution
if (require.main === module) {
  capturePurchaseOrderDetail()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 Purchase Order Detail screenshot fixed successfully!');
        console.log(`📸 Screenshot: ${result.screenshot}`);
        console.log(`📍 Source URL: ${result.url}`);
      } else {
        console.log('\n❌ Failed to fix Purchase Order Detail screenshot');
        console.log(`🚫 Error: ${result.error}`);
        if (result.debug_screenshot) {
          console.log(`🐛 Debug screenshot: ${result.debug_screenshot}`);
        }
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during PO detail capture:', error);
      process.exit(1);
    });
}

module.exports = { capturePurchaseOrderDetail };