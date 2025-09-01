// Browser pool configuration for parallel test execution
export interface BrowserPoolConfig {
  [poolName: string]: PoolConfig;
}

export interface PoolConfig {
  browsers: string[];
  maxInstances: number;
  timeout: number;
  headless: boolean;
  retries: number;
  viewport?: { width: number; height: number };
  permissions?: string[];
  locale?: string;
  timezone?: string;
}

export const browserPoolConfig: BrowserPoolConfig = {
  'chrome-desktop-1': {
    browsers: ['chromium'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1368, height: 720 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'chrome-desktop-2': {
    browsers: ['chromium'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1920, height: 1080 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'firefox-desktop-1': {
    browsers: ['firefox'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1366, height: 768 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'firefox-desktop-2': {
    browsers: ['firefox'],
    maxInstances: 1,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1024, height: 768 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'safari-desktop-1': {
    browsers: ['webkit'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1440, height: 900 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'safari-desktop-2': {
    browsers: ['webkit'],
    maxInstances: 1,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 1280, height: 720 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'mobile-chrome-1': {
    browsers: ['chromium'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 375, height: 667 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  },
  
  'mobile-chrome-2': {
    browsers: ['chromium'],
    maxInstances: 2,
    timeout: 30000,
    headless: !process.env.DEBUG,
    retries: 2,
    viewport: { width: 414, height: 896 },
    permissions: ['geolocation', 'notifications'],
    locale: 'en-US',
    timezone: 'America/New_York'
  }
};

export const testAllocation = {
  // Phase 1: Independent Module Tests (Parallel - 15 minutes)
  moduleTests: {
    'toggle-tests': ['chrome-desktop-1', 'chrome-desktop-2'],
    'policy-tests': ['chrome-desktop-2', 'firefox-desktop-1', 'safari-desktop-1'],
    'role-tests': ['firefox-desktop-2', 'safari-desktop-2'],
    'subscription-tests': ['safari-desktop-2', 'mobile-chrome-1'],
    'navigation-tests': ['mobile-chrome-1', 'mobile-chrome-2']
  },
  
  // Phase 2: Integration Tests (Parallel - 18 minutes)
  integrationTests: {
    'policy-role-assignment': ['chrome-desktop-1'],
    'user-journey-e2e': ['firefox-desktop-1'],
    'permission-inheritance': ['safari-desktop-1'],
    'subscription-integration': ['chrome-desktop-2']
  },
  
  // Phase 3: Performance Tests (Sequential - 35 minutes)
  performanceTests: {
    'load-testing': ['chrome-desktop-1'],
    'stress-testing': ['firefox-desktop-1'],
    'memory-testing': ['safari-desktop-1']
  }
};

export const resourceLimits = {
  // Memory limits per pool (MB)
  memoryLimits: {
    'chrome-desktop-1': 4096,
    'chrome-desktop-2': 4096,
    'firefox-desktop-1': 3072,
    'firefox-desktop-2': 2048,
    'safari-desktop-1': 3072,
    'safari-desktop-2': 2048,
    'mobile-chrome-1': 2048,
    'mobile-chrome-2': 2048
  },
  
  // CPU limits per pool (percentage)
  cpuLimits: {
    'chrome-desktop-1': 25,
    'chrome-desktop-2': 25,
    'firefox-desktop-1': 20,
    'firefox-desktop-2': 15,
    'safari-desktop-1': 20,
    'safari-desktop-2': 15,
    'mobile-chrome-1': 15,
    'mobile-chrome-2': 15
  },
  
  // Concurrent test limits per pool
  concurrencyLimits: {
    'chrome-desktop-1': 2,
    'chrome-desktop-2': 2,
    'firefox-desktop-1': 2,
    'firefox-desktop-2': 1,
    'safari-desktop-1': 2,
    'safari-desktop-2': 1,
    'mobile-chrome-1': 2,
    'mobile-chrome-2': 2
  }
};

export default browserPoolConfig;