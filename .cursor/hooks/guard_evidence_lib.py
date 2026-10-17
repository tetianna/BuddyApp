#!/usr/bin/env python3
"""Shared helpers: run scripts/score-evidence.ts and read human approval files."""

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
EVIDENCE_CURRENT = REPO_ROOT / ".test-artifacts" / "evidence" / "current.json"
APPROVALS_DIR = REPO_ROOT / ".test-artifacts" / "approvals"
SCORER_SCRIPT = REPO_ROOT / "scripts" / "score-evidence.ts"


def scorer_command() -> list[str]:
    npx = shutil.which("npx") or shutil.which("npx.cmd")
    if not npx:
        raise FileNotFoundError("npx not found on PATH")
    return [
        npx,
        "tsx",
        str(SCORER_SCRIPT),
        "--verify-only",
        str(EVIDENCE_CURRENT),
    ]


def emit(payload: dict, code: int = 0) -> None:
    print(json.dumps(payload))
    sys.exit(code)


def allow() -> None:
    emit({"permission": "allow"})


def deny(message: str) -> None:
    print(message, file=sys.stderr)
    emit({"permission": "deny", "user_message": message, "agent_message": message}, 2)


def git_branch() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        cwd=REPO_ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0:
        return ""
    return result.stdout.strip()


def run_scorer() -> dict:
    if not EVIDENCE_CURRENT.is_file():
        raise FileNotFoundError(f"Missing evidence file: {EVIDENCE_CURRENT}")

    cmd = scorer_command()
    run_kwargs: dict = {
        "cwd": REPO_ROOT,
        "capture_output": True,
        "text": True,
        "check": False,
    }
    if os.name == "nt":
        run_kwargs["shell"] = True
        run_kwargs["args"] = subprocess.list2cmdline(cmd)
    else:
        run_kwargs["args"] = cmd
    result = subprocess.run(**run_kwargs)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or "score-evidence.ts failed")

    scored = json.loads(result.stdout)
    if not isinstance(scored, dict):
        raise RuntimeError("score-evidence.ts did not return a JSON object")
    return scored


def approval_allows(decision_id: str, action: str) -> bool:
    path = APPROVALS_DIR / f"{decision_id}.json"
    if not path.is_file():
        return False
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    allows = data.get("allows")
    return isinstance(allows, list) and action in allows


def denial_message(
    gate: str,
    rule: str,
    scored: dict | None,
    extra: str,
) -> str:
    decision = scored.get("decision") if scored else "missing"
    side = scored.get("side") if scored else "missing"
    summary = scored.get("summary") if scored else "no scorer output"
    decision_id = scored.get("decisionId") if scored else "n/a"
    return (
        f"[{gate}] Blocked — rule `{rule}`. "
        f"decision={decision}, side={side}, decisionId={decision_id}. "
        f"Scorer: {summary}. {extra}"
    )
