import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class AdminPage {
  readonly header: HeaderComponent;
  readonly refreshButton: Locator;
  readonly latestSignUpsTable: Locator;
  readonly newParentsChart: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.refreshButton = page.getByRole('button', { name: 'Refresh', exact: true });
    this.latestSignUpsTable = page.getByRole('table');
    this.newParentsChart = page.getByRole('list', { name: 'New parents per week' });
  }

  /** Opens the platform admin dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Admin);
  }

  /** Reloads admin statistics. */
  async refreshStats(): Promise<void> {
    await this.refreshButton.click();
  }
}
