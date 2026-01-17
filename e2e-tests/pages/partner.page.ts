import { expect, Page, Locator } from '@playwright/test';

/**
 * Page Object for Partner Management
 * Encapsulates all interactions with the Partners page
 */
export class PartnerPage {
  readonly page: Page;

  // Low-level element locators
  readonly addPartnerButton: Locator;
  readonly searchInput: Locator;
  readonly clearSearchButton: Locator;
  readonly partnerNumberInput: Locator;
  readonly notesInput: Locator;
  readonly activeCheckbox: Locator;
  readonly createButton: Locator;
  readonly cancelButton: Locator;
  readonly loadingIndicator: Locator;
  readonly errorBox: Locator;
  readonly formErrorBox: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators
    this.addPartnerButton = page.getByRole('button', { name: /Add Partner/i });
    this.searchInput = page.locator('input.filter-input');
    this.clearSearchButton = page.locator('button.filter-clear-button');
    this.partnerNumberInput = page.locator('#partnerNumber');
    this.notesInput = page.locator('#notes');
    this.activeCheckbox = page.locator('input[name="active"]');
    this.createButton = page.getByRole('button', { name: /Create Partner/i });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.loadingIndicator = page.locator('.loading');
    this.errorBox = page.locator('.error-box');
    this.formErrorBox = page.locator('.form-container .error-box');
  }

  // Low-level navigation
  async goto() {
    await this.page.goto('/partners');
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    // Wait for either loading to disappear or partners to be visible
    await this.page.waitForLoadState('networkidle');
    await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 }).catch(() => {});
  }

  // Low-level element getters
  getPartnerTile(partnerNumber: string): Locator {
    return this.page.locator('.tile', { hasText: partnerNumber });
  }

  getPartnerDeleteButton(partnerNumber: string): Locator {
    return this.getPartnerTile(partnerNumber).locator('button.btn-icon-danger');
  }

  getPartnerStatusBadge(partnerNumber: string): Locator {
    return this.getPartnerTile(partnerNumber).locator('.status-badge');
  }

  getPartnerNotes(partnerNumber: string): Locator {
    return this.getPartnerTile(partnerNumber).locator('.notes');
  }

  getAllPartnerTiles(): Locator {
    return this.page.locator('.tile');
  }

  getConfirmDialog(): Locator {
    return this.page.locator('.modal-overlay');
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

  getFilterInfo(): Locator {
    return this.page.locator('.filter-info');
  }

  // High-level actions
  
  /**
   * Opens the add partner form
   */
  async openAddPartnerForm() {
    console.log('Opening add partner form...');
    await expect(this.addPartnerButton).toBeVisible({ timeout: 10000 });
    await this.addPartnerButton.click();
    await expect(this.partnerNumberInput).toBeVisible({ timeout: 5000 });
  }

  /**
   * Closes the add partner form
   */
  async closeAddPartnerForm() {
    console.log('Closing add partner form...');
    await this.cancelButton.click();
    await expect(this.partnerNumberInput).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Creates a new partner with the given details
   * @param partnerNumber - The partner number (required)
   * @param notes - Optional notes
   * @param active - Whether the partner is active (default: true)
   */
  async createPartner(partnerNumber: string, notes?: string, active: boolean = true) {
    console.log(`Creating partner '${partnerNumber}'...`);
    
    await this.openAddPartnerForm();
    
    // Fill in the form
    await this.partnerNumberInput.fill(partnerNumber);
    
    if (notes) {
      await this.notesInput.fill(notes);
    }
    
    // Handle active checkbox
    const isChecked = await this.activeCheckbox.isChecked();
    if (active && !isChecked) {
      await this.activeCheckbox.check();
    } else if (!active && isChecked) {
      await this.activeCheckbox.uncheck();
    }
    
    // Submit the form
    await this.createButton.click();
    
    // Wait for form to close (indicates success)
    await expect(this.partnerNumberInput).not.toBeVisible({ timeout: 5000 });
    
    // Wait for the partner to appear in the list
    await expect(this.getPartnerTile(partnerNumber)).toBeVisible({ timeout: 5000 });
    
    console.log(`Partner '${partnerNumber}' created successfully`);
  }

  /**
   * Deletes a partner by partner number
   * @param partnerNumber - The partner number to delete
   * @param confirm - Whether to confirm the deletion (default: true)
   */
  async deletePartner(partnerNumber: string, confirm: boolean = true) {
    console.log(`Deleting partner '${partnerNumber}'...`);
    
    // Find and click the delete button
    const deleteButton = this.getPartnerDeleteButton(partnerNumber);
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();
    
    // Wait for confirmation dialog
    await expect(this.getConfirmDialog()).toBeVisible({ timeout: 5000 });
    
    if (confirm) {
      await this.getConfirmDialogDeleteButton().click();
      
      // Wait for the partner to disappear
      await expect(this.getPartnerTile(partnerNumber)).not.toBeVisible({ timeout: 5000 });
      
      console.log(`Partner '${partnerNumber}' deleted successfully`);
    } else {
      await this.getConfirmDialogCancelButton().click();
      
      // Confirm dialog should close
      await expect(this.getConfirmDialog()).not.toBeVisible({ timeout: 5000 });
      
      // Partner should still be visible
      await expect(this.getPartnerTile(partnerNumber)).toBeVisible();
      
      console.log(`Partner deletion cancelled`);
    }
  }

  /**
   * Searches for partners using the search input
   * @param searchTerm - The term to search for
   */
  async searchPartners(searchTerm: string) {
    console.log(`Searching for partners with term: '${searchTerm}'`);
    
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
   * Gets the count of visible partner tiles
   */
  async getPartnerCount(): Promise<number> {
    const tiles = this.getAllPartnerTiles();
    return await tiles.count();
  }

  /**
   * Checks if a partner exists in the list
   */
  async partnerExists(partnerNumber: string): Promise<boolean> {
    const tile = this.getPartnerTile(partnerNumber);
    return await tile.isVisible().catch(() => false);
  }

  /**
   * Verifies a partner has the expected status
   */
  async verifyPartnerStatus(partnerNumber: string, expectedStatus: 'Active' | 'Inactive') {
    const badge = this.getPartnerStatusBadge(partnerNumber);
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText(expectedStatus);
  }

  /**
   * Verifies a partner has the expected notes
   */
  async verifyPartnerNotes(partnerNumber: string, expectedNotes: string) {
    const notes = this.getPartnerNotes(partnerNumber);
    await expect(notes).toBeVisible();
    await expect(notes).toHaveText(expectedNotes);
  }

  /**
   * Verifies the search result count
   */
  async verifySearchResultCount(expectedCount: number) {
    const actualCount = await this.getPartnerCount();
    expect(actualCount).toBe(expectedCount);
  }

  /**
   * Verifies the filter info message is displayed with the search term
   */
  async verifyFilterInfo(searchTerm: string) {
    await expect(this.getFilterInfo()).toBeVisible();
    await expect(this.getFilterInfo()).toContainText(searchTerm);
  }

  /**
   * Waits for a success toast message
   */
  async waitForSuccessToast(message?: string) {
    const toast = this.getToast();
    await expect(toast).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Waits for an error toast message
   */
  async waitForErrorToast(message?: string) {
    const toast = this.getToast();
    await expect(toast).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(toast).toContainText(message);
    }
  }

  /**
   * Verifies form validation error is displayed
   */
  async verifyFormError(expectedError: string) {
    await expect(this.formErrorBox).toBeVisible();
    await expect(this.formErrorBox).toContainText(expectedError);
  }
}
