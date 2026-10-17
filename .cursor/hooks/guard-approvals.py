#!/usr/bin/env python3
"""preToolUse: agents may not write human approval files."""

import json
import sys

GATE = "guard-approvals"


def emit(payload: dict, code: int = 0) -> None:
    print(json.dumps(payload))
    sys.exit(code)


def deny(message: str) -> None:
    print(message, file=sys.stderr)
    emit({"permission": "deny", "user_message": message, "agent_message": message}, 2)


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
        emit({"permission": "allow"})

    tool_name = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except json.JSONDecodeError:
            emit({"permission": "allow"})
    if tool_name not in {"Write", "StrReplace"} or not isinstance(tool_input, dict):
        emit({"permission": "allow"})

    file_path = tool_input.get("path") or tool_input.get("file_path")
    if not isinstance(file_path, str):
        emit({"permission": "allow"})

    normalized = file_path.replace("\\", "/")
    if normalized.startswith(".test-artifacts/approvals/"):
        deny(
            f"[{GATE}] Blocked — rule human-approvals-only. "
            "Agents cannot write .test-artifacts/approvals/; create approval JSON by hand."
        )

    emit({"permission": "allow"})


if __name__ == "__main__":
    main()
