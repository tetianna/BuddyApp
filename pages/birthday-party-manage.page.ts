import type { Locator, Page } from '@playwright/test';

import {
  CANCEL_PARTY_CONFIRM_MESSAGE,
  GUEST_LINK_LABEL,
  INVITE_BY_EMAIL_HELPER_COPY,
  RSVP_EMPTY_STATE_COPY,
} from '../test-data/birthday-party.copy';

/** Host manage view at `/birthdays/{partyId}` after **Manage →**. */
export class BirthdayPartyManagePage {
  readonly editButton: Locator;
  readonly copyGuestLinkButton: Locator;
  readonly cancelPartyButton: Locator;
  readonly sendInvitesButton: Locator;
  readonly addToCalendarLink: Locator;
  readonly saveChangesButton: Locator;
  readonly discardButton: Locator;
  readonly guestLinkLabel: Locator;
  readonly inviteByEmailSection: Locator;
  readonly inviteByEmailHelper: Locator;
  readonly rsvpEmptyState: Locator;
  readonly editDateAndTimeField: Locator;
  readonly editTitleField: Locator;
  readonly editVenueField: Locator;
  readonly editDetailsField: Locator;

  constructor(private readonly page: Page) {
    this.editButton = page.getByRole('button', { name: 'Edit', exact: true });
    this.copyGuestLinkButton = page.getByRole('button', { name: 'copy', exact: true });
    this.cancelPartyButton = page.getByRole('button', { name: 'Cancel party', exact: true });
    this.sendInvitesButton = page.getByRole('button', { name: 'Send invites', exact: true });
    this.addToCalendarLink = page.getByRole('link', { name: 'Add to my calendar', exact: true });
    this.saveChangesButton = page.getByRole('button', { name: 'Save changes', exact: true });
    this.discardButton = page.getByRole('button', { name: 'Discard', exact: true });
    this.guestLinkLabel = page.getByText(GUEST_LINK_LABEL, { exact: true });
    this.inviteByEmailSection = page.getByText('Invite by email', { exact: false });
    this.inviteByEmailHelper = page.getByText(INVITE_BY_EMAIL_HELPER_COPY);
    this.rsvpEmptyState = page.getByText(RSVP_EMPTY_STATE_COPY);
    this.editDateAndTimeField = page.getByRole('textbox', { name: 'Date and time' });
    this.editTitleField = page.getByRole('textbox', { name: 'Title' });
    this.editVenueField = page.getByRole('textbox', { name: 'Venue' });
    this.editDetailsField = page.getByRole('textbox', { name: 'Details' });
  }

  /** Party title as shown on the manage screen (read-only or edit). */
  partyTitleOnManage(partyTitle: string): Locator {
    return this.page.getByText(partyTitle, { exact: false });
  }

  /** Opens inline edit fields on `/birthdays/{partyId}`. */
  async enterEditMode(): Promise<void> {
    await this.editButton.click();
  }

  /** Leaves edit mode without saving (same URL). */
  async discardEdits(): Promise<void> {
    await this.discardButton.click();
  }

  /** Dismisses the native cancel confirm and stays on manage. */
  async dismissCancelPartyConfirm(): Promise<void> {
    this.page.once('dialog', (dialog) => {
      void dialog.dismiss();
    });
    await this.cancelPartyButton.click();
  }

  /** Accepts the native **Cancel party** confirm and waits for navigation back to the list. */
  async cancelPartyAndReturnToList(): Promise<void> {
    this.page.once('dialog', (dialog) => {
      if (dialog.message() !== CANCEL_PARTY_CONFIRM_MESSAGE) {
        throw new Error(`Unexpected dialog: ${dialog.message()}`);
      }
      void dialog.accept();
    });
    await this.cancelPartyButton.click();
    await this.page.waitForURL(/\/birthdays(\/[0-9a-f-]+)?\/?(\?|$)/i);
  }
}
