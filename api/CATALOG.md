# BuddyTime API catalog (discovery)

**Session:** 2026-10-19 · main family · Bearer JWT (`bt_token` in storage state → `Authorization` on `/api/v1/*`)  
**Scope:** JSON **`/api/v1/*`** only (no HTML page loads, static files, or RUM)  
**Capture:** Playwright + `playwright/.auth/user.json`; read-only tour of main `AppRoute` nav pages (including **Calendar**) except Dashboard add/remove one child

---

## Quick reference

| Method | Endpoint | Safe for API tests? | Evidence |
|--------|----------|---------------------|----------|
| GET | `/api/v1/me` | yes | executed |
| GET | `/api/v1/connections` | yes | executed |
| GET | `/api/v1/communities` | yes | executed |
| GET | `/api/v1/communities/{id}` | yes | executed |
| GET | `/api/v1/availability` | yes | executed |
| GET | `/api/v1/playdates` | yes | executed |
| GET | `/api/v1/playdates?filter=upcoming` | yes | executed |
| GET | `/api/v1/matches` | yes | executed |
| GET | `/api/v1/events` | yes | executed |
| POST | `/api/v1/children` | yes (DELETE undo seen) | executed |
| DELETE | `/api/v1/children/{id}` | yes | executed |
| POST | `/api/v1/events` | no | inspected only |
| POST | `/api/v1/events/{id}/cancel` | no | inspected only |

---

## Reads (detail)

| Endpoint | Seen on pages | Status | Response (top level) | Notes |
|----------|---------------|--------|----------------------|-------|
| `/api/v1/me` | All main nav pages + Dashboard child actions | 200 | `parent`, `family`, `isAdmin` | Includes **Calendar**; host children under `family` |
| `/api/v1/connections` | All main nav pages + Dashboard child actions | 200 | array of connections | Includes **Calendar**; friends / circle data |
| `/api/v1/communities` | Dashboard, Communities, Birthdays | 200 | array of community summaries | |
| `/api/v1/communities/{id}` | Birthdays | 200 | community + `members` array | One community id in this session |
| `/api/v1/availability` | Dashboard, Availability | 200 | `rules`, `exceptions` | |
| `/api/v1/playdates` | Playdates | 200 | array | Playdates hub list (no query) |
| `/api/v1/playdates?filter=upcoming` | Dashboard, Calendar, Dashboard child actions | 200 | array | Upcoming playdates; family calendar **This week** |
| `/api/v1/matches` | Playdates | 200 | array of matches | Matcher screen |
| `/api/v1/events` | Birthdays, Calendar | 200 | array of events | `id`, `kind`, `status`, …; month grid and **Birthdays this month** |

**Auth (all rows):** Bearer JWT on `Authorization` header.

**Authenticated GET contract (API tests):** status **200**, `Content-Type` includes **`application/json`**.

**Unauthenticated GET (no `Authorization` header):** status **401** for every endpoint in the Reads table (recorded by `@api` tests).

---

## Writes (detail)

| Endpoint | Trigger | Request body fields | Response | Undo | Safe? |
|----------|---------|---------------------|----------|------|-------|
| `POST /api/v1/children` | Dashboard — Add child | `firstName`, `birthYear`, `birthMonth`, `gender`, `avatarKey`, `interests` | 201 + child object with `id` | `DELETE /api/v1/children/{id}` | yes |
| `DELETE /api/v1/children/{id}` | Dashboard — remove | — | 204 empty | — | yes |

Example **POST** body (unique name in session; shape only):

```json
{
  "firstName": "ApiCat…",
  "birthYear": 2019,
  "birthMonth": 8,
  "gender": "boy",
  "avatarKey": "fox",
  "interests": []
}
```

---

## Inspected only (not run in this browser pass)

| Endpoint | Why |
|----------|-----|
| `POST /api/v1/events` | Used for birthday create in tests; see teardown in `support/api-client.ts` |
| `POST /api/v1/events/{id}/cancel` | Undo for events; same helper — not clicked in UI this pass |

---

## Not yet tested

- Pagination (`page`, `cursor`, `limit`) on any GET
- Error JSON for 4xx / 5xx
- Rate limits
- Calls with an **expired** token (anonymous **401** is cataloged above)
- Other writes: invites, community join/create, availability save, playdate create/cancel, profile update, admin
- Query filters on `connections`, `matches`, `events` (Calendar uses `playdates?filter=upcoming` — cataloged above)

---

*API tests: `npx playwright test --project=api` (see `api/*.api.spec.ts`, `api/fixtures.ts`).*
