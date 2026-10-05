import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';

export class CommunityDetailPage {
  readonly header: HeaderComponent;
  readonly allCommunitiesLink: Locator;
  readonly inviteFamiliesButton: Locator;
  readonly copyInviteLinkButton: Locator;
  readonly membersTab: Locator;
  readonly eventsTab: Locator;
  readonly announcementsTab: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.allCommunitiesLink = page.getByRole('link', { name: '← All communities', exact: true });
    this.inviteFamiliesButton = page.getByRole('button', { name: 'Invite families', exact: true });
    this.copyInviteLinkButton = page.getByRole('button', { name: 'Copy invite link', exact: true });
    this.membersTab = page.getByRole('tab', { name: 'Members', exact: true });
    this.eventsTab = page.getByRole('tab', { name: 'Events', exact: true });
    this.announcementsTab = page.getByRole('tab', { name: 'Announcements', exact: true });
  }

  /** Opens the explored Maple Class community detail page. */
  async gotoMapleClass(): Promise<void> {
    await this.page.goto(AppRoute.CommunityMapleClass);
  }

  /** @param communityTitle Expected H2 community name */
  communityHeading(communityTitle: string): Locator {
    return this.page.getByRole('heading', { name: communityTitle, level: 2 });
  }

  /** @param familyName Family card heading in the members list */
  connectButtonForFamily(familyName: string): Locator {
    return this.page
      .getByRole('article')
      .filter({ has: this.page.getByRole('heading', { name: familyName, level: 4 }) })
      .getByRole('button', { name: 'Connect', exact: true });
  }
}
