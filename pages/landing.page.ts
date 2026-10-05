import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';

export class LandingPage {
  readonly brand: Locator;
  readonly tagline: Locator;
  readonly getStartedLink: Locator;
  readonly logInLink: Locator;
  readonly privacyLink: Locator;
  readonly termsLink: Locator;

  constructor(private readonly page: Page) {
    this.brand = page.getByText('BuddyTime', { exact: true });
    this.tagline = page.getByText('See when your kids', { exact: false });
    this.getStartedLink = page.getByRole('link', { name: 'Get started', exact: true });
    this.logInLink = page.getByRole('link', { name: 'Log in', exact: true });
    this.privacyLink = page.getByRole('link', { name: 'Privacy', exact: true });
    this.termsLink = page.getByRole('link', { name: 'Terms', exact: true });
  }

  /** Opens the public marketing home page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Home);
  }

  /** Navigates to sign-up from the hero. */
  async openSignUp(): Promise<void> {
    await this.getStartedLink.click();
  }

  /** Navigates to log in from the hero. */
  async openLogIn(): Promise<void> {
    await this.logInLink.click();
  }
}
