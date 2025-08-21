const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

async function capturePOCreateForm() {
  console.log('🔧 Capturing Purchase Order Create Form...');
  
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
    
    await page.goto('http://localhost:3000/procurement/purchase-orders', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    console.log('✅ PO List loaded successfully');
    await page.waitForTimeout(3000);
    
    console.log('🔍 Step 2: Looking for New Purchase Order button...');
    
    // Try to click the "New Purchase Order" button
    const newPOButton = page.locator('button:has-text("New Purchase Order")');
    if (await newPOButton.isVisible({ timeout: 5000 })) {
      console.log('   ✓ Found New Purchase Order button, clicking...');
      await newPOButton.click();
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`   📍 Current URL after click: ${currentUrl}`);
      
      // Check if we're on a create form or dropdown appeared
      const bodyText = await page.textContent('body');
      
      // Try to click on "Create Blank PO" option if dropdown appeared
      const createBlankButton = page.locator('text="Create Blank PO"');
      if (await createBlankButton.isVisible({ timeout: 3000 })) {
        console.log('   🎯 Found Create Blank PO option, clicking...');
        await createBlankButton.click();
        await page.waitForTimeout(3000);
        
        const finalUrl = page.url();
        console.log(`   📍 Final URL: ${finalUrl}`);
        
        // Wait for form to load
        await page.waitForTimeout(3000);
        
        // Take screenshot
        const imageDir = path.join('docs/prd/output/screens/images', 'purchase-order-detail');
        await fs.mkdir(imageDir, { recursive: true });
        
        const screenshotPath = path.join(imageDir, 'purchase-order-detail-create-form.png');
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        console.log(`✅ PO Create Form screenshot saved: ${screenshotPath}`);
        console.log(`📍 Captured from URL: ${finalUrl}`);
        
        return {
          success: true,
          url: finalUrl,
          screenshot: screenshotPath,
          type: 'create_form'
        };
      }
      
      // If no dropdown, maybe we're directly on create form
      if (currentUrl.includes('new') || bodyText.includes('Create') || bodyText.includes('New Purchase Order')) {
        console.log('   ✅ Appears to be on create form page');
        
        // Take screenshot
        const imageDir = path.join('docs/prd/output/screens/images', 'purchase-order-detail');
        await fs.mkdir(imageDir, { recursive: true });
        
        const screenshotPath = path.join(imageDir, 'purchase-order-detail-create-form.png');
        await page.screenshot({ 
          path: screenshotPath, 
          fullPage: true 
        });
        
        console.log(`✅ PO Create Form screenshot saved: ${screenshotPath}`);
        console.log(`📍 Captured from URL: ${currentUrl}`);
        
        return {
          success: true,
          url: currentUrl,
          screenshot: screenshotPath,
          type: 'create_form'
        };
      }
    }
    
    throw new Error('Could not access Purchase Order create form');
    
  } catch (error) {
    console.log(`❌ Error during PO create form capture: ${error.message}`);
    
    // Take error screenshot for debugging
    const errorDir = path.join('docs/prd/output/screens/images', 'purchase-order-detail');
    await fs.mkdir(errorDir, { recursive: true });
    const errorPath = path.join(errorDir, 'purchase-order-create-debug.png');
    await page.screenshot({ 
      path: errorPath, 
      fullPage: true 
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
  capturePOCreateForm()
    .then((result) => {
      if (result.success) {
        console.log('\n🎉 Purchase Order Create Form captured successfully!');
        console.log(`📸 Screenshot: ${result.screenshot}`);
        console.log(`📍 Source URL: ${result.url}`);
        console.log(`🏷️ Type: ${result.type}`);
      } else {
        console.log('\n❌ Failed to capture Purchase Order Create Form');
        console.log(`🚫 Error: ${result.error}`);
        if (result.debug_screenshot) {
          console.log(`🐛 Debug screenshot: ${result.debug_screenshot}`);
        }
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Fatal error during PO create form capture:', error);
      process.exit(1);
    });
}

module.exports = { capturePOCreateForm };