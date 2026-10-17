import type { Locator, Page } from '@playwright/test';

import type { PracticumHostChild } from '../test-data/factories/practicum-child.factory';
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
  readonly birthYearField: Locator;
  readonly birthMonthField: Locator;
  readonly genderCombobox: Locator;
  readonly addChildButton: Locator;
  readonly viewAllPlaydatesLink: Locator;
  readonly seeAllFriendsLink: Locator;
  readonly setUpAvailabilityLink: Locator;
  readonly kidsSection: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.inviteFamilyPanel = new InviteFamilyPanelComponent(page);
    this.inviteCoParentPanel = new InviteCoParentPanelComponent(page);
    this.greetingHeading = page.getByRole('heading', { level: 2 });
    this.findPlaydateLink = page.getByRole('link', { name: 'Find a Playdate', exact: true });
    this.inviteFamilyButton = page.getByRole('button', { name: '+ Invite a family', exact: true });
    this.inviteCoParentButton = page.getByRole('button', { name: 'Invite co-parent', exact: true });
    this.childFirstNameField = page.getByRole('textbox', { name: "Child's first name" });
    this.birthYearField = page.getByRole('spinbutton', { name: 'Birth year' });
    this.birthMonthField = page.getByRole('spinbutton', { name: 'Month' });
    this.genderCombobox = page.getByRole('combobox', { name: 'Gender' });
    this.addChildButton = page.getByRole('button', { name: 'Add child', exact: true });
    this.viewAllPlaydatesLink = page.getByRole('link', { name: 'View all', exact: true });
    this.seeAllFriendsLink = page.getByRole('link', { name: 'See all →', exact: true });
    this.setUpAvailabilityLink = page.getByRole('link', { name: 'Set up', exact: true });
    this.kidsSection = page
      .locator('div')
      .filter({
        has: this.childFirstNameField,
        has: this.addChildButton,
      })
      .first();
  }

  /** Opens the signed-in dashboard. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }

  /** Waits until the add-child form on the dashboard is ready. */
  async waitForKidsSectionReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.greetingHeading.waitFor();
    await this.childFirstNameField.waitFor();
    await this.addChildButton.waitFor();
  }

  /**
   * First names from kid summary lines (e.g. "Mia, 8") on the dashboard.
   */
  async readChildFirstNames(): Promise<string[]> {
    const lines = await this.kidsSection.getByText(/^[A-Za-z][\w]*, \d+/).allTextContents();
    return lines.map((line) => line.split(',')[0]?.trim() ?? '').filter(Boolean);
  }

  /** Removes every child row on the dashboard (My Kids section). */
  async removeAllChildren(): Promise<void> {
    const removeButtons = this.kidsSection.getByRole('button', { name: 'remove' });
    while ((await removeButtons.count()) > 0) {
      await removeButtons.first().click();
      await this.waitForKidsSectionReady();
    }
  }

  /** Adds a host child using the dashboard form (does not navigate). */
  async addHostChild(child: PracticumHostChild): Promise<void> {
    await this.childFirstNameField.fill(child.firstName);
    await this.birthYearField.fill(child.birthYear);
    await this.birthMonthField.fill(child.birthMonth);
    await this.genderCombobox.selectOption({ label: child.gender });
    await this.page.getByRole('button', { name: child.avatar, exact: true }).click();
    await this.addChildButton.click();
    await this.kidsSection.getByText(new RegExp(`^${child.firstName}, \\d+`)).waitFor();
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
