# Eval report

**Generated:** 2026-10-17  
**Window:** 16 Playwright workflow runs (target N = 30; ids: 38967646198, 38967617618, 38485778925, 38480143625, 38479517480, 38479492870, 38478968967, 38478151651, 38478079741, 38477942113, 38477907764, 38467801998, 38467516043, 38465856468, 38464448347, 38463771421)  
**Triggers:** orchestrator close (AQPBT-8) | generation PR | manual refresh

## Session log

Most recent orchestrator sessions first (keep last **5** rows).

| Date | Jira | Confidence | Unknowns | Outcome | PR / notes |
|------|------|------------|----------|---------|------------|
| 2026-10-16 | AQPBT-8 | **8/10** | No dedicated Confluence feature page (Feature map only); AC1 has no required success toast; shared main-family weekly slots need UI restore | spec green locally (3 tests) + generation PR open; `tests-generated` on Jira | [#4](https://github.com/tetianna/BuddyApp/pull/4), `features/AQPBT-8.feature.md` |

**Latest session confidence:** **8/10** — Jira acceptance criteria, Confluence Feature map, and live `/availability` UI aligned on Weekend afternoons (Sat/Sun 13:00–17:00) and empty one-off exception guardrail; score not higher because the story has no dedicated Confluence page and the orchestrator did not emit a formal Proposal block in chat.

## Summary

| Metric | Value | How measured | Interpretation |
|--------|-------|--------------|----------------|
| Flake rate | **insufficient data** | `gh run list --workflow=playwright.yml --limit 30` → 16 runs (2026-10-13–16). No retry/flaky line audit in this refresh. | Window still below N = 30; do not report a flake percentage yet. |
| Heal success | **insufficient data** (0 heal PRs) | `gh pr list --state all --limit 20`: no `heal/*` branch or self-heal PR body. | No heal chain completed yet. |
| Generation-gate pass | **1 / 2 merged** (50%; partial) | Ticket-first PRs [#2](https://github.com/tetianna/BuddyApp/pull/2) AQPBT-15 merged CI green; [#4](https://github.com/tetianna/BuddyApp/pull/4) AQPBT-8 open, Playwright check success on run 38967646198. [#1](https://github.com/tetianna/BuddyApp/pull/1) AQPBT-12 open with `action_required` runs — excluded from pass numerator until green. | Early backlog; treat 50% as indicative only until more merges and AC/conformance review per skill. |
| Ask vs guess | **insufficient data** (K not sampled) | No structured transcript pass this refresh. | Re-sample last K sessions on next orchestrator close. |
| Session confidence (latest) | **8/10** | Retroactive orchestrator assessment for AQPBT-8 (see Session log + rationale above). | Unknowns are documentation gaps, not invented UI strings. |

**Masked regressions (heal):** 0 (no heal PRs to review)

## Data sources

- GitHub runs: `gh run list --workflow=playwright.yml --limit 30` — 16 runs, includes AQPBT-8 PR success 38967646198.
- PRs reviewed: [#1](https://github.com/tetianna/BuddyApp/pull/1), [#2](https://github.com/tetianna/BuddyApp/pull/2), [#3](https://github.com/tetianna/BuddyApp/pull/3) (chore), [#4](https://github.com/tetianna/BuddyApp/pull/4).
- Transcripts: not sampled for ask-vs-guess in this refresh.

## Top reliability risk

Generation work is ahead of Confluence depth for some stories (e.g. AQPBT-8), so confidence stays at 8/10 until feature pages exist or live-app evidence is logged in the feature file.

## Next action

Merge or review PR #4 after human check; on the next orchestrator run, emit an explicit **Proposal** block so confidence in the report matches the constitution gate without retroactive notes.
