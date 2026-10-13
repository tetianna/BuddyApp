import { expect, test } from '@playwright/test';

import { DashboardPage } from '../pages/dashboard.page';
import { ProfilePage } from '../pages/profile.page';
import { ALT_AUTH_FILE } from '../support/auth.constants';
import { buildDisplayName } from '../test-data/factories/profile.factory';
import { INVALID_PHONE_VALUE, MY_PROFILE_TITLE } from '../test-data/profile.copy';
import { AppRoute } from '../test-data/routes';

/**
 * AQPBT-15 — Profile: Your details (display name, optional phone).
 * Gherkin: features/AQPBT-15.feature.md
 * Shared main-family account: saves mutate it, so this block runs serially and
 * every save restores the original values before the test ends.
 */
test.describe('AQPBT-15 — profile your details (main family)', () => {
  test.describe.configure({ mode: 'serial' });

  test('AQPBT-15 AC1 — open My Profile from the sidebar @smoke', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
    await dashboardPage.header.profileLink.click();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Profile}(\\?|$)`));
    await expect(dashboardPage.header.banner).toContainText(MY_PROFILE_TITLE);
  });

  test('AQPBT-15 AC2 — Your details shows fields, helper text, and save button @regression', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(profilePage.yourDetailsSectionLabel).toBeVisible();
    await expect(profilePage.displayNameField).toBeVisible();
    await expect(profilePage.phoneField).toBeVisible();
    await expect(profilePage.phoneHelperText).toBeVisible();
    await expect(profilePage.saveMyDetailsButton).toBeVisible();
  });

  test('AQPBT-15 AC3 — invalid phone shows a validation message @regression', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.waitForYourDetailsReady();
    const originalPhone = await profilePage.phoneField.inputValue();

    try {
      await profilePage.saveMyDetails({ phone: INVALID_PHONE_VALUE });

      await expect(profilePage.invalidPhoneMessage).toBeVisible();
      await expect(profilePage.detailsSavedStatus).toBeHidden();
    } finally {
      await profilePage.goto();
      await profilePage.waitForYourDetailsReady();
      if ((await profilePage.phoneField.inputValue()) !== originalPhone) {
        await profilePage.saveMyDetails({ phone: originalPhone });
        await expect(profilePage.detailsSavedStatus).toBeVisible();
      }
    }
  });

  test('AQPBT-15 AC4 — saving with an empty display name succeeds @regression', async ({ page }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.waitForYourDetailsReady();
    const originalDisplayName = await profilePage.displayNameField.inputValue();
    const originalPhone = await profilePage.phoneField.inputValue();

    try {
      await profilePage.saveMyDetails({ displayName: '', phone: '' });

      await expect(profilePage.invalidPhoneMessage).toBeHidden();
      await expect(profilePage.detailsSavedStatus).toBeVisible();
    } finally {
      await profilePage.goto();
      await profilePage.waitForYourDetailsReady();
      await profilePage.saveMyDetails({ displayName: originalDisplayName, phone: originalPhone });
      await expect(profilePage.detailsSavedStatus).toBeVisible();
      await expect(profilePage.displayNameField).toHaveValue(originalDisplayName);
    }
  });

  test('AQPBT-15 — Save my details is enabled when nothing changed @regression', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.waitForYourDetailsReady();

    await expect(profilePage.saveMyDetailsButton).toBeEnabled();
  });

  test('AQPBT-15 — leaving the page without saving does not keep the edit @regression', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.waitForYourDetailsReady();
    const notedDisplayName = await profilePage.displayNameField.inputValue();

    await profilePage.displayNameField.fill(buildDisplayName());
    await profilePage.header.dashboardLink.click();
    await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard}(\\?|$)`));

    await profilePage.goto();
    await profilePage.waitForYourDetailsReady();
    await expect(profilePage.displayNameField).toHaveValue(notedDisplayName);
  });
});

test.describe('AQPBT-15 — profile your details (alt family)', () => {
  test.skip(
    !process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD,
    'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD must be set for the second family',
  );
  test.use({ storageState: ALT_AUTH_FILE });

  test('AQPBT-15 AC5 — family B sees the same Your details labels @regression', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();

    await expect(profilePage.yourDetailsSectionLabel).toBeVisible();
    await expect(profilePage.displayNameField).toBeVisible();
    await expect(profilePage.phoneField).toBeVisible();
    await expect(profilePage.saveMyDetailsButton).toBeVisible();
  });
});
