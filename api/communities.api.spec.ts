import { expect, test } from './fixtures';
import {
  expectArray,
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectKeys,
} from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const LIST_PATH = '/api/v1/communities';

test.describe('Communities API', () => {
  test(
    'authenticated GET list returns catalog contract @api',
    testDescription(
      'Checks HTTP 200, Content-Type application/json, and a JSON array of community summaries per api/CATALOG.md.',
    ),
    async ({ mainApi }) => {
      await expectCatalogAuthenticatedGet(mainApi, LIST_PATH, (body) => {
        expectArray(body);
      });
    },
  );

  test(
    'unauthenticated GET list returns catalog status @api',
    testDescription('Calls list GET without a Bearer token and expects HTTP 401 per api/CATALOG.md.'),
    async ({ anonApi }) => {
      await expectCatalogUnauthenticatedGet(anonApi, LIST_PATH);
    },
  );

  test(
    'authenticated GET by id returns catalog contract @api',
    testDescription(
      'Uses the first community id from the list GET, then checks HTTP 200, JSON, and top-level fields id, name, type, description, myRole, myStatus, familiesCount, pendingCount, createdAt, and members (array) per api/CATALOG.md.',
    ),
    async ({ mainApi }) => {
      const listResponse = await mainApi.get(LIST_PATH);
      const list = (await listResponse.json()) as unknown[];
      expect(list.length).toBeGreaterThan(0);
      const first = list[0] as { id?: string };
      expect(typeof first.id).toBe('string');
      const detailPath = `/api/v1/communities/${first.id}`;

      await expectCatalogAuthenticatedGet(mainApi, detailPath, (body) => {
        expectKeys(body, [
          'id',
          'name',
          'type',
          'description',
          'myRole',
          'myStatus',
          'familiesCount',
          'pendingCount',
          'createdAt',
          'members',
        ]);
        expect(Array.isArray((body as { members: unknown }).members)).toBeTruthy();
      });
    },
  );

  test(
    'unauthenticated GET by id returns catalog status @api',
    testDescription(
      'Resolves a community id from the authenticated list, then calls detail GET without a token and expects HTTP 401 per api/CATALOG.md.',
    ),
    async ({ mainApi, anonApi }) => {
      const list = (await (await mainApi.get(LIST_PATH)).json()) as { id: string }[];
      const detailPath = `/api/v1/communities/${list[0].id}`;
      await expectCatalogUnauthenticatedGet(anonApi, detailPath);
    },
  );
});
