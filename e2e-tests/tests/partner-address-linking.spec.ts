import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';
import { PartnerPage } from '../pages/partner.page';
import { AddressPage } from '../pages/address.page';
import { PartnerAddressPage } from '../pages/partner-address.page';

/**
 * Partner Address Linking Feature Tests
 * 
 * Implements all scenarios from the partner-address-linking.feature file:
 * - Add a billing address to a partner
 * - Add a shipping address to a partner
 * - Set primary address for a partner
 * - Add multiple addresses to a partner
 * - View all addresses for a partner
 * - Remove an address from a partner
 * - Navigate to partner addresses from partner context menu
 */

test.describe.serial('Partner Address Linking', () => {
  let authPage: AuthPage;
  let partnerPage: PartnerPage;
  let addressPage: AddressPage;
  let partnerAddressPage: PartnerAddressPage;
  let testPartnerNumber: string;
  let testAddress1Street: string;
  let testAddress2Street: string;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120000); // Increase timeout to 2 minutes for setup
    
    // One-time setup before all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    
    authPage = new AuthPage(page);
    partnerPage = new PartnerPage(page);
    addressPage = new AddressPage(page);
    partnerAddressPage = new PartnerAddressPage(page);
    
    try {
      // Background: Authenticate
      await authPage.signIn('admin@abstratium.dev', 'secretLong', true);
      expect(await authPage.isSignedIn()).toBe(true);
      await authPage.goToHome();
      
      // Background: Delete all partners first
      await partnerPage.navigateFromHeader();
      await partnerPage.searchPartners('%%%');
      const partnerCount = await partnerPage.getPartnerCount();
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
      testPartnerNumber = await partnerPage.createNaturalPerson('Test', 'Partner');
      console.log(`Created test partner: ${testPartnerNumber}`);
      
      // Background: Create test addresses
      const timestamp = Date.now();
      testAddress1Street = `123 Main Street ${timestamp}`;
      testAddress2Street = `456 Oak Avenue ${timestamp}`;
      
      await addressPage.navigateFromHeader();
      await addressPage.createAddress({
        streetLine1: testAddress1Street,
        city: 'New York',
        countryCode: 'US'
      });
      console.log(`Created test address 1: ${testAddress1Street}`);
      
      await addressPage.createAddress({
        streetLine1: testAddress2Street,
        city: 'Boston',
        countryCode: 'US'
      });
      console.log(`Created test address 2: ${testAddress2Street}`);
      
    } catch (error) {
      console.error('Error during beforeAll setup:', error);
      throw error;
    } finally {
      await context.close();
    }
  });

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    partnerPage = new PartnerPage(page);
    addressPage = new AddressPage(page);
    partnerAddressPage = new PartnerAddressPage(page);
    
    // Background: Authenticate
    await authPage.signIn('admin@abstratium.dev', 'secretLong', true);
    expect(await authPage.isSignedIn()).toBe(true);
    await authPage.goToHome();
  });

  test('Scenario: Add a billing address to a partner', async () => {
    console.log('\n=== Scenario: Add a billing address to a partner ===');
    
    // Given I am on the partner addresses page
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(testPartnerNumber);
    await partnerPage.manageAddresses(testPartnerNumber);
    await partnerAddressPage.waitForPageLoad();
    
    // When I click "Add Address" and select the address
    await partnerAddressPage.addAddress(testAddress1Street, 'BILLING', false);
    
    // Then the address should be linked to the partner
    expect(await partnerAddressPage.addressExists(testAddress1Street)).toBe(true);
    
    // And the address should be marked as "BILLING"
    await partnerAddressPage.verifyAddressType(testAddress1Street, 'BILLING');
    
    console.log('✓ Billing address added to partner');
  });

  test('Scenario: Add a shipping address to a partner', async () => {
    console.log('\n=== Scenario: Add a shipping address to a partner ===');
    
    // Given I am on the partner addresses page
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(testPartnerNumber);
    await partnerPage.manageAddresses(testPartnerNumber);
    await partnerAddressPage.waitForPageLoad();
    
    // When I click "Add Address" and select the address
    await partnerAddressPage.addAddress(testAddress2Street, 'SHIPPING', false);
    
    // Then the address should be linked to the partner
    expect(await partnerAddressPage.addressExists(testAddress2Street)).toBe(true);
    
    // And the address should be marked as "SHIPPING"
    await partnerAddressPage.verifyAddressType(testAddress2Street, 'SHIPPING');
    
    console.log('✓ Shipping address added to partner');
  });

  test('Scenario: Set primary address for a partner', async () => {
    console.log('\n=== Scenario: Set primary address for a partner ===');
    
    // Given I am on the partner addresses page
    await partnerPage.navigateFromHeader();
    await partnerPage.manageAddresses(testPartnerNumber);
    await partnerAddressPage.waitForPageLoad();
    
    // When I add an address and mark it as primary
    const uniqueStreet = `789 Primary Street ${Date.now()}`;
    
    // First create the address
    await addressPage.navigateFromHeader();
    await addressPage.createAddress({
      streetLine1: uniqueStreet,
      city: 'Chicago',
      countryCode: 'US'
    });
    
    // Then add it to the partner as primary
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(testPartnerNumber);
    await partnerPage.manageAddresses(testPartnerNumber);
    await partnerAddressPage.waitForPageLoad();
    await partnerAddressPage.addAddress(uniqueStreet, 'BILLING', true);
    
    // Then the address should be marked as PRIMARY
    await partnerAddressPage.verifyAddressIsPrimary(uniqueStreet, true);
    
    // And the address should be marked as BILLING
    await partnerAddressPage.verifyAddressType(uniqueStreet, 'BILLING');
    
    console.log('✓ Primary address set for partner');
  });

  test('Scenario: Add multiple addresses to a partner', async () => {
    console.log('\n=== Scenario: Add multiple addresses to a partner ===');
    
    // Create a new partner for this test
    await partnerPage.navigateFromHeader();
    const multiPartner = await partnerPage.createNaturalPerson('Multi', 'Address');
    
    // Create two addresses
    const timestamp = Date.now();
    const addr1 = `111 First Street ${timestamp}`;
    const addr2 = `222 Second Avenue ${timestamp}`;
    
    await addressPage.navigateFromHeader();
    await addressPage.createAddress({
      streetLine1: addr1,
      city: 'Seattle',
      countryCode: 'US'
    });
    
    await addressPage.createAddress({
      streetLine1: addr2,
      city: 'Portland',
      countryCode: 'US'
    });
    
    // Navigate to partner addresses page
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(multiPartner);
    await partnerPage.manageAddresses(multiPartner);
    await partnerAddressPage.waitForPageLoad();
    
    // Add first address as primary billing
    await partnerAddressPage.addAddress(addr1, 'BILLING', true);
    
    // Add second address as shipping
    await partnerAddressPage.addAddress(addr2, 'SHIPPING', false);
    
    // Then the partner should have 2 addresses
    const count = await partnerAddressPage.getAddressCount();
    expect(count).toBe(2);
    
    // And first address should be marked as PRIMARY
    await partnerAddressPage.verifyAddressIsPrimary(addr1, true);
    
    // And second address should not be marked as PRIMARY
    await partnerAddressPage.verifyAddressIsPrimary(addr2, false);
    
    console.log('✓ Multiple addresses added to partner');
  });

  test('Scenario: View all addresses for a partner', async () => {
    console.log('\n=== Scenario: View all addresses for a partner ===');
    
    // Create a new partner with addresses
    await partnerPage.navigateFromHeader();
    const viewPartner = await partnerPage.createNaturalPerson('View', 'Test');
    
    const timestamp = Date.now();
    const addr1 = `333 View Street ${timestamp}`;
    const addr2 = `444 Display Avenue ${timestamp}`;
    
    await addressPage.navigateFromHeader();
    await addressPage.createAddress({
      streetLine1: addr1,
      city: 'Denver',
      countryCode: 'US'
    });
    
    await addressPage.createAddress({
      streetLine1: addr2,
      city: 'Austin',
      countryCode: 'US'
    });
    
    // Add addresses to partner
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(viewPartner);
    await partnerPage.manageAddresses(viewPartner);
    await partnerAddressPage.waitForPageLoad();
    
    await partnerAddressPage.addAddress(addr1, 'BILLING', true);
    await partnerAddressPage.addAddress(addr2, 'SHIPPING', false);
    
    // When I navigate to the partner addresses page
    // (already there, but let's verify)
    const title = await partnerAddressPage.getPageTitle();
    expect(title).toContain(viewPartner);
    
    // Then I should see 2 addresses
    const count = await partnerAddressPage.getAddressCount();
    expect(count).toBe(2);
    
    // And I should see both addresses with correct types
    await partnerAddressPage.verifyAddressType(addr1, 'BILLING');
    await partnerAddressPage.verifyAddressIsPrimary(addr1, true);
    
    await partnerAddressPage.verifyAddressType(addr2, 'SHIPPING');
    await partnerAddressPage.verifyAddressIsPrimary(addr2, false);
    
    console.log('✓ All addresses viewed for partner');
  });

  test('Scenario: Remove an address from a partner', async () => {
    console.log('\n=== Scenario: Remove an address from a partner ===');
    
    // Create a new partner with an address
    await partnerPage.navigateFromHeader();
    const removePartner = await partnerPage.createNaturalPerson('Remove', 'Test');
    
    const uniqueStreet = `555 Remove Street ${Date.now()}`;
    
    await addressPage.navigateFromHeader();
    await addressPage.createAddress({
      streetLine1: uniqueStreet,
      city: 'Miami',
      countryCode: 'US'
    });
    
    // Add address to partner
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(removePartner);
    await partnerPage.manageAddresses(removePartner);
    await partnerAddressPage.waitForPageLoad();
    await partnerAddressPage.addAddress(uniqueStreet, 'BILLING', false);
    
    // Verify it's there
    expect(await partnerAddressPage.addressExists(uniqueStreet)).toBe(true);
    
    // When I click "Remove" for the address
    await partnerAddressPage.removeAddress(uniqueStreet);
    
    // Then the address should be unlinked from the partner
    expect(await partnerAddressPage.addressExists(uniqueStreet)).toBe(false);
    
    // But the address should still exist in the global addresses list
    await addressPage.navigateFromHeader();
    await addressPage.searchAddresses(uniqueStreet);
    expect(await addressPage.addressExists(uniqueStreet)).toBe(true);
    
    console.log('✓ Address removed from partner but still exists globally');
  });

  test('Scenario: Navigate to partner addresses from partner context menu', async () => {
    console.log('\n=== Scenario: Navigate to partner addresses from partner context menu ===');
    
    // Given I am on the partners page
    await partnerPage.navigateFromHeader();
    await partnerPage.searchPartners(testPartnerNumber);
    
    // When I open the context menu and click "Manage Addresses"
    await partnerPage.manageAddresses(testPartnerNumber);
    
    // Then I should be navigated to the partner addresses page
    await partnerAddressPage.waitForPageLoad();
    
    // And the page title should show the partner number
    const title = await partnerAddressPage.getPageTitle();
    expect(title).toContain(testPartnerNumber);
    
    console.log('✓ Navigated to partner addresses page from context menu');
  });
});
