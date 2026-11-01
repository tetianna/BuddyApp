import { expect, type Locator, type Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { BirthdayPartyManagePage } from './birthday-party-manage.page';
import { BirthdayPartyFormComponent } from './components/birthday-party-form.component';
import { HeaderComponent } from './components/header.component';

export class BirthdaysPage {
  readonly header: HeaderComponent;
  readonly form: BirthdayPartyFormComponent;
  readonly createPartyHeading: Locator;
  readonly emptyPartiesMessage: Locator;
  readonly partyCreatedStatus: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.form = new BirthdayPartyFormComponent(page);
    this.createPartyHeading = page.getByText('Create a birthday party', { exact: true });
    this.emptyPartiesMessage = page.getByText('No upcoming parties yet', { exact: false });
    this.partyCreatedStatus = page.getByRole('status');
    this.firstManageLink = page.getByRole('link', { name: /Manage/i }).first();
    this.copyRsvpLinkButton = page.getByRole('button', { name: 'copy RSVP link', exact: true }).first();
    this.allManageLinks = page.getByRole('link', { name: /Manage/i });
  }

  /** First **Manage →** in the upcoming parties list (use when only one new party exists). */
  readonly firstManageLink: Locator;

  /** First **copy RSVP link** on the upcoming parties list. */
  readonly copyRsvpLinkButton: Locator;

  /** Every **Manage →** link in the upcoming parties list. */
  readonly allManageLinks: Locator;

  /** Party title text on the list (unique title recommended). */
  partyTitleInList(partyTitle: string): Locator {
    return this.page.getByText(partyTitle, { exact: false });
  }

  /** Upcoming list row with **Manage →** for the given party title. */
  upcomingPartyRowWithManage(partyTitle: string): Locator {
    return this.page
      .locator('div')
      .filter({ has: this.page.getByRole('link', { name: /Manage/i }) })
      .filter({ has: this.page.getByText(partyTitle, { exact: false }) });
  }

  /** **Past & cancelled** row for a party (title, **Cancelled** label, **View** link). */
  cancelledPartyRow(partyTitle: string): Locator {
    const pastCancelledSection = this.page
      .locator('.card')
      .filter({ has: this.page.getByText('Past & cancelled', { exact: false }) });
    return pastCancelledSection
      .locator('.pd-row')
      .filter({ has: this.page.getByText(partyTitle, { exact: false }) })
      .filter({ has: this.page.getByText('Cancelled', { exact: true }) });
  }

  /** **Manage →** link for a party id on the upcoming list. */
  manageLinkForPartyId(partyId: string): Locator {
    return this.page.locator(`a[href*="/birthdays/${partyId}"]`).filter({ hasText: /Manage/i });
  }

  /** Opens the first upcoming party manage screen and waits for `/birthdays/{partyId}`. */
  async openFirstManageParty(): Promise<void> {
    await this.firstManageLink.click();
    await this.page.waitForURL(/\/birthdays\/[0-9a-f-]+/i);
  }

  /**
   * Opens manage for the upcoming party with the given title (unique title recommended).
   * @param partyTitle Party title as entered on the create form (without list emoji prefix)
   */
  async openManageParty(partyTitle: string): Promise<void> {
    const titleLine = this.page.getByText(partyTitle, { exact: false }).first();
    await expect(titleLine).toBeVisible();
    await titleLine.evaluate((el) => {
      let sibling = el.nextElementSibling;
      while (sibling) {
        if (
          sibling instanceof HTMLAnchorElement &&
          /\/birthdays\//.test(sibling.getAttribute('href') ?? '') &&
          sibling.textContent?.includes('Manage')
        ) {
          sibling.click();
          return;
        }
        sibling = sibling.nextElementSibling;
      }
      throw new Error('Manage → link not found after party title on list');
    });
    await this.page.waitForURL(/\/birthdays\/[0-9a-f-]+/i);
  }

  /** Opens birthday parties and invitations. */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Birthdays);
  }

  /** Waits until the parties list finishes loading on `/birthdays`. */
  async waitForPartiesListReady(): Promise<void> {
    await this.page.getByText('Loading…').waitFor({ state: 'hidden', timeout: 30000 });
    await expect(
      this.emptyPartiesMessage.or(this.page.getByRole('link', { name: /Manage/i })).first(),
    ).toBeVisible({ timeout: 30000 });
  }

  /** Cancels every upcoming party on the list (shared-account cleanup before empty-state ACs). */
  async cancelAllUpcomingParties(): Promise<void> {
    await this.goto();
    await this.waitForPartiesListReady();
    let manageLinks = this.page.getByRole('link', { name: /Manage/i });
    while ((await manageLinks.count()) > 0) {
      await manageLinks.first().click();
      await this.page.waitForURL(/\/birthdays\/[0-9a-f-]+/i);
      const managePage = new BirthdayPartyManagePage(this.page);
      await managePage.cancelPartyAndReturnToList();
      await this.goto();
      await this.waitForPartiesListReady();
      manageLinks = this.page.getByRole('link', { name: /Manage/i });
    }
  }
}
