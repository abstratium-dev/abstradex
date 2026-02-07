import { expect, Page, Locator } from '@playwright/test';
import { ToastWidget } from './toast.widget';

/**
 * Page Object for Partner Management
 * Encapsulates all interactions with the Partners page
 */
export class PartnerPage {
  private toast: ToastWidget;

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
  
  // Partner type selection
  readonly naturalPersonButton: Locator;
  readonly legalEntityButton: Locator;
  
  // Natural person fields
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly middleNameInput: Locator;
  
  // Legal entity fields
  readonly legalNameInput: Locator;
  readonly tradingNameInput: Locator;
  readonly registrationNumberInput: Locator;
  readonly taxIdInput: Locator;
  readonly legalFormInput: Locator;
  readonly jurisdictionInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toast = new ToastWidget(page);
    
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
    
    // Partner type selection
    this.naturalPersonButton = page.locator('button.type-button:has-text("Natural Person")');
    this.legalEntityButton = page.locator('button.type-button:has-text("Legal Entity")');
    
    // Natural person fields
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.middleNameInput = page.locator('#middleName');
    
    // Legal entity fields
    this.legalNameInput = page.locator('#legalName');
    this.tradingNameInput = page.locator('#tradingName');
    this.registrationNumberInput = page.locator('#registrationNumber');
    this.taxIdInput = page.locator('#legalTaxId');
    this.legalFormInput = page.locator('#legalForm');
    this.jurisdictionInput = page.locator('#jurisdiction');
  }

  // Low-level navigation
  async goto() {
    // Use header link instead of direct navigation
    await this.page.locator('#partners-link').click();
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

  getPartnerContextMenuButton(partnerNumber: string): Locator {
    return this.getPartnerTile(partnerNumber).locator('button.btn-context-menu');
  }

  getPartnerContextMenu(partnerNumber: string): Locator {
    return this.getPartnerTile(partnerNumber).locator('.context-menu');
  }

  getPartnerContextMenuItem(partnerNumber: string, itemText: string): Locator {
    return this.getPartnerContextMenu(partnerNumber).locator('.context-menu-item', { hasText: itemText });
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
    return this.page.locator('.dialog-overlay');
  }

  getConfirmDialogDeleteButton(): Locator {
    return this.getConfirmDialog().getByRole('button', { name: /Delete/i });
  }

  getConfirmDialogCancelButton(): Locator {
    return this.getConfirmDialog().getByRole('button', { name: /Cancel/i });
  }

  // Toast methods delegated to ToastWidget
  getToast(): Locator {
    return this.toast.getToast();
  }

  getToastAction(): Locator {
    return this.toast.getToastAction();
  }

  getToastActionByPartnerNumber(partnerNumber: string): Locator {
    return this.toast.getToastActionByPartnerNumber(partnerNumber);
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
    // Wait for form container to appear (type selection or form fields)
    await this.page.locator('.form-container').waitFor({ state: 'visible', timeout: 5000 });
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
   * Creates a new natural person partner
   * @param firstName - First name (required)
   * @param lastName - Last name (required)
   * @param middleName - Optional middle name
   * @param notes - Optional notes
   * @param active - Whether the partner is active (default: true)
   * @returns The created partner's number (extracted from the tile after creation)
   */
  async createNaturalPerson(
    firstName: string,
    lastName: string,
    middleName?: string,
    notes?: string,
    active: boolean = true
  ): Promise<string> {
    console.log(`Creating natural person partner: ${firstName} ${lastName}...`);
    
    await this.openAddPartnerForm();
    
    // Select natural person type
    await expect(this.naturalPersonButton).toBeVisible({ timeout: 5000 });
    await this.naturalPersonButton.click();
    
    // Wait for natural person form to appear
    await expect(this.firstNameInput).toBeVisible({ timeout: 5000 });
    
    // Fill in natural person fields
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    
    if (middleName) {
      await this.middleNameInput.fill(middleName);
    }
    
    if (notes) {
      await this.notesInput.fill(notes);
    }
    
    // Note: Active status defaults to true in the backend, no checkbox in form
    
    // Submit the form
    await this.createButton.click();
    
    // Wait for form to close (indicates success)
    await expect(this.firstNameInput).not.toBeVisible({ timeout: 5000 });
    
    // Wait for success toast and click the partner number link to filter
    const partnerNumber = await this.waitForSuccessToastAndClickPartnerNumber();
    
    console.log(`Natural person partner created successfully with number: ${partnerNumber}`);
    return partnerNumber;
  }

  /**
   * Creates a new legal entity partner
   * @param legalName - Legal name (required)
   * @param tradingName - Optional trading name
   * @param registrationNumber - Optional registration number
   * @param taxId - Optional tax ID
   * @param legalForm - Optional legal form
   * @param jurisdictionInput - Optional jurisdiction
   * @param notes - Optional notes
   * @returns The created partner's number (extracted from the tile after creation)
   */
  async createLegalEntity(
    legalName: string,
    tradingName?: string,
    registrationNumber?: string,
    taxId?: string,
    legalForm?: string,
    jurisdiction?: string,
    notes?: string
  ): Promise<string> {
    console.log(`Creating legal entity partner: ${legalName}...`);
    
    await this.openAddPartnerForm();
    
    // Select legal entity type
    await expect(this.legalEntityButton).toBeVisible({ timeout: 5000 });
    await this.legalEntityButton.click();
    
    // Wait for legal entity form to appear
    await expect(this.legalNameInput).toBeVisible({ timeout: 5000 });
    
    // Fill in legal entity fields
    await this.legalNameInput.fill(legalName);
    
    if (tradingName) {
      await this.tradingNameInput.fill(tradingName);
    }
    
    if (registrationNumber) {
      await this.registrationNumberInput.fill(registrationNumber);
    }
    
    if (taxId) {
      await this.taxIdInput.fill(taxId);
    }
    
    if (legalForm) {
      await this.legalFormInput.fill(legalForm);
    }
    
    if (jurisdiction) {
      await this.jurisdictionInput.fill(jurisdiction);
    }
    
    if (notes) {
      // Scroll to notes field
      await this.notesInput.scrollIntoViewIfNeeded();
      await this.notesInput.fill(notes);
    }
    
    // Note: Active status defaults to true in the backend, no checkbox in form
    
    // Submit the form
    await this.createButton.click();
    
    // Wait for form to close (indicates success)
    await expect(this.legalNameInput).not.toBeVisible({ timeout: 5000 });
    
    // Wait for success toast and click the partner number link to filter
    const partnerNumber = await this.waitForSuccessToastAndClickPartnerNumber();
    
    console.log(`Legal entity partner created successfully with number: ${partnerNumber}`);
    return partnerNumber;
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
   * Opens the context menu for a partner
   * @param partnerNumber - The partner number
   */
  async openContextMenu(partnerNumber: string) {
    console.log(`Opening context menu for partner '${partnerNumber}'...`);
    const contextMenuButton = this.getPartnerContextMenuButton(partnerNumber);
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();
    await expect(this.getPartnerContextMenu(partnerNumber)).toBeVisible({ timeout: 2000 });
  }

  /**
   * Clicks a context menu item for a partner
   * @param partnerNumber - The partner number
   * @param itemText - The text of the menu item to click
   */
  async clickContextMenuItem(partnerNumber: string, itemText: string) {
    await this.openContextMenu(partnerNumber);
    const menuItem = this.getPartnerContextMenuItem(partnerNumber, itemText);
    await expect(menuItem).toBeVisible({ timeout: 2000 });
    await menuItem.click();
    // Wait a bit for the click to register
    await this.page.waitForTimeout(300);
  }

  /**
   * Deletes a partner by partner number using context menu
   * @param partnerNumber - The partner number to delete
   * @param confirm - Whether to confirm the deletion (default: true)
   */
  async deletePartnerViaContextMenu(partnerNumber: string, confirm: boolean = true) {
    console.log(`Deleting partner '${partnerNumber}' via context menu...`);
    
    // Open context menu and click delete
    await this.clickContextMenuItem(partnerNumber, 'Delete Partner');
    
    // Wait for confirmation dialog
    await expect(this.getConfirmDialog()).toBeVisible({ timeout: 5000 });
    
    if (confirm) {
      await this.getConfirmDialogDeleteButton().click();
      
      // Wait for network activity (deletion + search refresh)
      await this.page.waitForLoadState('networkidle');
      
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
   * Navigates to manage addresses for a partner
   * @param partnerNumber - The partner number
   */
  async manageAddresses(partnerNumber: string) {
    console.log(`Managing addresses for partner '${partnerNumber}'...`);
    await this.clickContextMenuItem(partnerNumber, 'Manage Addresses');
    // Wait for navigation to partner addresses page
    await this.page.waitForURL('**/partners/*/addresses', { timeout: 5000 });
    await this.page.waitForLoadState('networkidle');
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
    // Wait for either tiles to appear or the "no partners" message
    // This ensures the page has finished rendering after a search
    try {
      await Promise.race([
        this.getAllPartnerTiles().first().waitFor({ state: 'visible', timeout: 3000 }),
        this.page.locator('.info-message').waitFor({ state: 'visible', timeout: 3000 })
      ]);
    } catch (e) {
      // If neither appears within timeout, continue anyway
      // This handles edge cases where the page might be in an unexpected state
    }
    
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
    await this.toast.waitForSuccessToast(message);
  }

  /**
   * Waits for success toast with partner number action and clicks it to filter
   * @returns The partner number from the toast action
   */
  async waitForSuccessToastAndClickPartnerNumber(): Promise<string> {
    const trimmedPartnerNumber = await this.toast.waitForSuccessToastAndClickPartnerNumber();
    
    // Wait for the search to complete
    await this.waitForPageLoad();
    
    // Verify the partner appears in the results
    await expect(this.getPartnerTile(trimmedPartnerNumber)).toBeVisible({ timeout: 5000 });
    
    return trimmedPartnerNumber;
  }

  /**
   * Waits for an error toast message
   */
  async waitForErrorToast(message?: string) {
    await this.toast.waitForErrorToast(message);
  }

  /**
   * Verifies form validation error is displayed
   */
  async verifyFormError(expectedError: string) {
    await expect(this.formErrorBox).toBeVisible();
    await expect(this.formErrorBox).toContainText(expectedError);
  }

  /**
   * Deletes all visible partners using context menu
   */
  async deleteAllPartners() {
    console.log('Deleting all partners...');
    
    let count = await this.getPartnerCount();
    
    while (count > 0) {
      // Dismiss any toasts that might be blocking the header
      await this.toast.dismissAll();
      
      // Get all partner tiles
      const tiles = this.getAllPartnerTiles();
      
      // Get the partner number from the first tile
      const firstTile = tiles.first();
      const partnerNumberElement = firstTile.locator('.partner-number');
      
      // Wait for the element to be visible
      await expect(partnerNumberElement).toBeVisible({ timeout: 5000 });
      
      const partnerNumber = await partnerNumberElement.textContent();
      
      if (partnerNumber) {
        console.log(`Deleting partner: ${partnerNumber.trim()}`);
        await this.deletePartnerViaContextMenu(partnerNumber.trim(), true);
        
        // Wait longer for network activity to settle
        await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
          console.log('Network not idle, continuing');
        });
        
        // Wait for loading indicator to disappear
        await expect(this.loadingIndicator).not.toBeVisible({ timeout: 10000 }).catch(() => {
          console.log('Loading indicator still visible or not found, continuing');
        });
      }
      
      // Update count
      count = await this.getPartnerCount();
    }
    
    console.log('All partners deleted');
  }

  /**
   * Navigate to partners page via header link
   */
  async navigateFromHeader() {
    const partnersLink = this.page.locator('#partners-link');
    await expect(partnersLink).toBeVisible({ timeout: 5000 });
    await partnersLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Verify partner attributes by checking the tile display
   * @param partnerNumber - The partner number to verify
   * @param attributes - Object containing expected attribute values
   */
  async verifyPartnerAttributes(partnerNumber: string, attributes: {
    firstName?: string;
    lastName?: string;
    title?: string;
    notes?: string;
    legalName?: string;
    tradingName?: string;
    registrationNumber?: string;
    taxId?: string;
    legalForm?: string;
    jurisdiction?: string;
    active?: boolean;
  }) {
    console.log(`Verifying attributes for partner: ${partnerNumber}`);
    
    const tile = this.getPartnerTile(partnerNumber);
    await expect(tile).toBeVisible({ timeout: 5000 });
    
    const tileText = await tile.textContent();
    
    // Verify name (for natural person: firstName + lastName, for legal entity: legalName or tradingName)
    if (attributes.firstName && attributes.lastName) {
      const fullName = `${attributes.firstName} ${attributes.lastName}`;
      expect(tileText).toContain(fullName);
      console.log(`✓ Name verified: ${fullName}`);
    }
    
    if (attributes.legalName) {
      expect(tileText).toContain(attributes.legalName);
      console.log(`✓ Legal name verified: ${attributes.legalName}`);
    }
    
    // Verify notes
    if (attributes.notes) {
      expect(tileText).toContain(attributes.notes);
      console.log(`✓ Notes verified: ${attributes.notes}`);
    }
    
    // Verify active status
    if (attributes.active !== undefined) {
      const statusBadge = tile.locator('.status-badge');
      await expect(statusBadge).toBeVisible({ timeout: 5000 });
      const statusText = await statusBadge.textContent();
      const expectedStatus = attributes.active ? 'Active' : 'Inactive';
      expect(statusText?.trim()).toBe(expectedStatus);
      console.log(`✓ Active status verified: ${expectedStatus}`);
    }
    
    console.log('✓ All visible attributes verified');
  }
}
