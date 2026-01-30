import { expect, Page, Locator } from '@playwright/test';

/**
 * Page Object for Authentication
 * Encapsulates all interactions with the authentication flow
 */
export class AuthPage {
  readonly page: Page;

  // OAuth server page elements (port 8080)
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly approveButton: Locator;
  readonly denyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // OAuth server form elements
    this.emailInput = page.locator('input#username');
    this.passwordInput = page.locator('input#password');
    this.signInButton = page.getByRole('button', { name: /Sign in$/i });
    this.approveButton = page.getByRole('button', { name: /Approve/i });
    this.denyButton = page.getByRole('button', { name: /Deny/i });
  }

  /**
   * Complete sign-in flow including OAuth approval
   * @param email - User email
   * @param password - User password
   * @param approve - Whether to approve the client (default: true)
   */
  async signIn(email: string, password: string, approve: boolean = true) {
    console.log(`Signing in as ${email}...`);
    
    // Navigate to login endpoint which will redirect to OAuth flow
    await this.page.goto('/api/auth/login');
    
    // Wait for OAuth login page to load (on port 3333)
    await expect(this.emailInput).toBeVisible({ timeout: 10000 });
    
    // Fill in credentials
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Submit the form
    await this.signInButton.click();
    
    // Wait for approval page
    await expect(this.approveButton).toBeVisible({ timeout: 10000 });
    
    if (approve) {
      // Approve the client
      await this.approveButton.click();
      
      // Wait for redirect back to application
      await this.page.waitForURL('**/', { timeout: 10000 });
      
      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle');
      
      console.log('Sign-in completed successfully');
    } else {
      // Deny the client
      await this.denyButton.click();
      console.log('Sign-in denied');
    }
  }

  /**
   * Check if user is signed in by looking for sign-out link
   */
  async isSignedIn(): Promise<boolean> {
    const signOutLink = this.page.locator('#signout-link');
    return await signOutLink.isVisible().catch(() => false);
  }

  /**
   * Sign out the current user
   */
  async signOut() {
    console.log('Signing out...');
    const signOutLink = this.page.locator('#signout-link');
    await expect(signOutLink).toBeVisible({ timeout: 5000 });
    await signOutLink.click();
    
    // Wait for redirect to signed-out page
    await this.page.waitForURL('**/signed-out', { timeout: 5000 });
    console.log('Signed out successfully');
  }

  /**
   * Navigate to home page
   */
  async goToHome() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }
}
