Feature: Partner Tag Assignment
  
  User Story:
  As a business user
  I want to assign tags to partners
  So that I can categorize partners and easily filter or group them by characteristics
  
  Acceptance Criteria:
  - Users can add existing tags to partners
  - Users can view all tags assigned to a partner
  - Users can remove tags from partners
  - Each partner can have multiple tags
  - Each tag can be assigned to multiple partners
  - Duplicate tag assignments are prevented
  
  Background:
    Given I am authenticated as a user with USER role
    And All pre-existing partners, addresses and tags have been deleted
    And a partner "John Doe" exists
    And the following tags exist:
      | ID  | Name         |
      | T01 | VIP Customer |
      | T02 | Supplier     |
      | T03 | Distributor  |
  
  Scenario: Add a tag to a partner
    Given I am on the partner tags page for "P00000001"
    When I click "Add Tag"
    And I select the tag "VIP Customer"
    And I submit the form
    Then the tag should be assigned to the partner
    And I should see "VIP Customer" in the partner's tags list
    
  Scenario: Add multiple tags to a partner
    Given I am on the partner tags page for "P00000001"
    When I add the following tags:
      | Tag Name     |
      | VIP Customer |
      | Supplier     |
    Then the partner should have 2 tags
    And I should see "VIP Customer" in the tags list
    And I should see "Supplier" in the tags list
    
  Scenario: Prevent duplicate tag assignment
    Given the partner "P00000001" already has the tag "VIP Customer"
    When I try to add the tag "VIP Customer" again
    Then I should see an error message
    And the tag should not be added twice
    
  Scenario: View all tags for a partner
    Given the partner "P00000001" has the following tags:
      | Tag Name     |
      | VIP Customer |
      | Supplier     |
    When I navigate to the partner tags page for "P00000001"
    Then I should see 2 tags
    And I should see "VIP Customer"
    And I should see "Supplier"
    
  Scenario: Remove a tag from a partner
    Given the partner "P00000001" has the tag "VIP Customer"
    And I am on the partner tags page for "P00000001"
    When I click "Remove" for the tag "VIP Customer"
    And I confirm the removal
    Then the tag should be unassigned from the partner
    And I should not see "VIP Customer" in the partner's tags list
    But the tag should still exist in the global tags list
    
  Scenario: Navigate to partner tags from partner context menu
    Given I am on the partners page
    And a partner "P00000001" exists
    When I open the context menu for partner "P00000001"
    And I click "Manage Tags"
    Then I should be navigated to the partner tags page
    And the page title should show "Tags for Partner P00000001"
    
  Scenario: Filter partners by tag
    Given the following partners exist with tags:
      | Partner Number | Name       | Tags                    |
      | P00000001      | John Smith | VIP Customer            |
      | P00000002      | Acme Corp  | VIP Customer, Supplier  |
      | P00000003      | Jane Doe   | Distributor             |
    When I filter partners by tag "VIP Customer"
    Then I should see 2 partners
    And I should see "P00000001" and "P00000002"
    
  Scenario: View partners with a specific tag
    Given the tag "VIP Customer" is assigned to 5 partners
    When I click on the tag "VIP Customer"
    Then I should see a list of all partners with this tag
    And the list should contain 5 partners
