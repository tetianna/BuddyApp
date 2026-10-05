Feature: Birthdays — create and manage a party (invite children, card theme)

  Signed-in host parents create a party on `/birthdays`, then manage it on
  `/birthdays/{partyId}` via **Manage →** (guest link, RSVPs, edit, cancel).
  Jira: AQPBT-6

  Background:
    Given the main practicum family is signed in

  # Happy paths — Create party (/birthdays)

  Scenario: AC1 — Host sees Birthdays banner and create form heading
    When they open "/birthdays"
    Then the banner shows "Birthdays"
    And "Create a birthday party" is visible

  Scenario: AC2 — Empty upcoming parties list shows empty-state copy
    Given no upcoming birthday parties are listed for the host
    When they open "/birthdays"
    Then copy matching "No upcoming parties yet" is visible

  Scenario: AC3 — Whose birthday dropdown lists host children and placeholder
    When they open "/birthdays"
    And the create form is visible
    Then the "Whose birthday? (optional)" control has options:
      | Whose birthday? (optional) |
      | Mia                        |
      | Maria                      |

  Scenario: AC4 — Invite children group shows RSVP email helper copy
    When they open "/birthdays"
    And the create form is visible
    Then the "Invite children" group shows "Their parents get an email with the RSVP link."

  Scenario: AC5 — Circle and Maple Class invitees appear as checkboxes
    When they open "/birthdays"
    And the create form is visible
    Then the "Invite children" group contains "Your circle"
    And the "Invite children" group contains "Maple Class"
    And a checkbox "Ethan The Nguyens" is available
    And a checkbox "Sofia The Petrovs" is available
    And a checkbox "Zara The Ahmeds" is available

  Scenario: AC6 — Create form shows party detail fields
    When they open "/birthdays"
    And the create form is visible
    Then the field "Party title" is visible
    And a visible datetime-local input is shown for party date and time
    And the field "Venue (e.g. our backyard, Chuck E. Cheese…)" is visible
    And the field "Details for guests (optional)" is visible

  Scenario: AC7 — Invitation card radiogroup lists all themes
    When they open "/birthdays"
    And the create form is visible
    Then the "Invitation card" radiogroup includes radio "No card"
    And the "Invitation card" radiogroup includes radio "Balloons"
    And the "Invitation card" radiogroup includes radio "Birthday cake"
    And the "Invitation card" radiogroup includes radio "Dinosaur"
    And the "Invitation card" radiogroup includes radio "Space"
    And the "Invitation card" radiogroup includes radio "Under the sea"
    And the "Invitation card" radiogroup includes radio "Rainbow"

  Scenario: AC10 — Create party with valid data adds list card and status message
    Given no upcoming birthday parties are listed for the host
    When they open "/birthdays"
    And they fill the create form with a unique party title and a future date and time
    And they select invitation card "Balloons"
    And they click "Create party"
    Then the URL matches "/birthdays"
    And status text includes "Party created, but email is off right now — share the RSVP link."
    And the new party title is visible in the upcoming parties list
    And a link "Manage →" is visible for that party

  # Happy paths — Manage party (/birthdays/{partyId})

  Scenario: AC11 — Manage screen shows host actions and empty RSVPs
    Given they have created a birthday party with a unique party title on "/birthdays"
    When they open "Manage →" for that party
    Then the URL matches "/birthdays/{partyId}"
    And the banner shows "Birthdays"
    And the party title is shown on the manage screen
    And button "Edit" is visible
    And button "copy" is visible
    And button "Cancel party" is visible
    And link "Add to my calendar" is visible
    And button "Send invites" is visible
    And the RSVPs area shows "No responses yet — share the guest link!" or equivalent zero-response summary

  Scenario: AC12 — Manage screen shows guest link and invite-by-email helper
    Given they have opened manage for a birthday party they created
    Then "Guest link:" is visible on the manage screen
    And the "Invite by email" section is visible
    And copy includes "Each guest gets the RSVP link and a calendar file — no app or account required."

  Scenario: AC13 — Upcoming list card offers Manage and copy RSVP link
    Given they have created a birthday party with a unique party title on "/birthdays"
    When they remain on "/birthdays"
    Then the upcoming party card shows "Manage →"
    And button "copy RSVP link" is visible for that party

  Scenario: AC14 — Edit mode exposes manage fields including Date and time
    Given they have opened manage for a birthday party they created
    When they click "Edit"
    Then button "Save changes" is visible
    And button "Discard" is visible
    And the field "Date and time" is visible
    And the field "Title" is visible
    And the field "Venue" is visible
    And the field "Details" is visible

  # Negative

  Scenario: AC8 — Create party with empty required fields stays on page with validation
    When they open "/birthdays"
    And the "Party title" field is empty
    And the party date and time input is empty
    When they click "Create party"
    Then the URL matches "/birthdays"
    And the "Party title" field has validation message "Please fill out this field." in Chromium

  Scenario: AC16 — Dismissing Cancel party confirm keeps manage open
    Given they have opened manage for a birthday party they created
    When they click "Cancel party"
    And they dismiss the browser confirm "Cancel this party? Guests who left an email will be told."
    Then the URL still matches "/birthdays/{partyId}"
    And button "Cancel party" is visible

  # Edge cases — Create

  Scenario: AC9 — Navigating away without submit does not create a party
    Given no upcoming birthday parties are listed for the host
    When they open "/birthdays"
    And they select invitation card "Dinosaur"
    And they check invitee "Ethan The Nguyens"
    And they navigate via sidebar "Calendar"
    And they navigate via sidebar "Birthdays"
    Then the URL matches "/birthdays"
    And copy matching "No upcoming parties yet" is visible

  Scenario: Optional birthday child can stay on placeholder and party still creates
    Given no upcoming birthday parties are listed for the host
    When they open "/birthdays"
    And "Whose birthday? (optional)" remains on "Whose birthday? (optional)"
    And they fill the create form with a unique party title and a future date and time
    And they select invitation card "Balloons"
    And they click "Create party"
    Then the URL matches "/birthdays"
    And the new party title is visible in the upcoming parties list

  Scenario: Selecting card and invitees without submit does not add a list card
    Given no upcoming birthday parties are listed for the host
    When they open "/birthdays"
    And they select invitation card "Dinosaur"
    And they check invitee "Ethan The Nguyens"
    And they do not click "Create party"
    Then copy matching "No upcoming parties yet" is visible

  Scenario: When upcoming parties exist the empty-state copy is hidden
    Given at least one upcoming birthday party exists for the host
    When they open "/birthdays"
    Then copy matching "No upcoming parties yet" is not visible
    And each upcoming party shows a link "Manage →"

  # Edge cases — Manage

  Scenario: AC15 — Discard closes edit mode without leaving manage
    Given they have opened manage for a birthday party they created
    And they clicked "Edit"
    When they click "Discard"
    Then the URL still matches "/birthdays/{partyId}"
    And button "Edit" is visible
    And button "Save changes" is not visible

  # Ambiguities and gaps
  #
  # - Empty-state copy: Jira AC2 uses "No upcoming parties yet"; Confluence also documents
  #   the longer line with RSVP-from-link wording. Scenarios use the Jira substring.
  # - The required datetime-local control on create has no visible label; "Date and time"
  #   appears on manage Edit (covered in AC11 Edit scenario).
  # - Default Invitation card selection on first load is undocumented.
  # - Whether at least one Invite children checkbox is required before Create party is unknown.
  # - Effect of selecting "No card" on preview or copy is unknown.
  # - Send invites delivery when email is off — button visibility only; send not exercised.
  # - Toast or clipboard feedback after "copy" / "copy RSVP link" is unspecified.
  # - Guest RSVP at public Guest link (/e/…) is out of scope for AQPBT-6.
  # - Alt practicum family (APP_ALT_USER_*) is out of scope.
  # - Save changes field validation matrix and email list editing are out of scope; AC14–AC15 smoke only.
  # - Whether venue and guest details persist on create vs only after Edit is unclear in UI ACs.
  #
  # Test automation: tests/aqpbt-6-birthdays-create-party.spec.ts (AC 1–16)
