import dotenv from 'dotenv';
import { defineConfig } from '@playwright/test';

import { AUTH_FILE } from './support/auth.constants';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./support/global-setup.ts'),
  globalTeardown: require.resolve('./support/global-teardown.ts'),
  timeout: 30000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [[require.resolve('./support/cleanup-reporter.ts')], ['html', { open: 'never' }]]
    : [
        ['list'],
        [require.resolve('./support/cleanup-reporter.ts')],
        ['html', { open: 'never' }],
      ],
  use: {
    baseURL: process.env.APP_URL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    storageState: AUTH_FILE,
  },
  projects: [
    {
      name: 'tests',
      testMatch: '**/*.spec.ts',
    },
  ],
});
