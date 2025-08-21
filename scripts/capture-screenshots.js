const { test, expect } = require('@playwright/test');
const fs = require('fs').promises;
const path = require('path');

/**
 * Carmen ERP Advanced Screenshot Automation
 * Captures comprehensive UI states including modals, dialogs, and interactive elements
 */

// Screen configuration mapping with modal interactions
const SCREEN_CONFIG = {
  // Dashboard
  dashboard: {
    url: '/dashboard',
    name: 'dashboard',
    modals: ['settings-modal', 'notification-modal'],
    states: ['default', 'loading', 'error']
  },

  // Procurement Module
  'purchase-requests': {
    url: '/procurement/purchase-requests',
    name: 'purchase-requests-list',
    modals: ['create-pr-modal', 'filter-modal', 'bulk-actions-modal'],
    states: ['default', 'empty', 'loading']
  },
  'purchase-request-detail': {
    url: '/procurement/purchase-requests/PR-2024-001',
    name: 'purchase-request-detail',
    modals: ['item-details-modal', 'vendor-comparison-modal', 'approval-modal', 'comment-modal'],
    states: ['default', 'editing', 'approved', 'rejected']
  },
  'purchase-orders': {
    url: '/procurement/purchase-orders',
    name: 'purchase-orders-list',
    modals: ['create-po-modal', 'filter-modal'],
    states: ['default', 'empty']
  },
  'purchase-order-detail': {
    url: '/procurement/purchase-orders/PO-2024-001',
    name: 'purchase-order-detail',
    modals: ['item-details-modal', 'receipt-modal', 'comment-modal'],
    states: ['default', 'editing', 'received']
  },
  'goods-received-note': {
    url: '/procurement/goods-received-note',
    name: 'goods-received-note-list',
    modals: ['create-grn-modal', 'filter-modal'],
    states: ['default', 'empty']
  },
  'goods-received-note-detail': {
    url: '/procurement/goods-received-note/GRN-2024-001',
    name: 'goods-received-note-detail',
    modals: ['item-details-modal', 'discrepancy-modal', 'comment-modal'],
    states: ['default', 'editing', 'completed']
  },

  // Vendor Management Module
  'vendor-management': {
    url: '/vendor-management/manage-vendors',
    name: 'vendor-list',
    modals: ['create-vendor-modal', 'import-modal'],
    states: ['default', 'empty']
  },
  'vendor-detail': {
    url: '/vendor-management/manage-vendors/VENDOR-001',
    name: 'vendor-detail',
    modals: ['edit-vendor-modal', 'price-list-modal', 'contact-modal'],
    states: ['default', 'editing']
  },
  'vendor-pricelists': {
    url: '/vendor-management/pricelists',
    name: 'vendor-pricelists',
    modals: ['upload-pricelist-modal', 'edit-price-modal'],
    states: ['default', 'empty']
  },

  // Inventory Management Module
  'inventory-overview': {
    url: '/inventory-management/stock-overview',
    name: 'inventory-overview',
    modals: ['adjustment-modal', 'filter-modal'],
    states: ['default', 'low-stock', 'out-of-stock']
  },
  'inventory-adjustments': {
    url: '/inventory-management/inventory-adjustments',
    name: 'inventory-adjustments',
    modals: ['create-adjustment-modal', 'approval-modal'],
    states: ['default', 'pending-approval']
  },

  // Store Operations Module
  'store-requisitions': {
    url: '/store-operations/store-requisitions',
    name: 'store-requisitions-list',
    modals: ['create-requisition-modal', 'approval-modal'],
    states: ['default', 'pending-approval']
  },
  'store-requisition-detail': {
    url: '/store-operations/store-requisitions/SR-2024-001',
    name: 'store-requisition-detail',
    modals: ['item-details-modal', 'approval-log-modal'],
    states: ['default', 'editing', 'approved']
  },

  // System Administration Module
  'pos-integration': {
    url: '/system-administration/system-integrations/pos',
    name: 'pos-integration-dashboard',
    modals: ['settings-modal', 'mapping-modal', 'sync-status-modal'],
    states: ['default', 'connected', 'disconnected', 'syncing']
  },
  'pos-mapping': {
    url: '/system-administration/system-integrations/pos/mapping/recipes',
    name: 'pos-recipe-mapping',
    modals: ['create-mapping-modal', 'fractional-sales-modal', 'validation-modal'],
    states: ['default', 'editing', 'validation-error']
  },

  // Help & Support Module
  'help-support': {
    url: '/help-support',
    name: 'help-support-main',
    modals: ['search-modal', 'feedback-modal'],
    states: ['default']
  },
  'user-manuals': {
    url: '/help-support/user-manuals',
    name: 'user-manuals',
    modals: ['search-modal', 'download-modal'],
    states: ['default']
  },
  'video-tutorials': {
    url: '/help-support/video-tutorials',
    name: 'video-tutorials',
    modals: ['video-player-modal', 'playlist-modal'],
    states: ['default', 'playing']
  },
  'faqs': {
    url: '/help-support/faqs',
    name: 'faqs',
    modals: ['search-modal', 'feedback-modal'],
    states: ['default']
  },
  'support-tickets': {
    url: '/help-support/support-ticket-system',
    name: 'support-ticket-system',
    modals: ['create-ticket-modal', 'ticket-detail-modal'],
    states: ['default', 'empty']
  }
};

