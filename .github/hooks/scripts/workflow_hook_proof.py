#!/usr/bin/env python3
"""Proof-of-concept scenarios for workflow hook enforcement."""

from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
HOOK_SCRIPT = ROOT / ".github" / "hooks" / "scripts" / "workflow_hook.py"
STATE_TEMPLATE = ROOT / ".github" / "workflow-state.json"


def run_hook(mode: str, cwd: Path, payload: dict) -> dict:
    result = subprocess.run(
        ["python3", str(HOOK_SCRIPT), mode],
        input=json.dumps(payload),
        text=True,
        capture_output=True,
        cwd=str(cwd),
        check=True,
    )
    return json.loads(result.stdout)


def write_state(repo: Path, state: dict) -> None:
    state_path = repo / ".github" / "workflow-state.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    with state_path.open("w", encoding="utf-8") as handle:
        json.dump(state, handle, indent=2)
        handle.write("\n")


def load_template_state() -> dict:
    return json.loads(STATE_TEMPLATE.read_text(encoding="utf-8"))


def expect(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def scenario_requires_discovery(repo: Path) -> None:
    state = load_template_state()
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "tool_name": "editFiles",
        "tool_use_id": "discovery-guard",
        "tool_input": {"files": ["src/feature.py"]},
    }
    result = run_hook("workflow-guard", repo, payload)
    decision = result["hookSpecificOutput"]["permissionDecision"]
    expect(decision == "ask", "expected discovery guard to ask before implementation edits")


def scenario_session_context(repo: Path) -> None:
    state = load_template_state()
    state["phase"] = "planning"
    state["requirements"]["status"] = "approved"
    state["plan"]["status"] = "approved"
    state["qualityGates"]["typecheck"] = "passed"
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "source": "new",
    }
    result = run_hook("session-context", repo, payload)
    context = result["hookSpecificOutput"]["additionalContext"]
    expect("phase=planning" in context, "expected session context to include the current phase")
    expect("requirements=approved" in context, "expected session context to include requirements status")
    expect("typecheck=passed" in context, "expected session context to summarize gate state")


def scenario_requires_plan(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "clarified"
    state["phase"] = "planning"
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "tool_name": "editFiles",
        "tool_use_id": "plan-guard",
        "tool_input": {"files": ["src/feature.py"]},
    }
    result = run_hook("workflow-guard", repo, payload)
    decision = result["hookSpecificOutput"]["permissionDecision"]
    expect(decision == "ask", "expected planning guard to ask before implementation without approval")


def scenario_retry_budget_blocks_edits(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "implementation"
    state["plan"]["status"] = "approved"
    state["implementation"]["retryCount"] = 3
    state["implementation"]["status"] = "blocked"
    state["implementation"]["blockedItems"] = ["login flow still failing"]
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "tool_name": "editFiles",
        "tool_use_id": "retry-budget",
        "tool_input": {"files": ["src/feature.py"]},
    }
    result = run_hook("workflow-guard", repo, payload)
    decision = result["hookSpecificOutput"]["permissionDecision"]
    expect(decision == "deny", "expected retry budget to deny further implementation edits")


def scenario_invalid_state_edit_is_restored(repo: Path) -> None:
    state = load_template_state()
    write_state(repo, state)
    pre_payload = {
        "cwd": str(repo),
        "tool_name": "editFiles",
        "tool_use_id": "state-edit",
        "tool_input": {"files": [".github/workflow-state.json"]},
    }
    pre_result = run_hook("workflow-guard", repo, pre_payload)
    decision = pre_result["hookSpecificOutput"]["permissionDecision"]
    expect(decision == "allow", "expected direct state-file edit to be allowed for validation")

    broken_state = load_template_state()
    broken_state["phase"] = "delivery"
    broken_state["requirements"]["status"] = "needs-clarification"
    write_state(repo, broken_state)

    post_payload = {
        "cwd": str(repo),
        "tool_name": "editFiles",
        "tool_use_id": "state-edit",
        "tool_input": {"files": [".github/workflow-state.json"]},
    }
    post_result = run_hook("post-edit-checks", repo, post_payload)
    expect(post_result["decision"] == "block", "expected invalid state transition to be blocked")
    restored = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(restored["phase"] == "discovery", "expected invalid state edit to be restored to previous baseline")


