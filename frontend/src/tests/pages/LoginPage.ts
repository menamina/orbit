import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly githubButton: Locator;
  readonly signupToggleButton: Locator;
  readonly loginToggleButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login' });
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: /^login$/i });
    this.githubButton = page.getByRole('button', { name: /Login with GitHub/i });
    this.signupToggleButton = page.getByRole('button', { name: 'Sign Up' });
    this.loginToggleButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.login-error');
  }

  async goto() {
    await this.page.goto('http://localhost:5173/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async clickGithubLogin() {
    await this.githubButton.click();
  }

  async switchToSignup() {
    await this.signupToggleButton.click();
  }

  async switchToLogin() {
    await this.loginToggleButton.click();
  }
}
