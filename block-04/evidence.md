## P15:

| type | Create | Delete | owner |
|------|--------|--------|-------|
| birthday-event | POST /api/v1/events | POST /api/v1/events/{eventId}/cancel | main \| alt |

##P16

import { expect, test } from '@playwright/test';

import { LoginPage } from '../pages/login.page';
import { AppRoute } from '../test-data/routes';

test.use({ storageState: { cookies: [], origins: [] } });

test('login page shows Welcome back heading @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  await expect(page).toHaveURL(new RegExp(`${AppRoute.Login}(\\?|$)`));
  await expect(loginPage.heading).toBeVisible();
});

##P18

One gap to start with
Playdates need a connection first. On Maple Class, The Ahmeds already shows Connect, while The Nguyens and The Petrovs show Connected. No spec and no Jira story cover that screen.

I saved a two-scenario test plan here: features/explore-communities-connect-member.feature.md.

If you want, I can turn that plan into Playwright tests, or we can pick a different gap (playdates, availability, or dashboard) next.

##P20
I'll read the exploratory-charter skill and the birthday-party feature context, then draft the charter. Your risk line was left blank, so I'll note that and suggest a sensible default risk from the feature.

The charter needs a stated risk; yours was left blank. Which risk should this session focus on?

You wrote “The risk is .” with nothing after it. What risk should this exploratory session focus on?

Invitation card theme does not match what guests see on RSVP
Creating the charter file with your chosen risk: invitation card theme vs what guests see on RSVP.

# Session charter
| Field | Value |
|-------|--------|
Your message ended with “The risk is .” with nothing after it. You chose this risk:

Invitation card theme does not match what guests see on RSVP.

I saved the charter here:

charters/birthdays-create-party.md

It includes:

Feature: Birthdays: create party (invite children, card theme)
Risk: (above)
Ticket: AQPBT-6
Confluence and routes: /birthdays, manage screen, guest /e/{token}
Empty sections for Mission, Oracles, Areas to probe, Notes, and the Findings table (for you to fill during the session)
Planning hint (not in the file): For this risk, compare each Invitation card radio on create (and Edit on manage) with the public RSVP page after you copy the guest link. Try at least two themes and No card. Use a unique party title and cancel or API cleanup when you are done.

If you want a time box (for example 45 minutes) or in/out of scope bullets added to the table, say what to use and I will update the file.

##P22 
Test data reset (dry-run)
Scope: all tracked types (dry-run)

Found: 0

Deleted: 0

Failed: 0

The tracker file .test-artifacts/created-records.jsonl has no rows right now, so there is nothing to cancel via the reset script. If you interrupted a run that should have left tracked records, say so and we can check whether the tracker was cleared or never written.