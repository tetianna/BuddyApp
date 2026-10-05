import type { Locator, Page } from '@playwright/test';

import type { BirthdayPartyFormInput } from '../../test-data/factories/birthday-party.factory';

/** On-page “Create a birthday party” form on `/birthdays`. */
export class BirthdayPartyFormComponent {
  readonly whoseBirthdayCombobox: Locator;
  readonly inviteChildrenGroup: Locator;
  readonly partyTitleField: Locator;
  readonly partyScheduleField: Locator;
  readonly venueField: Locator;
  readonly guestDetailsField: Locator;
  readonly invitationCardGroup: Locator;
  readonly createPartyButton: Locator;

  constructor(private readonly page: Page) {
    this.whoseBirthdayCombobox = page.getByRole('combobox').first();
    this.inviteChildrenGroup = page.getByRole('group', { name: 'Invite children' });
    this.partyTitleField = page.getByRole('textbox', { name: 'Party title' });
    this.partyScheduleField = page.getByRole('textbox').nth(1);
    this.venueField = page.getByRole('textbox', {
      name: 'Venue (e.g. our backyard, Chuck E. Cheese…)',
    });
    this.guestDetailsField = page.getByRole('textbox', { name: 'Details for guests (optional)' });
    this.invitationCardGroup = page.getByRole('radiogroup', { name: 'Invitation card' });
    this.createPartyButton = page.getByRole('button', { name: 'Create party', exact: true });
  }

  /** @param childFirstName One of your children listed in the birthday dropdown */
  async selectBirthdayChild(childFirstName: string): Promise<void> {
    await this.whoseBirthdayCombobox.selectOption({ label: childFirstName });
  }

  /** @param card Accessible name of the invitation card style radio */
  async selectInvitationCard(card: string): Promise<void> {
    await this.invitationCardGroup.getByRole('radio', { name: card, exact: true }).click();
  }

  /** Circle or community guest checkbox inside the invite group. */
  inviteGuestCheckbox(guestLabel: string): Locator {
    return this.inviteChildrenGroup.getByRole('checkbox', { name: guestLabel, exact: true });
  }

  /** Option locators for **Whose birthday? (optional)** (AQPBT-6 AC3). */
  whoseBirthdayOptions(): Locator {
    return this.whoseBirthdayCombobox.locator('option');
  }

  /** Fills the create form from a factory payload (does not submit). */
  async fillFromInput(input: BirthdayPartyFormInput): Promise<void> {
    if (input.birthdayChild) {
      await this.selectBirthdayChild(input.birthdayChild);
    }
    for (const invitee of input.invitees) {
      await this.inviteGuestCheckbox(invitee).check();
    }
    await this.partyTitleField.fill(input.partyTitle);
    await this.partyScheduleField.fill(input.scheduledAt);
    await this.venueField.fill(input.venue);
    await this.guestDetailsField.fill(input.guestDetails);
    await this.selectInvitationCard(input.invitationCard);
  }
}
