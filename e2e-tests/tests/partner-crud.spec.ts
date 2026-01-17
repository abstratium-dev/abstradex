import { test, expect } from '@playwright/test';
import { PartnerPage } from '../pages/partner.page';

/**
 * Partner CRUD Operations Tests
 * Tests for creating, reading, updating, and deleting partners
 */

test.describe('Partner CRUD Operations', () => {
  let partnerPage: PartnerPage;

  test.beforeEach(async ({ page }) => {
    partnerPage = new PartnerPage(page);
    await partnerPage.goto();
  });

  test('should display the partners page', async () => {
    // Verify page elements are visible
    await expect(partnerPage.addPartnerButton).toBeVisible();
    await expect(partnerPage.searchInput).toBeVisible();
  });

  test('should create a new partner with all fields', async () => {
    const partnerNumber = `P-TEST-${Date.now()}`;
    const notes = 'Test partner created via E2E test';

    await partnerPage.createPartner(partnerNumber, notes, true);

    // Verify partner appears in the list
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    
    // Verify partner details
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Active');
    await partnerPage.verifyPartnerNotes(partnerNumber, notes);
  });

  test('should create a new partner with only required fields', async () => {
    const partnerNumber = `P-MIN-${Date.now()}`;

    await partnerPage.createPartner(partnerNumber);

    // Verify partner appears in the list
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Active');
  });

  test('should create an inactive partner', async () => {
    const partnerNumber = `P-INACTIVE-${Date.now()}`;

    await partnerPage.createPartner(partnerNumber, 'Inactive partner', false);

    // Verify partner appears with inactive status
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Inactive');
  });

  test('should show validation error when partner number is empty', async () => {
    await partnerPage.openAddPartnerForm();
    
    // Try to submit without filling partner number
    await partnerPage.createButton.click();
    
    // Verify validation error (form should still be visible)
    await expect(partnerPage.partnerNumberInput).toBeVisible();
  });

  test('should cancel partner creation', async () => {
    const initialCount = await partnerPage.getPartnerCount();
    
    await partnerPage.openAddPartnerForm();
    await partnerPage.partnerNumberInput.fill('P-CANCEL-TEST');
    await partnerPage.closeAddPartnerForm();
    
    // Verify form is closed and no new partner was added
    await expect(partnerPage.partnerNumberInput).not.toBeVisible();
    const finalCount = await partnerPage.getPartnerCount();
    expect(finalCount).toBe(initialCount);
  });

  test('should delete a partner with confirmation', async () => {
    const partnerNumber = `P-DELETE-${Date.now()}`;
    
    // Create a partner first
    await partnerPage.createPartner(partnerNumber);
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    
    // Delete the partner
    await partnerPage.deletePartner(partnerNumber, true);
    
    // Verify partner is removed
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(false);
  });

  test('should cancel partner deletion', async () => {
    const partnerNumber = `P-NO-DELETE-${Date.now()}`;
    
    // Create a partner first
    await partnerPage.createPartner(partnerNumber);
    
    // Try to delete but cancel
    await partnerPage.deletePartner(partnerNumber, false);
    
    // Verify partner still exists
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
  });

  test('should create multiple partners', async () => {
    const timestamp = Date.now();
    const partners = [
      { number: `P-MULTI-1-${timestamp}`, notes: 'First partner' },
      { number: `P-MULTI-2-${timestamp}`, notes: 'Second partner' },
      { number: `P-MULTI-3-${timestamp}`, notes: 'Third partner' }
    ];

    for (const partner of partners) {
      await partnerPage.createPartner(partner.number, partner.notes);
    }

    // Verify all partners exist
    for (const partner of partners) {
      expect(await partnerPage.partnerExists(partner.number)).toBe(true);
    }
  });
});
