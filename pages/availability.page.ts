import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class AvailabilityPage {
  readonly header: HeaderComponent;
  readonly heading: Locator;
  readonly weekendAfternoonsButton: Locator;
  readonly addSlotButton: Locator;
  readonly saveAvailabilityButton: Locator;
  readonly addExceptionButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.heading = page.getByRole('heading', { name: 'Set your weekly free time', level: 2 });
    this.weekendAfternoonsButton = page.getByRole('button', {
      name: 'Weekend afternoons',
      exact: true,
    });
    this.addSlotButton = page.getByRole('button', { name: '+ Add slot', exact: true });
    this.saveAvailabilityButton = page.getByRole('button', {
      name: 'Save availability',
      exact: true,
    });
    this.addExceptionButton = page.getByRole('button', { name: 'Add exception', exact: true });
  }

  /** Opens weekly availability settings. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }

  /** Applies the weekend-afternoons quick template. */
  async applyWeekendAfternoonsTemplate(): Promise<void> {
    await this.weekendAfternoonsButton.click();
  }

  /** Persists the current weekly slot grid. */
  async saveAvailability(): Promise<void> {
    await this.saveAvailabilityButton.click();
  }
}
