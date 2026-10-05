import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { HeaderComponent } from './components/header.component';
import { InviteCoParentPanelComponent } from './components/invite-co-parent-panel.component';
import { InviteFamilyPanelComponent } from './components/invite-family-panel.component';

export class DashboardPage {
  readonly header: HeaderComponent;
  readonly inviteFamilyPanel: InviteFamilyPanelComponent;
  readonly inviteCoParentPanel: InviteCoParentPanelComponent;
  readonly greetingHeading: Locator;
  readonly findPlaydateLink: Locator;
  readonly inviteFamilyButton: Locator;
  readonly inviteCoParentButton: Locator;
  readonly childFirstNameField: Locator;
  readonly addChildButton: Locator;
  readonly viewAllPlaydatesLink: Locator;
  readonly seeAllFriendsLink: Locator;
  readonly setUpAvailabilityLink: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.inviteFamilyPanel = new InviteFamilyPanelComponent(page);
    this.inviteCoParentPanel = new InviteCoParentPanelComponent(page);
    this.greetingHeading = page.getByRole('heading', { level: 2 });
    this.findPlaydateLink = page.getByRole('link', { name: 'Find a Playdate', exact: true });
    this.inviteFamilyButton = page.getByRole('button', { name: '+ Invite a family', exact: true });
    this.inviteCoParentButton = page.getByRole('button', { name: 'Invite co-parent', exact: true });
    this.childFirstNameField = page.getByRole('textbox', { name: "Child's first name" });
    this.addChildButton = page.getByRole('button', { name: 'Add child', exact: true });
    this.viewAllPlaydatesLink = page.getByRole('link', { name: 'View all', exact: true });
    this.seeAllFriendsLink = page.getByRole('link', { name: 'See all →', exact: true });
    this.setUpAvailabilityLink = page.getByRole('link', { name: 'Set up', exact: true });
  }

  /** Opens the signed-in dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }

  /** Reveals the circle invite link panel. */
  async openInviteFamily(): Promise<void> {
    await this.inviteFamilyButton.click();
  }

  /** Reveals the co-parent invite link panel. */
  async openInviteCoParent(): Promise<void> {
    await this.inviteCoParentButton.click();
  }

  /** Navigates to the new playdate matcher. */
  async openFindPlaydate(): Promise<void> {
    await this.findPlaydateLink.click();
  }
}
