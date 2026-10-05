import fs from 'fs';
import path from 'path';

import { expect, test } from '@playwright/test';

import { LoginPage } from '../pages';
import { ALT_AUTH_FILE, AUTH_FILE } from '../support/auth.constants';
import { AppRoute } from '../test-data/routes';

/** Login smoke tests start signed out even though other specs reuse `storageState`. */
test.use({ storageState: { cookies: [], origins: [] } });

test('authenticate main family @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(process.env.APP_USER_EMAIL ?? '');
  await loginPage.fillPassword(process.env.APP_USER_PASSWORD ?? '');
  await loginPage.submit();

  await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard}(\\?|$)`));
  await expect(page).not.toHaveURL(new RegExp(`${AppRoute.Login}(\\?|$)`));

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: AUTH_FILE });
});

test('authenticate second family @smoke', async ({ page }) => {
  test.skip(
    !process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD,
    'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD must be set to authenticate the second family',
  );

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillEmail(process.env.APP_ALT_USER_EMAIL ?? '');
  await loginPage.fillPassword(process.env.APP_ALT_USER_PASSWORD ?? '');
  await loginPage.submit();

  await expect(page).toHaveURL(new RegExp(`${AppRoute.Dashboard}(\\?|$)`));
  await expect(page).not.toHaveURL(new RegExp(`${AppRoute.Login}(\\?|$)`));

  fs.mkdirSync(path.dirname(ALT_AUTH_FILE), { recursive: true });
  await page.context().storageState({ path: ALT_AUTH_FILE });
});
