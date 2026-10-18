import { test } from './fixtures';
import {
  expectArray,
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
} from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const PATH = '/api/v1/playdates';

test.describe('Playdates API', () => {
  test(
    'authenticated GET returns catalog contract @api',
    testDescription(
      'Checks HTTP 200, Content-Type application/json, and a JSON array body per api/CATALOG.md (may be empty).',
    ),
    async ({ mainApi }) => {
      await expectCatalogAuthenticatedGet(mainApi, PATH, (body) => {
        expectArray(body);
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
