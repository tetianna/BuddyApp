---
name: ci-failure-triage
description: Triage any CI or local Playwright run (failed or passed). Always write evidence and run score-evidence.ts. On red runs, pull logs and playwright-report, classify bug vs test issue, and post diagnosis. Use whenever a run is discussed or triage is asked — even when CI is green.
---

# CI triage (Playwright)

Turn any CI or local run into a **structured diagnosis** with **mandatory evidence + scorer**. Do not merge, push fixes, or file Jira without the human’s direction.

**Always (green or red):** steps **5** (evidence file + `score-evidence.ts`) and include scorer JSON in the report. Skipping the scorer because the run passed is not allowed.

## Workflow

### 1. Get artifacts

| Source | Actions |
|--------|---------|
| **GitHub CI** | GitHub MCP or `gh`: failed run logs (`gh run view <id> --log`), download artifacts (`gh run download <id>`), especially **playwright-report**. |
| **Local** | `playwright-report/`, `test-results/` (screenshot, `error-context.md`, trace zip). |

Note workflow name, run id, commit SHA, and branch.

### 2. Read the run

**If the run failed:**

- Failing test title, file, project, tag.
- Assertion: **expected** vs **received** (or timeout / navigation).
- Trace path when present; open from CLI:

```bash
npx playwright show-trace <path-to-trace.zip>
```

- If Playwright wrote an **aria snapshot** in `test-results/.../error-context.md`, **quote the relevant lines** in the report.

**If the run passed:**

- Workflow name, run id, branch, commit SHA, job conclusion.
- Regression/suite scope (e.g. `@regression` project).
- Evidence excerpt must state **green** explicitly (e.g. “regression job passed; no failing tests”) so the scorer can return `pass`.

### 3. Cross-reference

| Layer | Where |
|-------|--------|
| Spec | `tests/*.spec.ts` — what the test claims |
| POM | `pages/` — locators and actions |
| Story | Jira key in test title / `features/<KEY>.feature.md` |
| Product rules | Linked Confluence in `CONFLUENCE_SPACE_KEY` (Atlassian MCP) |

BuddyTime **application source is not in this repo** — judge against AC, Gherkin, and Confluence, not imagined implementation.

### 4. Classify (exactly one)

| Label | Meaning | Next step |
|-------|---------|-----------|
| **Test issue (drift)** | UI or copy changed; spec/POM/timeout/data is wrong; shared-account pollution; strict assertion mismatch. | Suggest fix in repo; **no** Jira product bug. |
| **Real app bug** | App behavior contradicts AC / feature / Confluence on a healthy env. | Hand off to **jira-bug-reporter** (draft only; human approves filing). |
| **Ambiguous** | AC silent, env/auth/data unclear, or conflicting docs. | List unknowns; ask human before changing tests or filing. |
| **Inconclusive** | Test **passed on re-run** or timing/retry flake without product mismatch. | **Not** drift — stop; gather more evidence; do not self-heal. |
| **Pass (green)** | Whole run or requested scope completed with no failure. | Scorer `pass` — no heal, no bug draft. |

### 5. Evidence file and scorer (gates — mandatory every triage)

1. Write evidence only to `.test-artifacts/evidence/<runId>-<testId>.json` (`artifact`, `line`, `excerpt` per item — never `score`, `confidence`, or `weight`).
2. Copy to `.test-artifacts/evidence/current.json`.
3. Run and return stdout from `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`.

### 6. Report

Post as a **PR comment** when a PR exists; otherwise return the same block to the parent agent.

```markdown
## CI triage — <run id or "local">

**Scorer:** `decision` / `side` / `decisionId` / `allowedActions` from `score-evidence.ts` (authoritative for routing)

**Run result:** passed | failed

**Classification (prose only):** pass (green) | test issue (drift) | real app bug | ambiguous | inconclusive

**Root cause:** <why it failed, or “none — regression green” for pass>

**Location:** `<file>:<line>` (spec and/or POM)

**Expected:** <from AC / feature / Confluence>

**Actual:** <observed UI, URL, or error>

**Evidence:** trace path or screenshot; GitHub run `<url>`; commit `<sha>`

**Suggested fix:** <concrete next step — e.g. update locator in `pages/...`, or file bug for AC3>
```

## Rules

- **Never merge** or **apply a fix yourself** as part of triage (diagnosis only unless the user explicitly asks to fix).
- **Real defects** → **jira-bug-reporter** skill; do not create Jira issues inside this skill.
- Name **file, line, and cause** — not only the symptom (e.g. “timeout on `getByRole('button', { name: 'Save' })` because label changed to ‘Save changes’ in `birthday-party-manage.page.ts`”, not “test failed”).
- Do not weaken assertions to explain green CI.
- Do not paste credentials or full `.env` in PR comments.

## Related skills

- **jira-bug-reporter** — after classification is **real app bug** and human wants a ticket.
- **pom-conventions** / **api-cleanup** — when the fix is test-side.
