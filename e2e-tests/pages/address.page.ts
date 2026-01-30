import { expect, Page, Locator } from '@playwright/test';

/**
 * Page Object for Address Management
 * Encapsulates all interactions with the Addresses page
 */
export class AddressPage {
  readonly page: Page;

  // Low-level element locators
  readonly addAddressButton: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly streetLine1Input: Locator;
  readonly streetLine2Input: Locator;
  readonly cityInput: Locator;
  readonly stateProvinceInput: Locator;
  readonly postalCodeInput: Locator;
  readonly countryCodeInput: Locator;
  readonly isVerifiedCheckbox: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly loadingIndicator: Locator;
  readonly errorBox: Locator;
  readonly formErrorBox: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.addAddressButton = page.getByRole('button', { name: /Add Address/i });
    this.searchInput = page.locator('input.filter-input');
    this.clearSearchButton = page.locator('button.filter-clear-button');
    this.streetLine1Input = page.locator('#streetLine1');
    this.streetLine2Input = page.locator('#streetLine2');
    this.cityInput = page.locator('#city');
    this.stateProvinceInput = page.locator('#stateProvince');
    this.postalCodeInput = page.locator('#postalCode');
    this.countryCodeInput = page.locator('#countryCode');
    this.isVerifiedCheckbox = page.locator('input[name="isVerified"]');
    this.createButton = page.getByRole('button', { name: /Create Address/i });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.loadingIndicator = page.locator('.loading');
    this.errorBox = page.locator('.error-box');
    this.formErrorBox = page.locator('.form-container .error-box');
  }

  // Low-level navigation
  async goto() {
    await this.page.goto('/addresses');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 }).catch(() => {});
  }

  // Low-level element getters
  getAddressTile(streetLine1: string): Locator {
    return this.page.locator('address-tile .tile', { hasText: streetLine1 });
  }

  getAddressContextMenuButton(streetLine1: string): Locator {
    return this.getAddressTile(streetLine1).locator('button.btn-context-menu');
  }

  getAddressContextMenu(streetLine1: string): Locator {
    return this.getAddressTile(streetLine1).locator('.context-menu');
  }

  getAddressDeleteButton(streetLine1: string): Locator {
    return this.getAddressContextMenu(streetLine1).locator('.context-menu-item-danger');
  }

  getAllAddressTiles(): Locator {
    return this.page.locator('address-tile .tile');
  }

  getConfirmDialog(): Locator {
    return this.page.locator('.dialog-overlay');
  }

  getConfirmDialogDeleteButton(): Locator {
    return this.getConfirmDialog().getByRole('button', { name: /Delete/i });
  }

  getConfirmDialogCancelButton(): Locator {
    return this.getConfirmDialog().getByRole('button', { name: /Cancel/i });
  }

  getToast(): Locator {
    return this.page.locator('.toast');
  }

  // High-level actions
  
  /**
   * Opens the add address form
   */
  async openAddAddressForm() {
    console.log('Opening add address form...');
    await expect(this.addAddressButton).toBeVisible({ timeout: 10000 });
    await this.addAddressButton.click();
    await expect(this.streetLine1Input).toBeVisible({ timeout: 5000 });
  }

  /**
   * Closes the add address form
   */
  async closeAddAddressForm() {
    console.log('Closing add address form...');
    await this.cancelButton.click();
    await expect(this.streetLine1Input).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Creates a new address with the given details
   */
  async createAddress(address: {
    streetLine1: string;
    streetLine2?: string;
    city: string;
    stateProvince?: string;
    postalCode?: string;
    countryCode: string;
    isVerified?: boolean;
  }) {
    console.log(`Creating address: ${address.streetLine1}, ${address.city}...`);
    
    await this.openAddAddressForm();
    
    // Fill in the form
    await this.streetLine1Input.fill(address.streetLine1);
    
    if (address.streetLine2) {
      await this.streetLine2Input.fill(address.streetLine2);
    }
    
    await this.cityInput.fill(address.city);
    
    if (address.stateProvince) {
      await this.stateProvinceInput.fill(address.stateProvince);
    }
    
    if (address.postalCode) {
      await this.postalCodeInput.fill(address.postalCode);
    }
    
    // Handle country code - need to type and select from autocomplete
    const countryInput = this.countryCodeInput.locator('input.autocomplete-input');
    await countryInput.click();
    await countryInput.fill(address.countryCode);
    await this.page.waitForTimeout(500); // Wait for autocomplete
    // Select first option from autocomplete
    await this.page.keyboard.press('ArrowDown');
    await this.page.keyboard.press('Enter');
    
    // Handle verified checkbox
    if (address.isVerified !== undefined) {
      const isChecked = await this.isVerifiedCheckbox.isChecked();
      if (address.isVerified && !isChecked) {
        await this.isVerifiedCheckbox.check();
      } else if (!address.isVerified && isChecked) {
        await this.isVerifiedCheckbox.uncheck();
      }
    }
    
    // Submit the form
    await this.createButton.click();
    
    // Wait for form to close (indicates success)
    await expect(this.streetLine1Input).not.toBeVisible({ timeout: 5000 });
    
    // Wait for the address to appear in the list
    await this.searchAddresses(address.streetLine1);
    await expect(this.getAddressTile(address.streetLine1)).toBeVisible({ timeout: 5000 });
    
    console.log(`Address created successfully`);
  }

  /**
   * Deletes an address by street line 1
   */
  async deleteAddress(streetLine1: string, confirm: boolean = true) {
    console.log(`Deleting address: ${streetLine1}...`);
    
    // Open context menu
    const contextMenuButton = this.getAddressContextMenuButton(streetLine1);
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();
    
    // Wait for context menu to appear
    await expect(this.getAddressContextMenu(streetLine1)).toBeVisible({ timeout: 2000 });
    
    // Click delete button
    const deleteButton = this.getAddressDeleteButton(streetLine1);
    await expect(deleteButton).toBeVisible({ timeout: 2000 });
    await deleteButton.click();
    
    // Wait for confirmation dialog
    await expect(this.getConfirmDialog()).toBeVisible({ timeout: 5000 });
    
    if (confirm) {
      await this.getConfirmDialogDeleteButton().click();
      
      // Wait for network activity
      await this.page.waitForLoadState('networkidle');
      
      // Wait for the address to disappear
      await expect(this.getAddressTile(streetLine1)).not.toBeVisible({ timeout: 5000 });
      
      console.log(`Address deleted successfully`);
    } else {
      await this.getConfirmDialogCancelButton().click();
      
      // Confirm dialog should close
      await expect(this.getConfirmDialog()).not.toBeVisible({ timeout: 5000 });
      
      // Address should still be visible
      await expect(this.getAddressTile(streetLine1)).toBeVisible();
      
      console.log(`Address deletion cancelled`);
    }
  }

  /**
   * Searches for addresses using the search input
   */
  async searchAddresses(searchTerm: string) {
    console.log(`Searching for addresses with term: '${searchTerm}'`);
    
    await expect(this.searchInput).toBeVisible({ timeout: 5000 });
    await this.searchInput.fill(searchTerm);
    
    // Wait a bit for debouncing
    await this.page.waitForTimeout(500);
    
    // Wait for network to be idle (search request completed)
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Clears the search input
   */
  async clearSearch() {
    console.log('Clearing search...');
    
    if (await this.clearSearchButton.isVisible()) {
      await this.clearSearchButton.click();
    } else {
      await this.searchInput.clear();
    }
    
    // Wait for network to be idle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Gets the count of visible address tiles
   */
  async getAddressCount(): Promise<number> {
    const tiles = this.getAllAddressTiles();
    return await tiles.count();
  }

  /**
   * Checks if an address exists in the list
   */
  async addressExists(streetLine1: string): Promise<boolean> {
    const tile = this.getAddressTile(streetLine1);
    return await tile.isVisible().catch(() => false);
  }

  /**
   * Deletes all visible addresses
   */
  async deleteAllAddresses() {
    console.log('Deleting all addresses...');
    
    let count = await this.getAddressCount();
    let attempts = 0;
    const maxAttempts = 10; // Safety limit
    
    while (count > 0 && attempts < maxAttempts) {
      attempts++;
      try {
        // Get the first address tile - use a fresh locator each time
        const tiles = this.getAllAddressTiles();
        const firstTile = tiles.first();
        
        // Wait for tile to be stable
        await firstTile.waitFor({ state: 'visible', timeout: 5000 });
        
        // Open context menu
        const contextMenuButton = firstTile.locator('button.btn-context-menu');
        await contextMenuButton.waitFor({ state: 'visible', timeout: 5000 });
        await contextMenuButton.click({ force: true });
        
        // Wait for context menu
        const contextMenu = firstTile.locator('.context-menu');
        await contextMenu.waitFor({ state: 'visible', timeout: 2000 });
        
        // Click delete
        const deleteButton = contextMenu.locator('.context-menu-item-danger');
        await deleteButton.waitFor({ state: 'visible', timeout: 2000 });
        await deleteButton.click();
        
        // Confirm deletion
        await expect(this.getConfirmDialog()).toBeVisible({ timeout: 5000 });
        await this.getConfirmDialogDeleteButton().click();
        
        // Wait for network activity
        await this.page.waitForLoadState('networkidle');
        
        // Update count
        count = await this.getAddressCount();
      } catch (error) {
        // If element was detached or other error, just retry with updated count
        console.log(`Error during deletion (attempt ${attempts}), retrying...`);
        count = await this.getAddressCount();
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log(`⚠ Stopped after ${maxAttempts} attempts, ${count} address(es) remaining`);
    } else {
      console.log('All addresses deleted');
    }
  }

  /**
   * Navigate to addresses page via header link
   */
  async navigateFromHeader() {
    const addressesLink = this.page.locator('#addresses-link');
    await expect(addressesLink).toBeVisible({ timeout: 5000 });
    await addressesLink.click();
    await this.waitForPageLoad();
  }
}
