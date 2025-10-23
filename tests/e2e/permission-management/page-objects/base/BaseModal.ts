import { Page } from 'playwright';
import { BasePage } from './BasePage';
import { testSelectors } from '../../config/test.config';

export abstract class BaseModal extends BasePage {
  protected modalSelector: string;
  protected closeButtonSelector: string;

  constructor(page: Page, modalSelector: string) {
    super(page);
    this.modalSelector = modalSelector;
    this.closeButtonSelector = testSelectors.modalClose;
  }

  // Modal lifecycle methods
  async waitForModal(timeout: number = 10000): Promise<void> {
    await this.page.waitForSelector(this.modalSelector, { 
      state: 'visible',
      timeout 
    });
    
    // Wait for modal animation to complete
    await this.page.waitForTimeout(300);
  }

  async waitForModalClosed(timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector(this.modalSelector, { 
      state: 'hidden',
      timeout 
    });
  }

  async isModalOpen(): Promise<boolean> {
    return await this.isElementVisible(this.modalSelector);
  }

  // Modal interaction methods
  async closeModal(): Promise<void> {
    await this.clickElement(this.closeButtonSelector);
    await this.waitForModalClosed();
  }

  async clickOutsideModal(): Promise<void> {
    // Click on the modal backdrop/overlay to close
    const backdrop = this.page.locator('[data-testid="modal-backdrop"]');
    if (await backdrop.isVisible()) {
      await backdrop.click();
      await this.waitForModalClosed();
    } else {
      // Fallback: click at the edge of the modal
      const modalBounds = await this.page.locator(this.modalSelector).boundingBox();
      if (modalBounds) {
        await this.page.mouse.click(
          modalBounds.x - 10,
          modalBounds.y + modalBounds.height / 2
        );
        await this.waitForModalClosed();
      }
    }
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.waitForModalClosed();
  }

  async confirmModal(): Promise<void> {
    const confirmButton = testSelectors.modalConfirm;
    await this.clickElement(confirmButton);
  }

  async cancelModal(): Promise<void> {
    const cancelButton = testSelectors.modalCancel;
    await this.clickElement(cancelButton);
    await this.waitForModalClosed();
  }

  // Modal content methods
  async getModalTitle(): Promise<string> {
    const titleSelector = `${this.modalSelector} [data-testid="modal-title"]`;
    return await this.getText(titleSelector);
  }

  async getModalContent(): Promise<string> {
    const contentSelector = `${this.modalSelector} [data-testid="modal-content"]`;
    return await this.getText(contentSelector);
  }

  async expectModalTitle(expectedTitle: string): Promise<void> {
    const titleSelector = `${this.modalSelector} [data-testid="modal-title"]`;
    await this.expectText(titleSelector, expectedTitle);
  }

  async expectModalContent(expectedContent: string): Promise<void> {
    const contentSelector = `${this.modalSelector} [data-testid="modal-content"]`;
    await this.expectText(contentSelector, expectedContent);
  }

  // Form interaction within modal
  async fillModalField(fieldName: string, value: string): Promise<void> {
    const fieldSelector = `${this.modalSelector} [data-testid="${fieldName}"]`;
    await this.fillField(fieldSelector, value);
  }

  async getModalFieldValue(fieldName: string): Promise<string> {
    const fieldSelector = `${this.modalSelector} [data-testid="${fieldName}"]`;
    return await this.getValue(fieldSelector);
  }

  async selectModalOption(fieldName: string, value: string): Promise<void> {
    const fieldSelector = `${this.modalSelector} [data-testid="${fieldName}"]`;
    await this.selectOption(fieldSelector, value);
  }

  async checkModalCheckbox(fieldName: string, checked: boolean = true): Promise<void> {
    const fieldSelector = `${this.modalSelector} [data-testid="${fieldName}"]`;
    await this.selectCheckbox(fieldSelector, checked);
  }

  // Modal button interactions
  async clickModalButton(buttonTestId: string): Promise<void> {
    const buttonSelector = `${this.modalSelector} [data-testid="${buttonTestId}"]`;
    await this.clickElement(buttonSelector);
  }

  async isModalButtonEnabled(buttonTestId: string): Promise<boolean> {
    const buttonSelector = `${this.modalSelector} [data-testid="${buttonTestId}"]`;
    return await this.isElementEnabled(buttonSelector);
  }

