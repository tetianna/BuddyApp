import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

export class SignupPage {
  readonly heading: Locator;
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly passwordField: Locator;
  readonly signUpButton: Locator;
  readonly logInLink: Locator;
  readonly termsLink: Locator;
  readonly privacyLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Create your account', level: 2 });
    this.nameField = page.getByRole('textbox', { name: 'Your name' });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.passwordField = page.getByRole('textbox', { name: 'Password (8+ characters)' });
    this.signUpButton = page.getByRole('button', { name: 'Sign up', exact: true });
    this.logInLink = page.getByRole('link', { name: 'Log in', exact: true });
    this.termsLink = page.getByRole('link', { name: 'Terms of Service', exact: true });
    this.privacyLink = page.getByRole('link', { name: 'Privacy Policy', exact: true });
  }

  /** Opens the sign-up page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Signup);
  }

  /** @param name Parent display name */
  async fillName(name: string): Promise<void> {
    await this.nameField.fill(name);
  }

  /** @param email New account email */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** @param password New account password */
  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  /** Submits the registration form. */
  async submit(): Promise<void> {
    await this.signUpButton.click();
  }
}
