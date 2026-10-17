---
name: jira-bug-reporter
description: Analyzes Playwright test failures, searches Jira for duplicates, drafts detailed bug tickets, and files only after human approval. Use when a test fails and needs investigation and bug reporting.
---

# Jira Bug Reporter (Playwright failures)

Turn a failing test into a **reviewable Jira draft**. BuddyTime application source is **not** in this repo — describe **observed UI/API behavior** precisely; do not invent internal implementation.

## Workflow

### 1. Read the failure

- Assertion message, stack trace, and **which test** (`tests/…`, tag, linked story key if in title).
- Artifacts under `test-results/`: screenshot path, `error-context.md`, trace path (note `trace: on-first-retry` if no trace).
- Linked Gherkin: `features/<KEY>.feature.md` and acceptance criterion the test encodes.

### 2. Confirm it reproduces

Re-run **once**:

```bash
npx playwright test <path-to-spec> -g "<test title fragment>"
```

- **Passes on retry** → scorer **inconclusive** (not drift); do **not** file a product bug.
- **Fails again** → require scorer **act** + **bug** before draft (`createJiraIssue` field **`issueType`**: **Bug**).

### 3. Root cause

Use scorer JSON on `current.json` — not chat labels or saved decision files.

| Scorer | Action |
|--------|--------|
| **act** + **bug** | Draft bug (steps 4–6); `issueType` **Bug**. |
| **act** + **drift** | **Stop** → self-heal. |
| **escalate** / **inconclusive** | **Stop** → approval file or more evidence. |

Read the spec, relevant `pages/` objects, and the live app (browser MCP or re-run with headed) as needed.

### 4. Search Jira before drafting

- Project: `JIRA_PROJECT_KEY` from `.env` / `.env.example` (e.g. `AQPBT`).
- Use **Atlassian MCP** (`searchJiraIssuesUsingJql` or equivalent): open bugs with similar summary, component, or keywords from the failure (route, button label, error snippet).
- If a **duplicate** exists: summarize the match, offer to **comment** on that issue with new evidence — do not create a second ticket unless the user asks.

### 5. Draft ticket

Present this structure to the human (markdown in chat; not filed yet):

| Field | Content |
|-------|---------|
| **Title** | Specific, user-visible symptom (not "test failed"). |
| **Type** | Bug |
| **Severity / Priority** | Justify from user impact and AC criticality. |
| **Steps to reproduce** | Numbered from signed-in state; say **main** vs **alt** practicum family by role, not by email. |
| **Expected** | From AC, Gherkin, or linked Confluence page. |
| **Actual** | What the app did (copy, URL, missing control). |
| **Environment** | `APP_URL` host only, browser/project from Playwright config, account **role** — **never** email or password. |
| **Evidence** | Relative paths to screenshot and trace under `test-results/`. |
| **Playwright error** | Exact assertion/timeout message. |
| **Linked story** | Originating story key (e.g. `AQPBT-6`). |

### 6. Human approval → file

- **Show the full draft** and ask explicitly to create the issue.
- **Only after approval**, create the issue via Atlassian MCP and **link** it to the originating story (issue link / parent as your site supports).
- If the user edits the draft, use their final text.

## Rules

- **Never file without human approval.**
- **Never file for a test issue** — automation mistakes, drift, flake without product mismatch, or bad test data are fixed in the repo, not in Jira.
- **Never weaken or delete assertions** to avoid filing; if the test is correct and the app is wrong, file (after approval).
- **Never put secrets** in the ticket (passwords, tokens, full `.env`).
- **Do not file** when the failure is out of scope or the feature file already marks the behavior as an ambiguity — surface that to the human instead.

## Reference

- Constitution: product defect → bug-reporter; drift → self-heal (`constitution.mdc`).
- Duplicate search aligns with Atlassian **triage-issue** patterns when available.
