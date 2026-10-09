---
name: exploratory-charter
description: Turns a feature name and a risk into a session charter and a blank findings template. Use when the user asks for an exploratory charter, session charter, exploratory testing plan, or wants to structure a time-boxed exploration before or after clicking through the app. The tester supplies the thinking; this skill only enforces the format.
---

# Exploratory session charter (format only)

Produce an empty **charter** and **findings** skeleton. The **human tester** supplies risks, oracles, observations, and severity — the agent does **not** invent them.

**Out of scope for this skill:** do **not** write Playwright specs, file Jira bugs, or run tests. Output is only the charter file under `charters/`.

## Required inputs

| Input | Required |
|-------|----------|
| **Feature** | Yes — ask if missing. |
| **Risk** | Yes — ask if missing. |

| Input | Optional |
|-------|----------|
| Time box | e.g. 45 minutes |
| Scope in / out | bullets |
| Ticket key | e.g. `AQPBT-6` |
| Confluence page | title or URL |
| Page URL | path on `APP_URL` |

If feature or risk is missing, **stop** and ask. Do not guess risks from the app.

## What this skill does not do

| Forbidden | Use instead |
|-----------|-------------|
| Write or edit `tests/*.spec.ts` | Test author / **jira-ticket-analyzer** after AC exists |
| File bugs (Jira MCP) | **jira-bug-reporter** after the tester confirms a finding |
| Run Playwright or other test commands | CI or explicit test task |
| Browser crawl for coverage gaps | **explore-and-generate** |

- No fabricated bugs, questions, or coverage claims in the saved file — leave human sections blank or with `(fill during session)`.

## Charter template

Copy into the output file verbatim structure; fill only **non-judgment** fields the user already provided (feature name, risk, time box, scope, ticket, links).

```markdown
# Session charter

| Field | Value |
|-------|--------|
| **Feature** | |
| **Risk** | |
| **Time box** | |
| **In scope** | |
| **Out of scope** | |
| **Ticket** | |
| **Confluence** | |
| **Page URL** | |

## Mission

(fill during planning — why this session, what could go wrong)

## Oracles

(human — how you will know something is wrong or right: AC, Confluence, comparable product, heuristics)

## Areas to probe

(human — flows, roles, data states, boundaries to visit)

## Notes before start

(human — env, account role, data prep, blockers)
```

## Findings template

Append below the charter in the **same file** (or keep as second section).

```markdown
# Findings

| # | Type (bug / question / note) | Area | Observation | Severity | Follow-up |
|---|------------------------------|------|-------------|----------|-----------|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |

_Add rows during or after the session. Leave cells empty until the tester records something._

## Coverage

**Tried:**

- 

**Not tried:**

- 

**Charter done?** (yes / no / partial — human)
```

## Save location

**Save as** `charters/<feature-slug>.md` only.

- **`<feature-slug>`** — lowercase, hyphens, from the feature name (e.g. `birthdays-create-party`).
- If that file already exists, **ask the human** before overwriting or choosing another name.

Deliver the file path in chat when done.

## Related skills

| Skill | When |
|-------|------|
| **explore-and-generate** | Ticket-less automation-assisted gap discovery + Gherkin |
| **jira-ticket-analyzer** | Ticket + AC → `features/<KEY>.feature.md` |
| **jira-bug-reporter** | File a bug after the tester confirms a finding |
