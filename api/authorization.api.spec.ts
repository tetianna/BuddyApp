import { createHostChild } from '../support/api-client';
import { buildApiTestChildPayload } from '../test-data/factories/api-child.factory';
import { expect, test, trackRecord } from './fixtures';
import { jsonIncludesValue } from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const ME_PATH = '/api/v1/me';

/** From api/CATALOG.md — Authorization (two families), observed in authorization.api.spec.ts pass. */
const ALT_DELETE_OTHER_FAMILY_CHILD_STATUS = 404;
/** From api/CATALOG.md — Authorization (two families), observed in authorization.api.spec.ts pass. */
const ANON_DELETE_CHILD_STATUS = 401;

function childDeletePath(childId: string): string {
  return `/api/v1/children/${childId}`;
}

async function expectMeIncludesChild(
  api: Parameters<typeof createHostChild>[0],
  childId: string,
  firstName: string,
): Promise<void> {
  const meResponse = await api.get(ME_PATH);
  expect(meResponse.status()).toBe(200);
  const meBody: unknown = await meResponse.json();
  expect(jsonIncludesValue(meBody, childId)).toBeTruthy();
  expect(jsonIncludesValue(meBody, firstName)).toBeTruthy();
}

async function expectMeExcludesChild(
  api: Parameters<typeof createHostChild>[0],
  childId: string,
  firstName: string,
): Promise<void> {
  const meResponse = await api.get(ME_PATH);
  expect(meResponse.status()).toBe(200);
  const meBody: unknown = await meResponse.json();
  expect(jsonIncludesValue(meBody, childId)).toBeFalsy();
  expect(jsonIncludesValue(meBody, firstName)).toBeFalsy();
}

test.describe('Authorization (two families)', () => {
  test(
    'alt family cannot delete main family host child',
    {
      ...testDescription(
        `mainApi creates a disposable host child (trackRecord immediately); altApi DELETE /api/v1/children/{id} expects HTTP ${ALT_DELETE_OTHER_FAMILY_CHILD_STATUS}; mainApi GET /api/v1/me still lists the child; altApi GET /api/v1/me does not (api/CATALOG.md).`,
      ),
      tag: '@api',
    },
    async ({ mainApi, altApi, recordOwner }) => {
      test.skip(
        !process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD,
        'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD must be set for the second family',
      );

      const payload = buildApiTestChildPayload();
      const created = await createHostChild(mainApi, payload);
      trackRecord({
        type: 'host-child',
        id: created.id,
        owner: recordOwner,
      });

      const deleteResponse = await altApi.delete(childDeletePath(created.id));
      expect(deleteResponse.status()).toBe(ALT_DELETE_OTHER_FAMILY_CHILD_STATUS);

      await expectMeIncludesChild(mainApi, created.id, payload.firstName);
      await expectMeExcludesChild(altApi, created.id, payload.firstName);
    },
  );

  test(
    'anonymous caller cannot delete main family host child',
    {
      ...testDescription(
        `mainApi creates a disposable host child (trackRecord immediately); anonApi DELETE /api/v1/children/{id} expects HTTP ${ANON_DELETE_CHILD_STATUS}; mainApi GET /api/v1/me still lists the child (api/CATALOG.md).`,
      ),
      tag: '@api',
    },
    async ({ mainApi, anonApi, recordOwner }) => {
      const payload = buildApiTestChildPayload();
      const created = await createHostChild(mainApi, payload);
      trackRecord({
        type: 'host-child',
        id: created.id,
        owner: recordOwner,
      });

      const deleteResponse = await anonApi.delete(childDeletePath(created.id));
      expect(deleteResponse.status()).toBe(ANON_DELETE_CHILD_STATUS);

      await expectMeIncludesChild(mainApi, created.id, payload.firstName);
    },
  );
});
