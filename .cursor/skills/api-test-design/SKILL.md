---
name: api-test-design
description: Designs API test cases as an approval table from api/CATALOG.md only — no OpenAPI or other specification. Use when the user asks what to test for an area of the API, asks for test cases, test ideas, a test plan, or coverage before any test code exists. Writes api/test-design/<area>.md and stops for approval. Do NOT use to write test code — that is api-contract-tests.
paths: "api/**"
---

# API test design

1. Read the endpoints for the area in **api/CATALOG.md** only (Quick reference, detail tables,
   Writes, Inspected only, Not yet tested). Say which catalog sections you used.
2. Write **api/test-design/<area>.md**, one table per endpoint:

   **ID** | **type** (positive / negative / error) | **what we send** (method, path, body, auth family) |
   **expected status** | **expected body** (rule, key values) | **source** | **technique**

   - **source** is always a catalog label: **executed** (with section name), **assumed — ask**
     (with the question), or **not yet tested**.
   - Rows backed by **executed** catalog evidence are **characterization** tests: copy status and
     body rules from the catalog into expected columns.
   - Rows for **assumed — ask** or **not yet tested** leave expected status and expected body
     empty (or `—`); do not invent outcomes.
3. **Positive (executed only):** one row per observed success case in the catalog (including
   documented query variants). Default auth family **apiMain** (Bearer JWT) unless the catalog
   row says otherwise.
4. **Negative and error**, with the technique named in its column — expected results only when
   the catalog already records them (e.g. unauthenticated **401** on GET reads):
   - **boundary values:** 0, smallest valid value, exactly at a limit, one over it;
   - **equivalence classes:** one row per kind of bad input (missing field, empty string,
     wrong type, negative number);
   - **state:** step in the wrong order or done twice;
   - **auth families:** (a) **apiAlt** — same request as a positive **apiMain** row but target an
     **id** that **apiMain** created (cross-user access); (b) **apiAnonymous** — same request
     with no token. If the catalog does not record status/body for that case, mark the row
     **assumed — ask** or **not yet tested** and leave expectations blank.
5. **Writes:** include a row only when the catalog marks the endpoint safe and documents undo;
   otherwise one **not yet tested** row with no expected result.
6. **Inspected only** endpoints: design read-only rows if the catalog gives enough shape; mark
   source **not yet tested** or **assumed — ask** until the row is **executed**.
7. **Stop.** Show the table and wait for the human to answer **approved** or ask for changes.
   Write no test code.
