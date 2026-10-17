#!/usr/bin/env python3
"""beforeShellExecution: gh pr create from heal/* requires scorer act+drift or approval."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from guard_evidence_lib import (  # noqa: E402
    approval_allows,
    deny,
    denial_message,
    git_branch,
    allow,
    run_scorer,
)

GATE = "guard-pr-gate"


def parse_payload(raw: str) -> dict | None:
    if not raw.strip():
        return None
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def main() -> None:
    payload = parse_payload(sys.stdin.read())
    if payload is None:
        allow()
    command = payload.get("command")
    if not isinstance(command, str) or "gh pr create" not in command:
        allow()

    branch = git_branch()
    if not branch.startswith("heal/"):
        allow()

    try:
        scored = run_scorer()
    except (FileNotFoundError, RuntimeError, json.JSONDecodeError) as exc:
        deny(denial_message(GATE, "scorer-required", None, str(exc)))
        return

    decision_id = scored.get("decisionId", "")
    if scored.get("decision") == "act" and scored.get("side") == "drift":
        allow()
        return

    if decision_id and approval_allows(decision_id, "heal-pr"):
        allow()
        return

    deny(
        denial_message(
            GATE,
            "heal-pr-act-drift-or-approval",
            scored,
            "Need decision act+side drift, or approval with allows: [\"heal-pr\"].",
        )
    )


if __name__ == "__main__":
    main()
