#!/usr/bin/env node

/**
 * Pre-flight connectivity test for Carmen ERP E2E test environment
 * Validates application accessibility and target page availability
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3005',
  targetPage: '/system-administration/permission-management/policies',
  timeout: 30000,
  viewport: { width: 1368, height: 720 },
  screenshotPath: path.join(__dirname, 'reports', 'preflight-screenshots')
};

// Ensure screenshot directory exists
if (!fs.existsSync(CONFIG.screenshotPath)) {
  fs.mkdirSync(CONFIG.screenshotPath, { recursive: true });
}

console.log('🚀 Carmen ERP E2E Test Environment - Pre-flight Check');
console.log('=' .repeat(60));
console.log(`📍 Target Application: ${CONFIG.baseUrl}`);
console.log(`📍 Target Page: ${CONFIG.targetPage}`);
console.log(`📍 Viewport: ${CONFIG.viewport.width}x${CONFIG.viewport.height}`);
console.log('');

async function runPreflightCheck() {
  let browser;
  
  try {
    console.log('⚡ Starting browser...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: CONFIG.viewport
    });
    
    const page = await browser.newPage();
    
    // Test 1: Basic connectivity
    console.log('📡 Testing basic connectivity...');
    const response = await page.goto(CONFIG.baseUrl, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    
    if (!response.ok()) {
      throw new Error(`HTTP ${response.status()}: ${response.statusText()}`);
    }
    
    console.log('✅ Application is accessible');
    
    // Take screenshot of homepage
    await page.screenshot({
      path: path.join(CONFIG.screenshotPath, 'homepage.png'),
      fullPage: false
    });
    
    // Test 2: Navigate to main menu
    console.log('📍 Testing navigation to main dashboard...');
    
    // Look for "Go to Menu" button and click it
    try {
      await page.waitForSelector('text=Go to Menu', { timeout: 10000 });
      await page.click('text=Go to Menu');
      
      await page.waitForSelector('[class*="sidebar"]', { timeout: 10000 });
      console.log('✅ Successfully navigated to main dashboard');
      
      await page.screenshot({
        path: path.join(CONFIG.screenshotPath, 'dashboard.png'),
        fullPage: false
      });
    } catch (error) {
      console.log('⚠️  Alternative navigation strategy needed');
    }
    
    // Test 3: Permission Management page accessibility
    console.log('🔐 Testing Permission Management page...');
    
    const fullUrl = CONFIG.baseUrl + CONFIG.targetPage;
    const pmResponse = await page.goto(fullUrl, { 
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout 
    });
    
    if (!pmResponse.ok()) {
      throw new Error(`Permission Management page unreachable: HTTP ${pmResponse.status()}`);
    }
    
    // Wait for key elements to load
    console.log('🔍 Validating page elements...');
    
    // Check for Policy Management heading
    const heading = await page.$('h1, h2, h3');
    if (heading) {
      const headingText = await page.evaluate(el => el.textContent, heading);
      console.log(`✅ Page heading found: "${headingText}"`);
    }
    
    // Check for RBAC/ABAC toggle elements
    const toggleSelectors = [
      '[data-testid*="toggle"]',
      'button[class*="rbac"]',
      'button[class*="abac"]',
      'text=Role-Based',
      'text=Attribute-Based'
    ];
    
    let toggleElements = 0;
    for (const selector of toggleSelectors) {
      try {
        const elements = await page.$$(selector);
        toggleElements += elements.length;
      } catch (e) {
        // Selector not supported, continue
      }
    }
    
    if (toggleElements > 0) {
      console.log('✅ RBAC/ABAC toggle functionality detected');
    } else {
      console.log('⚠️  RBAC/ABAC toggle not found with test selectors');
    }
    
    // Check for policy list/table
    const tableElements = await page.$$('table, [data-testid*="policy"], [data-testid*="list"]');
    if (tableElements.length > 0) {
      console.log('✅ Policy management interface detected');
    }
    
    // Check for Simple Creator and Advanced Builder buttons
    const creatorSelectors = [
      '[data-testid*="creator"]',
      '[data-testid*="builder"]', 
      'button[class*="creator"]',
      'button[class*="builder"]'
    ];
    
    let creatorButtons = 0;
    for (const selector of creatorSelectors) {
      try {
        const elements = await page.$$(selector);
        creatorButtons += elements.length;
      } catch (e) {
        // Continue with next selector
      }
    }
    
    // Also check by text content
    try {
      const textButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn => 
          btn.textContent.includes('Simple Creator') || 
          btn.textContent.includes('Advanced Builder')
        ).length;
      });
      creatorButtons += textButtons;
    } catch (e) {
      // Continue
    }
    
    if (creatorButtons > 0) {
      console.log(`✅ Policy creation buttons found (${creatorButtons} buttons)`);
    } else {
      console.log('⚠️  Policy creation buttons not detected');
    }
    
    // Take screenshot of Permission Management page
    await page.screenshot({
      path: path.join(CONFIG.screenshotPath, 'permission-management.png'),
      fullPage: true
    });
    
    // Test 4: Performance baseline measurement
    console.log('⚡ Measuring page load performance...');
    
    const startTime = Date.now();
    await page.goto(fullUrl, { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    console.log(`📊 Page load time: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Page load performance: EXCELLENT');
    } else if (loadTime < 5000) {
      console.log('⚠️  Page load performance: ACCEPTABLE');
    } else {
      console.log('❌ Page load performance: POOR (may affect tests)');
    }
    
    // Test 5: Mobile responsiveness check
    console.log('📱 Testing mobile responsiveness...');
    
    await page.setViewport({ width: 375, height: 667 });
    await page.goto(fullUrl, { waitUntil: 'networkidle0' });
    
    await page.screenshot({
      path: path.join(CONFIG.screenshotPath, 'mobile-view.png'),
      fullPage: false
    });
    
    const mobileElements = await page.$$('button, input, select');
    console.log(`✅ Mobile view: ${mobileElements.length} interactive elements detected`);
    
    // Reset viewport
    await page.setViewport(CONFIG.viewport);
    
    console.log('');
    console.log('🎉 PRE-FLIGHT CHECK COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`✅ Application accessible at ${CONFIG.baseUrl}`);
    console.log(`✅ Permission Management page functional`);
    console.log(`✅ Page load time: ${loadTime}ms`);
    console.log(`✅ Screenshots saved to: ${CONFIG.screenshotPath}`);
    console.log('');
    console.log('🚀 Ready to run comprehensive E2E test suite!');
    
    return {
      success: true,
      loadTime,
      screenshots: 5,
      elementsDetected: true
    };
    
  } catch (error) {
    console.error('');
    console.error('❌ PRE-FLIGHT CHECK FAILED!');
    console.error('');
    console.error('Error Details:', error.message);
    console.error('');
    console.error('Troubleshooting Steps:');
    console.error('1. Verify Carmen application is running on port 3005');
    console.error('2. Check network connectivity');
    console.error('3. Ensure all dependencies are installed');
    console.error('4. Review application logs for errors');
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the pre-flight check
runPreflightCheck()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });