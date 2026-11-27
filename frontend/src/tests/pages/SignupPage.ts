import { type Page, type Locator } from '@playwright/test';

export class SignupPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly nameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly signupButton: Locator;
  readonly githubButton: Locator;
  readonly loginToggleButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Signup' });
    this.nameInput = page.getByLabel('Name');
    this.usernameInput = page.getByLabel('Username');
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.confirmPasswordInput = page.getByLabel('ConfirmPassword');
    this.signupButton = page.getByRole('button', { name: /^signup$/i });
    this.githubButton = page.getByRole('button', { name: /Continue with GitHub/i });
    this.loginToggleButton = page.getByRole('button', { name: 'Log In' });
    this.errorMessage = page.locator('.login-error');
  }

  async signup(name: string, username: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.usernameInput.fill(username);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.signupButton.click();
  }

  async switchToLogin() {
    await this.loginToggleButton.click();
  }
}
