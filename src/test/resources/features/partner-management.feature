Feature: Partner Management
  
  User Story:
  As a business user
  I want to manage my business partners (customers, suppliers, etc.)
  So that I can maintain accurate records of all entities I do business with
  
  Acceptance Criteria:
  - Users can create both natural person and legal entity partners
  - Users can search for partners by name, number, email, or notes
  - Users can view detailed information about a partner
  - Users can update partner information
  - Users can delete partners when no longer needed
  - Partner numbers are automatically generated
  - Partners can be marked as active or inactive
  
  Background:
    Given I am authenticated as a user with USER role
    And I am on the partners page
    And All pre-existing partners and addresses have been deleted
  
  Scenario: Create a natural person partner
    Given I click the "Add Partner" button
    And I select "Natural Person" as the partner type
    When I fill in the following details:
      | Field      | Value           |
      | First Name | John            |
      | Last Name  | Smith           |
      | Title      | Mr.             |
      | Notes      | Preferred client|
    And I submit the form
    Then a new partner should be created with an auto-generated partner number
    And the partner should be marked as active by default
    And I should see the partner in the partners list
    
  Scenario: Create a legal entity partner
    Given I click the "Add Partner" button
    And I select "Legal Entity" as the partner type
    When I fill in the following details:
      | Field               | Value                    |
      | Legal Name          | Acme Corporation         |
      | Trading Name        | Acme                     |
      | Registration Number | 123456789                |
      | Tax ID              | TAX-123                  |
      | Legal Form          | Limited Liability Company|
      | Jurisdiction        | Delaware, USA            |
    And I submit the form
    Then a new partner should be created with an auto-generated partner number
    And the partner should be marked as active by default
    And I should see the partner in the partners list
    
  Scenario: Search for partners
    Given the following partners exist:
      | Partner Number | Name          | Type           |
      | P00000001      | John Smith    | Natural Person |
      | P00000002      | Acme Corp     | Legal Entity   |
      | P00000003      | Jane Doe      | Natural Person |
    When I search for "John"
    Then I should see 1 partner in the results
    And the partner "P00000001" should be visible
    
  Scenario: Search partners by wildcard
    Given multiple partners exist in the system
    When I search for "%%%"
    Then I should see all partners in the results
    
  Scenario: View partner details
    Given a partner "P00000001" exists
    When I click on the partner tile
    Then I should see the full partner details
    And I should see the partner's addresses
    And I should see the partner's contacts
    And I should see the partner's tags
    
  Scenario: Update partner information
    Given a natural person partner "P00000001" exists with name "John Smith"
    When I open the partner for editing
    And I change the first name to "Jonathan"
    And I submit the form
    Then the partner should be updated
    And I should see "Jonathan Smith" in the partners list
    
  Scenario: Delete a partner
    Given a partner "P00000001" exists
    When I open the context menu for the partner
    And I click "Delete Partner"
    And I confirm the deletion
    Then the partner should be removed from the system
    And I should not see the partner in the partners list
    
  Scenario: Mark partner as inactive
    Given an active partner "P00000001" exists
    When I update the partner and set active to false
    Then the partner should be marked as inactive
    And the partner status should display "Inactive"
