import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { InviteFamilyPanelComponent } from './components/invite-family-panel.component';
import { ManageFriendPanelComponent } from './components/manage-friend-panel.component';

export class FriendsPage {
  readonly header: HeaderComponent;
  readonly inviteFamilyPanel: InviteFamilyPanelComponent;
  readonly manageFriendPanel: ManageFriendPanelComponent;
  readonly inviteFamilyButton: Locator;
  readonly exploreCommunitiesLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.inviteFamilyPanel = new InviteFamilyPanelComponent(page);
    this.manageFriendPanel = new ManageFriendPanelComponent(page);
    this.inviteFamilyButton = page.getByRole('button', { name: '+ Invite a family', exact: true });
    this.exploreCommunitiesLink = page.getByRole('link', { name: 'Explore Communities', exact: true });
  }

  /** Opens the friends and circle page. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Friends);
  }

  /** Reveals the shareable circle invite link. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Clicks Schedule Playdate on the first family card. */
  async openSchedulePlaydateFirst(): Promise<void> {
    await this.page.getByRole('button', { name: 'Schedule Playdate', exact: true }).first().click();
  }

  /** Opens connection management for the first family in the list. */
  async openManageFirstFamily(): Promise<void> {
    await this.page.getByRole('button', { name: 'manage', exact: true }).first().click();
  }
}
