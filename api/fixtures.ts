import type { APIRequestContext } from '@playwright/test';

import { test as cleanupTest } from '../fixtures/cleanup.fixture';
import {
  createApiContextForOwner,
  createUnauthenticatedApiContext,
} from '../support/api-client';

type ApiFixtures = {
  mainApi: APIRequestContext;
  altApi: APIRequestContext;
  anonApi: APIRequestContext;
};

export const test = cleanupTest.extend<ApiFixtures>({
  mainApi: async ({}, use) => {
    const api = await createApiContextForOwner('main');
    await use(api);
    await api.dispose();
  },

  altApi: async ({}, use) => {
    if (!process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD) {
      const empty = await createUnauthenticatedApiContext();
      await use(empty);
      await empty.dispose();
      return;
    }
    const api = await createApiContextForOwner('alt');
    await use(api);
    await api.dispose();
  },

  anonApi: async ({}, use) => {
    const api = await createUnauthenticatedApiContext();
    await use(api);
    await api.dispose();
  },
});

export { expect, trackRecord } from '../fixtures/cleanup.fixture';
