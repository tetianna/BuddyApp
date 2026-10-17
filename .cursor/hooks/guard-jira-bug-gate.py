#!/usr/bin/env python3
"""beforeMCPExecution: createJiraIssue with issueType Bug requires act+bug or approval."""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from guard_evidence_lib import (  # noqa: E402
    approval_allows,
    deny,
    denial_message,
    allow,
    run_scorer,
)

GATE = "guard-jira-bug-gate"
CREATE_ISSUE_TOOL = "createJiraIssue"
JIRA_BUG_ISSUE_TYPE = "Bug"


def parse_payload(raw: str) -> dict | None:
    if not raw.strip():
        return None
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return None
    return payload if isinstance(payload, dict) else None


def parse_tool_input(raw: object) -> dict:
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        return json.loads(raw)
    raise ValueError("tool_input must be object or JSON string")


def main() -> None:
    payload = parse_payload(sys.stdin.read())
    if payload is None:
        allow()

    tool_name = payload.get("tool_name")
    if tool_name != CREATE_ISSUE_TOOL:
        allow()

    try:
        tool_input = parse_tool_input(payload.get("tool_input"))
    except (json.JSONDecodeError, ValueError) as exc:
        deny(denial_message(GATE, "invalid-mcp-input", None, str(exc)))
        return

    issue_type = tool_input.get("issueType")
    if issue_type != JIRA_BUG_ISSUE_TYPE:
        allow()

    try:
        scored = run_scorer()
    except (FileNotFoundError, RuntimeError, json.JSONDecodeError) as exc:
        deny(denial_message(GATE, "scorer-required", None, str(exc)))
        return

    decision_id = scored.get("decisionId", "")
    if scored.get("decision") == "act" and scored.get("side") == "bug":
        allow()
        return

    if decision_id and approval_allows(decision_id, "jira-bug-draft"):
        allow()
        return

    deny(
        denial_message(
            GATE,
            "jira-bug-act-or-approval",
            scored,
            f"Need decision act+side bug for issueType {JIRA_BUG_ISSUE_TYPE}, "
            'or approval with allows: ["jira-bug-draft"].',
        )
    )


if __name__ == "__main__":
    main()
