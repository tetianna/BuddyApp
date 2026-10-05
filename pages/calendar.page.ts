import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CalendarPage {
  readonly header: HeaderComponent;
  readonly monthHeading: Locator;
  readonly thisWeekSection: Locator;
  readonly birthdaysThisMonthSection: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.monthHeading = page.getByText('Your family calendar', { exact: false });
    this.thisWeekSection = page.getByText('This week', { exact: true });
    this.birthdaysThisMonthSection = page.getByText('Birthdays this month', { exact: false });
  }

  /** Opens the family calendar. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Calendar);
  }
}
