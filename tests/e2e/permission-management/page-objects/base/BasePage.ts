import { Page, Locator } from 'playwright';
import { expect } from '@playwright/test';
import { testConfig, testSelectors } from '../../config/test.config';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;
  
  constructor(page: Page) {
    this.page = page;
    this.baseUrl = testConfig.baseUrl;
  }

  // Core navigation methods
  async navigate(path: string = ''): Promise<void> {
    const fullUrl = `${this.baseUrl}${path}`;
    console.log(`Navigating to: ${fullUrl}`);
    
    await this.page.goto(fullUrl, { 
      waitUntil: 'networkidle',
      timeout: testConfig.pageLoadTimeout 
    });
    
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    // Wait for DOM content to be loaded
    await this.page.waitForLoadState('domcontentloaded');
    
    // Wait for page loaded indicator (if exists)
    try {
      await this.page.waitForSelector(testSelectors.pageLoaded, { 
        timeout: 5000,
        state: 'attached'
      });
    } catch (error) {
      // Page loaded indicator not found, continue with basic checks
      console.log('Page loaded indicator not found, checking for basic page elements');
    }
    
    // Wait for any loading spinners to disappear
    await this.waitForLoadingComplete();
  }

  async waitForLoadingComplete(): Promise<void> {
    try {
      await this.page.waitForSelector(testSelectors.loadingSpinner, { 
        state: 'hidden', 
        timeout: 10000 
      });
    } catch (error) {
      // No loading spinner found, which is fine
    }
  }

  // Element interaction helpers
  async clickElement(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ 
      state: 'visible', 
      timeout: options?.timeout || 5000 
    });
    
    // Scroll element into view if needed
    await element.scrollIntoViewIfNeeded();
    
    if (options?.force) {
      await element.click({ force: true });
    } else {
      await element.click();
    }
  }

  async fillField(selector: string, value: string, options?: { clear?: boolean }): Promise<void> {
    const field = this.page.locator(selector);
    await field.waitFor({ state: 'visible' });
    
    if (options?.clear !== false) {
      await field.clear();
    }
    
    await field.fill(value);
    
    // Trigger change event for React components
    await field.dispatchEvent('change');
  }

  async selectOption(selector: string, value: string | number): Promise<void> {
    const select = this.page.locator(selector);
    await select.waitFor({ state: 'visible' });
    await select.selectOption(value.toString());
  }

  async selectCheckbox(selector: string, checked: boolean = true): Promise<void> {
    const checkbox = this.page.locator(selector);
    await checkbox.waitFor({ state: 'visible' });
    
    const isChecked = await checkbox.isChecked();
    if (isChecked !== checked) {
      await checkbox.click();
    }
  }

  async toggleSwitch(selector: string): Promise<void> {
    const toggle = this.page.locator(selector);
    await toggle.waitFor({ state: 'visible' });
    await toggle.click();
  }

  // Validation helpers
  async expectElementVisible(selector: string, timeout: number = 5000): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible({ timeout });
  }

  async expectElementHidden(selector: string, timeout: number = 5000): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toBeHidden({ timeout });
  }

  async expectText(selector: string, text: string | RegExp): Promise<void> {
    const element = this.page.locator(selector);
    if (typeof text === 'string') {
      await expect(element).toContainText(text);
    } else {
      await expect(element).toHaveText(text);
    }
  }

  async expectValue(selector: string, value: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toHaveValue(value);
  }

  async expectElementCount(selector: string, count: number): Promise<void> {
    const elements = this.page.locator(selector);
    await expect(elements).toHaveCount(count);
  }

  // Text and attribute helpers
  async getText(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.textContent() || '';
  }

  async getValue(selector: string): Promise<string> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.inputValue();
  }

  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    return await element.getAttribute(attribute);
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      await element.waitFor({ state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async isElementEnabled(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isEnabled();
  }

  async isElementChecked(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.isChecked();
  }

  // Wait helpers
  async waitForSelector(selector: string, options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<void> {
    await this.page.waitForSelector(selector, {
      state: options?.state || 'visible',
      timeout: options?.timeout || 5000
    });
  }

  async waitForTimeout(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  async waitForURL(url: string | RegExp, timeout: number = 10000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  // Performance monitoring
  async measurePageLoad(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measureActionTime(action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async getPageMetrics(): Promise<any> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;
      
      return {
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart : 0,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.loadEventStart : 0,
        responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
        memoryUsage: memory ? memory.usedJSHeapSize : 0,
        totalMemory: memory ? memory.totalJSHeapSize : 0
      };
    });
  }

  // Screenshot and debugging
  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = `tests/e2e/permission-management/reports/screenshots/${filename}`;
    
    await this.page.screenshot({ 
      path: filepath,
      fullPage: true 
    });
    
    return filename;
  }

  async takeElementScreenshot(selector: string, name: string): Promise<string> {
    const element = this.page.locator(selector);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-element-${timestamp}.png`;
    const filepath = `tests/e2e/permission-management/reports/screenshots/${filename}`;
    
    await element.screenshot({ path: filepath });
    
    return filename;
  }

  // Error handling
  async handleError(error: Error, context: string): Promise<void> {
    const screenshot = await this.takeScreenshot(`error-${context}`);
    const url = this.page.url();
    const consoleLogs = await this.getConsoleLogs();
    
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      screenshot,
      url,
      consoleLogs,
      timestamp: new Date().toISOString()
    };
    
    console.error('Test Error Details:', errorDetails);
    throw new Error(`${error.message}\n\nError context: ${context}\nScreenshot: ${screenshot}\nURL: ${url}`);
  }

  async getConsoleLogs(): Promise<string[]> {
    // This would need to be implemented with console message listeners
    // For now, return an empty array
    return [];
  }

  // Accessibility helpers
  async checkAccessibility(): Promise<boolean> {
    // Check for basic accessibility features
    const issues = [];
    
    // Check for alt text on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images without alt text`);
    }
    
    // Check for form labels
    const inputsWithoutLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count();
    if (inputsWithoutLabels > 0) {
      issues.push(`${inputsWithoutLabels} inputs without labels`);
    }
    
    // Check for heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    // Add heading hierarchy validation logic here
    
    if (issues.length > 0) {
      console.warn('Accessibility issues found:', issues);
      return false;
    }
    
    return true;
  }

  async testKeyboardNavigation(): Promise<boolean> {
    try {
      // Test tab navigation
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.evaluate(() => document.activeElement?.tagName);
      return focusedElement !== null;
    } catch (error) {
      console.error('Keyboard navigation test failed:', error);
      return false;
    }
  }

  // Utility methods
  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'networkidle' });
    await this.waitForPageLoad();
  }

  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }
}