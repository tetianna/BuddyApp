---
name: self-heal
description: Repairs drifted Playwright locators after a UI change — patch the POM, re-run unchanged assertions, open a PR. Use when the build is red because a locator broke, fix the drifted selector, the test broke after a UI change, or heal the suite. Use ONLY after triage classifies the red run as a test issue (drift/locator drift); NEVER for a real app bug — route those to bug-reporter instead.
---

# Self-heal (locator drift)

Fix **one** broken locator in `pages/` when triage says **test issue (drift)**. Specs and assertions stay the same.

## Prerequisite

Scorer on `.test-artifacts/evidence/current.json`:

```bash
npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json
```

| `decision` + `side` | Action |
|---------------------|--------|
| **act** + **drift** | Continue (hooks allow `pages/` on `heal/*`). |
| **act** + **bug** | **Stop** → **jira-bug-reporter**. |
| **escalate** / **inconclusive** | **Stop** → human `.test-artifacts/approvals/<decisionId>.json` or re-triage. |

## Steps

### 1. Pin the failure

From error + trace (read-only on `tests/`):

- Failing test name and `tests/<file>.spec.ts`
- **Assertion line** (do not edit)
- POM class + **property** that supplied the locator
- **Old locator** exactly as written in `pages/` (constructor or method)

### 2. Re-discover on live UI

- `browser_navigate` to the flow’s URL (`APP_URL` + `AppRoute` or path from spec)
- `browser_snapshot` at the failing step
- Find the element: **same role**, **current accessible name** from the snapshot
- **No screenshots** for guessing; no invented labels

### 3. Patch the POM only

- **One locator per run** — minimal diff in `pages/` (or `pages/components/`)
- Keep **role-based** (`getByRole` → `getByLabel` → `getByText`)
- **Never** CSS, XPath, or a looser selector “to make it pass”
- **Do not** change files under `tests/`

### 4. Verify

```bash
npx playwright test <path-to-spec> -g "<failing test title fragment>"
```

Must pass with **zero changes under `tests/`** (assertions unchanged).

### 5. Pull request

- Branch: `heal/<short-description>`
- **Do not merge**

PR body must include:

- CI **run id** (or “local”) from triage
- **Classification:** test issue (drift)
- **Locator diff:** old → new (file + property)
- **Re-run result** (pass)
- Line: **assertions unchanged**

Use `gh pr create` per project conventions.

## Stop and escalate

| Signal | Action |
|--------|--------|
| Fix requires changing an **assertion** or expected copy | Stop — not drift-only; human decides (bug vs AC update). |
| Same locator error after re-discovery | Stop — report snapshot vs POM mismatch. |
| **New** failure looks like product regression | Stop → **jira-bug-reporter** or re-triage. |
| Failure is timeout/race/flake without label change | Stop — not a one-locator heal. |

## Report template

```markdown
## Self-heal — <run id or local>

**Triage:** test issue (drift)

**Test:** `<spec>` — `<test title>`

**Assertion (unchanged):** `<file>:<line>` — `<expect(...) snippet>`

**POM:** `<page>.ts` → `<property>`

**Locator change:**
- Before: `...`
- After: `...`
- Evidence: aria snapshot — `<role>` name `"..."`

**Re-run:** `npx playwright test ...` — passed

**PR:** <url> — assertions unchanged
```

## Do / Don't

| Do | Don't |
|----|--------|
| Patch **one** locator in `pages/` after snapshot proof | Change `expect()` or delete assertions |
| Re-run the **same** failing test | Run the full suite as “proof” unless user asks |
| Open PR on `heal/...` with triage + diff | Merge without review |
| Use triage classification **drift** only | Heal when the app is wrong per AC |
| Quote new name from **browser_snapshot** | Guess from screenshot pixels |
| Route product defects to **jira-bug-reporter** | File Jira from self-heal |

## Related skills

- **ci-failure-triage** — required classification before heal
- **jira-bug-reporter** — real app bug path
- **pom-conventions** — locator rules for the patch
