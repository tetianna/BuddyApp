---
name: score-agent
description: Scores an agent against an answer key and appends the result to eval-report.md. Use when the user asks how accurate an agent is, wants to score triage, self-heal, or test generation, or after cases are added to an evals/*/answer-key.json.
---

# Score agent (eval harness)

Put a number on classification agents (triage first: `drift` | `bug` | `ambiguous`).

## Layout

| Path | Owner | Contents |
|------|--------|----------|
| `evals/<agent>/answer-key.json` | **Human only** | `[{ "id", "input", "expected" }]` — never edit during agent runs |
| `evals/<agent>/runs/<date>-<n>.json` | Agent / scorer | `{ "model", "startedAt", "finishedAt", "predictions": [{ "id", "predicted", "evidence" }] }` |
| `evals/score.ts` | Repo | CLI metrics |

See `evals/README.md`.

## Workflow

1. Confirm cases exist in `evals/<agent>/answer-key.json` (human-maintained). **Do not read or cite the key while simulating the agent under test.**
2. For each case, run the agent on `input` only; record `predicted` and short `evidence` (same rules as **ci-failure-triage** / **self-heal** / generation gate).
3. Write **one** run file per pass: `evals/<agent>/runs/YYYY-MM-DD-<n>.json` (`n` = 1, 2, 3…).
4. Repeat for **N** passes (default **3**, different run files).
5. Score:

```bash
npx tsx evals/score.ts <agent>
```

6. Append to **`eval-report.md`** (do not replace the whole file):

```markdown
## Agent accuracy — <agent> (YYYY-MM-DD)

**Runs:** evals/<agent>/runs/… (list files)  
**How measured:** `npx tsx evals/score.ts <agent>` on pooled predictions; cross-run agreement = cases where every run predicted the same class.

| Metric | Value |
|--------|-------|
| Overall accuracy | … |
| Cross-run agreement | … |
| drift precision / recall | … / … |
| bug precision / recall | … / … |
| ambiguous precision / recall | … / … |
| False positives (drift / bug / ambiguous) | … / … / … |

**Notes:** …
```

## Rules

| Rule | Detail |
|------|--------|
| Answer key | **Never** load `answer-key.json` into the prompt for the agent under test. |
| Answer key edits | **Human only** — do not add or change cases unless the user asks. |
| Invalid ids | `score.ts` exits non-zero if a run references an id not in the key. |
| Types | No `any` in harness or run files. |

## Related

- **ci-failure-triage** — label definitions for triage evals
- **eval-report** — suite metrics + session confidence; agent accuracy is an extra section