// Modal interaction selectors and triggers
const MODAL_TRIGGERS = {
  'create-pr-modal': { selector: '[data-testid="create-pr-button"]', wait: 1000 },
  'filter-modal': { selector: '[data-testid="filter-button"]', wait: 800 },
  'item-details-modal': { selector: '[data-testid="item-details-button"]:first-child', wait: 1200 },
  'vendor-comparison-modal': { selector: '[data-testid="vendor-comparison-button"]', wait: 1000 },
  'approval-modal': { selector: '[data-testid="approve-button"]', wait: 800 },
  'comment-modal': { selector: '[data-testid="add-comment-button"]', wait: 600 },
  'settings-modal': { selector: '[data-testid="settings-button"]', wait: 800 },
  'notification-modal': { selector: '[data-testid="notifications-button"]', wait: 600 },
  'bulk-actions-modal': { selector: '[data-testid="bulk-actions-button"]', wait: 800 },
  'create-po-modal': { selector: '[data-testid="create-po-button"]', wait: 1000 },
  'receipt-modal': { selector: '[data-testid="receipt-button"]', wait: 800 },
  'create-grn-modal': { selector: '[data-testid="create-grn-button"]', wait: 1000 },
  'discrepancy-modal': { selector: '[data-testid="discrepancy-button"]', wait: 800 },
  'create-vendor-modal': { selector: '[data-testid="create-vendor-button"]', wait: 1000 },
  'import-modal': { selector: '[data-testid="import-button"]', wait: 800 },
  'edit-vendor-modal': { selector: '[data-testid="edit-vendor-button"]', wait: 800 },
  'price-list-modal': { selector: '[data-testid="price-list-button"]', wait: 1000 },
  'contact-modal': { selector: '[data-testid="add-contact-button"]', wait: 800 },
  'upload-pricelist-modal': { selector: '[data-testid="upload-pricelist-button"]', wait: 1000 },
  'edit-price-modal': { selector: '[data-testid="edit-price-button"]:first-child', wait: 800 },
  'adjustment-modal': { selector: '[data-testid="create-adjustment-button"]', wait: 1000 },
  'create-adjustment-modal': { selector: '[data-testid="new-adjustment-button"]', wait: 1000 },
  'create-requisition-modal': { selector: '[data-testid="create-requisition-button"]', wait: 1000 },
  'approval-log-modal': { selector: '[data-testid="approval-log-button"]', wait: 800 },
  'mapping-modal': { selector: '[data-testid="mapping-button"]', wait: 1000 },
  'sync-status-modal': { selector: '[data-testid="sync-status-button"]', wait: 800 },
  'create-mapping-modal': { selector: '[data-testid="create-mapping-button"]', wait: 1000 },
  'fractional-sales-modal': { selector: '[data-testid="fractional-sales-button"]', wait: 1200 },
  'validation-modal': { selector: '[data-testid="validate-mapping-button"]', wait: 800 },
  'search-modal': { selector: '[data-testid="search-button"]', wait: 600 },
  'feedback-modal': { selector: '[data-testid="feedback-button"]', wait: 800 },
  'download-modal': { selector: '[data-testid="download-button"]', wait: 600 },
  'video-player-modal': { selector: '[data-testid="play-video-button"]:first-child', wait: 1000 },
  'playlist-modal': { selector: '[data-testid="playlist-button"]', wait: 800 },
  'create-ticket-modal': { selector: '[data-testid="create-ticket-button"]', wait: 1000 },
  'ticket-detail-modal': { selector: '[data-testid="ticket-row"]:first-child', wait: 800 }
};

