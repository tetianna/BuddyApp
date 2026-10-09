---
name: api-cleanup
description: Ensures Playwright tests clean up the data they create. Use whenever generating or reviewing tests that create persistent records in the app under test (BuddyTime availability, playdates, invites, or anything else), so test data does not accumulate in the shared test environment. Apply this to every test that creates data — even if cleanup isn't explicitly requested.
paths: tests/**
---

# API cleanup for Playwright tests

Shared BuddyTime test env: every create must be tracked and torn down. **Do not extend the table below** until `RecordType` and `api-client` gain new handlers — read those files and update this skill in the same change.

## Workflow

### 1. Fixture import

```typescript
import { expect, test, trackRecord } from '../fixtures/cleanup.fixture';
```

Not `@playwright/test` for `test` / `expect` in specs that create data.

### 2. Tracking

| How created | What to do |
|-------------|------------|
| **UI** | Automatic: `cleanup.fixture` listens for `POST /api/v1/events` → `201`, reads `id` from JSON, calls `trackRecord({ type: 'birthday-event', id, owner: recordOwner })`. Set `test.use({ recordOwner: 'alt' })` when the signed-in family is alt. |
| **API** in test/setup | Call `trackRecord({ type, id, owner })` immediately after create. `owner` is `'main'` or `'alt'`. |

### 3. Teardown

- **No** manual `afterAll` / `afterEach` cleanup blocks for tracked records.
- `support/global-teardown.ts` and `support/cleanup-reporter.ts` call `cleanupCreatedRecords()` at run end.
- `support/global-setup.ts` runs `initTracker()` so each run starts with an empty `.test-artifacts/created-records.jsonl`.

### 4. Delete path

- Teardown uses `support/api-client.ts` with the **same owner's** `storageState` (`AUTH_FILE` / `ALT_AUTH_FILE`) via `createApiContext(record.owner)`.
- If a future `RecordType` has **no** API delete helper yet, use the **UI teardown** agreed in P10 for that feature — still track the record; never leave data behind.

### 5. Safety

- Never hardcode credentials.
- Never delete data the test did not create (no broad `cancelAllActiveBirthdayEvents` as a substitute for per-test tracking unless the scenario explicitly requires empty shared prep and is documented in the spec).

## Tracked record types

Sourced only from `support/record-tracker.ts` and `support/api-client.ts` / `support/cleanup-records.ts` as of this repo.

| `type` | Create request | Delete request | `owner` |
|--------|----------------|----------------|---------|
| `birthday-event` | `POST /api/v1/events` (UI create or API; tracked on `201` + body `id`) | `POST /api/v1/events/{eventId}/cancel` (`cancelBirthdayEvent`) | `main` \| `alt` |

**Helpers (not tracked types):** `cancelAllActiveBirthdayEvents(owner)` lists `GET /api/v1/events` and cancels active `kind: birthday` rows — use only for documented empty-state prep, not as default test cleanup.

## When adding a new record type

1. Add to `RecordType` in `record-tracker.ts`.
2. Add create detection in `cleanup.fixture.ts` (UI) and/or document API `trackRecord` usage.
3. Add delete in `api-client.ts` and a `case` in `cleanup-records.ts`.
4. Update the table in this skill in the same pull request.
