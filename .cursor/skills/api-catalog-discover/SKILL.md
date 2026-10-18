---
name: api-catalog-discover
description: Discover BuddyTime /api/v1 calls via Playwright (network or browser MCP), write api/CATALOG.md, and show a readable catalog. Use for API discovery prompts, Prompt 1 catalog-only, or when the user wants a friendlier table than one wide markdown grid.
---

# API catalog discovery

Browser pass over `AppRoute` pages (read-only except Dashboard add/remove one child for write bodies). Auth: `playwright/.auth/user.json` or login from env — **never echo credentials**.

Re-run capture: `npx tsx scripts/discover-api-catalog.ts` → `scripts/discover-api-catalog-output.json`.

## Write `api/CATALOG.md`

Do **not** use one very wide table (many columns are hard to read in the editor and in chat).

Use this layout in order:

### 1. Session header (short)

Date, family (main/alt), auth style (Bearer from `bt_token`), scope (`/api/v1/*` only).

### 2. Quick reference (always)

One small table — **four columns only**:

| Method | Endpoint | Safe for API tests? | Evidence |
|--------|----------|---------------------|----------|

- **Safe:** `yes` for GET; for writes only if undo was observed in the same session.
- **Evidence:** `executed` | `inspected only`

Sort: GETs first, then writes, then inspected-only rows.

### 3. Reads — detail block

**One table**, max **five columns**:

| Endpoint | Seen on pages | Status | Response (top level) | Notes |

- **Seen on pages:** comma-separated page names; wrap long lists with “all main nav pages” if the same on every screen.
- **Response:** short type summary, not a full JSON dump.

### 4. Writes — detail block

**One table**:

| Endpoint | Trigger (page / action) | Request body fields | Response | Undo | Safe? |

- Put example JSON in a fenced block **under** the table (one example per write family), not inside a table cell.

### 5. Inspected only

Bullets or a **two-column** table: `Endpoint` | `Why inspected only` (e.g. `support/api-client.ts`, not clicked in UI).

### 6. Not yet tested

Bullet list (pagination, errors, rate limits, no token, writes not exercised).

---

## When you show the catalog in chat

Prefer the **Quick reference** table plus **one** detail section the user asked about (e.g. only Writes). Offer the full file path: `api/CATALOG.md`.

If the user asks for something easier to scan than markdown tables, use the **visualize** skill (compact HTML table or Mermaid) **in chat only** — keep `api/CATALOG.md` in the markdown layout above for git.

---

## Rules

- Omit static assets, fonts, analytics (`/cdn-cgi/rum`), Next `_next/data`, and HTML document navigations unless the user asks for them.
- Normalize path ids to `{id}`.
- Prompt 1 stops after `api/CATALOG.md` — no `fixtures.ts`, `*.api.spec.ts`, or playwright `api` project until Prompt 2.
