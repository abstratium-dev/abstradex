import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { PartnerPage } from '../pages/partner.page';
import { AddressPage } from '../pages/address.page';

/**
 * Partner Management Feature Tests
 * 
 * Derived from: src/test/resources/features/partner-management.feature
 * 
 * This test suite consolidates scenarios from the feature file to reduce duplication
 * and improve test execution speed. The main "happy path" test covers the core workflow:
 * - Create natural person and legal entity partners
 * - Search for partners (by name, wildcard, partner number, notes)
 * - Verify partner attributes
 * - Delete partners
 * 
 * Additional tests cover edge cases and specific scenarios:
 * - Minimal information partner creation
 * - Partner number uniqueness
 * - Multiple partner type verification
 */

test.describe.serial('Partner Management', () => {
  let authPage: AuthPage;
  let partnerPage: PartnerPage;
  let addressPage: AddressPage;

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
      
      // Background: Delete all partners first (cascade deletes address_detail, contact_detail, partner_tag)
      await partnerPage.navigateFromHeader();
      await partnerPage.searchPartners('%%%');
      const partnerCount = await partnerPage.getPartnerCount();
      console.log(`Found ${partnerCount} partner(s)...`);
      if (partnerCount > 0) {
        console.log(`Cleaning up ${partnerCount} partner(s)...`);
        await partnerPage.deleteAllPartners();
      }
      
      // Background: Delete all addresses (now safe since address_detail links are gone)
      await addressPage.navigateFromHeader();
      await addressPage.searchAddresses('%%%');
      const addressCount = await addressPage.getAddressCount();
      if (addressCount > 0) {
        console.log(`Cleaning up ${addressCount} address(es)...`);
        await addressPage.deleteAllAddresses();
      }
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

  test('Happy Path: Complete partner management workflow', async () => {
    console.log('\n=== Happy Path: Complete partner management workflow ===');
    
    // Step 1: Create natural person partner with full details
    console.log('Step 1: Creating natural person partner...');
    const npPartner = await partnerPage.createNaturalPerson(
      'John',
      'Smith',
      undefined,
      'Preferred client'
    );
    expect(npPartner).toBeTruthy();
    expect(npPartner).toMatch(/^P\d+$/);
    await partnerPage.verifyPartnerStatus(npPartner, 'Active');
    await partnerPage.verifyPartnerAttributes(npPartner, {
      firstName: 'John',
      lastName: 'Smith',
      notes: 'Preferred client',
      active: true
    });
    console.log(`✓ Natural person created: ${npPartner}`);
    
    // Step 2: Create legal entity partner with full details
    console.log('Step 2: Creating legal entity partner...');
    const lePartner = await partnerPage.createLegalEntity(
      'Acme Corporation',
      'Acme',
      '123456789',
      'TAX-123',
      'Limited Liability Company',
      'Delaware, USA'
    );
    expect(lePartner).toBeTruthy();
    expect(lePartner).toMatch(/^P\d+$/);
    await partnerPage.verifyPartnerStatus(lePartner, 'Active');
    await partnerPage.verifyPartnerAttributes(lePartner, {
      legalName: 'Acme Corporation',
      active: true
    });
    // Verify partner numbers are unique
    expect(npPartner).not.toBe(lePartner);
    console.log(`✓ Legal entity created: ${lePartner} (partner numbers are auto-generated and unique)`);
    
    // Step 3: Create additional partners for search testing
    console.log('Step 3: Creating additional partners for search tests...');
    const searchPartner = await partnerPage.createNaturalPerson('Zebediah', 'Quixote', undefined, 'VIP customer');
    console.log(`✓ Search test partner created: ${searchPartner}`);
    
    // Step 4: Search by name
    console.log('Step 4: Testing search by name...');
    await partnerPage.searchPartners('Zebediah');
    let count = await partnerPage.getPartnerCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(await partnerPage.partnerExists(searchPartner)).toBe(true);
    console.log(`✓ Found ${count} partner(s) matching 'Zebediah'`);
    
    // Step 5: Search by partner number
    console.log('Step 5: Testing search by partner number...');
    await partnerPage.searchPartners(npPartner);
    count = await partnerPage.getPartnerCount();
    expect(count).toBe(1);
    expect(await partnerPage.partnerExists(npPartner)).toBe(true);
    console.log(`✓ Found exact match for partner number ${npPartner}`);
    
    // Step 6: Search by notes
    console.log('Step 6: Testing search by notes...');
    await partnerPage.searchPartners('VIP');
    count = await partnerPage.getPartnerCount();
    expect(count).toBeGreaterThanOrEqual(1);
    expect(await partnerPage.partnerExists(searchPartner)).toBe(true);
    console.log(`✓ Found ${count} partner(s) with 'VIP' in notes`);
    
    // Step 7: Wildcard search to see all partners
    console.log('Step 7: Testing wildcard search...');
    await partnerPage.searchPartners('%%%');
    count = await partnerPage.getPartnerCount();
    expect(count).toBeGreaterThanOrEqual(3);
    expect(await partnerPage.partnerExists(npPartner)).toBe(true);
    expect(await partnerPage.partnerExists(lePartner)).toBe(true);
    expect(await partnerPage.partnerExists(searchPartner)).toBe(true);
    console.log(`✓ Wildcard search returned ${count} partners`);
    
    // Step 8: Delete a partner
    console.log('Step 8: Testing partner deletion...');
    const deletePartner = await partnerPage.createNaturalPerson('Delete', 'Me');
    expect(await partnerPage.partnerExists(deletePartner)).toBe(true);
    await partnerPage.deletePartnerViaContextMenu(deletePartner);
    expect(await partnerPage.partnerExists(deletePartner)).toBe(false);
    console.log(`✓ Partner ${deletePartner} deleted successfully`);
    
    console.log('\n✓ Happy path completed successfully');
  });

  test('Scenario: Create partners with minimal information', async () => {
    console.log('\n=== Scenario: Create partners with minimal information ===');
    
    // Natural person with only required fields
    const npMinimal = await partnerPage.createNaturalPerson('Min', 'Person');
    expect(npMinimal).toBeTruthy();
    expect(await partnerPage.partnerExists(npMinimal)).toBe(true);
    
    // Legal entity with only required field
    const leMinimal = await partnerPage.createLegalEntity('Minimal Corp');
    expect(leMinimal).toBeTruthy();
    expect(await partnerPage.partnerExists(leMinimal)).toBe(true);
    
    console.log('✓ Partners created with minimal information');
  });
});
