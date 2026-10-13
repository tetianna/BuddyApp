Feature: Playdates — no calendar export (Google / ICS) on empty or cancelled rows

  Signed-in parents with a set-up family see **Upcoming** and **Past** on `/playdates`
  and `/playdates/new`. Calendar export (**Google** / **ICS**) must not be offered when
  Upcoming is empty or on **Cancelled** Past rows. Profile **Calendar Sync** only shows a
  status toast that calendar links ship with playdates.
  Jira: AQPBT-12
  Confluence: "[Anna] Playdates: add to calendar (Google / ICS) on confirmed row" (space AQPBT)

  Background:
    Given the main practicum family "Lev Test / The Gorfels" is signed in
    And their dashboard is set up and their circle includes "The Nguyens" and "The Petrovs"

  # Happy paths — /playdates

  Scenario: AC1 — Empty Upcoming shows empty copy and no calendar export
    Given the family has "Upcoming" count "0"
    When they open "/playdates"
    Then the "Upcoming" card shows count "0"
    And the "Upcoming" card shows "No upcoming playdates yet."
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page

  Scenario: AC2 — Cancelled Past row (future-dated) has status and empty actions
    Given the family has a cancelled Past playdate on "Fri, Oct 16, 3:00 PM"
    When they open "/playdates"
    And they view the Past row for "Fri, Oct 16, 3:00 PM"
    Then that row shows status "Cancelled"
    And that row has no link "Google"
    And that row has no button "ICS"
    And that row has no button "Accept"
    And that row has no button "Decline"
    And that row has no button "cancel"

  Scenario: AC2 — Every Past row is Cancelled with no action controls
    When they open "/playdates"
    Then every row in the "Past" card shows status "Cancelled"
    And the "Past" card contains no buttons and no links

  # Happy paths — /playdates/new

  Scenario: AC3 — Find a playdate shows the same empty Upcoming and cancelled Past rows
    When they open "/playdates/new"
    Then the "Upcoming" card shows "No upcoming playdates yet."
    And the Past row for "Fri, Oct 16, 3:00 PM" shows status "Cancelled"
    And the "Past" card contains no buttons and no links
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page

  # Happy paths — /profile

  Scenario: AC4 — Calendar Sync stays on Profile and shows the ship-with-playdates toast
    When they open "/profile"
    And they click the button "Calendar Sync" with subtitle "Add-to-calendar links soon"
    Then the URL matches "/profile"
    And the status message shows "Calendar links ship with playdates 🗓️"

  # Negative

  Scenario: AC5 — Family not set up sees the Dashboard gate and no lists (BLOCKED — no account)
    Given a parent "Anna Procopov" whose family is not set up on the Dashboard is signed in
    When they open "/playdates"
    Then "Set up your family on the Dashboard before planning playdates." is visible
    And "Upcoming" is not visible
    And "Past" is not visible
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page
    When they open "/playdates/new"
    Then "Set up your family on the Dashboard before planning playdates." is visible
    And "Upcoming", "Past", "Google" and "ICS" are not visible

  Scenario: AC6 — Clicking a cancelled Past row does not open calendar export
    When they open "/playdates"
    And they click the Past row for "Fri, Oct 16, 3:00 PM"
    Then the URL matches "/playdates"
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page
    And no dialog is open

  # Edge cases — second family's point of view

  Scenario: Set-up family with an empty circle sees the invite gate and no calendar export
    Given the practicum second family "Tetiana KK / The KKKs" is signed in
    And their family is set up but their circle has no connections
    When they open "/playdates"
    Then "Invite a trusted family first. Matches appear once your circle has at least one connection." is visible
    And "Upcoming" is not visible
    And "Past" is not visible
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page
    When they open "/playdates/new"
    Then "Invite a trusted family first. Matches appear once your circle has at least one connection." is visible
    And no link "Google" is shown on the page
    And no button "ICS" is shown on the page

  # Ambiguities and gaps
  #
  # - AC5 is BLOCKED for automation: Jira names "Anna Procopov" (family not set up), but no
  #   credentials for that account exist in .env.example. The practicum alt account
  #   (APP_ALT_USER_*) is "Tetiana KK / The KKKs", whose family IS set up; it shows the
  #   circle gate copy instead (observed live 2026-10-13). AC5 stays unautomated until a
  #   human provides an unset-family account; no env var name is invented here.
  # - The circle-gate edge scenario uses copy observed on the live app, not stated in Jira
  #   or Confluence.
  # - Data dependency (shared env): Upcoming 0 and the cancelled "Fri, Oct 16, 3:00 PM" row
  #   are pre-existing data for the main family (row created by another story's run,
  #   "AQP10-1791427751097 park"). If someone confirms a playdate with The Gorfels or
  #   removes that row, AC1–AC3 / AC6 preconditions break. Live Past count was 6
  #   (Confluence said 5).
  # - The ticket says the Oct 16 row is future-dated; after Oct 16, 2026 it is still a
  #   cancelled Past row but no longer "future".
  # - Playdate rows and cards have no ARIA role or accessible name; automation must use
  #   structural locators for row/card scoping (flagged for review).
  # - Out of scope (per Jira): confirmed-row Google / ICS behavior (href, ICS filename,
  #   download error copy), Accept / Decline / cancel on live pending rows (AQPBT-10),
  #   matched slots and propose form (AQPBT-9), list layout (AQPBT-11), Birthday
  #   "Add to my calendar", dashboard widget, Send request.
  # - Open questions from Confluence (both families on one confirmed row, completed Past
  #   rows, dashboard widget export, /calendar events) remain unanswered.
  #
  # Test automation: tests/aqpbt-12-playdates-calendar-export.spec.ts (AC1–AC4, AC6, edge)
