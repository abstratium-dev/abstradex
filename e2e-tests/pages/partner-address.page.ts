import { expect, Page, Locator } from '@playwright/test';

/**
 * Page Object for Partner Address Management
 * Encapsulates all interactions with the Partner Addresses page
 */
export class PartnerAddressPage {
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
    
    // Initialize locators
    this.addAddressButton = page.getByRole('button', { name: /Add Address/i });
    this.backButton = page.locator('button.back-button');
    this.addressAutocomplete = page.locator('#addressAutocomplete');
    this.addressTypeSelect = page.locator('#addressType');
    this.isPrimaryCheckbox = page.locator('input[type="checkbox"]').filter({ hasText: /Primary Address/i });
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
    
    // Wait for autocomplete results
    await this.page.waitForTimeout(1000);
    
    // Select first option from autocomplete
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    
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
    await this.addAddressSubmitButton.click();
    
    // Wait for form to close (indicates success)
    await expect(this.addressAutocomplete).not.toBeVisible({ timeout: 5000 });
    
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
}
