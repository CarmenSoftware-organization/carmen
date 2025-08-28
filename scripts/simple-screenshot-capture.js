#!/usr/bin/env node

/**
 * Simple Carmen ERP Screenshot Capture
 * 
 * Focused desktop-only screenshot capture for key application routes
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class SimpleScreenshotCapture {
  constructor() {
    this.baseUrl = 'http://localhost:3006';
    this.outputDir = 'docs/screenshots';
    
    // Key routes to capture (reduced set for initial documentation)
    this.keyRoutes = [
      '/dashboard',
      '/procurement/purchase-requests',
      '/procurement/purchase-requests/new-pr',
      '/procurement/purchase-orders',
      '/inventory-management/stock-overview',
      '/inventory-management/physical-count',
      '/vendor-management/vendors',
      '/vendor-management/vendors/new',
      '/product-management/products',
      '/operational-planning/recipe-management/recipes',
      '/store-operations/store-requisitions',
      '/system-administration/user-management'
    ];
    
    this.viewport = { width: 1920, height: 1080 };
    this.browser = null;
    this.statistics = {
      totalScreenshots: 0,
      successfulCaptures: 0,
      failures: []
    };
  }

  async captureScreenshots() {
    console.log('🚀 Starting Simple Screenshot Capture...');
    console.log(`📊 Target: ${this.keyRoutes.length} key routes (desktop only)`);
    
    try {
      await this.setupEnvironment();
      await this.initializeBrowser();
      await this.captureAllRoutes();
      
      console.log('✅ Screenshot capture completed!');
      this.printStatistics();
      
    } catch (error) {
      console.error('❌ Screenshot capture failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  async setupEnvironment() {
    console.log('📁 Setting up output directory...');
    await fs.mkdir(this.outputDir, { recursive: true });
  }

  async initializeBrowser() {
    console.log('🌐 Launching browser...');
    
    this.browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
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
    
    console.log('✅ Browser launched');
  }

  async captureAllRoutes() {
    console.log('📸 Starting route capture...');
    
    for (let i = 0; i < this.keyRoutes.length; i++) {
      const route = this.keyRoutes[i];
      console.log(`📍 Capturing: ${route} (${i + 1}/${this.keyRoutes.length})`);
      
      try {
        await this.captureRoute(route);
        this.statistics.successfulCaptures++;
      } catch (error) {
        console.error(`❌ Failed to capture ${route}:`, error.message);
        this.statistics.failures.push({ route, error: error.message });
      }
    }
  }

  async captureRoute(route) {
    const page = await this.browser.newPage();
    
    try {
      // Set viewport
      await page.setViewport(this.viewport);
      
      // Disable animations
      await page.evaluateOnNewDocument(() => {
        const css = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
        `;
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      });
      
      // Navigate to route
      const url = `${this.baseUrl}${route}`;
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Create filename
      const filename = this.createFilename(route);
      const filepath = path.join(this.outputDir, `${filename}.png`);
      
      // Capture screenshot
      await page.screenshot({
        path: filepath,
        fullPage: true,
        type: 'png'
      });
      
      this.statistics.totalScreenshots++;
      console.log(`  ✅ Saved: ${filename}.png`);
      
    } finally {
      await page.close();
    }
  }

  createFilename(route) {
    return route
      .replace(/^\//, '')
      .replace(/\//g, '-')
      .replace(/\[.*?\]/g, 'dynamic')
      .toLowerCase() || 'home';
  }

  printStatistics() {
    console.log('\n📊 Capture Statistics:');
    console.log(`├── Total Screenshots: ${this.statistics.totalScreenshots}`);
    console.log(`├── Successful Captures: ${this.statistics.successfulCaptures}`);
    console.log(`├── Failures: ${this.statistics.failures.length}`);
    console.log(`└── Output Directory: ${this.outputDir}/`);
    
    if (this.statistics.failures.length > 0) {
      console.log('\n❌ Failed routes:');
      this.statistics.failures.forEach(failure => {
        console.log(`   • ${failure.route}: ${failure.error}`);
      });
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const capture = new SimpleScreenshotCapture();
  
  capture.captureScreenshots()
    .then(() => {
      console.log('🎉 Screenshot capture finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Screenshot capture failed:', error);
      process.exit(1);
    });
}

module.exports = { SimpleScreenshotCapture };