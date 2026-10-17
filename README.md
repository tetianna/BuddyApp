# BuddyApp

Playwright tests and agent tooling for **BuddyTime**, a web app for scheduling playdates between families.

Stories live in Jira project **[AQPBT](https://your-site.atlassian.net/browse/AQPBT)**. Feature pages and acceptance criteria live in Confluence space **AQPBT**. In this repo, ticket plans are saved under `features/` (for example `features/AQPBT-15.feature.md`).

## Prerequisites

- **Node.js 20+** (matches GitHub Actions)

## Install

```bash
npm ci
npx playwright install --with-deps chromium
```

## Environment

Copy the example file and fill in real values (never commit `.env`):

```bash
cp .env.example .env
```

On Windows PowerShell: `Copy-Item .env.example .env`

| Section in `.env.example` | Variables | Needed for |
|---------------------------|-----------|------------|
| **Run tests** | `APP_URL`, `APP_USER_EMAIL`, `APP_USER_PASSWORD`, `APP_ALT_USER_EMAIL`, `APP_ALT_USER_PASSWORD` | Local `npx playwright test` and CI Playwright job |
| **Agent / CI setup** | `CURSOR_API_KEY`, `ATLASSIAN_*`, `JIRA_PROJECT_KEY`, `CONFLUENCE_SPACE_KEY` | GitHub **Test Generation** workflow and backlog automation — not required to run tests locally |

**Why two family accounts?** Global setup logs in once per family and writes `playwright/.auth/user.json` (main) and `playwright/.auth/alt-user.json` (second). Most tests use the main family only. Flows that need two parents (for example invites or shared playdates) use the alt account; those tests skip if the alt credentials are not set.

## Run tests

| Goal | Command |
|------|---------|
| Full suite | `npm test` or `npx playwright test` |
| App project | `npx playwright test --project=app` |
| Smoke tag | `npm run test:smoke` |
| Sanity tag | `npm run test:sanity` |
| Regression tag | `npm run test:regression` |
| API tag | `npm run test:api` |
| End-to-end tag | `npm run test:e2e` |
| Destructive tag (one worker) | `npm run test:destructive` |
| Single file | `npx playwright test tests/path/to/spec.spec.ts` |
| Open last HTML report | `npx playwright show-report` |

Auth state files under `playwright/.auth/` are created on the first run and are git-ignored.

## CI (Playwright workflow)

Workflow file: `.github/workflows/playwright.yml`

| Trigger | What runs |
|---------|-----------|
| `push` | Sanity slice (`@sanity`) |
| `pull_request` | Smoke slice (`@smoke`) |
| `workflow_dispatch` | Full suite (all tests) |

Secrets in GitHub Actions mirror the **Run tests** variables from `.env.example` (`APP_URL`, both families’ emails and passwords).

A separate workflow, **Test Generation** (`.github/workflows/test-generation.yml`), can run on a schedule or `workflow_dispatch` to process Jira backlog tickets; it uses the **Agent / CI setup** variables and `CURSOR_API_KEY`.

## Agent layout (`.cursor/`)

| Part | One-line role |
|------|----------------|
| `.cursor/rules` | Always-on conventions (constitution, Playwright style, orchestrator, ESL-friendly chat). |
| `.cursor/skills` | Step-by-step playbooks (Jira analysis, self-heal, CI triage, eval report, API cleanup, and others). |
| `.cursor/agents` | Specialist subagents: `test-writer`, `triage`, `bug-reporter`. |
| `.cursor/hooks` | Pre-edit guards that block weakening assertions or breaking constitution rules. |

Suite reliability metrics are tracked in [`eval-report.md`](eval-report.md).

## MCP in Cursor (IDE only)

Connect **Atlassian** and **GitHub** MCP servers in **Cursor Settings → MCP**, not in `.env`. The IDE uses your signed-in MCP connections for Jira, Confluence, and pull requests. `.env` Atlassian fields are for headless CI (Test Generation), not for day-to-day Cursor chat.

This repo’s `.cursor/mcp.json` also enables the **Playwright** MCP server for browser automation in the IDE.

## Typical flow

Pick a Jira ticket in **AQPBT**, read its Confluence page, and save a Gherkin plan to `features/<key>.feature.md` using the ticket analyzer skill. Delegate to **test-writer** to add page objects under `pages/` and a spec under `tests/`, then run the suite locally or open a pull request. If CI fails, **triage** classifies drift versus a real bug; drift goes to **self-heal**, a confirmed defect goes to **bug-reporter** for a Jira draft after your approval.
