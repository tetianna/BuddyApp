# Block 10 — Authorization adversary evidence

Source run: `qa-run/authz-report.json` (all probes **HELD**; no **BREACHED**; no 5xx stop).

---

## Evidence item 1 — HELD (cross-family DELETE + owner follow-up)

**Evidence item:** Alt family cannot delete main family's disposable host child (`DELETE /api/v1/children/{id}`).

**Basis:** executed

**Test performed:** Authorization adversary probe (promoted pattern in `api/authorization.api.spec.ts`). Main family creates a tracked host child; alt family attempts DELETE on that child id; both families then call `GET /api/v1/me`.

**Command or request:**

```http
DELETE {{baseUrl}}/api/v1/children/{{mainFamilyHostChildId}}
Authorization: Bearer {{altFamilySessionToken}}
```

Follow-up (owner checks):

```http
GET {{baseUrl}}/api/v1/me
Authorization: Bearer {{mainFamilySessionToken}}
```

```http
GET {{baseUrl}}/api/v1/me
Authorization: Bearer {{altFamilySessionToken}}
```

**Expected status:** **404** on DELETE (alt token, child id owned by main) — `api/CATALOG.md` Authorization table.

**Actual status:** **404** on DELETE; **200** on both follow-up GET `/api/v1/me` calls.

**Expected body:** DELETE response must not remove the child from main's `/me`; alt `/me` must not list main's marker child id or first name.

**Actual body:** DELETE body not relied on for pass/fail. Main `/me` JSON still contained the marker child id and first name. Alt `/me` JSON did not contain the marker child id or first name.

**What this proves:** In this executed run, family B could not delete family A's host child (HTTP 404), and the owner follow-up showed the child still on main while absent from alt's profile payload.

**What this does not prove:** Cross-family safety on other write endpoints (events, playdates, availability, profile, admin). Whether **404** vs **403** is the intended denial signal for every unauthorized DELETE. Behavior for unknown UUID ids or double-delete on main.

**Open question:** None for this row — catalog documents this scenario as **executed**.

---

## Evidence item 2 — undocumented (cross-family GET by community id)

**Evidence item:** Alt family reads main family's community by id (`GET /api/v1/communities/{id}`).

**Basis:** executed (adversary probe); catalog **Authorization** table does not state expected status or body for this caller/path (treated as **undocumented**, not a product bug).

**Test performed:** After main family setup (marker host child + `GET /api/v1/communities` to resolve `{{mainCommunityId}}`), alt family called `GET /api/v1/communities/{{mainCommunityId}}`. Probe then confirmed main still owned the marker via `GET /api/v1/me` as main.

**Command or request:**

```http
GET {{baseUrl}}/api/v1/communities/{{mainCommunityId}}
Authorization: Bearer {{altFamilySessionToken}}
```

Follow-up (owner check):

```http
GET {{baseUrl}}/api/v1/me
Authorization: Bearer {{mainFamilySessionToken}}
```

**Expected status:** Not specified in `api/CATALOG.md` for alt-on-main-community-id (reads table covers authenticated main family only; unauthenticated GET is **401**).

**Actual status:** **404** on alt GET community by id; **200** on main follow-up `/me`.

**Expected body:** Not specified in catalog for this adversary case.

**Actual body:** Community GET response did not expose main marker child id or name in JSON (no cross-family read of marker in body). Main `/me` still included the marker child after the probe.

**What this proves:** In this run, alt did not obtain main's marker child via this community id call (404, no marker in response body), and main still owned the marker afterward.

**What this does not prove:** That **404** is the correct long-term contract for every non-member community id (vs **403** or empty **200**). That all community ids behave the same when the alt family is connected elsewhere but not a member of this community. Anonymous or expired-token variants on this path beyond catalog's unauthenticated **401** row.

**Open question:** Should a family that is not a member of a community be able to read that community by its id — and if not, should the API return **404**, **403**, or something else?