  async isModalButtonVisible(buttonTestId: string): Promise<boolean> {
    const buttonSelector = `${this.modalSelector} [data-testid="${buttonTestId}"]`;
    return await this.isElementVisible(buttonSelector);
  }

  // Modal validation methods
  async validateModalStructure(): Promise<boolean> {
    try {
      // Check if modal container exists
      await this.expectElementVisible(this.modalSelector);
      
      // Check for close button
      const hasCloseButton = await this.isElementVisible(this.closeButtonSelector);
      
      // Check for modal content area
      const contentSelector = `${this.modalSelector} [data-testid="modal-content"]`;
      const hasContent = await this.isElementVisible(contentSelector);
      
      return hasCloseButton && hasContent;
    } catch (error) {
      console.error('Modal structure validation failed:', error);
      return false;
    }
  }

  // Error handling for modals
  async expectModalError(expectedError: string): Promise<void> {
    const errorSelector = `${this.modalSelector} [data-testid="modal-error"]`;
    await this.expectElementVisible(errorSelector);
    await this.expectText(errorSelector, expectedError);
  }

  async expectModalSuccess(expectedMessage: string): Promise<void> {
    const successSelector = `${this.modalSelector} [data-testid="modal-success"]`;
    await this.expectElementVisible(successSelector);
    await this.expectText(successSelector, expectedMessage);
  }

  async expectModalLoading(): Promise<void> {
    const loadingSelector = `${this.modalSelector} [data-testid="modal-loading"]`;
    await this.expectElementVisible(loadingSelector);
  }

  // Modal accessibility testing
  async testModalAccessibility(): Promise<boolean> {
    try {
      // Check if modal has proper ARIA attributes
      const modal = this.page.locator(this.modalSelector);
      
      const role = await modal.getAttribute('role');
      const ariaModal = await modal.getAttribute('aria-modal');
      const ariaLabelledBy = await modal.getAttribute('aria-labelledby');
      
      const hasProperRole = role === 'dialog' || role === 'alertdialog';
      const hasAriaModal = ariaModal === 'true';
      const hasAriaLabel = ariaLabelledBy !== null || await modal.getAttribute('aria-label') !== null;
      
      // Test focus trapping
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.evaluate(() => {
        const activeElement = document.activeElement;
        const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
        return modal?.contains(activeElement) ?? false;
      });

      return hasProperRole && hasAriaModal && hasAriaLabel && focusedElement;
    } catch (error) {
      console.error('Modal accessibility test failed:', error);
      return false;
    }
  }

  // Modal keyboard navigation testing
  async testModalKeyboardNavigation(): Promise<boolean> {
    try {
      // Test Tab navigation within modal
      await this.page.keyboard.press('Tab');
      
      // Test Escape key to close modal
      await this.page.keyboard.press('Escape');
      
      const isClosed = !(await this.isModalOpen());
      
      if (isClosed) {
        // Reopen modal for further testing if needed
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Modal keyboard navigation test failed:', error);
      return false;
    }
  }

  // Performance testing
  async measureModalOpenTime(): Promise<number> {
    const startTime = Date.now();
    await this.waitForModal();
    const endTime = Date.now();
    return endTime - startTime;
  }

  async measureModalCloseTime(): Promise<number> {
    const startTime = Date.now();
    await this.closeModal();
    const endTime = Date.now();
    return endTime - startTime;
  }

  // Utility methods for modal testing
  async takeModalScreenshot(name: string): Promise<string> {
    return await this.takeElementScreenshot(this.modalSelector, `modal-${name}`);
  }

  async getModalBounds(): Promise<{ x: number; y: number; width: number; height: number } | null> {
    return await this.page.locator(this.modalSelector).boundingBox();
  }

  async isModalCentered(): Promise<boolean> {
    const modalBounds = await this.getModalBounds();
    if (!modalBounds) return false;
    
    const viewportSize = this.page.viewportSize();
    if (!viewportSize) return false;
    
    const modalCenterX = modalBounds.x + modalBounds.width / 2;
    const modalCenterY = modalBounds.y + modalBounds.height / 2;
    const viewportCenterX = viewportSize.width / 2;
    const viewportCenterY = viewportSize.height / 2;
    
    // Allow for some tolerance in centering (20px)
    const tolerance = 20;
    const isCenteredX = Math.abs(modalCenterX - viewportCenterX) <= tolerance;
    const isCenteredY = Math.abs(modalCenterY - viewportCenterY) <= tolerance;
    
    return isCenteredX && isCenteredY;
  }
}