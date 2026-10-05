import type { Locator, Page } from '@playwright/test';

/** Password confirmation step for permanent account deletion on Profile. */
export class DeleteAccountFormComponent {
  readonly passwordField: Locator;
  readonly deleteForeverButton: Locator;
  readonly keepAccountButton: Locator;

  constructor(page: Page) {
    this.passwordField = page.getByRole('textbox', { name: 'Your password' });
    this.deleteForeverButton = page.getByRole('button', { name: 'Delete forever', exact: true });
    this.keepAccountButton = page.getByRole('button', { name: 'Keep my account', exact: true });
  }

  /** @param password Current account password for confirmation */
  async fillPassword(password: string): Promise<void> {
    await this.passwordField.fill(password);
  }

  /** Dismisses the delete-account confirmation. */
  async keepAccount(): Promise<void> {
    await this.keepAccountButton.click();
  }
}
