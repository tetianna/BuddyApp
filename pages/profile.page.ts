import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { DeleteAccountFormComponent } from './components/delete-account-form.component';
import { HeaderComponent } from './components/header.component';

export class ProfilePage {
  readonly header: HeaderComponent;
  readonly deleteAccountForm: DeleteAccountFormComponent;
  readonly displayNameField: Locator;
  readonly phoneField: Locator;
  readonly saveMyDetailsButton: Locator;
  readonly familyNameField: Locator;
  readonly hostAddressField: Locator;
  readonly saveFamilyDetailsButton: Locator;
  readonly privacySettingsButton: Locator;
  readonly notificationSettingsButton: Locator;
  readonly deleteAccountButton: Locator;
  readonly myAvailabilityButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.deleteAccountForm = new DeleteAccountFormComponent(page);
    this.displayNameField = page.getByRole('textbox', {
      name: 'Display name (how your circle sees you)',
    });
    this.phoneField = page.getByRole('textbox', { name: 'Phone (optional)' });
    this.saveMyDetailsButton = page.getByRole('button', { name: 'Save my details', exact: true });
    this.familyNameField = page.getByRole('textbox', { name: 'Family name' });
    this.hostAddressField = page.getByRole('textbox', { name: 'Host address or meeting note' });
    this.saveFamilyDetailsButton = page.getByRole('button', {
      name: 'Save family details',
      exact: true,
    });
    this.privacySettingsButton = page.getByRole('button', {
      name: 'Privacy & Safety Private mode · circle only',
    });
    this.notificationSettingsButton = page.getByRole('button', {
      name: 'Notifications Push + email',
    });
    this.deleteAccountButton = page.getByRole('button', { name: 'Delete account…', exact: true });
    this.myAvailabilityButton = page.getByRole('button', {
      name: 'My Availability Weekly slots',
    });
  }

  /** Opens the signed-in profile and settings page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Profile);
  }

  /** Expands the delete-account confirmation form. */
  async openDeleteAccount(): Promise<void> {
    await this.deleteAccountButton.click();
  }

  /** Opens privacy and safety settings (status feedback only in current build). */
  async openPrivacySettings(): Promise<void> {
    await this.privacySettingsButton.click();
  }

  /** Opens notification preferences (status feedback only in current build). */
  async openNotificationSettings(): Promise<void> {
    await this.notificationSettingsButton.click();
  }
}
