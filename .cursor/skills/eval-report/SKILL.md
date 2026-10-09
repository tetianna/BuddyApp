---
name: eval-report
description: Refreshes eval-report.md — flake rate, heal success, generation-gate pass rate, ask-vs-guess — from CI logs, PR history, and session review. Use when the orchestrator closes a session, after a heal chain, at the end of backlog mode, when the user asks for suite reliability, or when eval-report.md is stale (>14 days). Cursor has no built-in telemetry; this skill defines how to measure each metric manually.
---

# Eval report (`eval-report.md`)

Refresh **suite reliability metrics** at the repo root. **Report only** — no Jira tickets, no test or POM edits.

## When it is mandatory

Run a full refresh if **any** trigger applies:

| Trigger | Action |
|---------|--------|
| A **heal** PR was opened or a **red run** was triaged | Full metrics |
| A **generation** PR was opened (ticket-first test work) | Full metrics |
| `eval-report.md` **missing** or **older than 14 days** | Full metrics |

If **none** apply, reply with **`eval: skipped — no trigger`** and do not rewrite the file unless the user insists.

## Inputs

Collect evidence (default window **N = 30** Playwright workflow runs):

```bash
gh run list --workflow=playwright.yml --limit 30
gh run view <id> --log
gh pr list --state all --limit 50
gh pr checks <pr>
gh pr diff <pr>
```

Also:

- **Manual review** of recent agent transcripts (session folder) and PR bodies for heal/generation claims, assertion changes, and ask-vs-guess behavior.
- Local logs only if CI is unavailable — label the report **local-only**.

If `playwright.yml` is missing or `gh` cannot reach the repo, document that under **Data sources**.

## Metrics

For **each** metric, record:

1. **Value** — `numerator / denominator` (or **insufficient data**)
2. **How measured** — commands, run ids, PR numbers, date range
3. **Interpretation** — one line

### 1. Flake rate

**Definition:** tests that **passed only on retry** ÷ tests in **passing** runs (within window N).

**How:**

- From `gh run view <id> --log`, find Playwright retry lines (e.g. retry #1, `flaky`, or pass after `retry #`).
- Count unique test titles that failed once then passed in the same run.
- Denominator: count test executions in runs with conclusion **success** (or count distinct tests reported green — state method in **How measured**).

**Interpretation:** High flake rate → prioritize stability (isolation, clocks, env) before new coverage.

### 2. Heal success rate

**Definition:** heal PRs **green on first CI** with **assertions unchanged** ÷ **all heal PRs** (branch `heal/*` or PR body claims **self-heal** / **assertions unchanged**).

**How:**

- `gh pr list` + search branch/title/body for `heal/`.
- `gh pr diff` each heal PR: **no** changes under `tests/` except import path refactors are still “unchanged assertions” only if every `expect(` line is identical — if any expect removed/weakened, count as **masked regression**.
- **Masked regressions** (expect removed or weakened to go green) must be **0**; if &gt; 0, call out in interpretation.

**Interpretation:** Low heal success or masked regressions &gt; 0 → tighten **self-heal** / triage gates.

### 3. Generation-gate pass rate

**Definition:** ticket-first generation PRs that are **CI green** + **conforming** + **mapped to AC** ÷ all ticket-first generation PRs.

**How:**

- PRs that reference `AQPBT-*`, `features/AQPBT-*.feature.md`, or orchestrator “generation” templates.
- **CI green:** `gh pr checks` all required checks success.
- **Conforming:** one tag per `test()`, cleanup fixture where data is created, POM locators in `pages/`, constitution/rules cited in PR or diff matches conventions.
- **Mapped to AC:** PR or feature file lists AC numbers covered by new/changed specs.

**Interpretation:** Low pass rate → fix gate (analyzer → feature → spec) before more backlog.

### 4. Ask vs guess

**Definition:** **explicit asks** (agent stopped for missing env, AC, or Confluence) vs **invented values** (placeholders, guessed routes, unconfirmed copy).

**How:** Qualitative is acceptable — sample last **K** sessions (e.g. 5) and PRs; count or bucket `ask` vs `guess` incidents with one example each. State **K** and sources.

**Interpretation:** More guess than ask → reinforce constitution “unknowns” and skills (jira-ticket-analyzer, no invented endpoints).

## Rules

| Rule | Detail |
|------|--------|
| Missing data | Write **insufficient data** for that metric — **never guess** a number. |
| Cleanup 404s | API cancel/delete **404** in teardown logs are **noise**, not flakes. |
| Scope | **No** tickets, **no** test or POM changes in this skill. |
| Close | End with **Top reliability risk** (one sentence) and **Next action** (one concrete step). |

## Output: `eval-report.md`

Write or replace at **repo root**:

```markdown
# Eval report

**Generated:** YYYY-MM-DD  
**Window:** last N Playwright workflow runs (ids: …)  
**Triggers:** heal PR | triage | generation PR | stale report | manual  

## Summary

| Metric | Value | How measured | Interpretation |
|--------|-------|--------------|----------------|
| Flake rate | | | |
| Heal success | | | |
| Generation-gate pass | | | |
| Ask vs guess | | | |

**Masked regressions (heal):** 0 (or count + PR links)

## Data sources

- GitHub runs: …
- PRs reviewed: …
- Transcripts: …

## Top reliability risk

…

## Next action

…
```

If skipped: do not update the file; output only `eval: skipped — no trigger` unless the user requested a refresh anyway.

## Related skills

- **ci-failure-triage** — feeds flake/heal context
- **self-heal** — heal PR criteria for metric 2
- **jira-ticket-analyzer** — generation-gate / AC mapping
