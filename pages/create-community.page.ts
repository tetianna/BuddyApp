import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { CreateCommunityFormComponent } from './components/create-community-form.component';
import { HeaderComponent } from './components/header.component';

export class CreateCommunityPage {
  readonly header: HeaderComponent;
  readonly form: CreateCommunityFormComponent;
  readonly backLink: Locator;
  readonly pageHeading: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.form = new CreateCommunityFormComponent(page);
    this.backLink = page.getByRole('link', { name: '← Back to communities', exact: true });
    this.pageHeading = page.getByText('Create a community', { exact: true });
  }

  /** Opens the create-community form. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.CreateCommunity);
  }

  /** Returns to the communities list via the back link. */
  async backToCommunities(): Promise<void> {
    await this.backLink.click();
  }
}