// Screenshot directory structure
const SCREENSHOT_BASE_DIR = './docs/prd/output/screens/images';

// Utility functions
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Additional wait for dynamic content
}

async function captureScreenshot(page, filepath, options = {}) {
  await ensureDirectoryExists(path.dirname(filepath));
  
  // Hide scrollbars and other UI artifacts
  await page.addStyleTag({
    content: `
      * { scrollbar-width: none !important; }
      *::-webkit-scrollbar { display: none !important; }
      .loading-spinner { display: none !important; }
    `
  });

  await page.screenshot({
    path: filepath,
    fullPage: options.fullPage || false,
    clip: options.clip,
    animations: 'disabled',
    ...options
  });

  console.log(`✓ Screenshot saved: ${filepath}`);
}

async function triggerModal(page, modalType) {
  const trigger = MODAL_TRIGGERS[modalType];
  if (!trigger) {
    console.log(`⚠ No trigger defined for modal: ${modalType}`);
    return false;
  }

  try {
    // Wait for trigger element to be available
    await page.waitForSelector(trigger.selector, { timeout: 5000, state: 'visible' });
    
    // Click to open modal
    await page.click(trigger.selector);
    
    // Wait for modal to open
    await page.waitForTimeout(trigger.wait);
    
    // Wait for modal content to load
    await page.waitForSelector('[role="dialog"], .modal, .dialog', { timeout: 3000, state: 'visible' });
    
    return true;
  } catch (error) {
    console.log(`⚠ Could not trigger modal ${modalType}: ${error.message}`);
    return false;
  }
}

async function closeModal(page) {
  try {
    // Try various modal close methods
    const closeMethods = [
      '[data-testid="close-modal"]',
      '[aria-label="Close"]',
      '.modal-close',
      '[role="button"][aria-label*="close" i]',
      'button:has-text("Close")',
      'button:has-text("Cancel")'
    ];

    for (const selector of closeMethods) {
      try {
        const element = await page.$(selector);
        if (element && await element.isVisible()) {
          await element.click();
          await page.waitForTimeout(500);
          return true;
        }
      } catch (e) {
        // Continue to next method
      }
    }

    // Fallback: Press Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    return true;
  } catch (error) {
    console.log(`⚠ Could not close modal: ${error.message}`);
    return false;
  }
}

