import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CommunitiesPage {
  readonly header: HeaderComponent;
  readonly yourCommunitiesHeading: Locator;
  readonly createGroupLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.yourCommunitiesHeading = page.getByRole('heading', { name: 'Your communities', level: 2 });
    this.createGroupLink = page.getByRole('link', { name: '+ Create group', exact: true });
  }

  /** Opens the communities list. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /** Navigates to the create-community form. */
  async openCreateGroup(): Promise<void> {
    await this.createGroupLink.click();
  }

  /** @param communityName Group card title to open */
  async openCommunity(communityName: string): Promise<void> {
    await this.page.getByRole('link', { name: new RegExp(communityName) }).click();
  }
}
