import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

/** One weekly slot row as shown in the availability grid. */
export type WeeklySlotSnapshot = {
  day: string;
  startTime: string;
  endTime: string;
  kid: string;
  hosting: string;
  notice: string;
};

export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly weeklyAvailabilityLabel: Locator;
  readonly oneOffChangesLabel: Locator;
  readonly weeklyAvailabilityPanel: Locator;
  readonly oneOffChangesSection: Locator;
  readonly weekendAfternoonsButton: Locator;
  readonly addSlotButton: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly addExceptionButton: Locator;
  readonly exceptionDateField: Locator;
  readonly exceptionTypeCombobox: Locator;
  readonly exceptionNoteField: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { name: 'Set your weekly free time', level: 2 });
    this.weeklyAvailabilityLabel = page.getByText('Weekly availability', { exact: true });
    this.oneOffChangesLabel = page.getByText('One-off changes', { exact: true });
    this.weeklyAvailabilityPanel = page
      .locator('div')
      .filter({
        has: this.heading,
        has: page.getByRole('button', { name: 'Save availability', exact: true }),
        hasNot: this.oneOffChangesLabel,
      })
      .first();
    this.oneOffChangesSection = page
      .locator('div')
      .filter({
        has: this.oneOffChangesLabel,
        has: page.getByRole('button', { name: 'Add exception', exact: true }),
      })
      .last();
    this.weekendAfternoonsButton = page.getByRole('button', {
      name: 'Weekend afternoons',
      exact: true,
    });
    this.addSlotButton = page.getByRole('button', { name: '+ Add slot', exact: true });
    this.saveAvailabilityButton = page.getByRole('button', {
      name: 'Save availability',
      exact: true,
    });
    this.addExceptionButton = this.oneOffChangesSection.getByRole('button', {
      name: 'Add exception',
      exact: true,
    });
    this.exceptionDateField = this.oneOffChangesSection.getByRole('textbox').first();
    this.exceptionTypeCombobox = this.oneOffChangesSection.getByRole('combobox');
    this.exceptionNoteField = this.oneOffChangesSection.getByRole('textbox', {
      name: 'Optional note',
    });
  }

  /** Opens weekly availability settings. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }

  /** Waits until weekly slots and the save action have loaded. */
  async waitForWeeklyReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.heading.waitFor();
    await this.saveAvailabilityButton.waitFor();
  }

  /** Locator for the slot row whose day dropdown matches `dayAbbrev` (e.g. Sat, Sun). */
  weeklyDaySlotRow(dayAbbrev: string): Locator {
    return this.weeklyAvailabilityPanel
      .getByRole('combobox', { name: 'Day' })
      .filter({ has: this.page.locator('option:checked', { hasText: dayAbbrev }) })
      .locator('..');
  }

  /** Start time field for a weekly day row. */
  weeklyDayStartTime(dayAbbrev: string): Locator {
    return this.weeklyDaySlotRow(dayAbbrev).getByRole('textbox', { name: 'Start time' });
  }

  /** End time field for a weekly day row. */
  weeklyDayEndTime(dayAbbrev: string): Locator {
    return this.weeklyDaySlotRow(dayAbbrev).getByRole('textbox', { name: 'End time' });
  }

  /** Applies the weekend-afternoons quick template. */
  async applyWeekendAfternoonsTemplate(): Promise<void> {
    await this.weekendAfternoonsButton.click();
  }

  /** Persists the current weekly slot grid. */
  async saveAvailability(): Promise<void> {
    await this.saveAvailabilityButton.click();
  }

  /** Reads all weekly slot rows currently shown in the grid. */
  async readWeeklySlots(): Promise<WeeklySlotSnapshot[]> {
    await this.waitForWeeklyReady();
    const dayComboboxes = this.weeklyAvailabilityPanel.getByRole('combobox', { name: 'Day' });
    const count = await dayComboboxes.count();
    const slots: WeeklySlotSnapshot[] = [];

    for (let index = 0; index < count; index += 1) {
      const row = dayComboboxes.nth(index).locator('..');
      slots.push({
        day: (await row.getByRole('combobox', { name: 'Day' }).locator('option:checked').innerText()).trim(),
        startTime: await row.getByRole('textbox', { name: 'Start time' }).inputValue(),
        endTime: await row.getByRole('textbox', { name: 'End time' }).inputValue(),
        kid: (await row.getByRole('combobox', { name: 'Kid' }).locator('option:checked').innerText()).trim(),
        hosting: (
          await row.getByRole('combobox', { name: 'Hosting' }).locator('option:checked').innerText()
        ).trim(),
        notice: (
          await row.getByRole('combobox', { name: 'Notice' }).locator('option:checked').innerText()
        ).trim(),
      });
    }

    return slots;
  }

  /**
   * Replaces the weekly grid with the given slots and saves.
   * @param slots Target weekly rows to restore after a mutating test.
   */
  async restoreWeeklySlots(slots: WeeklySlotSnapshot[]): Promise<void> {
    await this.goto();
    await this.waitForWeeklyReady();

    const removeButtons = this.weeklyAvailabilityPanel.getByRole('button', { name: 'remove' });
    while ((await removeButtons.count()) > 0) {
      await removeButtons.first().click();
    }

    for (const slot of slots) {
      await this.addSlotButton.click();
      const row = this.weeklyAvailabilityPanel
        .getByRole('combobox', { name: 'Day' })
        .last()
        .locator('..');
      await row.getByRole('combobox', { name: 'Day' }).selectOption({ label: slot.day });
      await row.getByRole('textbox', { name: 'Start time' }).fill(slot.startTime);
      await row.getByRole('textbox', { name: 'End time' }).fill(slot.endTime);
      await row.getByRole('combobox', { name: 'Kid' }).selectOption({ label: slot.kid });
      await row.getByRole('combobox', { name: 'Hosting' }).selectOption({ label: slot.hosting });
      await row.getByRole('combobox', { name: 'Notice' }).selectOption({ label: slot.notice });
    }

    await this.saveAvailability();
  }

  /** Counts persisted one-off exception rows (excludes the add form). */
  async countSavedExceptionRows(): Promise<number> {
    return await this.oneOffChangesSection.getByRole('button', { name: 'remove' }).count();
  }

  /** Clears the exception date and selects Away / closed before Add exception. */
  async prepareEmptyAwayClosedExceptionForm(): Promise<void> {
    await this.exceptionDateField.fill('');
    await this.exceptionTypeCombobox.selectOption({ label: 'Away / closed' });
  }

  /** Submits the one-off exception form. */
  async addException(): Promise<void> {
    await this.addExceptionButton.click();
  }
}
