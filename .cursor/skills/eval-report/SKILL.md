---
name: eval-report
description: Refreshes eval-report.md — flake rate, heal success, generation-gate pass rate, ask-vs-guess, and orchestrator session confidence — from CI logs, PR history, and session review. Mandatory when the orchestrator closes any session (ticket, backlog, or heal). Also run after a heal chain, when the user asks for suite reliability, or when eval-report.md is stale (>14 days). Cursor has no built-in telemetry; this skill defines how to measure each metric manually.
---

# Eval report (`eval-report.md`)

Refresh **suite reliability metrics** at the repo root. **Report only** — no Jira tickets, no test or POM edits.

**Gold standard:** match the tone and depth of the current repo root `eval-report.md` (Session log with **N/10**, plain-language unknowns, a short **Latest session confidence** paragraph that says why the score is not higher, honest **insufficient data** where CI is thin, and concrete **Top reliability risk** / **Next action**). Update that file in place; do not shrink future reports to a stub.

## When it is mandatory

**Always** update `eval-report.md` when the **qa-orchestrator** (or any user-driven ticket end-to-end run) closes a session. Do **not** skip with `eval: skipped`.

| Trigger | Action |
|---------|--------|
| **Orchestrator session closes** (success, heal PR, bug draft, or escalate) | Full metrics **and** append **Session log** row (confidence required) |
| A **heal** PR was opened or a **red run** was triaged | Full metrics |
| A **generation** PR was opened (ticket-first test work) | Full metrics |
| `eval-report.md` **missing** or **older than 14 days** | Full metrics |
| User asks for suite reliability | Full metrics |

If CI history is thin, still write the file: use **insufficient data** for numeric metrics, but always record the **Session log** row for the work just finished.

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

### 5. Session confidence (orchestrator)

**Definition:** the orchestrator **Proposal** **Confidence** score (1–10) for the ticket or failure handled this session, plus whether the **confidence gate** was satisfied.

**How:**

- Prefer the session’s **Proposal** block (constitution agent governance). If it was never emitted, assign a **retroactive N/10** from evidence (Jira, Confluence, live app, PR/CI) and say so in **Latest session confidence** and **Top reliability risk**.
- **Unknowns** column: short plain-language bullets in one cell (not `TBD`); use `none` only when truly none.
- **Confidence** column: always **`N/10`** (bold in markdown is OK).
- **Outcome:** concrete status — e.g. `spec green locally (3 tests) + generation PR open; tests-generated on Jira`.
- Link **Jira key**, **PR**, and **feature file** when they exist.

**Latest session confidence** (required paragraph under Session log): one or two sentences — what evidence supported the score and **why it is not 9–10** (missing docs, shared-account cleanup, no Proposal in chat, etc.).

**Interpretation:** Sessions with confidence **&lt; 8** or non-empty unknowns → treat generation-gate risk as higher until Confluence or live-app evidence closes gaps.

## Rules

| Rule | Detail |
|------|--------|
| Missing data | Write **insufficient data** for that metric — **never guess** a number. |
| Cleanup 404s | API cancel/delete **404** in teardown logs are **noise**, not flakes. |
| Scope | **No** tickets, **no** test or POM changes in this skill. |
| Close | **Top reliability risk** (one sentence, tie to latest confidence/unknowns) and **Next action** (one concrete step, e.g. merge PR, add Confluence page, emit Proposal next run). |
| Style | Write for the project owner (clear English, no insider abbreviations). Prefer links to PRs and run ids over vague “CI passed”. |

## Output: `eval-report.md`

Write or replace at **repo root**:

```markdown
# Eval report

**Generated:** YYYY-MM-DD  
**Window:** last N Playwright workflow runs (ids: …)  
**Triggers:** orchestrator close | heal PR | triage | generation PR | stale report | manual  

## Session log

Most recent orchestrator sessions first (keep last **5** rows; drop older).

| Date | Jira | Confidence | Unknowns | Outcome | PR / notes |
|------|------|------------|----------|---------|------------|
| YYYY-MM-DD | AQPBT-n | 8/10 | none | spec green + generation PR | #n, features/AQPBT-n.feature.md |

**Latest session confidence:** N/10 — one-line rationale from the Proposal.

## Summary

| Metric | Value | How measured | Interpretation |
|--------|-------|--------------|----------------|
| Flake rate | | | |
| Heal success | | | |
| Generation-gate pass | | | |
| Ask vs guess | | | |
| Session confidence (latest) | N/10 or not recorded | Proposal block this session | |

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

On orchestrator close: commit the refreshed `eval-report.md` when the parent task asked for a commit; otherwise leave the file updated locally and state **Confidence: N/10** in the handoff summary.

## Related skills

- **ci-failure-triage** — feeds flake/heal context
- **self-heal** — heal PR criteria for metric 2
- **jira-ticket-analyzer** — generation-gate / AC mapping
