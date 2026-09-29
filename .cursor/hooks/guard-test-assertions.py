#!/usr/bin/env python3
"""Block agent edits that reduce active expect( calls in test files."""

import json
import sys
from pathlib import Path

TEST_SUFFIXES = (".spec.ts", ".spec.tsx", ".spec.js", ".spec.jsx", ".test.ts", ".test.tsx", ".test.js", ".test.jsx")


def fail(reason: str, code: int = 1) -> None:
    print(reason, file=sys.stderr)
    sys.exit(code)


def emit(payload: dict, code: int = 0) -> None:
    print(json.dumps(payload))
    sys.exit(code)


def count_active_expects(text: str) -> int:
    total = 0
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        code = line.split("//", 1)[0]
        total += code.count("expect(")
    return total


def is_test_file(file_path: str) -> bool:
    normalized = file_path.replace("\\", "/")
    if "/tests/" not in f"/{normalized}" and not normalized.startswith("tests/"):
        return False
    return normalized.endswith(TEST_SUFFIXES)


def blocked_message(file_path: str, before_count: int, after_count: int) -> str:
    return (
        f"Blocked: test assertions weakened in {file_path} — "
        f"active expect( count {before_count} -> {after_count}. "
        "Do not delete or comment out assertions to make tests pass. "
        "Fix the app, locator, or test data instead."
    )


def deny(message: str) -> None:
    print(message, file=sys.stderr)
    emit({"permission": "deny", "user_message": message, "agent_message": message}, 2)


def allow() -> None:
    emit({"permission": "allow"})


def read_text(file_path: str) -> str:
    path = Path(file_path)
    if not path.is_file():
        return ""
    return path.read_text(encoding="utf-8")


def input_path(tool_input: dict) -> str | None:
    path = tool_input.get("path") or tool_input.get("file_path")
    return path if isinstance(path, str) else None


def proposed_contents(tool_name: str, tool_input: dict, current: str) -> str | None:
    if tool_name == "Write":
        contents = tool_input.get("contents")
        if contents is None:
            contents = tool_input.get("content")
        return contents if isinstance(contents, str) else None

    old = tool_input.get("old_string")
    new = tool_input.get("new_string")
    if not isinstance(old, str) or not isinstance(new, str):
        return None
    if tool_input.get("replace_all") is True:
        return current.replace(old, new)
    return current.replace(old, new, 1)


def guard_pre_tool(payload: dict) -> None:
    tool_name = payload.get("tool_name")
    tool_input = payload.get("tool_input")
    if isinstance(tool_input, str):
        try:
            tool_input = json.loads(tool_input)
        except json.JSONDecodeError as exc:
            fail(f"guard-test-assertions: invalid tool_input JSON: {exc}")
    if not isinstance(tool_name, str) or not isinstance(tool_input, dict):
        fail("guard-test-assertions: invalid JSON: tool_name and tool_input are required")

    if tool_name not in {"Write", "StrReplace"}:
        allow()

    file_path = input_path(tool_input)
    if file_path is None or not is_test_file(file_path):
        allow()

    current = read_text(file_path)
    proposed = proposed_contents(tool_name, tool_input, current)
    if proposed is None:
        fail(f"guard-test-assertions: {tool_name} input for {file_path} has no new contents")

    before_count = count_active_expects(current)
    after_count = count_active_expects(proposed)
    if after_count < before_count:
        deny(blocked_message(file_path, before_count, after_count))

    print(
        f"guard-test-assertions: OK — {after_count} active expect( preserved",
        file=sys.stderr,
    )
    allow()


def main() -> None:
    raw = sys.stdin.buffer.read().decode("utf-8-sig")
    if not raw.strip():
        fail("guard-test-assertions: empty JSON on stdin")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        fail(f"guard-test-assertions: invalid JSON: {exc}")

    if not isinstance(payload, dict):
        fail("guard-test-assertions: invalid JSON: expected an object")

    if "tool_input" in payload or "tool_name" in payload:
        guard_pre_tool(payload)

    fail("guard-test-assertions: invalid JSON: expected a preToolUse payload")


if __name__ == "__main__":
    main()
