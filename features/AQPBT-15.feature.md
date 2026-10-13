Feature: Profile — your details (display name, optional phone)

  Signed-in parents edit **Your details** on `/profile` (My Profile): the display name
  their circle sees and an optional phone kept for future text reminders. Saving uses
  **Save my details**.
  Jira: AQPBT-15
  Confluence: AQPBT / "[Taya] Profile: your details (display name, phone)" (page 323223554)

  Background:
    Given the main practicum family (APP_USER_EMAIL) is signed in

  # Happy paths — Your details (/profile)

  Scenario: AC1 — Open My Profile from the sidebar
    Given they are on "/app"
    When they click the sidebar link "My Profile"
    Then the URL matches "/profile"
    And the banner shows "My Profile"

  Scenario: AC2 — Your details section shows fields, helper text, and save button
    Given they are on "/profile"
    When they view the "Your details" section
    Then the textbox "Display name (how your circle sees you)" is visible
    And the textbox "Phone (optional)" is visible
    And the text "Your phone stays with your account — nobody in your circle sees it. It is kept for playdate reminders by text, which are not switched on yet." is visible
    And the button "Save my details" is visible

  Scenario: AC4 — Saving with an empty display name succeeds
    Given they are on "/profile"
    And the textbox "Phone (optional)" is empty
    And they clear "Display name (how your circle sees you)"
    When they click "Save my details"
    Then the text "phone must be a phone number" is not visible
    And the text "Your details are saved" is visible
    # Cleanup: restore the original display name via the UI and save again

  # Negative

  Scenario: AC3 — Invalid phone shows a validation message
    Given they are on "/profile"
    And they fill "Phone (optional)" with "abc"
    When they click "Save my details"
    Then the text "phone must be a phone number" is visible
    And the text "Your details are saved" is not visible

  # Edge cases — second family

  Scenario: AC5 — Family B sees the same Your details labels
    Given the alt practicum family (APP_ALT_USER_EMAIL) is signed in
    And they are on "/profile"
    When they view the "Your details" section
    Then the textbox "Display name (how your circle sees you)" is visible
    And the textbox "Phone (optional)" is visible
    And the button "Save my details" is visible

  # Edge cases — Your details

  Scenario: Save my details is enabled when nothing changed
    Given they are on "/profile"
    When they have not edited any field in "Your details"
    Then the button "Save my details" is enabled

  Scenario: Leaving the page without saving does not keep the edit
    Given they are on "/profile"
    And they note the current display name
    And they fill "Display name (how your circle sees you)" with a unique value
    When they click the sidebar link "Dashboard"
    Then the URL matches "/app"
    When they open "/profile"
    Then "Display name (how your circle sees you)" still has the noted display name

  # Ambiguities and gaps
  #
  # - Accepted valid phone formats are undocumented (Confluence open question); no valid-phone
  #   save scenario is automated.
  # - Whether a valid-phone save shows "Your details are saved" is unconfirmed.
  # - Display name validation beyond "may be empty" is unknown (no max-length or
  #   special-character rule documented).
  # - AC4 mutates the shared main family's display name; the test must restore the original
  #   value. If restore fails, the account keeps an empty display name.
  # - AC5 needs APP_ALT_USER_EMAIL / APP_ALT_USER_PASSWORD; the scenario is skipped when unset.
  # - No unsaved-changes dialog was observed on Dashboard navigation; other paths
  #   (browser back, other sidebar links) are unverified and out of scope.
  # - Where the display name appears to other families is out of scope (ticket Out of scope).
  # - Family details, kids, settings shortcuts, delete account, and SMS reminders are out of scope.
  #
  # Test automation: tests/aqpbt-15-profile-your-details.spec.ts (AC 1–5 plus edge cases)
