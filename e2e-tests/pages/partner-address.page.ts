import { expect, Page, Locator } from '@playwright/test';
import { ToastWidget } from './toast.widget';

/**
 * Page Object for Partner Address Management
 * Encapsulates all interactions with the Partner Addresses page
 */
export class PartnerAddressPage {
  private toast: ToastWidget;

  readonly page: Page;

  // Low-level element locators
  readonly addAddressButton: Locator;
  readonly backButton: Locator;
  readonly addressAutocomplete: Locator;
  readonly addressTypeSelect: Locator;
  readonly isPrimaryCheckbox: Locator;
  readonly addAddressSubmitButton: Locator;
  readonly cancelButton: Locator;
  readonly loadingIndicator: Locator;
  readonly errorBox: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = new ToastWidget(page);
    
    // Initialize locators
    this.addAddressButton = page.getByRole('button', { name: /Add Address/i });
    this.backButton = page.locator('button.back-button');
    this.addressAutocomplete = page.locator('#addressAutocomplete');
    this.addressTypeSelect = page.locator('#addressType');
    this.isPrimaryCheckbox = page.locator('label:has-text("Primary Address") input[type="checkbox"]');
    this.addAddressSubmitButton = page.locator('.form-actions button.btn-primary');
    this.cancelButton = page.locator('.form-actions button.btn-secondary');
    this.loadingIndicator = page.locator('.loading');
    this.errorBox = page.locator('.error');
  }

  // Low-level element getters
  getAddressTile(addressText: string): Locator {
    return this.page.locator('.address-tile', { hasText: addressText });
  }

  getAddressRemoveButton(addressText: string): Locator {
    return this.getAddressTile(addressText).locator('button.btn-danger');
  }

  getAllAddressTiles(): Locator {
    return this.page.locator('.address-tile');
  }

  // High-level actions
  
  /**
   * Waits for the page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 }).catch(() => {});
  }

  /**
   * Opens the add address form
   */
  async openAddAddressForm() {
    console.log('Opening add address form...');
    await expect(this.addAddressButton).toBeVisible({ timeout: 10000 });
    await this.addAddressButton.click();
    await expect(this.addressAutocomplete).toBeVisible({ timeout: 5000 });
  }

  /**
   * Closes the add address form
   */
  async closeAddAddressForm() {
    console.log('Closing add address form...');
    await this.cancelButton.click();
    await expect(this.addressAutocomplete).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Adds an address to the partner
   * @param searchTerm - Search term to find the address (e.g., street line 1)
   * @param addressType - Type of address (BILLING or SHIPPING)
   * @param isPrimary - Whether this is the primary address
   */
  async addAddress(searchTerm: string, addressType: 'BILLING' | 'SHIPPING' = 'BILLING', isPrimary: boolean = false) {
    console.log(`Adding address with search term: ${searchTerm}...`);
    
    await this.openAddAddressForm();
    
    // Search for the address using autocomplete
    const addressInput = this.addressAutocomplete.locator('input.autocomplete-input');
    await addressInput.click();
    await addressInput.fill(searchTerm);
    
    // Wait for autocomplete dropdown to appear
    await this.page.waitForTimeout(1000);
    
    // Wait for dropdown items to be visible
    const dropdown = this.addressAutocomplete.locator('.dropdown');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    
    const dropdownItems = this.addressAutocomplete.locator('.dropdown-item')
      .filter({ hasNot: this.page.locator('.loading') })
      .filter({ hasNot: this.page.locator('.no-results') })
      .filter({ hasNot: this.page.locator('.hint') });
    
    await expect(dropdownItems.first()).toBeVisible({ timeout: 5000 });
    
    // Click the first option directly (use mousedown as per autocomplete component)
    await dropdownItems.first().dispatchEvent('mousedown');
    
    // Wait a bit for the selection to register
    await this.page.waitForTimeout(200);
    
    // Press Escape to close the dropdown
    await this.page.keyboard.press('Escape');
    
    // Wait for dropdown to close
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    
    // Verify address was selected
    const selectedValue = await addressInput.inputValue();
    console.log(`Address input value after selection: "${selectedValue}"`);
    
    // Set address type
    await this.addressTypeSelect.selectOption(addressType);
    
    // Set primary checkbox
    if (isPrimary) {
      const isChecked = await this.isPrimaryCheckbox.isChecked();
      if (!isChecked) {
        await this.isPrimaryCheckbox.check();
      }
    } else {
      const isChecked = await this.isPrimaryCheckbox.isChecked();
      if (isChecked) {
        await this.isPrimaryCheckbox.uncheck();
      }
    }
    
    // Submit the form
    console.log('Submitting add address form...');
    await this.addAddressSubmitButton.click();
    
    // Wait for success toast
    const toast = this.toast.getSuccessToast();
    await expect(toast).toBeVisible({ timeout: 10000 });
    console.log('Success toast appeared');
    
    // Wait for form to close (indicates success)
    await expect(this.addressAutocomplete).not.toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Form did not close, but toast appeared so continuing');
    });
    
    console.log('Address added successfully');
  }

  /**
   * Removes an address from the partner
   * @param addressText - Text to identify the address (e.g., street line 1)
   */
  async removeAddress(addressText: string) {
    console.log(`Removing address: ${addressText}...`);
    
    const removeButton = this.getAddressRemoveButton(addressText);
    await expect(removeButton).toBeVisible({ timeout: 5000 });
    await removeButton.click();
    
    // Wait for the address to disappear
    await expect(this.getAddressTile(addressText)).not.toBeVisible({ timeout: 5000 });
    
    console.log('Address removed successfully');
  }

  /**
   * Gets the count of addresses assigned to the partner
   */
  async getAddressCount(): Promise<number> {
    const tiles = this.getAllAddressTiles();
    return await tiles.count();
  }

  /**
   * Checks if an address is assigned to the partner
   */
  async addressExists(addressText: string): Promise<boolean> {
    const tile = this.getAddressTile(addressText);
    return await tile.isVisible().catch(() => false);
  }

  /**
   * Navigates back to the partners page
   */
  async goBack() {
    console.log('Going back to partners page...');
    await this.backButton.click();
    await this.page.waitForURL('**/partners', { timeout: 5000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigates to address management via the link in the form
   */
  async goToAddressManagement() {
    const link = this.page.locator('button.btn-link', { hasText: /Create a new address/i });
    await expect(link).toBeVisible({ timeout: 5000 });
    await link.click();
    await this.page.waitForURL('**/addresses', { timeout: 5000 });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verifies that an address has a specific type badge
   */
  async verifyAddressType(addressText: string, expectedType: 'BILLING' | 'SHIPPING') {
    console.log(`Verifying address type: ${addressText} should be ${expectedType}`);
    
    const tile = this.getAddressTile(addressText);
    await expect(tile).toBeVisible({ timeout: 5000 });
    
    const typeBadge = tile.locator('.badge.type');
    await expect(typeBadge).toBeVisible({ timeout: 5000 });
    
    const badgeText = await typeBadge.textContent();
    expect(badgeText?.trim()).toBe(expectedType);
    
    console.log(`✓ Address type verified: ${expectedType}`);
  }

  /**
   * Verifies that an address is marked as primary
   */
  async verifyAddressIsPrimary(addressText: string, shouldBePrimary: boolean = true) {
    console.log(`Verifying address primary status: ${addressText} should be ${shouldBePrimary ? 'PRIMARY' : 'SECONDARY'}`);
    
    const tile = this.getAddressTile(addressText);
    await expect(tile).toBeVisible({ timeout: 5000 });
    
    const primaryBadge = tile.locator('.badge.primary');
    
    if (shouldBePrimary) {
      await expect(primaryBadge).toBeVisible({ timeout: 5000 });
      const badgeText = await primaryBadge.textContent();
      expect(badgeText?.trim()).toBe('PRIMARY');
    } else {
      // Check for SECONDARY badge or no primary badge
      const allBadges = tile.locator('.badge');
      const count = await allBadges.count();
      let foundPrimary = false;
      
      for (let i = 0; i < count; i++) {
        const badge = allBadges.nth(i);
        const text = await badge.textContent();
        if (text?.trim() === 'PRIMARY') {
          foundPrimary = true;
          break;
        }
      }
      
      expect(foundPrimary).toBe(false);
    }
    
    console.log(`✓ Address primary status verified`);
  }

  /**
   * Gets the page title
   */
  async getPageTitle(): Promise<string> {
    const title = this.page.locator('h2');
    await expect(title).toBeVisible({ timeout: 5000 });
    return await title.textContent() || '';
  }
}
