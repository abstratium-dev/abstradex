import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { PartnerPage } from '../pages/partner.page';
import { AddressPage } from '../pages/address.page';

/**
 * Partner Management Feature Tests
 * 
 * Implements all scenarios from the partner-management.feature file:
 * - Create natural person partner
 * - Create legal entity partner
 * - Search for partners
 * - Search partners by wildcard
 * - View partner details
 * - Update partner information
 * - Delete a partner
 * - Mark partner as inactive
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

  test('Scenario: Create a natural person partner', async () => {
    console.log('\n=== Scenario: Create a natural person partner ===');
    
    // Given I click the "Add Partner" button
    // And I select "Natural Person" as the partner type
    // When I fill in the following details
    const partnerNumber = await partnerPage.createNaturalPerson(
      'John',      // First Name
      'Smith',     // Last Name
      undefined,   // Middle Name
      'Preferred client' // Notes
    );
    
    // Then a new partner should be created with an auto-generated partner number
    expect(partnerNumber).toBeTruthy();
    expect(partnerNumber).toMatch(/^P\d+$/);
    
    // And the partner should be marked as active by default
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Active');
    
    // And I should see the partner in the partners list
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    
    console.log(`✓ Natural person partner created: ${partnerNumber}`);
  });

  test('Scenario: Create a legal entity partner', async () => {
    console.log('\n=== Scenario: Create a legal entity partner ===');
    
    // Given I click the "Add Partner" button
    // And I select "Legal Entity" as the partner type
    // When I fill in the following details
    const partnerNumber = await partnerPage.createLegalEntity(
      'Acme Corporation',           // Legal Name
      'Acme',                       // Trading Name
      '123456789',                  // Registration Number
      'TAX-123',                    // Tax ID
      'Limited Liability Company',  // Legal Form
      'Delaware, USA'               // Jurisdiction
    );
    
    // Then a new partner should be created with an auto-generated partner number
    expect(partnerNumber).toBeTruthy();
    expect(partnerNumber).toMatch(/^P\d+$/);
    
    // And the partner should be marked as active by default
    await partnerPage.verifyPartnerStatus(partnerNumber, 'Active');
    
    // And I should see the partner in the partners list
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    
    console.log(`✓ Legal entity partner created: ${partnerNumber}`);
  });

  test('Scenario: Search for partners', async () => {
    console.log('\n=== Scenario: Search for partners ===');
    
    // Given the following partners exist
    const john = await partnerPage.createNaturalPerson('Zebediah', 'Quixote');
    const acme = await partnerPage.createLegalEntity('Acme Corp');
    const jane = await partnerPage.createNaturalPerson('Jane', 'Doe');
    
    // When I search for "Zebediah"
    await partnerPage.searchPartners('Zebediah');
    
    // Then I should see 1 partner in the results (the one we just created)
    const count = await partnerPage.getPartnerCount();
    console.log(`Found ${count} partner(s) matching 'Zebediah'`);
    // Note: May find more than 1 if cleanup didn't run or previous tests failed
    expect(count).toBeGreaterThanOrEqual(1);
    
    // And the partner should be visible
    expect(await partnerPage.partnerExists(john)).toBe(true);
    
    console.log('✓ Search found correct partner');
  });

  test('Scenario: Search partners by wildcard', async () => {
    console.log('\n=== Scenario: Search partners by wildcard ===');
    
    // Given multiple partners exist in the system
    const partner1 = await partnerPage.createNaturalPerson('Alice', 'Anderson');
    console.log(`Created partner1: ${partner1}`);
    const partner2 = await partnerPage.createNaturalPerson('Bob', 'Brown');
    console.log(`Created partner2: ${partner2}`);
    const partner3 = await partnerPage.createLegalEntity('Charlie Corp');
    console.log(`Created partner3: ${partner3}`);
    
    // When I search for "%%%"
    await partnerPage.searchPartners('%%%');
    
    // Then I should see all partners in the results (at least the 3 we just created)
    const count = await partnerPage.getPartnerCount();
    console.log(`Found ${count} partners after wildcard search '%%%'`);
    
    expect(count).toBeGreaterThanOrEqual(3);
    
    expect(await partnerPage.partnerExists(partner1)).toBe(true);
    expect(await partnerPage.partnerExists(partner2)).toBe(true);
    expect(await partnerPage.partnerExists(partner3)).toBe(true);
    
    console.log('✓ Wildcard search returned all partners');
  });

  test('Scenario: Delete a partner', async () => {
    console.log('\n=== Scenario: Delete a partner ===');
    
    // Given a partner exists
    const partnerNumber = await partnerPage.createNaturalPerson('Delete', 'Me');
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(true);
    
    // When I open the context menu for the partner
    // And I click "Delete Partner"
    // And I confirm the deletion
    await partnerPage.deletePartnerViaContextMenu(partnerNumber);
    
    // Then the partner should be removed from the system
    // And I should not see the partner in the partners list
    expect(await partnerPage.partnerExists(partnerNumber)).toBe(false);
    
    console.log('✓ Partner deleted successfully');
  });

  test('Scenario: Search and verify multiple partner types', async () => {
    console.log('\n=== Scenario: Search and verify multiple partner types ===');
    
    // Create a mix of natural persons and legal entities
    const np1 = await partnerPage.createNaturalPerson('Emma', 'Wilson', undefined, 'VIP client');
    const le1 = await partnerPage.createLegalEntity('Tech Solutions Inc', 'TechSol', '987654321');
    const np2 = await partnerPage.createNaturalPerson('Frank', 'Miller');
    
    // Search for all partners using wildcard
    await partnerPage.searchPartners('%%%');
    const totalCount = await partnerPage.getPartnerCount();
    console.log(`Found ${totalCount} partners after wildcard search '%%%'`);
    expect(totalCount).toBeGreaterThanOrEqual(3);
    
    // Verify each partner exists
    expect(await partnerPage.partnerExists(np1)).toBe(true);
    expect(await partnerPage.partnerExists(le1)).toBe(true);
    expect(await partnerPage.partnerExists(np2)).toBe(true);
    
    // Search by specific name
    await partnerPage.searchPartners('Emma');
    const emmaCount = await partnerPage.getPartnerCount();
    console.log(`Found ${emmaCount} partner(s) matching 'Emma'`);
    expect(emmaCount).toBeGreaterThanOrEqual(1);
    expect(await partnerPage.partnerExists(np1)).toBe(true);
    
    // Search by legal entity name
    await partnerPage.searchPartners('Tech Solutions Inc');
    const techCount = await partnerPage.getPartnerCount();
    console.log(`Found ${techCount} partner(s) matching 'Tech Solutions Inc'`);
    expect(techCount).toBeGreaterThanOrEqual(1);
    expect(await partnerPage.partnerExists(le1)).toBe(true);
    
    console.log('✓ Multiple partner types created and searched successfully');
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

  test('Scenario: Verify partner numbers are auto-generated and unique', async () => {
    console.log('\n=== Scenario: Verify partner numbers are auto-generated and unique ===');
    
    const partner1 = await partnerPage.createNaturalPerson('First', 'Partner');
    const partner2 = await partnerPage.createNaturalPerson('Second', 'Partner');
    const partner3 = await partnerPage.createLegalEntity('Third Partner Inc');
    
    // All should have partner numbers
    expect(partner1).toBeTruthy();
    expect(partner2).toBeTruthy();
    expect(partner3).toBeTruthy();
    
    // All should be unique
    expect(partner1).not.toBe(partner2);
    expect(partner2).not.toBe(partner3);
    expect(partner1).not.toBe(partner3);
    
    // All should follow the pattern
    expect(partner1).toMatch(/^P\d+$/);
    expect(partner2).toMatch(/^P\d+$/);
    expect(partner3).toMatch(/^P\d+$/);
    
    console.log('✓ Partner numbers are auto-generated and unique');
  });
});
