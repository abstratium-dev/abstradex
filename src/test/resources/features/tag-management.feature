Feature: Tag Management
  
  User Story:
  As a business user
  I want to create and manage tags
  So that I can categorize and organize partners with custom labels
  
  Acceptance Criteria:
  - Users can create tags with names and optional descriptions
  - Users can search for tags
  - Users can view all tags
  - Users can update tag information
  - Users can delete tags
  - Tag names must be unique
  - Tags can be assigned to multiple partners
  
  Background:
    Given I am authenticated as a user with USER role
    And All pre-existing partners, addresses and tags have been deleted
    And I am on the tags page
  
  Scenario: Create a new tag
    Given I click the "Add Tag" button
    When I fill in the following tag details:
      | Field       | Value                    |
      | Name        | VIP Customer             |
      | Description | High-value customer      |
    And I submit the form
    Then a new tag should be created
    And I should see "VIP Customer" in the tags list
    
  Scenario: Create a tag without description
    Given I click the "Add Tag" button
    When I fill in the tag name as "Supplier"
    And I submit the form
    Then a new tag should be created
    And I should see "Supplier" in the tags list
    
  Scenario: Prevent duplicate tag names
    Given a tag "VIP Customer" already exists
    When I try to create a new tag with name "VIP Customer"
    Then I should see an error message
    And the tag should not be created
    
  Scenario: Search for tags
    Given the following tags exist:
      | Name         | Description           |
      | VIP Customer | High-value customer   |
      | Supplier     | Product supplier      |
      | Distributor  | Distribution partner  |
    When I search for "VIP"
    Then I should see 1 tag in the results
    And the tag "VIP Customer" should be visible
    
  Scenario: View all tags
    Given multiple tags exist in the system
    When I navigate to the tags page
    Then I should see all tags listed
    
  Scenario: View tag details
    Given a tag "VIP Customer" exists with description "High-value customer"
    When I click on the tag
    Then I should see the tag details
    And the description should show "High-value customer"
    
  Scenario: Update a tag
    Given a tag "VIP Customer" exists
    When I edit the tag
    And I change the description to "Premium customer with high lifetime value"
    And I submit the form
    Then the tag should be updated
    And the new description should be visible
    
  Scenario: Delete a tag
    Given a tag "Old Category" exists
    When I click "Delete" for the tag
    And I confirm the deletion
    Then the tag should be removed from the system
    And I should not see "Old Category" in the tags list
    
  Scenario: Delete a tag that is assigned to partners
    Given a tag "VIP Customer" exists
    And the tag is assigned to 3 partners
    When I try to delete the tag
    Then I should see a warning about partners using this tag
    And I should be able to confirm or cancel the deletion
