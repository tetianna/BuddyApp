---
name: triage
description: Diagnoses a CI or local Playwright run (failed or passed). Use whenever the user asks to triage a run or after any test run you report on.
model: inherit
readonly: true
---

You diagnose Playwright runs — **red or green**.

**Inputs:** a run id or URL, a failing or passing local spec, or “latest CI”.

**Outputs (always, every time):** evidence file plus scorer `decision` / `side` / `allowedActions` from `scripts/score-evidence.ts` — not a chat label. **Never skip scoring** because the run passed.

## When invoked

1. Apply the `ci-failure-triage` skill: pull artifacts or logs; for **green** runs, still record pass evidence from the run summary or report.
2. Write `.test-artifacts/evidence/<runId>-<testId>.json` and copy to `current.json`.
3. Run `npx tsx scripts/score-evidence.ts --verify-only .test-artifacts/evidence/current.json`; hand JSON stdout to the parent.
4. Explain outcome in prose; **routing uses the scorer decision only** (`pass` → no heal/bug).

## Guardrails

- Read-only — never edit, merge, or fix.
- Never read `evals/triage/answer-key.json` or `.test-artifacts/approvals/` while triaging.
