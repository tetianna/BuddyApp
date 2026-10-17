import { expect, test } from '@playwright/test';

import { AvailabilityPage } from '../pages/availability.page';
import { AppRoute } from '../test-data/routes';

/**
 * AQPBT-8 — Availability: Weekend afternoons preset and one-off exception guardrails.
 * Gherkin: features/AQPBT-8.feature.md
 * Shared main-family account: weekly saves mutate it, so this block runs serially and
 * AC1 restores prior weekly slots before the test ends.
 */
test.describe('AQPBT-8 — availability weekend preset (main family)', () => {
  test.describe.configure({ mode: 'serial' });

  test('AQPBT-8 AC1 — banner and weekly heading on /availability @smoke', async ({ page }) => {
    const availabilityPage = new AvailabilityPage(page);
    await availabilityPage.goto();
    await availabilityPage.waitForWeeklyReady();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Availability}(\\?|$)`));
    await expect(availabilityPage.header.banner).toContainText('Availability');
    await expect(availabilityPage.heading).toBeVisible();
    await expect(availabilityPage.weeklyAvailabilityLabel).toBeVisible();
  });

  test('AQPBT-8 AC1 — Weekend afternoons preset persists for Sat and Sun @regression', async ({
    page,
  }) => {
    const availabilityPage = new AvailabilityPage(page);
    await availabilityPage.goto();
    await availabilityPage.waitForWeeklyReady();
    const originalWeeklySlots = await availabilityPage.readWeeklySlots();

    try {
      await availabilityPage.applyWeekendAfternoonsTemplate();
      await availabilityPage.saveAvailability();

      await expect(page).toHaveURL(new RegExp(`${AppRoute.Availability}(\\?|$)`));

      await page.reload();
      await availabilityPage.waitForWeeklyReady();

      await expect(availabilityPage.weeklyDayStartTime('Sat')).toHaveValue('13:00');
      await expect(availabilityPage.weeklyDayEndTime('Sat')).toHaveValue('17:00');
      await expect(availabilityPage.weeklyDayStartTime('Sun')).toHaveValue('13:00');
      await expect(availabilityPage.weeklyDayEndTime('Sun')).toHaveValue('17:00');
    } finally {
      await availabilityPage.restoreWeeklySlots(originalWeeklySlots);
    }
  });

  test('AQPBT-8 AC2 — empty date with Away / closed does not add an exception @regression', async ({
    page,
  }) => {
    const availabilityPage = new AvailabilityPage(page);
    await availabilityPage.goto();
    await availabilityPage.waitForWeeklyReady();

    await expect(availabilityPage.oneOffChangesLabel).toBeVisible();
    const exceptionRowsBefore = await availabilityPage.countSavedExceptionRows();

    await availabilityPage.prepareEmptyAwayClosedExceptionForm();
    await expect(availabilityPage.exceptionDateField).toHaveValue('');
    await availabilityPage.addException();

    const exceptionRowsAfter = await availabilityPage.countSavedExceptionRows();
    expect(exceptionRowsAfter).toBe(exceptionRowsBefore);
  });
});
