import { DashboardPage } from '../../pages/dashboard.page';
import { createApiContextForOwner, createHostChild } from '../../support/api-client';
import { countHostChildrenInMe } from '../../support/me-family';
import { jsonIncludesValue } from '../../api/helpers/catalog-get';
import {
  buildChildPayload,
  formatDashboardChildRow,
} from '../../test-data/factories/child.factory';
import { expect, test, trackRecord } from '../../fixtures/cleanup.fixture';

test.describe('Children — API arrange, UI remove, API prove', () => {
  test.describe.configure({ mode: 'serial' });

  test(
    'API create appears on dashboard; UI remove clears GET /api/v1/me',
    { tag: '@destructive' },
    async ({ page }) => {
      const dashboard = new DashboardPage(page);
      let childId = '';
      let childFirstName = '';
      let childRowLabel = '';
      let myKidsCountBefore = 0;

      await test.step('API: arrange', async () => {
        const api = await createApiContextForOwner('main');
        try {
          const meBefore = await api.get('/api/v1/me');
          expect(meBefore.status()).toBe(200);
          myKidsCountBefore = countHostChildrenInMe(await meBefore.json());

          const payload = buildChildPayload();
          const created = await createHostChild(api, payload);

          trackRecord({
            type: 'host-child',
            id: created.id,
            owner: 'main',
          });

          childId = created.id;
          childFirstName = created.firstName;
          childRowLabel = formatDashboardChildRow(
            created.firstName,
            created.age,
            created.gender,
          );
        } finally {
          await api.dispose();
        }
      });

      await test.step('UI: check', async () => {
        await dashboard.goto();
        await dashboard.waitForKidsSectionReady();

        await expect(dashboard.childSummaryLine(childRowLabel)).toBeVisible();
        await expect
          .poll(async () => dashboard.readMyKidsCount())
          .toBe(myKidsCountBefore + 1);
      });

      await test.step('UI: act', async () => {
        await dashboard.removeChild(childFirstName);
      });

      await test.step('API: prove', async () => {
        await expect
          .poll(async () => {
            const api = await createApiContextForOwner('main');
            try {
              const meResponse = await api.get('/api/v1/me');
              expect(meResponse.status()).toBe(200);
              const meBody: unknown = await meResponse.json();
              return jsonIncludesValue(meBody, childId);
            } finally {
              await api.dispose();
            }
          })
          .toBe(false);
      });
    },
  );
});
