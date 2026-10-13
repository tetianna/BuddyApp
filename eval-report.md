# Eval report

**Generated:** 2026-10-13  
**Window:** last 9 Playwright workflow runs available (`playwright.yml`; ids: 38478151651, 38478079741, 38477942113, 38477907764, 38467801998, 38467516043, 38465856468, 38464448347, 38463771421)  
**Triggers:** generation PR (AQPBT-15) | stale report (file was missing on `main`)

## Summary

| Metric | Value | How measured | Interpretation |
|--------|-------|--------------|----------------|
| Flake rate | 0 / 139 | `gh run download` of `playwright-report-regression` for the 6 successful runs (38478151651, 38477907764, 38467801998, 38467516043, 38465856468, 38464448347); `stats.flaky` ÷ `stats.total` from the HTML report data (22 + 29 + 22 + 22 + 22 + 22 tests). 2026-10-13 only. | No test needed a retry to pass. The window is one day, so this is early evidence only. |
| Heal success | insufficient data (0 heal PRs) | `gh pr list --state all --limit 50`: no `heal/*` branch and no PR body claiming self-heal. | No heal chain has run yet. |
| Generation-gate pass | 1 / 1 (AQPBT-15 PR pending CI, not counted) | PR [#1](https://github.com/tetianna/BuddyApp/pull/1) (AQPBT-12): its branch run 38477907764 succeeded (29 tests); one tag per `test()` (`@regression`); locators in `pages/`; PR body maps AC1–AC4 and AC6 to tests, AC5 documented as blocked. | The ticket → Gherkin → spec gate works on the one finished sample. |
| Ask vs guess | ask 0 / guess 0 (K = 2 sessions) | This AQPBT-15 session plus PR #1 body. AQPBT-15: every UI string came from Jira, Confluence page 323223554, or a live-app check; no stop for missing input was needed. PR #1: AC5 was marked "not automated (blocked)" instead of guessed. | No invented values found; the sample is small. |

**Masked regressions (heal):** 0

## Data sources

- GitHub runs: `gh run list --workflow=playwright.yml --limit 30` returned 9 runs. 6 succeeded, 2 are `action_required` (PR #1 branch, waiting for approval), 1 failed (38463771421 on `main`: the "Run Playwright" step exited 1 and the report had 0 tests, so the cause is setup, not a flaky test).
- The combined `gh run view --log` output is cut off before the Playwright step, and the CI reporter does not print pass/retry counts, so counts come from the HTML report artifacts.
- PRs reviewed: [#1](https://github.com/tetianna/BuddyApp/pull/1).
- Transcripts: current orchestrator session for AQPBT-15.

## Top reliability risk

The CI log does not show test counts or retries, and one `main` run failed before any test result was saved, so failures can be hard to diagnose from logs alone.

## Next action

Add the `list` (or `github`) reporter to the CI reporter list in `playwright.config.ts` so each run prints passed, flaky, and failed counts in the log.
