import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

export class ForgotPasswordPage {
  readonly heading: Locator;
  readonly instructions: Locator;
  readonly emailField: Locator;
  readonly sendResetLinkButton: Locator;
  readonly backToLogInLink: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Reset your password', level: 2 });
    this.instructions = page.getByText('Enter your email', { exact: false });
    this.emailField = page.getByRole('textbox', { name: 'Email' });
    this.sendResetLinkButton = page.getByRole('button', { name: 'Send reset link', exact: true });
    this.backToLogInLink = page.getByRole('link', { name: '← Back to log in', exact: true });
  }

  /** Opens the forgot-password page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.ForgotPassword);
  }

  /** @param email Account email to receive the reset link */
  async fillEmail(email: string): Promise<void> {
    await this.emailField.fill(email);
  }

  /** Returns to log in without requesting a reset. */
  async backToLogIn(): Promise<void> {
    await this.backToLogInLink.click();
  }
}
