---
name: jira-ticket-analyzer
description: Turns a Jira ticket's acceptance criteria into structured, reviewable Gherkin test scenarios. Use this skill whenever the user references a Jira ticket (AQPBT-1, AQPBT-2, etc.) and asks for test cases, a test plan, scenarios, or wants to plan testing for a ticket — even if they don't say the word "Gherkin".
---

# Jira Ticket to Gherkin Test Cases

The Gherkin is a human-readable checkpoint reviewed before any Playwright code is written.

## Workflow

### 1. Read sources

- Use the **Atlassian MCP** to load the Jira issue: title, description, and **every** acceptance criterion (custom fields, checklist, or embedded AC text — read the full issue, not only the summary).
- If the ticket links a Confluence page in space `CONFLUENCE_SPACE_KEY` (repo: `.env.example`, typically `AQPBT`), read that page and fold its business rules into scenarios.
- Note routes, roles, copy, and data names exactly as documented (or as confirmed on the live app if the ticket is silent — then list that as an ambiguity).

### 2. Map coverage

- **One `Feature`** named after the ticket (short product phrase + `Jira: <KEY>` in the preamble).
- **Every AC** → at least one `Scenario` (title prefix `AC<n> —` when ACs are numbered).
- Add scenarios the ticket implies but does not number:
  - **Negative** — what must **not** happen (validation, blocked actions, no side effects).
  - **Edge cases** — boundaries, empty input, duplicates, special characters, max length, time-zone and overlap edges for scheduling rules, a **second family's** point of view when multi-user flows apply.

### 3. Step semantics

| Keyword | Meaning |
|--------|---------|
| **Given** | Starting state (auth, data preconditions, empty lists). |
| **When** | The action under test (navigation, submit, dismiss dialog). |
| **Then** | Observable expected outcome (visible copy, URL, validation message, list contents). |

Prefer user-facing labels and quoted UI strings. Use tables for option lists when the AC enumerates values.

### 4. Grouping

Separate blocks with comments:

```gherkin
  # Happy paths — <area>

  # Negative

  # Edge cases — <area>
```

Add a `Background:` only for steps shared by most scenarios (e.g. default signed-in family).

### 5. Values

Use **real, specific values** from the ticket, Confluence, or practicum test accounts — **never** placeholders like `TBD`, `foo`, or `example.com` unless the AC explicitly allows any value.

### 6. Ambiguities

End the file with a comment block:

```gherkin
  # Ambiguities and gaps
  #
  # - ...
```

List missing AC detail, conflicting Jira vs Confluence copy, undocumented defaults, and out-of-scope items (so automation does not guess later).

## Output

| Item | Rule |
|------|------|
| **Path** | `features/<ticket-key>.feature.md` (e.g. `features/AQPBT-6.feature.md`) |
| **Format** | Markdown file; Gherkin keywords at column 0; scenario bodies indented two spaces |
| **Review gate** | Stop after writing the feature file unless the user asks for Playwright implementation |

Do **not** weaken or invent ACs to match the app. If live UI contradicts the ticket during a later automation pass, report the mismatch; do not change Gherkin silently.

## Reference

For shape and depth, compare `features/AQPBT-6.feature.md` in this repo (AC mapping, negative/edge sections, ambiguity footer).
