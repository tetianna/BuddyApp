import { test as setup } from '@playwright/test';

import { ensureAuthStorageStates } from '../../support/global-auth.setup';

setup('prepare auth storage states', async ({}, testInfo) => {
  const baseURL = testInfo.project.use.baseURL;
  if (!baseURL) {
    throw new Error('APP_URL must be set on the project use.baseURL.');
  }
  await ensureAuthStorageStates(baseURL);
});
