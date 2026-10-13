import type { Locator, Page } from '@playwright/test';

import {
  CANCELLED_STATUS_LABEL,
  EMPTY_CIRCLE_GATE_COPY,
  NO_UPCOMING_PLAYDATES_COPY,
  PlaydateListCard,
} from '../../test-data/playdates-calendar.copy';

/** Upcoming / Past playdate cards and gate copy on `/playdates` and `/playdates/new`. */
export class PlaydateListsComponent {
  readonly upcomingLabel: Locator;
  readonly pastLabel: Locator;
  readonly upcomingCard: Locator;
  readonly pastCard: Locator;
  readonly pastRows: Locator;
  readonly cancelledPastRows: Locator;
  readonly noUpcomingMessage: Locator;
  readonly emptyCircleGateMessage: Locator;
  readonly googleCalendarLink: Locator;
  readonly icsButton: Locator;
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.upcomingLabel = page.getByText(PlaydateListCard.Upcoming, { exact: true });
    this.pastLabel = page.getByText(PlaydateListCard.Past, { exact: true });
    // Cards and rows expose no ARIA role or accessible name; CSS scoping is the only option.
    this.upcomingCard = page.locator('.card').filter({ has: this.upcomingLabel });
    this.pastCard = page.locator('.card').filter({ has: this.pastLabel });
    this.pastRows = this.pastCard.locator('.playdate-card-row');
    this.cancelledPastRows = this.pastRows.filter({
      has: page.getByText(CANCELLED_STATUS_LABEL, { exact: true }),
    });
    this.noUpcomingMessage = this.upcomingCard.getByText(NO_UPCOMING_PLAYDATES_COPY, {
      exact: true,
    });
    // The gate copy shares its element with an aria-hidden "BT" icon, so exact match fails.
    this.emptyCircleGateMessage = page.getByText(EMPTY_CIRCLE_GATE_COPY);
    this.googleCalendarLink = page.getByRole('link', { name: 'Google', exact: true });
    this.icsButton = page.getByRole('button', { name: 'ICS', exact: true });
    this.dialog = page.getByRole('dialog');
  }

  /** @param count Count text shown in the Upcoming card header */
  upcomingCount(count: string): Locator {
    return this.upcomingCard.getByText(count, { exact: true });
  }

  /** @param dateText Date/time shown in the row meta, e.g. `Fri, Oct 16, 3:00 PM` */
  pastRow(dateText: string): Locator {
    return this.pastRows.filter({ hasText: dateText });
  }

  /** @param scope Row or card to search within */
  cancelledStatusIn(scope: Locator): Locator {
    return scope.getByText(CANCELLED_STATUS_LABEL, { exact: true });
  }

  /** @param scope Row or card to search within */
  googleCalendarLinkIn(scope: Locator): Locator {
    return scope.getByRole('link', { name: 'Google', exact: true });
  }

  /** @param scope Row or card to search within */
  icsButtonIn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'ICS', exact: true });
  }

  /** @param scope Row or card to search within */
  acceptButtonIn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'Accept', exact: true });
  }

  /** @param scope Row or card to search within */
  declineButtonIn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'Decline', exact: true });
  }

  /** @param scope Row or card to search within */
  cancelButtonIn(scope: Locator): Locator {
    return scope.getByRole('button', { name: 'cancel', exact: true });
  }

  /** @param scope Row or card to search within */
  anyButtonIn(scope: Locator): Locator {
    return scope.getByRole('button');
  }

  /** @param scope Row or card to search within */
  anyLinkIn(scope: Locator): Locator {
    return scope.getByRole('link');
  }

  /**
   * Clicks a Past row by its date/time text.
   * @param dateText Date/time shown in the row meta, e.g. `Fri, Oct 16, 3:00 PM`
   */
  async clickPastRow(dateText: string): Promise<void> {
    await this.pastRow(dateText).click();
  }
}
