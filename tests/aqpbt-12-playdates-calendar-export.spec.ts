import { expect, test } from '@playwright/test';

import { NewPlaydatePage } from '../pages/new-playdate.page';
import { PlaydatesPage } from '../pages/playdates.page';
import { ProfilePage } from '../pages/profile.page';
import { ALT_AUTH_FILE } from '../support/auth.constants';
import {
  CALENDAR_SYNC_TOAST_COPY,
  CANCELLED_PAST_ROW_DATE,
  EMPTY_UPCOMING_COUNT,
} from '../test-data/playdates-calendar.copy';
import { AppRoute } from '../test-data/routes';

/**
 * AQPBT-12 — no calendar export (Google / ICS) on empty Upcoming or cancelled Past rows.
 * Gherkin: features/AQPBT-12.feature.md
 * Read-only: relies on pre-existing main-family data (Upcoming 0, cancelled Oct 16 row).
 * AC5 is BLOCKED — no account with an unset family exists; not automated.
 */
test.describe('AQPBT-12 — playdates calendar export', () => {
  test('AQPBT-12 AC1 — empty Upcoming shows empty copy and no calendar export @regression', async ({
    page,
  }) => {
    const playdatesPage = new PlaydatesPage(page);
    await playdatesPage.goto();
    const lists = playdatesPage.lists;

    await expect(lists.noUpcomingMessage).toBeVisible();
    await expect(lists.upcomingCount(EMPTY_UPCOMING_COUNT)).toBeVisible();
    await expect(lists.googleCalendarLink).toHaveCount(0);
    await expect(lists.icsButton).toHaveCount(0);
  });

  test('AQPBT-12 AC2 — cancelled Past row has status and no actions @regression', async ({
    page,
  }) => {
    const playdatesPage = new PlaydatesPage(page);
    await playdatesPage.goto();
    const lists = playdatesPage.lists;
    const row = lists.pastRow(CANCELLED_PAST_ROW_DATE);

    await expect(row).toBeVisible();
    await expect(lists.cancelledStatusIn(row)).toBeVisible();
    await expect(lists.googleCalendarLinkIn(row)).toHaveCount(0);
    await expect(lists.icsButtonIn(row)).toHaveCount(0);
    await expect(lists.acceptButtonIn(row)).toHaveCount(0);
    await expect(lists.declineButtonIn(row)).toHaveCount(0);
    await expect(lists.cancelButtonIn(row)).toHaveCount(0);
  });

  test('AQPBT-12 AC2 — every Past row is Cancelled with no action controls @regression', async ({
    page,
  }) => {
    const playdatesPage = new PlaydatesPage(page);
    await playdatesPage.goto();
    const lists = playdatesPage.lists;

    await expect(lists.pastRows.first()).toBeVisible();
    const rowCount = await lists.pastRows.count();
    expect(rowCount).toBeGreaterThan(0);
    await expect(lists.cancelledPastRows).toHaveCount(rowCount);
    await expect(lists.anyButtonIn(lists.pastCard)).toHaveCount(0);
    await expect(lists.anyLinkIn(lists.pastCard)).toHaveCount(0);
  });

  test('AQPBT-12 AC3 — Find a playdate shows empty Upcoming and cancelled Past rows @regression', async ({
    page,
  }) => {
    const newPlaydatePage = new NewPlaydatePage(page);
    await newPlaydatePage.goto();
    const lists = newPlaydatePage.lists;
    const row = lists.pastRow(CANCELLED_PAST_ROW_DATE);

    await expect(lists.noUpcomingMessage).toBeVisible();
    await expect(lists.cancelledStatusIn(row)).toBeVisible();
    await expect(lists.anyButtonIn(lists.pastCard)).toHaveCount(0);
    await expect(lists.anyLinkIn(lists.pastCard)).toHaveCount(0);
    await expect(lists.googleCalendarLink).toHaveCount(0);
    await expect(lists.icsButton).toHaveCount(0);
  });

  test('AQPBT-12 AC4 — Calendar Sync stays on Profile and shows toast @regression', async ({
    page,
  }) => {
    const profilePage = new ProfilePage(page);
    await profilePage.goto();
    await profilePage.openCalendarSync();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Profile}$`));
    await expect(profilePage.statusToast).toHaveText(CALENDAR_SYNC_TOAST_COPY);
  });

  test('AQPBT-12 AC6 — clicking a cancelled Past row opens no calendar export @regression', async ({
    page,
  }) => {
    const playdatesPage = new PlaydatesPage(page);
    await playdatesPage.goto();
    const lists = playdatesPage.lists;
    await expect(lists.pastRow(CANCELLED_PAST_ROW_DATE)).toBeVisible();
    await lists.clickPastRow(CANCELLED_PAST_ROW_DATE);

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Playdates}$`));
    await expect(lists.pastRow(CANCELLED_PAST_ROW_DATE)).toBeVisible();
    await expect(lists.googleCalendarLink).toHaveCount(0);
    await expect(lists.icsButton).toHaveCount(0);
    await expect(lists.dialog).toHaveCount(0);
  });

  test.describe('second family with an empty circle', () => {
    test.skip(!process.env.APP_ALT_USER_EMAIL, 'APP_ALT_USER_EMAIL is not set');
    test.use({ storageState: ALT_AUTH_FILE });

    test('AQPBT-12 — empty-circle family sees invite gate and no calendar export @regression', async ({
      page,
    }) => {
      const playdatesPage = new PlaydatesPage(page);
      await playdatesPage.goto();
      const lists = playdatesPage.lists;

      await expect(lists.emptyCircleGateMessage).toBeVisible();
      await expect(lists.upcomingLabel).toBeHidden();
      await expect(lists.pastLabel).toBeHidden();
      await expect(lists.googleCalendarLink).toHaveCount(0);
      await expect(lists.icsButton).toHaveCount(0);

      const newPlaydatePage = new NewPlaydatePage(page);
      await newPlaydatePage.goto();

      await expect(newPlaydatePage.lists.emptyCircleGateMessage).toBeVisible();
      await expect(newPlaydatePage.lists.googleCalendarLink).toHaveCount(0);
      await expect(newPlaydatePage.lists.icsButton).toHaveCount(0);
    });
  });
});
