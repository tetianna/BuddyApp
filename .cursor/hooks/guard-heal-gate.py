#!/usr/bin/env python3
"""preToolUse: heal/* branch writes under pages/ require scorer act+drift or human approval."""

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

GATE = "guard-heal-gate"


def normalize_path(file_path: str) -> str:
    return file_path.replace("\\", "/")


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

    tool_name = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except json.JSONDecodeError:
            allow()
    if tool_name not in {"Write", "StrReplace"} or not isinstance(tool_input, dict):
        allow()

    file_path = tool_input.get("path") or tool_input.get("file_path")
    if not isinstance(file_path, str):
        allow()

    path = normalize_path(file_path)
    if not path.startswith("pages/"):
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

    if decision_id and approval_allows(decision_id, "self-heal"):
        allow()
        return

    deny(
        denial_message(
            GATE,
            "heal-pages-act-drift-or-approval",
            scored,
            "Need decision act+side drift from score-evidence.ts, or human file "
            f".test-artifacts/approvals/{decision_id}.json with allows: [\"self-heal\"].",
        )
    )


if __name__ == "__main__":
    main()
