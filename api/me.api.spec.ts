import { expect, test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectKeys,
} from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const PATH = '/api/v1/me';

test.describe('Me API', () => {
  test(
    'authenticated GET returns catalog contract @api',
    testDescription(
      'Checks HTTP 200, Content-Type application/json, and top-level fields parent (object), family (object), and isAdmin (boolean) per api/CATALOG.md.',
    ),
    async ({ mainApi }) => {
      await expectCatalogAuthenticatedGet(mainApi, PATH, (body) => {
        expectKeys(body, ['parent', 'family', 'isAdmin']);
        expect(typeof (body as { parent: unknown }).parent).toBe('object');
        expect(typeof (body as { family: unknown }).family).toBe('object');
        expect(typeof (body as { isAdmin: unknown }).isAdmin).toBe('boolean');
      });
    },
  );

  test(
    'unauthenticated GET returns catalog status @api',
    testDescription(
      'Calls GET without a Bearer token and expects HTTP 401, as recorded in api/CATALOG.md.',
    ),
    async ({ anonApi }) => {
      await expectCatalogUnauthenticatedGet(anonApi, PATH);
    },
  );
});
