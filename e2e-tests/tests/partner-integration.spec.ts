import { test, expect } from '@playwright/test';
import { PartnerPage } from '../pages/partner.page';

/**
 * Partner Integration Tests
 * End-to-end scenarios combining multiple operations
 */

test.describe('Partner Integration Scenarios', () => {
  let partnerPage: PartnerPage;

  test.beforeEach(async ({ page }) => {
    partnerPage = new PartnerPage(page);
    await partnerPage.goto();
  });

  test('complete partner lifecycle: create, search, verify, delete', async () => {
    const partnerNumber = `P-LIFECYCLE-${Date.now()}`;
    const notes = 'Full lifecycle test partner';

    // Step 1: Create partner
    console.log('Step 1: Creating partner...');
    await partnerPage.createPartner(partnerNumber, notes, true);
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);

    // Step 2: Search for the partner
    console.log('Step 2: Searching for partner...');
    await partnerPage.searchPartners(partnerNumber);
    await partnerPage.verifySearchResultCount(1);
    await partnerPage.verifyFilterInfo(partnerNumber);

    // Step 3: Verify partner details
    console.log('Step 3: Verifying partner details...');
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Active');
    await partnerPage.verifyPartnerNotes(partnerNumber, notes);

    // Step 4: Clear search to see all partners
    console.log('Step 4: Clearing search...');
    await partnerPage.clearSearch();
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);

    // Step 5: Delete the partner
    console.log('Step 5: Deleting partner...');
    await partnerPage.deletePartner(partnerNumber);
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(false);
  });

  test('bulk operations: create multiple, search, and delete', async () => {
    const timestamp = Date.now();
    const prefix = `BULK-${timestamp}`;
    const partners = [
      { number: `${prefix}-001`, notes: 'Bulk partner 1' },
      { number: `${prefix}-002`, notes: 'Bulk partner 2' },
      { number: `${prefix}-003`, notes: 'Bulk partner 3' },
      { number: `${prefix}-004`, notes: 'Bulk partner 4' },
      { number: `${prefix}-005`, notes: 'Bulk partner 5' }
    ];

    // Create all partners
    console.log('Creating bulk partners...');
    for (const partner of partners) {
      await partnerPage.createPartner(partner.number, partner.notes);
    }

    // Search for all bulk partners
    console.log('Searching for bulk partners...');
    await partnerPage.searchPartners(prefix);
    
    // Verify all are found
    for (const partner of partners) {
      expect(await partnerPage.partnerExists(partner.number)).toBe(true);
    }

    // Delete all bulk partners
    console.log('Deleting bulk partners...');
    for (const partner of partners) {
      await partnerPage.deletePartner(partner.number);
    }

    // Verify all are deleted
    await partnerPage.searchPartners(prefix);
    expect(await partnerPage.getPartnerCount()).toBe(0);
  });

  test('search refinement workflow', async () => {
    const timestamp = Date.now();
    const partners = [
      { number: `REFINE-TECH-${timestamp}`, notes: 'Technology company' },
      { number: `REFINE-TECH-SOFT-${timestamp}`, notes: 'Software company' },
      { number: `REFINE-FINANCE-${timestamp}`, notes: 'Finance company' }
    ];

    // Create test partners
    for (const partner of partners) {
      await partnerPage.createPartner(partner.number, partner.notes);
    }

    // Broad search
    console.log('Performing broad search...');
    await partnerPage.searchPartners('REFINE');
    const broadCount = await partnerPage.getPartnerCount();
    expect(broadCount).toBeGreaterThanOrEqual(3);

    // Refined search
    console.log('Refining search...');
    await partnerPage.searchPartners('REFINE-TECH');
    const refinedCount = await partnerPage.getPartnerCount();
    expect(refinedCount).toBe(2);
    expect(await partnerPage.partnerExists(partners[0].number)).toBe(true);
    expect(await partnerPage.partnerExists(partners[1].number)).toBe(true);
    expect(await partnerPage.partnerExists(partners[2].number)).toBe(false);

    // Very specific search
    console.log('Performing specific search...');
    await partnerPage.searchPartners('REFINE-TECH-SOFT');
    const specificCount = await partnerPage.getPartnerCount();
    expect(specificCount).toBe(1);
    expect(await partnerPage.partnerExists(partners[1].number)).toBe(true);

    // Cleanup
    await partnerPage.clearSearch();
    for (const partner of partners) {
      await partnerPage.deletePartner(partner.number);
    }
  });

  test('mixed status partners workflow', async () => {
    const timestamp = Date.now();
    const activePartner = `MIXED-ACTIVE-${timestamp}`;
    const inactivePartner = `MIXED-INACTIVE-${timestamp}`;

    // Create one active and one inactive partner
    await partnerPage.createPartner(activePartner, 'Active partner', true);
    await partnerPage.createPartner(inactivePartner, 'Inactive partner', false);

    // Verify both exist
    expect(await partnerPage.partnerExists(activePartner)).toBe(true);
    expect(await partnerPage.partnerExists(inactivePartner)).toBe(true);

    // Verify their statuses
    await partnerPage.verifyPartnerStatus(activePartner, 'Active');
    await partnerPage.verifyPartnerStatus(inactivePartner, 'Inactive');

    // Search should find both
    await partnerPage.searchPartners('MIXED');
    expect(await partnerPage.partnerExists(activePartner)).toBe(true);
    expect(await partnerPage.partnerExists(inactivePartner)).toBe(true);

    // Cleanup
    await partnerPage.clearSearch();
    await partnerPage.deletePartner(activePartner);
    await partnerPage.deletePartner(inactivePartner);
  });

  test('error recovery: cancel and retry partner creation', async () => {
    const partnerNumber = `RETRY-${Date.now()}`;
    const notes = 'Retry test partner';

    // First attempt: cancel
    console.log('First attempt: canceling...');
    await partnerPage.openAddPartnerForm();
    await partnerPage.partnerNumberInput.fill(partnerNumber);
    await partnerPage.notesInput.fill(notes);
    await partnerPage.closeAddPartnerForm();
    
    // Verify partner was not created
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(false);

    // Second attempt: complete
    console.log('Second attempt: completing...');
    await partnerPage.createPartner(partnerNumber, notes);
    
    // Verify partner was created
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    await partnerPage.verifyPartnerNotes(partnerNumber, notes);

    // Cleanup
    await partnerPage.deletePartner(partnerNumber);
  });

  test('search persistence across operations', async () => {
    const timestamp = Date.now();
    const searchTerm = `PERSIST-${timestamp}`;
    const partner1 = `${searchTerm}-FIRST`;
    const partner2 = `${searchTerm}-SECOND`;

    // Create first partner
    await partnerPage.createPartner(partner1);

    // Set up search
    await partnerPage.searchPartners(searchTerm);
    expect(await partnerPage.getPartnerCount()).toBe(1);

    // Create second partner (should appear in filtered results)
    await partnerPage.createPartner(partner2);
    expect(await partnerPage.getPartnerCount()).toBe(2);

    // Delete first partner (should update filtered results)
    await partnerPage.deletePartner(partner1);
    expect(await partnerPage.getPartnerCount()).toBe(1);
    expect(await partnerPage.partnerExists(partner2)).toBe(true);

    // Cleanup
    await partnerPage.deletePartner(partner2);
  });

  test('rapid successive operations', async () => {
    const timestamp = Date.now();
    const partners = [
      `RAPID-1-${timestamp}`,
      `RAPID-2-${timestamp}`,
      `RAPID-3-${timestamp}`
    ];

    // Rapidly create partners
    console.log('Rapidly creating partners...');
    for (const partner of partners) {
      await partnerPage.createPartner(partner);
    }

    // Immediately search
    await partnerPage.searchPartners('RAPID');
    expect(await partnerPage.getPartnerCount()).toBe(3);

    // Rapidly delete
    console.log('Rapidly deleting partners...');
    for (const partner of partners) {
      await partnerPage.deletePartner(partner);
    }

    // Verify all deleted
    expect(await partnerPage.getPartnerCount()).toBe(0);
  });
});
