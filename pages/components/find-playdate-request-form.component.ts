import type { Locator, Page } from '@playwright/test';

/** Propose-a-playdate form on `/playdates` and `/playdates/new`. */
export class FindPlaydateRequestFormComponent {
  readonly heading: Locator;
  readonly familyCombobox: Locator;
  readonly hostingCombobox: Locator;
  readonly startDateField: Locator;
  readonly startTimeField: Locator;
  readonly endTimeField: Locator;
  readonly locationNoteField: Locator;
  readonly optionalNoteField: Locator;
  readonly sendRequestButton: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Find a playdate', level: 2 });
    this.familyCombobox = page.getByRole('combobox').first();
    this.hostingCombobox = page.getByRole('combobox').nth(1);
    this.startDateField = page.getByRole('textbox').nth(0);
    this.startTimeField = page.getByRole('textbox').nth(1);
    this.endTimeField = page.getByRole('textbox').nth(2);
    this.locationNoteField = page.getByRole('textbox', {
      name: 'Location note, park name, or address',
    });
    this.optionalNoteField = page.getByRole('textbox', { name: 'Optional note' });
    this.sendRequestButton = page.getByRole('button', { name: 'Send request', exact: true });
  }

  /** @param familyName Connected family to propose a playdate with */
  async selectFamily(familyName: string): Promise<void> {
    await this.familyCombobox.selectOption({ label: familyName });
  }

  /** @param slotLabel Full accessible label of a suggested overlap slot button */
  async selectMatchedSlot(slotLabel: string): Promise<void> {
    await this.page.getByRole('button', { name: slotLabel, exact: true }).click();
  }

  /** @param note Location or meeting details for the other parent */
  async fillLocationNote(note: string): Promise<void> {
    await this.locationNoteField.fill(note);
  }

  /** Returns an attending-child checkbox by first name. */
  childCheckbox(childName: string): Locator {
    return this.page.getByRole('checkbox', { name: childName, exact: true });
  }
}