// Main screenshot capture function
async function captureScreenshotSuite(page, screenKey, config) {
  const { url, name, modals = [], states = ['default'] } = config;
  const screenDir = path.join(SCREENSHOT_BASE_DIR, name);
  
  console.log(`\n📸 Capturing screenshots for: ${name}`);
  console.log(`   URL: ${url}`);
  
  try {
    // Navigate to the screen
    await page.goto(url, { waitUntil: 'networkidle' });
    await waitForPageLoad(page);

    // Capture base state screenshots
    for (const state of states) {
      const stateFilename = `${name}-${state}.png`;
      const stateFilepath = path.join(screenDir, stateFilename);
      
      // Apply state-specific modifications if needed
      if (state === 'loading') {
        // Trigger loading state (this would need custom implementation per screen)
        await page.evaluate(() => {
          // Add loading spinner or state
          document.body.setAttribute('data-loading', 'true');
        });
      } else if (state === 'error') {
        // Trigger error state
        await page.evaluate(() => {
          document.body.setAttribute('data-error', 'true');
        });
      }
      
      await captureScreenshot(page, stateFilepath, { fullPage: true });
    }

    // Capture modal screenshots
    for (const modalType of modals) {
      console.log(`   📱 Capturing modal: ${modalType}`);
      
      // Navigate back to base page if needed
      await page.goto(url, { waitUntil: 'networkidle' });
      await waitForPageLoad(page);
      
      const modalTriggered = await triggerModal(page, modalType);
      
      if (modalTriggered) {
        const modalFilename = `${name}-${modalType}.png`;
        const modalFilepath = path.join(screenDir, modalFilename);
        
        await captureScreenshot(page, modalFilepath);
        await closeModal(page);
        
        // Wait for modal to close
        await page.waitForTimeout(1000);
      }
    }

  } catch (error) {
    console.error(`❌ Error capturing screenshots for ${name}: ${error.message}`);
  }
}

// Test suites for different viewport sizes
test.describe('Carmen ERP Screenshot Capture', () => {
  test('Capture Desktop Screenshots', async ({ page, browserName }) => {
    if (browserName !== 'chromium') return; // Only run on Chrome for consistency
    
    // Set viewport for desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    console.log('🚀 Starting desktop screenshot capture...');
    
    // Capture screenshots for all configured screens
    for (const [screenKey, config] of Object.entries(SCREEN_CONFIG)) {
      await captureScreenshotSuite(page, screenKey, config);
    }
    
    console.log('✅ Desktop screenshot capture completed');
  });

  test('Capture Tablet Screenshots', async ({ page, browserName }) => {
    if (browserName !== 'chromium') return;
    
    // Set viewport for tablet
    await page.setViewportSize({ width: 1366, height: 768 });
    
    console.log('📱 Starting tablet screenshot capture...');
    
    // Capture key screens for tablet view (subset for space efficiency)
    const tabletScreens = [
      'dashboard',
      'purchase-requests',
      'purchase-request-detail',
      'vendor-management',
      'inventory-overview',
      'pos-integration'
    ];
    
    for (const screenKey of tabletScreens) {
      if (SCREEN_CONFIG[screenKey]) {
        const config = { ...SCREEN_CONFIG[screenKey] };
        config.name = `${config.name}-tablet`;
        await captureScreenshotSuite(page, screenKey, config);
      }
    }
    
    console.log('✅ Tablet screenshot capture completed');
  });

  test('Capture Mobile Screenshots', async ({ page, browserName }) => {
    if (browserName !== 'chromium') return;
    
    // Set viewport for mobile
    await page.setViewportSize({ width: 390, height: 844 });
    
    console.log('📱 Starting mobile screenshot capture...');
    
    // Capture essential screens for mobile view
    const mobileScreens = [
      'dashboard',
      'purchase-requests',
      'vendor-management',
      'help-support'
    ];
    
    for (const screenKey of mobileScreens) {
      if (SCREEN_CONFIG[screenKey]) {
        const config = { ...SCREEN_CONFIG[screenKey] };
        config.name = `${config.name}-mobile`;
        // Reduce modals for mobile to save space
        config.modals = config.modals.slice(0, 2);
        await captureScreenshotSuite(page, screenKey, config);
      }
    }
    
    console.log('✅ Mobile screenshot capture completed');
  });
});

// Export for direct usage
module.exports = {
  SCREEN_CONFIG,
  MODAL_TRIGGERS,
  captureScreenshotSuite,
  captureScreenshot
};