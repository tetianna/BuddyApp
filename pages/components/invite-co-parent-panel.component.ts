import type { Locator, Page } from '@playwright/test';

/** Inline panel shown after opening the co-parent invite flow on the dashboard. */
export class InviteCoParentPanelComponent {
  readonly inviteLink: Locator;
  readonly copyButton: Locator;

  constructor(page: Page) {
    this.inviteLink = page.locator('code').first();
    this.copyButton = page.getByRole('button', { name: 'copy', exact: true }).first();
  }

  /** Copies the co-parent invite link to the clipboard. */
  async copyInviteLink(): Promise<void> {
    await this.copyButton.click();
  }
}
