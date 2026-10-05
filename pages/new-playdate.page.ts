import type { Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { FindPlaydateRequestFormComponent } from './components/find-playdate-request-form.component';
import { HeaderComponent } from './components/header.component';

export class NewPlaydatePage {
  readonly header: HeaderComponent;
  readonly requestForm: FindPlaydateRequestFormComponent;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.requestForm = new FindPlaydateRequestFormComponent(page);
  }

  /** Opens the find-a-playdate flow. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.NewPlaydate);
  }
}
