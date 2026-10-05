import type { Locator, Page } from '@playwright/test';

/** Actions panel for a connected family on the Friends page. */
export class ManageFriendPanelComponent {
  readonly reportButton: Locator;
  readonly blockButton: Locator;
  readonly removeButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.reportButton = page.getByRole('button', { name: 'report', exact: true });
    this.blockButton = page.getByRole('button', { name: 'block', exact: true });
    this.removeButton = page.getByRole('button', { name: 'remove', exact: true });
    this.cancelButton = page.getByRole('button', { name: 'cancel', exact: true });
  }

  /** Closes the manage panel without changing the connection. */
  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }
}
