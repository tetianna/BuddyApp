# Agent evals

You keep `evals/<agent>/answer-key.json` with cases `{ id, input, expected }` (`expected` is `drift`, `bug`, or `ambiguous`).
The agent under test never reads the answer key; it only sees each case `input`.
Each scoring pass writes `evals/<agent>/runs/<date>-<n>.json` with `predictions`: `{ id, predicted, evidence }`.
Run `npx tsx evals/score.ts <agent>` to print accuracy, per-class precision/recall, false positives, and cross-run agreement.
Use the **score-agent** skill to run N passes (default 3), score, and append an **Agent accuracy** section to `eval-report.md`.
