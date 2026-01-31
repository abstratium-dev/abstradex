Feature: Partner Address Linking
  
  User Story:
  As a business user
  I want to link addresses to partners
  So that I can track billing addresses, shipping addresses, and other location information for each partner
  
  Acceptance Criteria:
  - Users can add existing addresses to partners
  - Users can specify address type (BILLING or SHIPPING)
  - Users can mark one address as the primary address
  - Users can view all addresses linked to a partner
  - Users can remove addresses from partners
  - Each partner can have multiple addresses
  - Each address can be linked to multiple partners
  
  Background:
    Given I am authenticated as a user with USER role
    And a partner "P00000001" exists
    And All pre-existing partners and addresses have been deleted
    And the following addresses exist:
      | ID  | Street Line 1   | City     |
      | A01 | 123 Main Street | New York |
      | A02 | 456 Oak Avenue  | Boston   |
  
  Scenario: Add a billing address to a partner
    Given I am on the partner addresses page for "P00000001"
    When I click "Add Address"
    And I select the address "123 Main Street"
    And I select address type "BILLING"
    And I submit the form
    Then the address should be linked to the partner
    And I should see "123 Main Street" in the partner's addresses list
    And the address should be marked as "BILLING"
    
  Scenario: Add a shipping address to a partner
    Given I am on the partner addresses page for "P00000001"
    When I click "Add Address"
    And I select the address "456 Oak Avenue"
    And I select address type "SHIPPING"
    And I submit the form
    Then the address should be linked to the partner
    And I should see "456 Oak Avenue" in the partner's addresses list
    And the address should be marked as "SHIPPING"
    
  Scenario: Set primary address for a partner
    Given I am on the partner addresses page for "P00000001"
    When I click "Add Address"
    And I select the address "123 Main Street"
    And I select address type "BILLING"
    And I check "Primary Address"
    And I submit the form
    Then the address should be linked to the partner
    And the address should be marked as "PRIMARY"
    And the address should be marked as "BILLING"
    
  Scenario: Add multiple addresses to a partner
    Given I am on the partner addresses page for "P00000001"
    When I add the following addresses:
      | Address         | Type     | Primary |
      | 123 Main Street | BILLING  | Yes     |
      | 456 Oak Avenue  | SHIPPING | No      |
    Then the partner should have 2 addresses
    And "123 Main Street" should be marked as PRIMARY
    And "456 Oak Avenue" should not be marked as PRIMARY
    
  Scenario: View all addresses for a partner
    Given the partner "P00000001" has the following addresses:
      | Address         | Type     | Primary |
      | 123 Main Street | BILLING  | Yes     |
      | 456 Oak Avenue  | SHIPPING | No      |
    When I navigate to the partner addresses page for "P00000001"
    Then I should see 2 addresses
    And I should see "123 Main Street" marked as "PRIMARY" and "BILLING"
    And I should see "456 Oak Avenue" marked as "SHIPPING"
    
  Scenario: Remove an address from a partner
    Given the partner "P00000001" has the address "123 Main Street" linked
    And I am on the partner addresses page for "P00000001"
    When I click "Remove" for the address "123 Main Street"
    Then the address should be unlinked from the partner
    And I should not see "123 Main Street" in the partner's addresses list
    But the address should still exist in the global addresses list
    
  Scenario: Navigate to partner addresses from partner context menu
    Given I am on the partners page
    And a partner "P00000001" exists
    When I open the context menu for partner "P00000001"
    And I click "Manage Addresses"
    Then I should be navigated to the partner addresses page
    And the page title should show "Addresses for Partner P00000001"
