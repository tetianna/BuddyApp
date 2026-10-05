import type { Locator, Page } from '@playwright/test';

/** Inline panel shown after inviting a family from the dashboard or friends page. */
export class InviteFamilyPanelComponent {
  readonly inviteLink: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.inviteLink = page.locator('code').first();
    this.copyButton = page.getByRole('button', { name: 'copy', exact: true }).first();
  }

  /** Copies the circle invite link to the clipboard. */
  async copyInviteLink(): Promise<void> {
    await this.copyButton.click();
  }
}
