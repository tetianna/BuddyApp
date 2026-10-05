import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../../test-data/routes';

/** Shared sidebar navigation, premium upsell, and top banner on signed-in pages. */
export class HeaderComponent {
  readonly navigation: Locator;
  readonly banner: Locator;
  readonly dashboardLink: Locator;
  readonly calendarLink: Locator;
  readonly friendsLink: Locator;
  readonly communitiesLink: Locator;
  readonly availabilityLink: Locator;
  readonly playdatesLink: Locator;
  readonly birthdaysLink: Locator;
  readonly profileLink: Locator;
  readonly adminLink: Locator;
  readonly discoverButton: Locator;
  readonly goPremiumButton: Locator;
  readonly notificationsButton: Locator;
  readonly logOutButton: Locator;

  constructor(private readonly page: Page) {
    this.navigation = page.getByRole('navigation');
    this.banner = page.getByRole('banner');
    this.dashboardLink = this.navigation.getByRole('link', { name: 'Dashboard', exact: true });
    this.calendarLink = this.navigation.getByRole('link', { name: 'Calendar', exact: true });
    this.friendsLink = this.navigation.getByRole('link', { name: 'Friends', exact: true });
    this.communitiesLink = this.navigation.getByRole('link', { name: 'Communities', exact: true });
    this.availabilityLink = this.navigation.getByRole('link', { name: 'Availability', exact: true });
    this.playdatesLink = this.navigation.getByRole('link', { name: 'Playdates', exact: true });
    this.birthdaysLink = this.navigation.getByRole('link', { name: 'Birthdays', exact: true });
    this.profileLink = this.navigation.getByRole('link', { name: 'My Profile', exact: true });
    this.adminLink = this.navigation.getByRole('link', { name: 'Admin', exact: true });
    this.discoverButton = this.navigation.getByRole('button', { name: 'Discover', exact: true });
    this.goPremiumButton = page.getByRole('button', { name: /Go Premium/i });
    this.notificationsButton = page.getByRole('button', { name: 'Notifications', exact: true });
    this.logOutButton = page.getByRole('button', { name: 'Log out', exact: true });
  }

  /** Opens the main Dashboard view. */
  async gotoDashboard(): Promise<void> {
    await this.page.goto(AppRoute.Dashboard);
  }

  /** Opens the family Calendar view. */
  async gotoCalendar(): Promise<void> {
    await this.page.goto(AppRoute.Calendar);
  }

  /** Opens the Friends (circle) view. */
  async gotoFriends(): Promise<void> {
    await this.page.goto(AppRoute.Friends);
  }

  /** Opens the Communities list. */
  async gotoCommunities(): Promise<void> {
    await this.page.goto(AppRoute.Communities);
  }

  /** Opens weekly Availability settings. */
  async gotoAvailability(): Promise<void> {
    await this.page.goto(AppRoute.Availability);
  }

  /** Opens the Playdates hub. */
  async gotoPlaydates(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }

  /** Opens Birthdays and party invitations. */
  async gotoBirthdays(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }

  /** Opens the signed-in user's profile. */
  async gotoProfile(): Promise<void> {
    await this.page.goto(AppRoute.Profile);
  }

  /** Opens the admin dashboard. */
  async gotoAdmin(): Promise<void> {
    await this.page.goto(AppRoute.Admin);
  }

  /** Expands the Discover menu in the sidebar. */
  async openDiscover(): Promise<void> {
    await this.discoverButton.click();
  }

  /** Opens the notifications feed. */
  async openNotifications(): Promise<void> {
    await this.notificationsButton.click();
  }

  /** Opens the premium upsell prompt. */
  async openGoPremium(): Promise<void> {
    await this.goPremiumButton.click();
  }

  /** Signs out of the current session. */
  async logOut(): Promise<void> {
    await this.logOutButton.click();
  }
}
