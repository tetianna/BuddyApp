import type { Locator, Page } from '@playwright/test';

/** Create-group form on `/communities/new`. */
export class CreateCommunityFormComponent {
  readonly groupNameField: Locator;
  readonly typeCombobox: Locator;
  readonly descriptionField: Locator;
  readonly createGroupButton: Locator;
  readonly cancelLink: Locator;

  constructor(private readonly page: Page) {
    this.groupNameField = page.getByRole('textbox', { name: 'Group name' });
    this.typeCombobox = page.getByRole('combobox', { name: 'Type' });
    this.descriptionField = page.getByRole('textbox', { name: 'Description (optional)' });
    this.createGroupButton = page.getByRole('button', { name: 'Create group', exact: true });
    this.cancelLink = page.getByRole('link', { name: 'Cancel', exact: true });
  }

  /** @param name Display name for the new community */
  async fillGroupName(name: string): Promise<void> {
    await this.groupNameField.fill(name);
  }

  /** @param description Optional community description */
  async fillDescription(description: string): Promise<void> {
    await this.descriptionField.fill(description);
  }

  /** Returns a child membership checkbox by the child's first name. */
  childCheckbox(childName: string): Locator {
    return this.page.getByRole('checkbox', { name: childName, exact: true });
  }

  /** Navigates back to the communities list without saving. */
  async cancel(): Promise<void> {
    await this.cancelLink.click();
  }
}
