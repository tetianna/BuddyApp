import { expect, test } from './fixtures';
import {
  expectCatalogAuthenticatedGet,
  expectCatalogUnauthenticatedGet,
  expectKeys,
} from './helpers/catalog-get';
import { testDescription } from './helpers/test-description';

const PATH = '/api/v1/availability';

test.describe('Availability API', () => {
  test(
    'authenticated GET returns catalog contract @api',
    testDescription(
      'Checks HTTP 200, Content-Type application/json, and top-level rules and exceptions arrays per api/CATALOG.md.',
    ),
    async ({ mainApi }) => {
      await expectCatalogAuthenticatedGet(mainApi, PATH, (body) => {
        expectKeys(body, ['rules', 'exceptions']);
        expect(Array.isArray((body as { rules: unknown }).rules)).toBeTruthy();
        expect(Array.isArray((body as { exceptions: unknown }).exceptions)).toBeTruthy();
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
