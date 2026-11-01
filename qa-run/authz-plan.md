# Authorization probe plan

**Question:** Can family B (`altApi`) read or change family A (`mainApi`) data? Can anonymous callers (`anonApi`)?

**Sources:** `api/CATALOG.md`, `api/authorization.api.spec.ts`

**Setup (mainApi only, counted):**

| # | Method | Endpoint | Caller | Purpose |
|---|--------|----------|--------|---------|
| S1 | POST | `/api/v1/children` | mainApi | Disposable host child + `trackRecord` (leak marker) |
| S2 | GET | `/api/v1/communities` | mainApi | Resolve `mainCommunityId` for `{id}` probe |

**Probes (max 20 HTTP calls including setup):**

| # | Method | Endpoint | Caller | Expected (catalog) | Follow-up for HELD |
|---|--------|----------|--------|--------------------|--------------------|
| 1 | GET | `/api/v1/me` | altApi | undocumented cross-family | mainApi `/me` still lists marker child |
| 2 | GET | `/api/v1/connections` | altApi | undocumented | body must not contain marker child id/name |
| 3 | GET | `/api/v1/communities/{mainCommunityId}` | altApi | undocumented | body must not contain marker child id |
| 4 | GET | `/api/v1/availability` | altApi | undocumented | no marker in body |
| 5 | GET | `/api/v1/playdates` | altApi | undocumented | no marker in body |
| 6 | GET | `/api/v1/playdates?filter=upcoming` | altApi | undocumented | no marker in body |
| 7 | GET | `/api/v1/matches` | altApi | undocumented | no marker in body |
| 8 | GET | `/api/v1/events` | altApi | undocumented | no marker in body |
| 9 | GET | `/api/v1/me` | anonApi | **401** (reads table) | — |
| 10 | GET | `/api/v1/connections` | anonApi | **401** | — |
| 11 | GET | `/api/v1/communities/{mainCommunityId}` | anonApi | **401** | — |
| 12 | POST+DELETE | `/api/v1/children/{id}` | altApi | DELETE **404** (Authorization table) | main `/me` still has child; alt `/me` does not |
| 13 | POST+DELETE | `/api/v1/children/{id}` | anonApi | DELETE **401** (Authorization table) | main `/me` still has child |

**Total planned:** 2 setup + 11 GET probes + 2 write setups + 2 DELETE attempts = **17** adversary HTTP calls (under 20; follow-up GET `/me` counts inside probe tests).

**Skip:** All `altApi` rows when `APP_ALT_USER_*` unset.

**Stop rule:** Abort remaining tests on any **5xx** response.
