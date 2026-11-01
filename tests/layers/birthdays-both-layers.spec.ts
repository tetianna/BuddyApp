import { BirthdayPartyManagePage } from '../../pages/birthday-party-manage.page';
import { BirthdaysPage } from '../../pages/birthdays.page';
import { createApiContextForOwner, createBirthdayEvent } from '../../support/api-client';
import { findFirstHostChildInMe } from '../../support/me-family';
import {
  buildBirthdayEventApiPayload,
  buildBirthdayPartyFormInput,
} from '../../test-data/factories/birthday-party.factory';
import { AppRoute } from '../../test-data/routes';
import { expect, test, trackRecord } from '../../fixtures/cleanup.fixture';

const EVENTS_PATH = '/api/v1/events';
const ME_PATH = '/api/v1/me';

type EventListItem = { id: string; kind: string; status: string };

function hasActiveBirthdayEvent(events: EventListItem[], partyId: string): boolean {
  return events.some(
    (event) => event.id === partyId && event.kind === 'birthday' && event.status === 'active',
  );
}

test.describe('Birthdays — API arrange, UI cancel, API prove', () => {
  test(
    'POST /api/v1/events party appears on /birthdays; UI cancel clears active event',
    { tag: '@regression' },
    async ({ page }) => {
      const unique = Date.now();
      const expectedTitle = `TKK layers test ${unique}`;
      const input = buildBirthdayPartyFormInput({
        partyTitle: expectedTitle,
      });
      const birthdaysPage = new BirthdaysPage(page);
      let partyId = '';
      let partyTitle = expectedTitle;

      await test.step('API: arrange', async () => {
        const api = await createApiContextForOwner('main');
        try {
          const meResponse = await api.get(ME_PATH);
          expect(meResponse.status()).toBe(200);
          const meBody: unknown = await meResponse.json();
          const hostChild = findFirstHostChildInMe(meBody);
          expect(hostChild).toBeTruthy();

          const payload = buildBirthdayEventApiPayload(input, hostChild!.id);
          const created = await createBirthdayEvent(api, payload);

          trackRecord({
            type: 'birthday-event',
            id: created.id,
            owner: 'main',
          });

          partyId = created.id;
          expect(created.title).toBe(expectedTitle);
          expect(created.kind).toBe('birthday');
          expect(created.status).toBe('active');
        } finally {
          await api.dispose();
        }
      });

      await test.step('UI: check', async () => {
        await birthdaysPage.goto();
        await birthdaysPage.waitForPartiesListReady();
        await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
        await expect(birthdaysPage.partyTitleInList(partyTitle)).toBeVisible();
        await expect(birthdaysPage.manageLinkForPartyId(partyId)).toBeVisible();
      });

      await test.step('UI: act', async () => {
        await birthdaysPage.manageLinkForPartyId(partyId).click();
        await expect(page).toHaveURL(new RegExp(`/birthdays/${partyId}(\\?|$)`));

        const managePage = new BirthdayPartyManagePage(page);
        await managePage.cancelPartyAndReturnToList();
        await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
        await birthdaysPage.waitForPartiesListReady();
        await expect(birthdaysPage.manageLinkForPartyId(partyId)).toHaveCount(0);
      });

      await test.step('API: prove', async () => {
        await expect
          .poll(async () => {
            const api = await createApiContextForOwner('main');
            try {
              const response = await api.get(EVENTS_PATH);
              if (response.status() !== 200) {
                return false;
              }
              const events = (await response.json()) as EventListItem[];
              return !hasActiveBirthdayEvent(events, partyId);
            } finally {
              await api.dispose();
            }
          })
          .toBe(true);
      });
    },
  );
});
