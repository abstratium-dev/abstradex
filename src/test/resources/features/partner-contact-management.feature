Feature: Partner Contact Management
  
  User Story:
  As a business user
  I want to manage contact details for partners
  So that I can track phone numbers, emails, and other communication methods for each partner
  
  Acceptance Criteria:
  - Users can add contact details to partners
  - Users can specify contact type (EMAIL, PHONE, etc.)
  - Users can view all contacts for a partner
  - Users can filter contacts by type
  - Users can update contact information
  - Users can delete contact details
  - Each partner can have multiple contact details
  
  Background:
    Given I am authenticated as a user with USER role
    And All pre-existing partners and addresses have been deleted
    And a partner "John Doe" exists
  
  Scenario: Add an email contact to a partner
    Given I am on the partner contacts page for "P00000001"
    When I click "Add Contact"
    And I fill in the following contact details:
      | Field        | Value                |
      | Contact Type | EMAIL                |
      | Value        | john@example.com     |
      | Label        | Primary Email        |
    And I submit the form
    Then the contact should be added to the partner
    And I should see "john@example.com" in the partner's contacts list
    
  Scenario: Add a phone contact to a partner
    Given I am on the partner contacts page for "P00000001"
    When I click "Add Contact"
    And I fill in the following contact details:
      | Field        | Value          |
      | Contact Type | PHONE          |
      | Value        | +1-555-0123    |
      | Label        | Mobile         |
    And I submit the form
    Then the contact should be added to the partner
    And I should see "+1-555-0123" in the partner's contacts list
    
  Scenario: Add multiple contacts to a partner
    Given I am on the partner contacts page for "P00000001"
    When I add the following contacts:
      | Type  | Value              | Label         |
      | EMAIL | john@example.com   | Work Email    |
      | EMAIL | john@personal.com  | Personal Email|
      | PHONE | +1-555-0123        | Mobile        |
      | PHONE | +1-555-0456        | Office        |
    Then the partner should have 4 contacts
    
  Scenario: View all contacts for a partner
    Given the partner "P00000001" has the following contacts:
      | Type  | Value              | Label      |
      | EMAIL | john@example.com   | Work Email |
      | PHONE | +1-555-0123        | Mobile     |
    When I navigate to the partner contacts page for "P00000001"
    Then I should see 2 contacts
    And I should see "john@example.com" with label "Work Email"
    And I should see "+1-555-0123" with label "Mobile"
    
  Scenario: Filter contacts by type
    Given the partner "P00000001" has the following contacts:
      | Type  | Value              |
      | EMAIL | john@example.com   |
      | EMAIL | john@personal.com  |
      | PHONE | +1-555-0123        |
    When I filter contacts by type "EMAIL"
    Then I should see 2 contacts
    And both contacts should be of type "EMAIL"
    
  Scenario: Update a contact detail
    Given the partner "P00000001" has an email contact "john@example.com"
    When I edit the contact
    And I change the value to "john.smith@example.com"
    And I submit the form
    Then the contact should be updated
    And I should see "john.smith@example.com" in the contacts list
    
  Scenario: Delete a contact detail
    Given the partner "P00000001" has a phone contact "+1-555-0123"
    When I click "Delete" for the contact
    And I confirm the deletion
    Then the contact should be removed from the partner
    And I should not see "+1-555-0123" in the contacts list
    
  Scenario: View contact detail by ID
    Given the partner "P00000001" has a contact with ID "C001"
    When I request the contact details for "C001"
    Then I should see the full contact information
    And the contact should belong to partner "P00000001"
