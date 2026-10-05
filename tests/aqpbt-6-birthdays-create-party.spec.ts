import { expect, test } from '../fixtures/cleanup.fixture';
import { BirthdayPartyManagePage } from '../pages/birthday-party-manage.page';
import { BirthdaysPage } from '../pages/birthdays.page';
import { cancelAllActiveBirthdayEvents } from '../support/api-client';
import { PARTY_CREATED_STATUS_SNIPPET } from '../test-data/birthday-party.copy';
import {
  BirthdayChild,
  BirthdayPartyInvitee,
  InvitationCardTheme,
  WHOSE_BIRTHDAY_PLACEHOLDER,
  buildBirthdayPartyFormInput,
} from '../test-data/factories/birthday-party.factory';
import {
  CHROMIUM_REQUIRED_FIELD_MESSAGE,
  invalidBirthdayPartyInputs,
} from '../test-data/invalid-birthday-party';
import { AppRoute } from '../test-data/routes';

/**
 * AQPBT-6 — Jira story AC 1–16 (create + manage party).
 * Gherkin: features/AQPBT-6.feature.md
 * Shared main-family account: use `--workers=1` with this file (serial order).
 * Creates in AC10+ are tracked; teardown is API cancel via global cleanup.
 */
test.describe('AQPBT-6 — birthdays create party', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async () => {
    await cancelAllActiveBirthdayEvents('main');
  });

  test('AQPBT-6 AC1 — banner and create heading @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.waitForPartiesListReady();

    await expect(birthdaysPage.header.banner).toContainText('Birthdays');
    await expect(birthdaysPage.createPartyHeading).toBeVisible();
  });

  test('AQPBT-6 AC2 — empty parties copy @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.waitForPartiesListReady();

    await expect(birthdaysPage.emptyPartiesMessage).toBeVisible();
  });

  test('AQPBT-6 AC3 — whose-birthday dropdown options @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();

    await expect(birthdaysPage.form.whoseBirthdayOptions()).toHaveText([
      WHOSE_BIRTHDAY_PLACEHOLDER,
      BirthdayChild.Mia,
      BirthdayChild.Maria,
    ]);
  });

  test('AQPBT-6 AC4 — invite-children helper copy @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();

    await expect(birthdaysPage.form.inviteChildrenGroup).toContainText(
      'Their parents get an email with the RSVP link.',
    );
  });

  test('AQPBT-6 AC5 — circle and community invite checkboxes @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    const inviteGroup = birthdaysPage.form.inviteChildrenGroup;

    await expect(inviteGroup).toContainText('Your circle');
    await expect(inviteGroup).toContainText('Maple Class');
    await expect(
      birthdaysPage.form.inviteGuestCheckbox(BirthdayPartyInvitee.EthanTheNguyens),
    ).toBeVisible();
    await expect(
      birthdaysPage.form.inviteGuestCheckbox(BirthdayPartyInvitee.SofiaThePetrovs),
    ).toBeVisible();
    await expect(
      birthdaysPage.form.inviteGuestCheckbox(BirthdayPartyInvitee.ZaraTheAhmeds),
    ).toBeVisible();
  });

  test('AQPBT-6 AC6 — party detail fields @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    const form = birthdaysPage.form;

    await expect(form.partyTitleField).toBeVisible();
    await expect(form.partyScheduleField).toBeVisible();
    await expect(form.venueField).toBeVisible();
    await expect(form.guestDetailsField).toBeVisible();
  });

  test('AQPBT-6 AC7 — invitation card theme radios @regression', async ({ page }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    const cardGroup = birthdaysPage.form.invitationCardGroup;

    for (const theme of Object.values(InvitationCardTheme)) {
      await expect(cardGroup.getByRole('radio', { name: theme, exact: true })).toBeVisible();
    }
  });

  test('AQPBT-6 AC8 — blocks create when required title and date are empty @regression', async ({
    page,
  }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    const form = birthdaysPage.form;
    const invalid = invalidBirthdayPartyInputs[0];

    await form.partyTitleField.fill(invalid.partyTitle);
    await form.partyScheduleField.fill(invalid.scheduledAt);
    await form.createPartyButton.click();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
    await expect(form.partyTitleField).toHaveJSProperty(
      'validationMessage',
      CHROMIUM_REQUIRED_FIELD_MESSAGE,
    );
  });

  test('AQPBT-6 AC9 — no party after partial fill and sidebar navigation @regression', async ({
    page,
  }) => {
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    const form = birthdaysPage.form;

    await form.selectInvitationCard(InvitationCardTheme.Dinosaur);
    await form.inviteGuestCheckbox(BirthdayPartyInvitee.EthanTheNguyens).check();
    await birthdaysPage.header.calendarLink.click();
    await expect(page).toHaveURL(new RegExp(`${AppRoute.Calendar}(\\?|$)`));
    await birthdaysPage.header.birthdaysLink.click();
    await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
    await expect(birthdaysPage.emptyPartiesMessage).toBeVisible();
  });

  test('AQPBT-6 AC10 — create party shows status and list row @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
    await expect(birthdaysPage.partyCreatedStatus).toContainText(PARTY_CREATED_STATUS_SNIPPET);
    await expect(birthdaysPage.partyTitleInList(input.partyTitle)).toBeVisible();
    await expect(birthdaysPage.firstManageLink).toBeVisible();
  });

  test('AQPBT-6 AC11 — manage screen host actions and empty RSVPs @regression', async ({
    page,
  }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.openManageParty(input.partyTitle);

    const managePage = new BirthdayPartyManagePage(page);
    await expect(birthdaysPage.header.banner).toContainText('Birthdays');
    await expect(managePage.partyTitleOnManage(input.partyTitle)).toBeVisible();
    await expect(page).toHaveURL(/\/birthdays\/[0-9a-f-]+/i);
    await expect(managePage.editButton).toBeVisible();
    await expect(managePage.copyGuestLinkButton).toBeVisible();
    await expect(managePage.cancelPartyButton).toBeVisible();
    await expect(managePage.addToCalendarLink).toBeVisible();
    await expect(managePage.sendInvitesButton).toBeVisible();
    await expect(managePage.rsvpEmptyState).toBeVisible();
  });

  test('AQPBT-6 AC12 — manage guest link and invite helper copy @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.openManageParty(input.partyTitle);

    const managePage = new BirthdayPartyManagePage(page);
    await expect(managePage.guestLinkLabel).toBeVisible();
    await expect(managePage.inviteByEmailSection).toBeVisible();
    await expect(managePage.inviteByEmailHelper).toBeVisible();
  });

  test('AQPBT-6 AC13 — list card shows Manage and copy RSVP link @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();

    await expect(birthdaysPage.partyTitleInList(input.partyTitle)).toBeVisible();
    await expect(birthdaysPage.firstManageLink).toBeVisible();
    await expect(birthdaysPage.copyRsvpLinkButton).toBeVisible();
  });

  test('AQPBT-6 AC14 — Edit mode shows manage fields @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.openManageParty(input.partyTitle);

    const managePage = new BirthdayPartyManagePage(page);
    await managePage.enterEditMode();

    await expect(managePage.saveChangesButton).toBeVisible();
    await expect(managePage.discardButton).toBeVisible();
    await expect(managePage.editDateAndTimeField).toBeVisible();
    await expect(managePage.editTitleField).toBeVisible();
    await expect(managePage.editVenueField).toBeVisible();
    await expect(managePage.editDetailsField).toBeVisible();
  });

  test('AQPBT-6 AC15 — Discard closes edit mode on manage @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.openManageParty(input.partyTitle);

    const managePage = new BirthdayPartyManagePage(page);
    const manageUrl = page.url();
    await managePage.enterEditMode();
    await managePage.discardEdits();

    await expect(page).toHaveURL(manageUrl);
    await expect(managePage.editButton).toBeVisible();
    await expect(managePage.saveChangesButton).toBeHidden();
  });

  test('AQPBT-6 AC16 — dismiss Cancel party confirm stays on manage @regression', async ({
    page,
  }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.openManageParty(input.partyTitle);

    const managePage = new BirthdayPartyManagePage(page);
    const manageUrl = page.url();
    await managePage.dismissCancelPartyConfirm();

    await expect(page).toHaveURL(manageUrl);
    await expect(managePage.cancelPartyButton).toBeVisible();
  });

  test('AQPBT-6 — optional birthday child placeholder still creates party @regression', async ({
    page,
  }) => {
    const input = buildBirthdayPartyFormInput({ birthdayChild: null });
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();

    await expect(page).toHaveURL(new RegExp(`${AppRoute.Birthdays}(\\?|$)`));
    await expect(birthdaysPage.partyTitleInList(input.partyTitle)).toBeVisible();
  });

  test('AQPBT-6 — card and invitees without submit leaves empty list @regression', async ({
    page,
  }) => {
    await cancelAllActiveBirthdayEvents('main');
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.waitForPartiesListReady();
    const form = birthdaysPage.form;

    await form.selectInvitationCard(InvitationCardTheme.Dinosaur);
    await form.inviteGuestCheckbox(BirthdayPartyInvitee.EthanTheNguyens).check();

    await expect(birthdaysPage.emptyPartiesMessage).toBeVisible();
  });

  test('AQPBT-6 — upcoming parties hide empty-state copy @regression', async ({ page }) => {
    const input = buildBirthdayPartyFormInput();
    const birthdaysPage = new BirthdaysPage(page);
    await birthdaysPage.goto();
    await birthdaysPage.form.fillFromInput(input);
    await birthdaysPage.form.createPartyButton.click();
    await birthdaysPage.waitForPartiesListReady();
    await birthdaysPage.goto();
    await birthdaysPage.waitForPartiesListReady();

    await expect(birthdaysPage.emptyPartiesMessage).toBeHidden();
    await expect(birthdaysPage.allManageLinks.first()).toBeVisible();
  });
});
