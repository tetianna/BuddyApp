#!/usr/bin/env python3
"""Block agent edits that introduce constitution WON'T violations in tests/ or pages/."""

import json
import re
import sys
from pathlib import Path

GUARD_FILE = re.compile(r"(^|/)(tests|pages)/.+\.[jt]sx?$")
SPEC_FILE = re.compile(r"(^|/)tests/.+\.(spec|test)\.[jt]sx?$")

XPATH_LOCATOR = re.compile(
    r"""locator\s*\(\s*(['"`])//""",
    re.MULTILINE,
)
ANY_TYPE = re.compile(
    r":\s*any\b|"
    r"\bas\s+any\b|"
    r"<any>|"
    r"Array<any>",
)
HARDCODED_FILL_EMAIL = re.compile(
    r"""\.fill\s*\(\s*['"][^'"]*@[^'"]*['"]""",
)
HARDCODED_SECRET = re.compile(
    r"(?i)(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]{4,}['\"]",
)
DESCRIBE_TAG = re.compile(
    r"test\.describe\s*\([^,]+,\s*\{[^}]*\btag\s*:",
    re.MULTILINE,
)

COUNTED_VIOLATIONS: list[tuple[str, str, re.Pattern[str] | None]] = [
    ("waitForTimeout", ".waitForTimeout( is forbidden", None),
    ("xpath_locator", "XPath locator (locator('//…')) is forbidden", XPATH_LOCATOR),
    ("any_type", "the any type is forbidden", ANY_TYPE),
    ("hardcoded_fill_email", "hardcoded email in .fill() is forbidden", HARDCODED_FILL_EMAIL),
    ("hardcoded_secret", "hardcoded password/secret/api_key/token is forbidden", HARDCODED_SECRET),
    ("describe_tag", "tags on test.describe() are forbidden", DESCRIBE_TAG),
]


def fail(reason: str, code: int = 1) -> None:
    print(reason, file=sys.stderr)
    sys.exit(code)


def emit(payload: dict, code: int = 0) -> None:
    print(json.dumps(payload))
    sys.exit(code)


def allow() -> None:
    emit({"permission": "allow"})


def deny(message: str) -> None:
    print(message, file=sys.stderr)
    emit({"permission": "deny", "user_message": message, "agent_message": message}, 2)


def normalize_path(file_path: str) -> str:
    return file_path.replace("\\", "/")


def is_guarded_file(file_path: str) -> bool:
    return GUARD_FILE.search(normalize_path(file_path)) is not None


def is_spec_file(file_path: str) -> bool:
    return SPEC_FILE.search(normalize_path(file_path)) is not None


def count_active_expects(text: str) -> int:
    total = 0
    for line in text.splitlines():
        stripped = line.lstrip()
        if stripped.startswith("//") or stripped.startswith("*"):
            continue
        code = line.split("//", 1)[0]
        total += code.count("expect(")
    return total


def count_pattern(text: str, key: str, pattern: re.Pattern[str] | None) -> int:
    if key == "waitForTimeout":
        return text.count(".waitForTimeout(")
    if pattern is None:
        return 0
    return len(pattern.findall(text))


def violation_deltas(before: str, after: str) -> list[str]:
    reasons: list[str] = []
    for key, label, pattern in COUNTED_VIOLATIONS:
        before_n = count_pattern(before, key, pattern)
        after_n = count_pattern(after, key, pattern)
        if after_n > before_n:
            reasons.append(f"{label} ({before_n} -> {after_n})")
    return reasons


def expect_drop_reason(before: str, after: str) -> str | None:
    before_count = count_active_expects(before)
    after_count = count_active_expects(after)
    if after_count < before_count:
        return (
            f"active expect( count dropped ({before_count} -> {after_count}); "
            "do not weaken assertions"
        )
    return None


def collect_reasons(file_path: str, before: str, after: str) -> list[str]:
    reasons = violation_deltas(before, after)
    if is_spec_file(file_path):
        drop = expect_drop_reason(before, after)
        if drop:
            reasons.append(drop)
    return reasons


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
            fail(f"guard-constitution: invalid tool_input JSON: {exc}")
    if not isinstance(tool_name, str) or not isinstance(tool_input, dict):
        fail("guard-constitution: invalid JSON: tool_name and tool_input are required")

    if tool_name not in {"Write", "StrReplace"}:
        allow()

    file_path = input_path(tool_input)
    if file_path is None or not is_guarded_file(file_path):
        allow()

    current = read_text(file_path)
    proposed = proposed_contents(tool_name, tool_input, current)
    if proposed is None:
        fail(f"guard-constitution: {tool_name} input for {file_path} has no new contents")

    reasons = collect_reasons(file_path, current, proposed)
    if reasons:
        deny(f"Blocked: constitution violation in {file_path} — " + "; ".join(reasons))

    print(f"guard-constitution: OK — {file_path}", file=sys.stderr)
    allow()


def main() -> None:
    raw = sys.stdin.buffer.read().decode("utf-8-sig")
    if not raw.strip():
        fail("guard-constitution: empty JSON on stdin")

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        fail(f"guard-constitution: invalid JSON: {exc}")

    if not isinstance(payload, dict):
        fail("guard-constitution: invalid JSON: expected an object")

    if "tool_input" in payload or "tool_name" in payload:
        guard_pre_tool(payload)

    fail("guard-constitution: invalid JSON: expected a preToolUse payload")


if __name__ == "__main__":
    main()
