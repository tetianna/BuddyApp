# Test design: children endpoints

**Catalog sections:** Quick reference (POST/DELETE), Writes (detail), Reads (`/api/v1/me` for family after create), Not yet tested (4xx body shape).

---

## POST `/api/v1/children`

| ID | type | what we send | expected status | expected body | source | technique |
|----|------|--------------|-----------------|---------------|--------|-----------|
| CH-P-01 | positive | `POST /api/v1/children` with catalog fields (`firstName`, `birthYear`, `birthMonth`, `gender`, `avatarKey`, `interests`); unique `firstName`; **apiMain** | 201 | JSON child with string `id`; response includes sent fields; `age` number (seen in API test pass) | executed — Writes (detail) | apiMain |
| CH-P-02 | positive | After CH-P-01, `GET /api/v1/me` **apiMain** | 200 | `family` tree includes created `firstName` | executed — Reads (`/api/v1/me` on Dashboard child actions) + API test pass | state (create then read) |
| CH-N-01 | negative | Same body as CH-P-01, **apiAnonymous** (no token) | — | — | not yet tested — catalog records **401** only for Reads GETs, not POST children | auth families — apiAnonymous |
| CH-N-02 | negative | Body missing `firstName`, **apiMain** | — | — | assumed — ask: required fields and status for POST children? | equivalence classes |
| CH-N-03 | negative | Body with empty string `firstName`, **apiMain** | — | — | assumed — ask | equivalence classes |
| CH-N-04 | negative | `birthMonth` **0**, otherwise valid, **apiMain** | — | — | assumed — ask: valid month range? | boundary values |
| CH-N-05 | negative | `birthMonth` **13**, otherwise valid, **apiMain** | — | — | assumed — ask | boundary values |
| CH-N-06 | negative | `birthYear` far in future or negative, **apiMain** | — | — | assumed — ask | boundary values |
| CH-N-07 | negative | `interests` wrong type (not array), **apiMain** | — | — | assumed — ask | equivalence classes |

---

## DELETE `/api/v1/children/{id}`

| ID | type | what we send | expected status | expected body | source | technique |
|----|------|--------------|-----------------|---------------|--------|-----------|
| CH-D-P-01 | positive | `DELETE /api/v1/children/{id}` for id from CH-P-01, **apiMain** | 204 | empty body | executed — Writes (detail) | apiMain |
| CH-D-N-01 | negative | `DELETE` with unknown id (valid UUID shape), **apiMain** | — | — | not yet tested | equivalence classes |
| CH-D-N-02 | negative | `DELETE` same id twice (second call after CH-D-P-01), **apiMain** | — | — | not yet tested | state |
| CH-D-N-03 | negative | `DELETE` id from CH-P-01, **apiAnonymous** | — | — | not yet tested | auth families — apiAnonymous |
| CH-D-N-04 | negative | `DELETE` id created by **apiMain**, caller **apiAlt** | — | — | assumed — ask: can another user delete this host child? | auth families — apiAlt |
| CH-D-N-05 | negative | `GET /api/v1/me` **apiMain** after CH-D-P-01 | 200 | created `firstName` no longer under `family` | not yet tested — delete success is executed; family absence not cataloged | state (delete then read) |

---

## Coverage notes

- **Already in code (partial):** `children.api.spec.ts` covers CH-P-01, CH-P-02, and CH-D-P-01 in one flow; it does not yet cover intentional single-change errors (see `api-conventions.mdc`).
- **Characterization rows** (executed): pin catalog status and field rules only.
- **Blank expectations:** need a catalog update or human answer before `api-contract-tests` should assert them.

**Status:** awaiting approval.
