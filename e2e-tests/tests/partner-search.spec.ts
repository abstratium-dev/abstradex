import { test, expect } from '@playwright/test';
import { PartnerPage } from '../pages/partner.page';

/**
 * Partner Search Tests
 * Tests for searching and filtering partners
 */

test.describe('Partner Search', () => {
  let partnerPage: PartnerPage;
  const timestamp = Date.now();
  
  // Test data
  const testPartners = [
    { number: `SEARCH-ALPHA-${timestamp}`, notes: 'Alpha company' },
    { number: `SEARCH-BETA-${timestamp}`, notes: 'Beta corporation' },
    { number: `SEARCH-GAMMA-${timestamp}`, notes: 'Gamma industries' },
    { number: `UNIQUE-DELTA-${timestamp}`, notes: 'Delta enterprises' }
  ];

  test.beforeAll(async ({ browser }) => {
    // Create test partners before running search tests
    const page = await browser.newPage();
    partnerPage = new PartnerPage(page);
    await partnerPage.goto();
    
    for (const partner of testPartners) {
      await partnerPage.createPartner(partner.number, partner.notes);
    }
    
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    partnerPage = new PartnerPage(page);
    await partnerPage.goto();
  });

  test('should search partners by partner number', async () => {
    await partnerPage.searchPartners('SEARCH-ALPHA');
    
    // Should find the alpha partner
    expect(await partnerPage.partnerExists(testPartners[0].number)).toBe(true);
    
    // Should not find other partners
    expect(await partnerPage.partnerExists(testPartners[1].number)).toBe(false);
    expect(await partnerPage.partnerExists(testPartners[2].number)).toBe(false);
  });

  test('should search partners by notes', async () => {
    await partnerPage.searchPartners('corporation');
    
    // Should find the beta partner (has "corporation" in notes)
    expect(await partnerPage.partnerExists(testPartners[1].number)).toBe(true);
    
    // Verify search result count
    await partnerPage.verifyFilterInfo('corporation');
  });

  test('should search partners with partial match', async () => {
    await partnerPage.searchPartners('SEARCH');
    
    // Should find all partners with "SEARCH" in their number
    expect(await partnerPage.partnerExists(testPartners[0].number)).toBe(true);
    expect(await partnerPage.partnerExists(testPartners[1].number)).toBe(true);
    expect(await partnerPage.partnerExists(testPartners[2].number)).toBe(true);
    
    // Should not find the unique partner
    expect(await partnerPage.partnerExists(testPartners[3].number)).toBe(false);
  });

  test('should be case-insensitive in search', async () => {
    await partnerPage.searchPartners('alpha');
    
    // Should find the alpha partner despite lowercase search
    expect(await partnerPage.partnerExists(testPartners[0].number)).toBe(true);
  });

  test('should clear search and show all partners', async () => {
    // First, perform a search
    await partnerPage.searchPartners('SEARCH-ALPHA');
    expect(await partnerPage.getPartnerCount()).toBeLessThan(testPartners.length);
    
    // Clear the search
    await partnerPage.clearSearch();
    
    // All test partners should be visible again
    for (const partner of testPartners) {
      expect(await partnerPage.partnerExists(partner.number)).toBe(true);
    }
  });

  test('should show no results for non-existent search term', async () => {
    await partnerPage.searchPartners('NONEXISTENT-PARTNER-12345');
    
    // Should show info message about no results
    const count = await partnerPage.getPartnerCount();
    expect(count).toBe(0);
  });

  test('should update results dynamically as user types', async () => {
    // Type a broad search term
    await partnerPage.searchInput.fill('SEARCH');
    await partnerPage.page.waitForTimeout(500);
    
    const broadCount = await partnerPage.getPartnerCount();
    
    // Narrow down the search
    await partnerPage.searchInput.fill('SEARCH-BETA');
    await partnerPage.page.waitForTimeout(500);
    
    const narrowCount = await partnerPage.getPartnerCount();
    
    // Narrow search should have fewer results
    expect(narrowCount).toBeLessThanOrEqual(broadCount);
  });

  test('should display clear button when search has text', async () => {
    // Initially, clear button should not be visible
    await expect(partnerPage.clearSearchButton).not.toBeVisible();
    
    // After typing, clear button should appear
    await partnerPage.searchPartners('test');
    await expect(partnerPage.clearSearchButton).toBeVisible();
    
    // After clearing, button should disappear
    await partnerPage.clearSearch();
    await expect(partnerPage.clearSearchButton).not.toBeVisible();
  });

  test('should maintain search after creating a new partner', async () => {
    const newPartner = `SEARCH-NEW-${Date.now()}`;
    
    // Perform a search
    await partnerPage.searchPartners('SEARCH');
    
    // Create a new partner that matches the search
    await partnerPage.createPartner(newPartner, 'New partner');
    
    // The new partner should be visible in the filtered results
    expect(await partnerPage.partnerExists(newPartner)).toBe(true);
  });

  test('should update results after deleting a partner', async () => {
    const partnerToDelete = `SEARCH-DELETE-${Date.now()}`;
    
    // Create a partner
    await partnerPage.createPartner(partnerToDelete);
    
    // Search for it
    await partnerPage.searchPartners(partnerToDelete);
    expect(await partnerPage.partnerExists(partnerToDelete)).toBe(true);
    
    // Delete it
    await partnerPage.deletePartner(partnerToDelete);
    
    // Should show no results
    expect(await partnerPage.partnerExists(partnerToDelete)).toBe(false);
  });
});
