import type { Page } from '@playwright/test';

export const MOCK_RECORD_ID_PREFIX = 'mock-';

const EVENTS_LIST_PATTERN = '**/api/v1/events';

/** Forces `GET /api/v1/events` to return an empty upcoming list. */
export async function mockEventsListEmpty(page: Page): Promise<void> {
  await page.route(EVENTS_LIST_PATTERN, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

/** Forces `GET /api/v1/events` to fail with a server error. */
export async function mockEventsListServerError(page: Page): Promise<void> {
  await page.route(EVENTS_LIST_PATTERN, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Mock server error' }),
    });
  });
}

/** Optional: mock create returning a deterministic mock id (ignored by auto-tracker). */
export async function mockBirthdayEventCreate(page: Page, mockId?: string): Promise<void> {
  const id = mockId ?? `${MOCK_RECORD_ID_PREFIX}${Date.now()}`;
  await page.route(EVENTS_LIST_PATTERN, async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        id,
        kind: 'birthday',
        title: 'Mock party',
        status: 'active',
      }),
    });
  });
}
