const { defineConfig, devices } = require('@playwright/test');

/**
 * Carmen ERP Screenshot Configuration
 * Enhanced setup for comprehensive UI documentation with modal capture
 */
module.exports = defineConfig({
  testDir: './scripts',
  fullyParallel: false, // Sequential execution for consistent screenshots
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker for consistent screenshots
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Enhanced screenshot settings
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'desktop-chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'desktop-firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro'],
        viewport: { width: 1366, height: 768 },
      },
    },
    {
      name: 'mobile',
      use: { 
        ...devices['iPhone 14 Pro'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  // Screenshot-specific configuration
  expect: {
    toHaveScreenshot: {
      mode: 'css',
      animations: 'disabled',
      caret: 'hide',
    },
  },
});