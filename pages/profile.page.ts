import type { Locator, Page } from '@playwright/test';

import {
  DETAILS_SAVED_STATUS,
  INVALID_PHONE_MESSAGE,
  PHONE_HELPER_COPY,
  YOUR_DETAILS_SECTION_LABEL,
} from '../test-data/profile.copy';
import { AppRoute } from '../test-data/routes';
import { DeleteAccountFormComponent } from './components/delete-account-form.component';
import { HeaderComponent } from './components/header.component';

export class ProfilePage {
  readonly header: HeaderComponent;
  readonly deleteAccountForm: DeleteAccountFormComponent;
  readonly displayNameField: Locator;
  readonly phoneField: Locator;
  readonly saveMyDetailsButton: Locator;
  readonly yourDetailsSectionLabel: Locator;
  readonly phoneHelperText: Locator;
  readonly detailsSavedStatus: Locator;
  readonly invalidPhoneMessage: Locator;
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
    this.yourDetailsSectionLabel = page.getByText(YOUR_DETAILS_SECTION_LABEL, { exact: true });
    this.phoneHelperText = page.getByText(PHONE_HELPER_COPY, { exact: true });
    this.detailsSavedStatus = page.getByText(DETAILS_SAVED_STATUS);
    this.invalidPhoneMessage = page.getByText(INVALID_PHONE_MESSAGE);
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

  /**
   * Waits until **Your details** has loaded the saved values from the server.
   * The form renders before its values arrive, so reads of the fields need this first.
   */
  async waitForYourDetailsReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.saveMyDetailsButton.waitFor();
  }

  /**
   * Fills **Your details** and clicks **Save my details**.
   * @param details Fields to set; omitted fields are left as they are.
   */
  async saveMyDetails(details: { displayName?: string; phone?: string }): Promise<void> {
    if (details.displayName !== undefined) {
      await this.displayNameField.fill(details.displayName);
    }
    if (details.phone !== undefined) {
      await this.phoneField.fill(details.phone);
    }
    await this.saveMyDetailsButton.click();
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
