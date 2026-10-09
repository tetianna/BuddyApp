---
name: explore-and-generate
description: Finds untested user flows by diffing live UI exploration against existing Playwright specs. Use when the user says "find what we're not testing", "explore <page> for untested flows", "expand coverage", "what flows are missing", "coverage gap", or asks to discover new test scenarios without a Jira ticket. Do NOT use when a Jira ticket or acceptance criteria already exist — that is jira-ticket-analyzer. This skill is for ticket-less discovery only. Exploration is read-only: map coverage, crawl the UI, propose one Gherkin plan per run; do not write or run Playwright specs here.
---

# Explore and generate (ticket-less coverage gaps)

Discover **one** untested flow per run and write a **reviewable Gherkin plan** — not Playwright code.

## Guardrails

| Rule | Detail |
|------|--------|
| **Read-only** | No creates, deletes, invites, approvals, or form submits that persist data. |
| **No automation** | Do not write or run `tests/*.spec.ts` in this skill. |
| **One flow** | One selected gap → one feature file per run. |
| **Browser** | `browser_navigate` + `browser_snapshot` only — **no screenshots**. |
| **Auth** | Reuse `playwright/.auth/user.json`, or sign in with `APP_USER_EMAIL` / `APP_USER_PASSWORD` from `.env` (never log credentials). |

If a control would mutate state, stop at the dialog/panel boundary and describe the flow from snapshot + labels only.

**Not for Jira-backed work** — if the user has a ticket or AC, use **jira-ticket-analyzer** instead.

## Steps

### 1. Map covered flows

From `tests/*.spec.ts` and `pages/`, build a mental inventory per area:

- **Page** (route / POM)
- **Action** (what the user does)
- **Asserted outcome** (what the spec checks)

### 2. Crawl the target page

- Navigate to the page the user named (or infer from context).
- `browser_snapshot` after each meaningful navigation.
- Open dialogs and panels only as far as needed to see labels and structure — **do not confirm** destructive or send actions.

### 3. List real user flows

For each flow on the page:

- **Trigger** (button, link, tab)
- **2–5 steps** (user language)
- **Visible outcome** (copy, URL, list change, validation)

### 4. Diff vs coverage

Label each flow:

| Label | Meaning |
|-------|---------|
| **Gap** | No spec exercises this flow end-to-end. |
| **Partial** | Spec touches the page but not this outcome or branch. |
| *(covered)* | Omit from gap list or note briefly. |

### 5. Select one gap

Pick **one** highest-value **Gap** (or strongest **Partial**). State **why in one sentence** (risk, core journey, regression history).

### 6. Gherkin plan

Write **exactly two** scenarios:

1. **Positive** — happy path for the selected flow.
2. **Edge case** — empty state, cancel, validation, or boundary implied by the UI.

Every **Then** must be assertable in Playwright (visible text, URL, role state). Use **real control names** from the accessibility snapshot — no placeholders.

## Output

Deliver in chat **and** save to:

`features/explore-<page-slug>-<flow-slug>.feature.md`

Use this template:

```markdown
# Coverage snapshot

| Page / area | Covered in specs | Notes |
|-------------|------------------|-------|
| … | … | … |

# Selected gap

**Flow:** …
**Why this gap:** …

# Gherkin test plan

Feature: …

  Scenario: …
    Given …
    When …
    Then …

  Scenario: …
    Given …
    When …
    Then …

# Locator hints

- … (role + name from snapshot; scope to dialog if needed)

# For test-writer

- **Suggested spec:** `tests/<slug>.spec.ts`
- **POM updates:** … (new page/component or methods in `pages/`)

# Suggested Jira story

**Title:** …
**Summary:** …
**Out of scope:** …
```

After human review, they can promote the story to **AQPBT** via backlog process and implement with **jira-ticket-analyzer** + normal test authoring — not in this skill.

## Related skills

- **jira-ticket-analyzer** — ticket + AC → `features/AQPBT-n.feature.md`
- **pom-conventions** / **api-cleanup** — when implementing tests from the plan
