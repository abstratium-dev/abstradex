Feature: Address Management
  
  User Story:
  As a business user
  I want to manage physical addresses
  So that I can maintain accurate location information for shipping, billing, and correspondence
  
  Acceptance Criteria:
  - Users can create addresses with full details (street, city, state, postal code, country)
  - Users can search for addresses
  - Users can view address details
  - Users can delete addresses when no longer needed
  - Addresses can be marked as verified or unverified
  - System provides a list of valid countries
  
  Background:
    Given I am authenticated as a user with USER role
    And I am on the addresses page
    And All partners and addresses have been deleted
  
  Scenario: Create a new address
    Given I click the "Add Address" button
    When I fill in the following address details:
      | Field          | Value           |
      | Street Line 1  | 123 Main Street |
      | Street Line 2  | Suite 100       |
      | City           | New York        |
      | State/Province | NY              |
      | Postal Code    | 10001           |
      | Country Code   | US              |
    And I mark the address as verified
    And I submit the form
    Then a new address should be created
    And I should see the address in the addresses list
    And the address should show as "Verified"
    
  Scenario: Create an unverified address
    Given I click the "Add Address" button
    When I fill in minimal address details:
      | Field         | Value           |
      | Street Line 1 | 456 Oak Avenue  |
      | City          | Boston          |
      | Country Code  | US              |
    And I do not mark the address as verified
    And I submit the form
    Then a new address should be created
    And the address should show as "Unverified"
    
  Scenario: Search for addresses
    Given the following addresses exist:
      | Street Line 1   | City      | Country |
      | 123 Main Street | New York  | US      |
      | 456 Oak Avenue  | Boston    | US      |
      | 789 Pine Road   | Chicago   | US      |
    When I search for "Main"
    Then I should see 1 address in the results
    And the address "123 Main Street" should be visible
    
  Scenario: View address details
    Given an address "123 Main Street, New York" exists
    When I click on the address tile
    Then I should see the full address details including:
      | Field          | Value           |
      | Street Line 1  | 123 Main Street |
      | City           | New York        |
      | State/Province | NY              |
      | Postal Code    | 10001           |
      | Country        | United States   |
      | Verified       | Yes             |
    
  Scenario: Delete an address
    Given an address "123 Main Street" exists
    When I open the context menu for the address
    And I click "Delete Address"
    And I confirm the deletion
    Then the address should be removed from the system
    And I should not see the address in the addresses list
    
  Scenario: Get list of valid countries
    When I open the country selection dropdown
    Then I should see a list of valid country codes and names
    And the list should include common countries like:
      | Code | Name          |
      | US   | United States |
      | GB   | United Kingdom|
      | DE   | Germany       |
      | FR   | France        |
    
  Scenario: Search all addresses with wildcard
    Given multiple addresses exist in the system
    When I search for "%%%"
    Then I should see all addresses in the results
