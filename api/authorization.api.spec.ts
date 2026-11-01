import { createHostChild } from '../support/api-client';
import { buildApiTestChildPayload } from '../test-data/factories/api-child.factory';
import { expect, test, trackRecord } from './fixtures';
import { jsonIncludesValue } from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const ME_PATH = '/api/v1/me';
const COMMUNITIES_PATH = '/api/v1/communities';

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

function assertNot5xx(status: number, endpoint: string): void {
  if (status >= 500) {
    throw new Error(`5xx stop: ${endpoint} returned HTTP ${status}`);
  }
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

  test.describe.configure({ mode: 'serial' });

  test.describe('Cross-family read boundaries', () => {
    let markerChildId = '';
    let markerChildName = '';
    let mainCommunityId = '';

    async function assertMainStillOwnsMarker(
      mainApi: Parameters<typeof createHostChild>[0],
    ): Promise<void> {
      const meResponse = await mainApi.get(ME_PATH);
      expect(meResponse.status()).toBe(200);
      const meBody: unknown = await meResponse.json();
      expect(jsonIncludesValue(meBody, markerChildId)).toBeTruthy();
      expect(jsonIncludesValue(meBody, markerChildName)).toBeTruthy();
    }

    async function assertBodyExcludesMarker(body: unknown): Promise<void> {
      expect(jsonIncludesValue(body, markerChildId)).toBeFalsy();
      expect(jsonIncludesValue(body, markerChildName)).toBeFalsy();
    }

    test.beforeAll(async ({ mainApi, recordOwner }) => {
      const payload = buildApiTestChildPayload();
      const created = await createHostChild(mainApi, payload);
      trackRecord({ type: 'host-child', id: created.id, owner: recordOwner });
      markerChildId = created.id;
      markerChildName = payload.firstName;

      const listResponse = await mainApi.get(COMMUNITIES_PATH);
      assertNot5xx(listResponse.status(), `GET ${COMMUNITIES_PATH} (setup)`);
      expect(listResponse.status()).toBe(200);
      const list = (await listResponse.json()) as { id?: string }[];
      expect(list.length).toBeGreaterThan(0);
      expect(typeof list[0]?.id).toBe('string');
      mainCommunityId = list[0].id as string;
    });

    const altGetLabels: { probePath: string; label: string }[] = [
      { probePath: ME_PATH, label: 'GET /api/v1/me' },
      { probePath: '/api/v1/connections', label: 'GET /api/v1/connections' },
      { probePath: 'COMMUNITY_BY_ID', label: 'GET /api/v1/communities/{id}' },
      { probePath: '/api/v1/availability', label: 'GET /api/v1/availability' },
      { probePath: '/api/v1/playdates', label: 'GET /api/v1/playdates' },
      {
        probePath: '/api/v1/playdates?filter=upcoming',
        label: 'GET /api/v1/playdates?filter=upcoming',
      },
      { probePath: '/api/v1/matches', label: 'GET /api/v1/matches' },
      { probePath: '/api/v1/events', label: 'GET /api/v1/events' },
    ];

    for (const { probePath, label } of altGetLabels) {
      test(
        `alt family — ${label}`,
        {
          ...testDescription(
            `altApi calls ${label} using main family context where applicable; response must not include main marker child; mainApi GET /api/v1/me confirms marker still owned by main.`,
          ),
          tag: '@api',
        },
        async ({ mainApi, altApi }) => {
          test.skip(
            !process.env.APP_ALT_USER_EMAIL || !process.env.APP_ALT_USER_PASSWORD,
            'APP_ALT_USER_EMAIL and APP_ALT_USER_PASSWORD must be set for the second family',
          );

          const pathToCall =
            probePath === 'COMMUNITY_BY_ID'
              ? `/api/v1/communities/${mainCommunityId}`
              : probePath;

          const response = await altApi.get(pathToCall);
          const status = response.status();
          assertNot5xx(status, label);

          if (status === 200) {
            const body: unknown = await response.json();
            if (jsonIncludesValue(body, markerChildId) || jsonIncludesValue(body, markerChildName)) {
              expect(jsonIncludesValue(body, markerChildId)).toBeFalsy();
            }
            await assertBodyExcludesMarker(body);
            await assertMainStillOwnsMarker(mainApi);
          } else if (status === 401 || status === 403 || status === 404) {
            await assertMainStillOwnsMarker(mainApi);
          }
        },
      );
    }
  });
});
