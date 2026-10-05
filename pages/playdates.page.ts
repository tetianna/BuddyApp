import type { Locator, Page } from '@playwright/test';

import { AppRoute } from '../test-data/routes';
import { FindPlaydateRequestFormComponent } from './components/find-playdate-request-form.component';
import { HeaderComponent } from './components/header.component';

export class PlaydatesPage {
  readonly header: HeaderComponent;
  readonly requestForm: FindPlaydateRequestFormComponent;
  readonly pendingRequestsLabel: Locator;
  readonly upcomingLabel: Locator;
  readonly pastLabel: Locator;
  readonly noUpcomingMessage: Locator;
  readonly noPendingMessage: Locator;
  readonly pastEmptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.requestForm = new FindPlaydateRequestFormComponent(page);
    this.pendingRequestsLabel = page.getByText('Pending requests', { exact: true });
    this.upcomingLabel = page.getByText('Upcoming', { exact: true });
    this.pastLabel = page.getByText('Past', { exact: true });
    this.noUpcomingMessage = page.getByText('No upcoming playdates yet', { exact: false });
    this.noPendingMessage = page.getByText('No pending requests', { exact: false });
    this.pastEmptyMessage = page.getByText('Past playdates will land here', { exact: false });
  }

  /** Opens the playdates hub (propose form plus request lists). */
  async goto(): Promise<void> {
    await this.page.goto(AppRoute.Playdates);
  }

  /** Accept button on an inbound playdate request row. */
  acceptButton(): Locator {
    return this.page.getByRole('button', { name: 'Accept', exact: true });
  }

  /** Decline button on an inbound playdate request row. */
  declineButton(): Locator {
    return this.page.getByRole('button', { name: 'Decline', exact: true });
  }

  /** Cancel / withdraw control on a pending or past playdate row. */
  cancelRequestButton(): Locator {
    return this.page.getByRole('button', { name: 'cancel', exact: true });
  }

  /** Add-to-Google-Calendar link on a confirmed past playdate. */
  googleCalendarLink(): Locator {
    return this.page.getByRole('link', { name: 'Google', exact: true });
  }

  /** Download ICS for a confirmed playdate. */
  icsButton(): Locator {
    return this.page.getByRole('button', { name: 'ICS', exact: true });
  }
}
