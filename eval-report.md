# Eval report

**Generated:** 2026-10-13  
**Window:** last N = 5 Playwright workflow runs available (ids: 38467801998, 38467516043, 38465856468, 38464448347, 38463771421) — fewer than the default 30 exist  
**Triggers:** generation PR ([#1](https://github.com/tetianna/BuddyApp/pull/1), AQPBT-12) | stale report (`eval-report.md` was missing)  

## Summary

| Metric | Value | How measured | Interpretation |
|--------|-------|--------------|----------------|
| Flake rate | 0 / 88 | `gh run download` of the `playwright-report-*` artifact for each run; parsed `report.json` stats inside the HTML report. Runs 38467801998, 38467516043, 38465856468, 38464448347: 22 tests each, 22 expected, 0 flaky, 0 unexpected. Run 38463771421 (push, `@sanity` slice) failed with 0 tests executed (no `@sanity` tests matched) — excluded as not a passing run. CI logs contain no per-test lines because CI uses only the cleanup + HTML reporters. | No retry-only passes in the window; the sample is small (4 passing runs, same 22 tests). |
| Heal success | insufficient data | `gh pr list --state all --limit 50`: only PR #1 exists; no `heal/*` branch or self-heal PR. | No heal has happened yet, so the heal gate is untested. |
| Generation-gate pass | insufficient data (0 evaluated / 1 open) | PR #1 (AQPBT-12): conforming (one `@regression` tag per `test()`, locators in `pages/`, no data created so no cleanup fixture needed) and mapped to AC (PR body table: AC1–AC4, AC6; AC5 blocked). `gh pr checks 1` reported no checks yet at report time. Local run `npx playwright test tests/aqpbt-12-playdates-calendar-export.spec.ts --retries=0`: 7 passed. | Gate result depends on PR #1 CI (`playwright.yml` runs the full suite on push / pull_request). |
| Ask vs guess | 1 ask / 0 guess (K = 2 sessions) | Manual review of this run's orchestrator and test-writer transcripts and the PR #1 body. Ask: AC5 needs an unset-family account ("Anna Procopov") with no credentials in `.env.example` — left blocked and escalated in PR #1 instead of inventing an env var. Live-only copy (circle gate) was labelled as observed, not from Jira. | Agents flagged unknowns instead of guessing; the sample is small. |

**Masked regressions (heal):** 0 (no heal PRs)

## Data sources

- GitHub runs: `gh run list --workflow=playwright.yml --limit 30` (5 runs, 2026-10-13); HTML report artifacts for all 5.
- PRs reviewed: [#1](https://github.com/tetianna/BuddyApp/pull/1).
- Transcripts: 2 sessions from this backlog run (orchestrator, test-writer).

## Top reliability risk

New read-only specs (AQPBT-12) depend on shared main-family data (Upcoming 0, a specific cancelled Past row), so another student's playdate run can turn them red without any app change.

## Next action

Provide a dedicated test account (or API seed) for playdate states, including an unset family for AQPBT-12 AC5, so these specs stop depending on other runs' leftover data.
