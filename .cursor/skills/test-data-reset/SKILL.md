---
name: test-data-reset
description: Deletes records that Playwright tests created in the app under test, using the delete calls in support/api-client.ts. Use only when the user explicitly asks to reset test data after an interrupted run left records behind.
disable-model-invocation: true
---

# Test data reset (tracker only)

Manual cleanup when a run stopped early and **tracked** rows remain in the shared test env. **Not** for routine teardown (global teardown / cleanup reporter handle that).

## When to use

**Only** when the human explicitly asks to reset test data after an interrupted run.

Do **not** run proactively, in CI, or to “clean the whole environment” — deletes **only** lines in `.test-artifacts/created-records.jsonl`.

## Workflow

### 1. Confirm intent

Restate: you will delete **tracker-listed** records only, using each row’s `owner` (`main` / `alt`) and `support/api-client.ts` cancel/delete helpers.

### 2. Auth files

Check `playwright/.auth/user.json` and, if any tracked row has `owner: alt`, `playwright/.auth/alt-user.json`.

If missing:

```bash
npx playwright test tests/auth.storage.spec.ts
```

### 3. Dry run first

Unless the user **already confirmed** delete in this thread:

```bash
npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts --dry-run
```

Optional filter:

```bash
npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts --dry-run --type birthday-event
```

### 4. Execute

After confirmation:

```bash
npx tsx .cursor/skills/test-data-reset/scripts/reset-test-data.ts
```

Same flags as above without `--dry-run`.

### 5. Interpret results

| HTTP / outcome | Meaning |
|----------------|---------|
| **401** | Storage state expired — re-run auth setup; do not guess credentials. |
| **404** on cancel/delete | **Already removed** — counted toward cleanup, not a flake. |
| Other failures | Report in **Failed**; tracker is still cleared only after a full non–dry-run pass (see script exit code). |

Requires `APP_URL` in `.env` (same as Playwright).

## Script

| Flag | Effect |
|------|--------|
| *(default)* | Delete every record in the tracker with that owner’s storage state |
| `--dry-run` | List targets; delete nothing; do not reset tracker |
| `--type <type>` | Only `birthday-event` today (`RecordType` in `record-tracker.ts`) |

Implementation: `.cursor/skills/test-data-reset/scripts/reset-test-data.ts` → `cleanupTrackedRecords()` in `support/cleanup-records.ts` → `support/api-client.ts`. **No duplicated API logic.**

## Result template

Report to the human:

```markdown
## Test data reset

**Scope:** all tracked types | birthday-event only | dry-run

**Found:** N

**Deleted:** N (includes already-removed / 404)

**Failed:** N
```

## Rules

- Never delete a record **not** in the tracker.
- Never hardcode credentials.
- No spec changes, no Jira, no full-suite test run as part of this skill unless auth setup is required.

## Related

- **api-cleanup** — how tests track creates during normal runs
