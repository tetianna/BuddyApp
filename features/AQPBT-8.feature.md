Feature: Availability — save weekly free time (Weekend afternoons preset)

  Signed-in parents on `/availability` apply the **Weekend afternoons** quick preset,
  save weekly slots, and validate one-off exception form guardrails.
  Jira: AQPBT-8
  Confluence: AQPBT / "Feature map" (page 305987585) — no dedicated availability feature page yet

  Background:
    Given the main practicum family (APP_USER_EMAIL) is signed in

  # Happy paths — weekly preset (/availability)

  Scenario: AC1 — Weekend afternoons preset saves Saturday and Sunday afternoon slots
    Given they are on "/availability"
    And the banner shows "Availability"
    And "Set your weekly free time" is visible
    When they click "Weekend afternoons"
    And they click "Save availability"
    Then the URL matches "/availability"
    When they reload the page
    Then the weekly row for "Sat" shows a slot with start time "13:00" and end time "17:00"
    And the weekly row for "Sun" shows a slot with start time "13:00" and end time "17:00"
    # Cleanup: restore prior weekly availability via the UI (or clear weekend slots) before the test ends

  # Negative — one-off exceptions

  Scenario: AC2 — Empty date with Away / closed does not add an exception row
    Given they are on "/availability"
    And they are in the "One-off changes" section
    And the exception date field is empty
    And the exception type is "Away / closed"
    When they click "Add exception"
    Then no new exception row appears below the form
    And the count of saved exception rows is unchanged

  # Ambiguities and gaps
  #
  # - Dedicated Confluence feature page for AQPBT-8 is missing (Feature map lists the story only).
  # - Exact clock labels in the UI may render as 1:00 PM / 5:00 PM while inputs use 24h "13:00" / "17:00".
  # - AC1 does not require a success toast; assert persistence via reload only unless the app shows stable copy.
  # - Shared main-family account: tests that save availability should run serially and revert weekly slots after AC1.
  # - Pre-existing one-off exceptions on the test account must not be deleted; AC2 only compares row count before/after.
