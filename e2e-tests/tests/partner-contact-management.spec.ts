import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { PartnerPage } from '../pages/partner.page';
import { AddressPage } from '../pages/address.page';

/**
 * Partner Contact Management Feature Tests
 * 
 * Derived from: src/test/resources/features/partner-contact-management.feature
 * 
 * This test suite consolidates scenarios from the feature file to reduce duplication
 * and improve test execution speed. The main "happy path" test covers the core workflow:
 * - Create a partner
 * - Add email and phone contacts to the partner
 * - View all contacts for the partner
 * - Update a contact
 * - Delete a contact
 * 
 * Additional tests cover edge cases and specific scenarios:
 * - Filter contacts by type
 * - Multiple contacts of the same type
 */

test.describe.serial('Partner Contact Management', () => {
  let authPage: AuthPage;
  let partnerPage: PartnerPage;
  let addressPage: AddressPage;
  let testPartnerNumber: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000); // Increase timeout to 2 minutes for cleanup
    
    // One-time cleanup before all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    
    authPage = new AuthPage(page);
    partnerPage = new PartnerPage(page);
    addressPage = new AddressPage(page);
    
    try {
      // Background: Authenticate
      await authPage.signIn('admin@abstratium.dev', 'secretLong', true);
      expect(await authPage.isSignedIn()).toBe(true);
      await authPage.goToHome();
      
      // Background: Delete all partners first (cascade deletes contact_detail)
      await partnerPage.navigateFromHeader();
      await partnerPage.searchPartners('%%%');
      const partnerCount = await partnerPage.getPartnerCount();
      console.log(`Found ${partnerCount} partner(s)...`);
      if (partnerCount > 0) {
        console.log(`Cleaning up ${partnerCount} partner(s)...`);
        await partnerPage.deleteAllPartners();
      }
      
      // Background: Delete all addresses
      await addressPage.navigateFromHeader();
      await addressPage.searchAddresses('%%%');
      const addressCount = await addressPage.getAddressCount();
      if (addressCount > 0) {
        console.log(`Cleaning up ${addressCount} address(es)...`);
        await addressPage.deleteAllAddresses();
      }
      
      // Background: Create test partner
      await partnerPage.navigateFromHeader();
      testPartnerNumber = await partnerPage.createNaturalPerson('John', 'Doe');
      console.log(`Created test partner: ${testPartnerNumber}`);
      
    } catch (error) {
      console.error('Error during beforeAll cleanup:', error);
      throw error;
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    partnerPage = new PartnerPage(page);
    addressPage = new AddressPage(page);
    
    // Background: Authenticate and navigate to partners page
    await authPage.signIn('admin@abstratium.dev', 'secretLong', true);
    expect(await authPage.isSignedIn()).toBe(true);
    await authPage.goToHome();
    await partnerPage.navigateFromHeader();
  });

  test('Happy Path: Complete partner contact management workflow', async ({ page }) => {
    console.log('\n=== Happy Path: Complete partner contact management workflow ===');
    
    // Step 1: Navigate to partner overview
    console.log('Step 1: Navigating to partner overview...');
    await partnerPage.searchPartners(testPartnerNumber);
    const partnerTile = partnerPage.getPartnerTile(testPartnerNumber);
    await expect(partnerTile).toBeVisible({ timeout: 5000 });
    await partnerTile.click();
    
    // Wait for partner overview page to load
    await page.waitForURL(/.*\/partner-overview.*/, { timeout: 5000 });
    console.log('✓ Partner overview page loaded');
    
    // Step 2: Add email contact
    console.log('Step 2: Adding email contact...');
    const addContactButton = page.getByRole('button', { name: /Add Contact/i });
    await expect(addContactButton).toBeVisible({ timeout: 5000 });
    await addContactButton.click();
    
    // Fill in email contact details
    const contactTypeSelect = page.locator('#contactType');
    await contactTypeSelect.selectOption('EMAIL');
    
    const contactValueInput = page.locator('#contactValue');
    await contactValueInput.fill('john@example.com');
    
    const contactLabelInput = page.locator('#contactLabel');
    await contactLabelInput.fill('Work Email');
    
    const submitButton = page.locator('form').getByRole('button', { name: /Save|Submit|Add/i });
    await submitButton.click();
    
    // Wait for contact to appear in the list
    const emailContact = page.locator('.contact-item', { hasText: 'john@example.com' });
    await expect(emailContact).toBeVisible({ timeout: 5000 });
    console.log('✓ Email contact added successfully');
    
    // Step 3: Add phone contact
    console.log('Step 3: Adding phone contact...');
    await addContactButton.click();
    
    await contactTypeSelect.selectOption('PHONE');
    await contactValueInput.fill('+1-555-0123');
    await contactLabelInput.fill('Mobile');
    await submitButton.click();
    
    const phoneContact = page.locator('.contact-item', { hasText: '+1-555-0123' });
    await expect(phoneContact).toBeVisible({ timeout: 5000 });
    console.log('✓ Phone contact added successfully');
    
    // Step 4: Verify contact count
    console.log('Step 4: Verifying contact count...');
    const contactItems = page.locator('.contact-item');
    const count = await contactItems.count();
    expect(count).toBe(2);
    console.log(`✓ Found ${count} contacts`);
    
    // Step 5: Update email contact
    console.log('Step 5: Updating email contact...');
    const emailEditButton = emailContact.locator('button', { hasText: /Edit/i });
    await emailEditButton.click();
    
    await contactValueInput.clear();
    await contactValueInput.fill('john.smith@example.com');
    await submitButton.click();
    
    const updatedEmailContact = page.locator('.contact-item', { hasText: 'john.smith@example.com' });
    await expect(updatedEmailContact).toBeVisible({ timeout: 5000 });
    console.log('✓ Email contact updated successfully');
    
    // Step 6: Delete phone contact
    console.log('Step 6: Deleting phone contact...');
    const phoneDeleteButton = phoneContact.locator('button', { hasText: /Delete/i });
    await phoneDeleteButton.click();
    
    // Confirm deletion
    const confirmDialog = page.locator('.confirm-dialog');
    await expect(confirmDialog).toBeVisible({ timeout: 3000 });
    const confirmButton = confirmDialog.getByRole('button', { name: /Delete|Confirm/i });
    await confirmButton.click();
    
    // Verify phone contact is removed
    await expect(phoneContact).not.toBeVisible({ timeout: 5000 });
    const remainingCount = await contactItems.count();
    expect(remainingCount).toBe(1);
    console.log('✓ Phone contact deleted successfully');
    
    console.log('\n✓ Happy path completed successfully');
  });

  test('Scenario: Add multiple contacts of different types', async ({ page }) => {
    console.log('\n=== Scenario: Add multiple contacts of different types ===');
    
    // Navigate to partner overview
    await partnerPage.searchPartners(testPartnerNumber);
    const partnerTile = partnerPage.getPartnerTile(testPartnerNumber);
    await partnerTile.click();
    await page.waitForURL(/.*\/partner-overview.*/, { timeout: 5000 });
    
    const addContactButton = page.getByRole('button', { name: /Add Contact/i });
    const contactTypeSelect = page.locator('#contactType');
    const contactValueInput = page.locator('#contactValue');
    const contactLabelInput = page.locator('#contactLabel');
    const submitButton = page.locator('form').getByRole('button', { name: /Save|Submit|Add/i });
    
    // Add multiple contacts
    const contacts = [
      { type: 'EMAIL', value: 'work@example.com', label: 'Work Email' },
      { type: 'EMAIL', value: 'personal@example.com', label: 'Personal Email' },
      { type: 'PHONE', value: '+1-555-0001', label: 'Office' },
      { type: 'PHONE', value: '+1-555-0002', label: 'Home' }
    ];
    
    for (const contact of contacts) {
      await addContactButton.click();
      await contactTypeSelect.selectOption(contact.type);
      await contactValueInput.fill(contact.value);
      await contactLabelInput.fill(contact.label);
      await submitButton.click();
      
      const contactItem = page.locator('.contact-item', { hasText: contact.value });
      await expect(contactItem).toBeVisible({ timeout: 5000 });
      console.log(`✓ Added ${contact.type} contact: ${contact.value}`);
    }
    
    // Verify total count
    const contactItems = page.locator('.contact-item');
    const count = await contactItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
    console.log(`✓ Partner has ${count} contacts`);
  });
});