def scenario_delivery_action_denied(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "verification"
    state["plan"]["status"] = "approved"
    state["implementation"]["status"] = "completed"
    state["implementation"]["filesTouched"] = ["src/feature.py"]
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "tool_name": "runTerminalCommand",
        "tool_use_id": "delivery-deny",
        "tool_input": {"command": "git commit -m 'ship it'"},
    }
    result = run_hook("workflow-guard", repo, payload)
    decision = result["hookSpecificOutput"]["permissionDecision"]
    expect(decision == "deny", "expected delivery action to be denied until gates are green")


def scenario_stop_gate_blocks_incomplete_work(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "implementation"
    state["plan"]["status"] = "approved"
    state["implementation"]["status"] = "in-progress"
    state["implementation"]["filesTouched"] = ["src/feature.py"]
    write_state(repo, state)
    payload = {
        "cwd": str(repo),
        "stop_hook_active": False,
    }
    result = run_hook("stop-gate", repo, payload)
    expect(result["decision"] == "block", "expected stop gate to block unfinished work")


def scenario_update_state_api(repo: Path) -> None:
    state = load_template_state()
    write_state(repo, state)
    patch = {
        "requirements": {"status": "approved"},
        "phase": "planning",
    }
    result = run_hook("update-state", repo, patch)
    expect(result["saved"] is True, "expected update-state API to persist a valid transition")
    updated = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(updated["phase"] == "planning", "expected update-state API to write the new phase")
    expect(updated["version"] == "1.0", "expected state version to be preserved")


def scenario_planning_rolls_back_to_discovery(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "planning"
    state["plan"]["status"] = "proposed"
    write_state(repo, state)

    rollback_patch = {
        "phase": "discovery",
        "requirements": {
            "status": "needs-clarification",
            "openQuestions": ["Clarify the required error-handling behavior"],
        },
        "plan": {
            "status": "not-started",
            "summary": "",
            "filesInScope": [],
        },
    }
    result = run_hook("update-state", repo, rollback_patch)
    expect(result["saved"] is True, "expected planning rollback to discovery to succeed")

    rolled_back = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(rolled_back["phase"] == "discovery", "expected rollback to land in discovery")
    expect(
        rolled_back["requirements"]["status"] == "needs-clarification",
        "expected rollback to mark requirements as needing clarification",
    )


def scenario_quality_gate_failure_rolls_back_to_implementation(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "quality-gates"
    state["plan"]["status"] = "approved"
    state["implementation"]["status"] = "completed"
    state["implementation"]["filesTouched"] = ["src/feature.py"]
    state["qualityGates"]["typecheck"] = "passed"
    state["qualityGates"]["lint"] = "passed"
    state["qualityGates"]["tests"] = "failed"
    state["qualityGates"]["verification"] = "pending"
    state["qualityGates"]["lastRunSummary"] = "Regression found in tests"
    write_state(repo, state)

    rollback_patch = {
        "phase": "implementation",
        "implementation": {
            "status": "in-progress",
            "filesTouched": ["src/feature.py"],
            "retryCount": 1,
            "blockedItems": [],
        },
    }
    result = run_hook("update-state", repo, rollback_patch)
    expect(result["saved"] is True, "expected quality-gate rollback to implementation to succeed")

    rolled_back = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(rolled_back["phase"] == "implementation", "expected rollback to land in implementation")
    expect(rolled_back["implementation"]["retryCount"] == 1, "expected rollback to increment retry evidence")
    expect(rolled_back["qualityGates"]["tests"] == "failed", "expected failed gate evidence to remain visible")


def scenario_verification_bug_rolls_back_to_implementation(repo: Path) -> None:
    state = load_template_state()
    state["requirements"]["status"] = "approved"
    state["phase"] = "verification"
    state["plan"]["status"] = "approved"
    state["implementation"]["status"] = "completed"
    state["implementation"]["filesTouched"] = ["src/feature.py"]
    state["qualityGates"]["typecheck"] = "passed"
    state["qualityGates"]["lint"] = "passed"
    state["qualityGates"]["tests"] = "passed"
    state["qualityGates"]["verification"] = "failed"
    state["qualityGates"]["lastRunSummary"] = "Runtime verification found a bug"
    write_state(repo, state)

    rollback_patch = {
        "phase": "implementation",
        "implementation": {
            "status": "in-progress",
            "filesTouched": ["src/feature.py"],
            "retryCount": 1,
            "blockedItems": [],
        },
        "delivery": {
            "status": "blocked",
            "userApproved": False,
            "notes": "Verification found a runtime bug; returning to implementation.",
        },
    }
    result = run_hook("update-state", repo, rollback_patch)
    expect(result["saved"] is True, "expected verification rollback to implementation to succeed")

    rolled_back = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(rolled_back["phase"] == "implementation", "expected verification rollback to land in implementation")
    expect(rolled_back["qualityGates"]["verification"] == "failed", "expected verification failure evidence to remain visible")
    expect(rolled_back["delivery"]["status"] == "blocked", "expected delivery to remain blocked after rollback")


def scenario_end_to_end_workflow(repo: Path) -> None:
    write_state(repo, load_template_state())

    discovery_patch = {
        "requirements": {
            "status": "approved",
            "acceptanceCriteria": ["user can complete the target workflow"],
            "constraints": ["stay inside approved scope"],
            "openQuestions": [],
        }
    }
    planning_result = run_hook("update-state", repo, discovery_patch)
    expect(planning_result["saved"] is True, "expected discovery state update to succeed")

    planning_patch = {
        "phase": "planning",
        "plan": {
            "status": "approved",
            "summary": "Implement the planned workflow end to end",
            "filesInScope": ["src/feature.py", "tests/test_feature.py"],
        },
    }
    planning_result = run_hook("update-state", repo, planning_patch)
    expect(planning_result["saved"] is True, "expected planning transition to succeed")

    implementation_patch = {
        "phase": "implementation",
        "implementation": {
            "status": "completed",
            "filesTouched": ["src/feature.py", "tests/test_feature.py"],
            "retryCount": 0,
            "blockedItems": [],
        },
    }
    implementation_result = run_hook("update-state", repo, implementation_patch)
    expect(implementation_result["saved"] is True, "expected implementation transition to succeed")

    quality_patch = {
        "phase": "quality-gates",
        "qualityGates": {
            "typecheck": "passed",
            "lint": "passed",
            "tests": "passed",
            "verification": "pending",
            "lastRunSummary": "All automated gates passed",
        },
    }
    quality_result = run_hook("update-state", repo, quality_patch)
    expect(quality_result["saved"] is True, "expected quality-gates transition to succeed")

    verification_patch = {
        "phase": "verification",
        "qualityGates": {
            "typecheck": "passed",
            "lint": "passed",
            "tests": "passed",
            "verification": "passed",
            "lastRunSummary": "Automated gates and verification passed",
        },
    }
    verification_result = run_hook("update-state", repo, verification_patch)
    expect(verification_result["saved"] is True, "expected verification transition to succeed")

    delivery_patch = {
        "phase": "delivery",
        "delivery": {
            "status": "ready-for-review",
            "userApproved": False,
            "notes": "Ready for user review",
        },
    }
    delivery_result = run_hook("update-state", repo, delivery_patch)
    expect(delivery_result["saved"] is True, "expected delivery transition to succeed after all gates passed")

    final_state = json.loads((repo / ".github" / "workflow-state.json").read_text(encoding="utf-8"))
    expect(final_state["phase"] == "delivery", "expected end-to-end proof to end in delivery phase")
    expect(final_state["delivery"]["status"] == "ready-for-review", "expected delivery to be review-ready")
    expect(final_state["qualityGates"]["verification"] == "passed", "expected verification to remain passed at delivery")


def main() -> int:
    temp_root = Path(tempfile.mkdtemp(prefix="workflow-hook-proof-"))
    repo = temp_root / "repo"
    try:
        repo.mkdir(parents=True, exist_ok=True)
        shutil.copytree(ROOT / ".github" / "hooks", repo / ".github" / "hooks")
        write_state(repo, load_template_state())

        scenario_session_context(repo)
        scenario_requires_discovery(repo)
        scenario_requires_plan(repo)
        scenario_retry_budget_blocks_edits(repo)
        scenario_invalid_state_edit_is_restored(repo)
        scenario_delivery_action_denied(repo)
        scenario_stop_gate_blocks_incomplete_work(repo)
        scenario_update_state_api(repo)
        scenario_planning_rolls_back_to_discovery(repo)
        scenario_quality_gate_failure_rolls_back_to_implementation(repo)
        scenario_verification_bug_rolls_back_to_implementation(repo)
        scenario_end_to_end_workflow(repo)

        print("WORKFLOW_HOOK_PROOF_OK")
        return 0
    finally:
        shutil.rmtree(temp_root, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
