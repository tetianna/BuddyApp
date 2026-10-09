---
name: ci-failure-triage
description: When a CI run is red, pull the run's logs and the playwright-report artifact via GitHub MCP or GH CLI, read the Playwright error and trace, cross-reference the spec, POM, and app source in the repo, classify real app bug vs test issue, and post a structured diagnosis to the PR. Use whenever a build fails — even if triage isn't asked for.
---

# CI failure triage (Playwright)

Turn a red CI or local run into a **structured diagnosis**. Do not merge, push fixes, or file Jira without the human’s direction.

## Workflow

### 1. Get artifacts

| Source | Actions |
|--------|---------|
| **GitHub CI** | GitHub MCP or `gh`: failed run logs (`gh run view <id> --log`), download artifacts (`gh run download <id>`), especially **playwright-report**. |
| **Local** | `playwright-report/`, `test-results/` (screenshot, `error-context.md`, trace zip). |

Note workflow name, run id, commit SHA, and branch.

### 2. Read the failure

- Failing test title, file, project, tag.
- Assertion: **expected** vs **received** (or timeout / navigation).
- Trace path when present; open from CLI:

```bash
npx playwright show-trace <path-to-trace.zip>
```

- If Playwright wrote an **aria snapshot** in `test-results/.../error-context.md`, **quote the relevant lines** in the report.

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
| **Test issue (drift)** | UI or copy changed; spec/POM/timeout/data is wrong; flake without product mismatch. | Suggest fix in repo; **no** Jira product bug. |
| **Real app bug** | App behavior contradicts AC / feature / Confluence on a healthy env. | Hand off to **jira-bug-reporter** (draft only; human approves filing). |
| **Ambiguous** | AC silent, env/auth/data unclear, or conflicting docs. | List unknowns; ask human before changing tests or filing. |

### 5. Report

Post as a **PR comment** when a PR exists; otherwise return the same block to the parent agent.

```markdown
## CI triage — <run id or "local">

**Classification:** test issue (drift) | real app bug | ambiguous

**Root cause:** <why it failed — not only what assertion said>

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
