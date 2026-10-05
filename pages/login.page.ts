import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

export class LoginPage {
  readonly heading: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly logInButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Welcome back', level: 2 });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.passwordField = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in', exact: true });
    this.signUpLink = page.getByRole('link', { name: 'Sign up', exact: true });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?', exact: true });
  }

  /** Opens the log-in page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Login);
  }

  /** @param email Account email */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** @param password Account password */
  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  /** Submits credentials and waits for navigation away from log-in. */
  async submit(): Promise<void> {
    await this.logInButton.click();
  }

  /** Opens the sign-up page from the footer link. */
  async openSignUp(): Promise<void> {
    await this.signUpLink.click();
  }

  /** Opens the forgot-password flow. */
  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }
}
