import { Page, Locator, expect } from '@playwright/test';

/**
 * Toast Widget Helper
 * 
 * Provides reusable methods for interacting with toast notifications
 * across all page objects. This is a cross-cutting concern that handles
 * toast visibility, actions, and dismissal.
 */
export class ToastWidget {
  constructor(private page: Page) {}

  /**
   * Get the toast locator
   */
  getToast(): Locator {
    return this.page.locator('.toast');
  }

  /**
   * Get the toast action button locator
   */
  getToastAction(): Locator {
    return this.page.locator('.toast-action');
  }

  /**
   * Get a toast action button by partner number
   */
  getToastActionByPartnerNumber(partnerNumber: string): Locator {
    return this.page.locator(`.toast-action[data-partner-number="${partnerNumber}"]`);
  }

  /**
   * Get a success toast locator
   */
  getSuccessToast(): Locator {
    return this.page.locator('.toast.toast-success');
  }

  /**
   * Get an error toast locator
   */
  getErrorToast(): Locator {
    return this.page.locator('.toast.toast-error');
  }

  /**
   * Wait for a success toast message to appear
   */
  async waitForSuccessToast(message?: string) {
    const toast = this.getToast();
    await expect(toast).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Wait for an error toast message to appear
   */
  async waitForErrorToast(message?: string) {
    const toast = this.getToast();
    await expect(toast).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Wait for success toast with partner number action and click it to filter
   * @returns The partner number from the toast action
   */
  async waitForSuccessToastAndClickPartnerNumber(): Promise<string> {
    // Wait for the toast to appear (use first() to avoid strict mode violations)
    const toast = this.getToast().first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Wait for the action button to appear
    const actionButton = this.getToastAction().first();
    await expect(actionButton).toBeVisible({ timeout: 5000 });
    
    // Get the partner number from the button text
    const partnerNumber = await actionButton.textContent() || '';
    const trimmedPartnerNumber = partnerNumber.trim();
    
    // Click the action button to filter by partner number
    console.log(`Clicking toast action to filter by partner number: ${trimmedPartnerNumber}`);
    await actionButton.click();
    
    // Wait for the toast to close (or timeout if it doesn't)
    await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('Toast did not close in time, continuing anyway');
    });
    
    return trimmedPartnerNumber;
  }

  /**
   * Wait for success toast with address identifier and click it to filter
   * @returns The address identifier from the toast action
   */
  async waitForSuccessToastAndClickAddress(): Promise<string> {
    // Wait for the toast to appear
    const toast = this.getToast().first();
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Wait for the action button to appear
    const actionButton = this.getToastAction().first();
    await expect(actionButton).toBeVisible({ timeout: 5000 });
    
    // Get the address identifier from the button text
    const addressId = await actionButton.textContent() || '';
    const trimmedAddressId = addressId.trim();
    
    // Click the action button to filter by address
    console.log(`Clicking toast action to filter by address: ${trimmedAddressId}`);
    await actionButton.click();
    
    // Wait for the toast to close (or timeout if it doesn't)
    await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('Toast did not close in time, continuing anyway');
    });
    
    return trimmedAddressId;
  }

  /**
   * Dismiss all visible toasts by clicking their close buttons
   * This is useful when toasts might be blocking UI elements
   */
  async dismissAll() {
    try {
      const toasts = this.page.locator('.toast');
      const count = await toasts.count();
      for (let i = 0; i < count; i++) {
        const closeButton = toasts.nth(i).locator('button.btn-close');
        if (await closeButton.isVisible({ timeout: 500 })) {
          await closeButton.click({ timeout: 1000 });
        }
      }
    } catch (error) {
      // Ignore errors - toasts might have auto-dismissed
    }
  }

  /**
   * Wait for any toast to disappear
   */
  async waitForToastToDisappear() {
    const toast = this.getToast().first();
    await expect(toast).not.toBeVisible({ timeout: 10000 }).catch(() => {
      console.log('Toast did not disappear in time, continuing anyway');
    });
  }
}
