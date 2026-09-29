import { expect, test } from '@playwright/test';

test('home page has a title @smoke', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('BuddyTime — playdates made easy');
});
