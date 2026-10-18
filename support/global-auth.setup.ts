import fs from 'fs';
import path from 'path';

import { chromium, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

import { AppRoute } from '../test-data/routes';
import { ALT_AUTH_FILE, AUTH_FILE } from './auth.constants';
import { ensurePracticumHostChildren } from './ensure-practicum-children';

dotenv.config();

async function saveStorageState(
  baseURL: string,
  email: string,
  password: string,
  outFile: string,
): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  await page.goto(AppRoute.Login);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.waitForURL(new RegExp(`${AppRoute.Dashboard}(\\?|$)`));

  if (path.resolve(outFile) === path.resolve(AUTH_FILE)) {
    await ensurePracticumHostChildren(page);
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await context.storageState({ path: path.resolve(outFile) });
  await browser.close();
}

/** Writes auth JSON so signed-in specs can use `storageState`. */
export async function ensureAuthStorageStates(baseURL: string): Promise<void> {
  const email = process.env.APP_USER_EMAIL;
  const password = process.env.APP_USER_PASSWORD;

  if (!email || !password) {
    throw new Error('APP_USER_EMAIL and APP_USER_PASSWORD must be set before running tests.');
  }

  await saveStorageState(baseURL, email, password, AUTH_FILE);

  if (process.env.APP_ALT_USER_EMAIL && process.env.APP_ALT_USER_PASSWORD) {
    await saveStorageState(
      baseURL,
      process.env.APP_ALT_USER_EMAIL,
      process.env.APP_ALT_USER_PASSWORD,
      ALT_AUTH_FILE,
    );
  }
}

/** Writes auth JSON before the suite so signed-in specs can use `storageState`. */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const baseURL = config.projects[0]?.use?.baseURL;
  if (!baseURL) {
    throw new Error('APP_URL must be set before running tests.');
  }
  await ensureAuthStorageStates(baseURL);
}
