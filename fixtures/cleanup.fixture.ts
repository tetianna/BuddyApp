import { test as base, expect } from '@playwright/test';

import {
  trackRecord,
  type RecordOwner,
  type TrackedRecord,
} from '../support/record-tracker';

export { expect, trackRecord };

type CleanupFixtures = {
  /** Which family's API context owns UI-created records (default: main / `AUTH_FILE`). */
  recordOwner: RecordOwner;
};

const CREATE_EVENT_PATH = /\/api\/v1\/events\/?$/;

function isBirthdayEventCreate(method: string, pathname: string): boolean {
  return method === 'POST' && CREATE_EVENT_PATH.test(pathname);
}

export const test = base.extend<CleanupFixtures>({
  recordOwner: ['main', { option: true }],

  page: async ({ page, recordOwner }, use) => {
    page.on('response', (response) => {
      void (async () => {
        const request = response.request();
        if (!isBirthdayEventCreate(request.method(), new URL(request.url()).pathname)) {
          return;
        }
        if (response.status() !== 201) {
          return;
        }

        let id: string | undefined;
        try {
          const body = (await response.json()) as { id?: string };
          id = body.id;
        } catch {
          return;
        }

        if (!id || id.startsWith('mock-')) {
          return;
        }

        trackRecord({
          type: 'birthday-event',
          id,
          owner: recordOwner,
        });
      })();
    });

    await use(page);
  },
});

export type { TrackedRecord, RecordOwner };
