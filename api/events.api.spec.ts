import { expect, test } from './fixtures';
import {
  expectArray,
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectKeys,
} from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const PATH = '/api/v1/events';

test.describe('Events API', () => {
  test(
    'authenticated GET returns catalog contract @api',
    testDescription(
      'Checks HTTP 200, Content-Type application/json, a JSON array of events, and when non-empty each item has string id, kind, and status per api/CATALOG.md.',
    ),
    async ({ mainApi }) => {
      await expectCatalogAuthenticatedGet(mainApi, PATH, (body) => {
        expectArray(body);
        const events = body as Record<string, unknown>[];
        if (events.length === 0) {
          return;
        }
        const first = events[0];
        expectKeys(first, ['id', 'kind', 'status']);
        expect(typeof first.id).toBe('string');
        expect(typeof first.kind).toBe('string');
        expect(typeof first.status).toBe('string');
      });
    },
  );

  test(
    'unauthenticated GET returns catalog status @api',
    testDescription('Calls GET without a Bearer token and expects HTTP 401 per api/CATALOG.md.'),
    async ({ anonApi }) => {
      await expectCatalogUnauthenticatedGet(anonApi, PATH);
    },
  );
});
