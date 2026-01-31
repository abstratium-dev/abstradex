Feature: User Authentication
  
  User Story:
  As a user
  I want to securely authenticate to the system
  So that I can access my business partner data while keeping it protected from unauthorized access
  
  Acceptance Criteria:
  - Users can sign in using OAuth2/OpenID Connect
  - Users must approve the OAuth client on first login
  - Authenticated users have access to partner management features
  - Users can sign out to end their session
  - Sessions are managed securely with HTTP-only cookies
  - Unauthenticated users are redirected to the login page
  
  Scenario: Successful sign-in with OAuth
    Given I am on the application home page
    And I am not authenticated
    When I am redirected to the OAuth login page
    And I enter my email "admin@abstratium.dev"
    And I enter my password "secretLong"
    And I click "Sign in"
    And I approve the OAuth client
    Then I should be authenticated
    And I should be redirected to the partners page
    And I should see the navigation header with my user information
    
  Scenario: Sign-in without client approval
    Given I am on the OAuth login page
    When I enter valid credentials
    And I click "Sign in"
    But I deny the OAuth client approval
    Then I should not be authenticated
    And I should remain on the OAuth page
    
  Scenario: Access protected resource without authentication
    Given I am not authenticated
    When I try to access "/partners"
    Then I should be redirected to the OAuth login page
    And I should not see any partner data
    
  Scenario: Sign out
    Given I am authenticated as "admin@abstratium.dev"
    And I am on the partners page
    When I click "Sign out" in the header
    Then my session should be terminated
    And I should be redirected to the signed-out page
    And I should not be able to access protected resources
    
  Scenario: Session persistence
    Given I am authenticated as "admin@abstratium.dev"
    When I close and reopen my browser
    And I navigate to the application
    Then I should still be authenticated
    And I should have access to the partners page
    
  Scenario: Role-based access control
    Given I am authenticated with USER role
    When I access partner management endpoints
    Then I should have full access to:
      | Resource              |
      | Partner CRUD          |
      | Address CRUD          |
      | Contact CRUD          |
      | Tag CRUD              |
      | Partner-Address links |
      | Partner-Contact links |
      | Partner-Tag links     |
    
  Scenario: Invalid credentials
    Given I am on the OAuth login page
    When I enter an invalid email or password
    And I click "Sign in"
    Then I should see an error message
    And I should not be authenticated
