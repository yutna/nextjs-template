#!/usr/bin/env python3
"""State-aware workflow hooks for GitHub Copilot customizations."""

from __future__ import annotations

import copy
import hashlib
import json
import tempfile
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


SCHEMA_VERSION = "1.0"
MAX_RETRY_COUNT = 3
PHASE_ORDER = ["discovery", "planning", "implementation", "quality-gates", "verification", "delivery"]
REQUIREMENTS_STATUSES = {"needs-clarification", "clarified", "approved"}
PLAN_STATUSES = {"not-started", "proposed", "approved", "blocked"}
IMPLEMENTATION_STATUSES = {"not-started", "in-progress", "completed", "blocked"}
GATE_STATUSES = {"pending", "passed", "failed", "not-applicable"}
DELIVERY_STATUSES = {"blocked", "ready-for-review", "approved"}
GREEN_GATE_VALUES = {"passed", "not-applicable"}
STATE_FILE = ".github/workflow-state.json"

DEFAULT_STATE: dict[str, Any] = {
    "version": SCHEMA_VERSION,
    "phase": "discovery",
    "taskId": "",
    "taskSummary": "",
    "requirements": {
        "status": "needs-clarification",
        "acceptanceCriteria": [],
        "constraints": [],
        "openQuestions": [],
    },
    "plan": {"status": "not-started", "summary": "", "filesInScope": []},
    "implementation": {
        "status": "not-started",
        "filesTouched": [],
        "retryCount": 0,
        "blockedItems": [],
    },
    "qualityGates": {
        "typecheck": "pending",
        "lint": "pending",
        "tests": "pending",
        "verification": "pending",
        "lastRunSummary": "",
    },
    "delivery": {"status": "blocked", "userApproved": False, "notes": ""},
    "lastUpdated": "",
}


def deep_copy_default_state() -> dict[str, Any]:
    return copy.deepcopy(DEFAULT_STATE)


def utc_timestamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_event() -> dict[str, Any]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def workflow_state_path(cwd: str) -> Path:
    return Path(cwd) / ".github" / "workflow-state.json"


def runtime_dir(cwd: str) -> Path:
    workspace_hash = hashlib.sha1(str(Path(cwd).resolve()).encode("utf-8")).hexdigest()[:12]
    path = Path(tempfile.gettempdir()) / "copilot-workflow-hooks" / workspace_hash
    path.mkdir(parents=True, exist_ok=True)
    return path


def baseline_path(cwd: str, tool_use_id: str) -> Path:
    return runtime_dir(cwd) / f"{tool_use_id}.baseline.json"


def log_path(cwd: str) -> Path:
    return Path(cwd) / ".github" / "hooks" / "workflow-hook.log"


def log_event(cwd: str, level: str, message: str, **extra: Any) -> None:
    try:
        path = log_path(cwd)
        path.parent.mkdir(parents=True, exist_ok=True)
        record = {"timestamp": utc_timestamp(), "level": level, "message": message, **extra}
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, sort_keys=True) + "\n")
    except OSError:
        pass


def lower(value: Any) -> str:
    return str(value or "").lower()


def phase_index(phase: str) -> int:
    try:
        return PHASE_ORDER.index(phase)
    except ValueError:
        return -1


def merge_known_sections(base: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    merged = deep_copy_default_state()
    merged.update(base)
    merged.update(incoming)
    defaults = deep_copy_default_state()
    for key in ("requirements", "plan", "implementation", "qualityGates", "delivery"):
        merged[key] = {
            **defaults[key],
            **base.get(key, {}),
            **incoming.get(key, {}),
        }
    return merged


def read_state_strict(cwd: str) -> tuple[dict[str, Any] | None, list[str]]:
    path = workflow_state_path(cwd)
    if not path.exists():
        return deep_copy_default_state(), []

    try:
        with path.open("r", encoding="utf-8") as handle:
            raw_state = json.load(handle)
    except OSError as exc:
        return None, [f"workflow state could not be read: {exc}"]
    except json.JSONDecodeError as exc:
        return None, [f"workflow state is not valid JSON: {exc.msg}"]

    if not isinstance(raw_state, dict):
        return None, ["workflow state must be a JSON object"]

    return merge_known_sections({}, raw_state), []


def load_state(cwd: str) -> dict[str, Any]:
    state, errors = read_state_strict(cwd)
    if errors:
        log_event(cwd, "warning", "Loaded fallback state after read error", errors=errors)
        return deep_copy_default_state()
    return state or deep_copy_default_state()


def deep_merge(base: Any, patch: Any) -> Any:
    if isinstance(base, dict) and isinstance(patch, dict):
        merged = copy.deepcopy(base)
        for key, value in patch.items():
            merged[key] = deep_merge(merged.get(key), value)
        return merged
    return copy.deepcopy(patch)


def validate_string_list(value: Any, field_name: str) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        return [f"{field_name} must be a list of strings"]
    return []


def validate_state(state: dict[str, Any]) -> list[str]:
    errors: list[str] = []

    if state.get("version") != SCHEMA_VERSION:
        errors.append(f"version must be {SCHEMA_VERSION}")

    phase = lower(state.get("phase"))
    if phase not in PHASE_ORDER:
        errors.append(f"phase must be one of {', '.join(PHASE_ORDER)}")

    if not isinstance(state.get("taskId"), str):
        errors.append("taskId must be a string")
    if not isinstance(state.get("taskSummary"), str):
        errors.append("taskSummary must be a string")

    requirements = state.get("requirements")
    if not isinstance(requirements, dict):
        errors.append("requirements must be an object")
    else:
        if lower(requirements.get("status")) not in REQUIREMENTS_STATUSES:
            errors.append("requirements.status is invalid")
        errors.extend(validate_string_list(requirements.get("acceptanceCriteria"), "requirements.acceptanceCriteria"))
        errors.extend(validate_string_list(requirements.get("constraints"), "requirements.constraints"))
        errors.extend(validate_string_list(requirements.get("openQuestions"), "requirements.openQuestions"))

    plan = state.get("plan")
    if not isinstance(plan, dict):
        errors.append("plan must be an object")
    else:
        if lower(plan.get("status")) not in PLAN_STATUSES:
            errors.append("plan.status is invalid")
        if not isinstance(plan.get("summary"), str):
            errors.append("plan.summary must be a string")
        errors.extend(validate_string_list(plan.get("filesInScope"), "plan.filesInScope"))

    implementation = state.get("implementation")
    if not isinstance(implementation, dict):
        errors.append("implementation must be an object")
    else:
        if lower(implementation.get("status")) not in IMPLEMENTATION_STATUSES:
            errors.append("implementation.status is invalid")
        errors.extend(validate_string_list(implementation.get("filesTouched"), "implementation.filesTouched"))
        errors.extend(validate_string_list(implementation.get("blockedItems"), "implementation.blockedItems"))
        retry_count = implementation.get("retryCount")
        if not isinstance(retry_count, int) or retry_count < 0:
            errors.append("implementation.retryCount must be a non-negative integer")

    quality = state.get("qualityGates")
    if not isinstance(quality, dict):
        errors.append("qualityGates must be an object")
    else:
        for gate in ("typecheck", "lint", "tests", "verification"):
            if lower(quality.get(gate)) not in GATE_STATUSES:
                errors.append(f"qualityGates.{gate} is invalid")
        if not isinstance(quality.get("lastRunSummary"), str):
            errors.append("qualityGates.lastRunSummary must be a string")

    delivery = state.get("delivery")
    if not isinstance(delivery, dict):
        errors.append("delivery must be an object")
    else:
        if lower(delivery.get("status")) not in DELIVERY_STATUSES:
            errors.append("delivery.status is invalid")
        if not isinstance(delivery.get("userApproved"), bool):
            errors.append("delivery.userApproved must be a boolean")
        if not isinstance(delivery.get("notes"), str):
            errors.append("delivery.notes must be a string")

    if not isinstance(state.get("lastUpdated"), str):
        errors.append("lastUpdated must be a string")

    return errors


def all_gates_green(state: dict[str, Any]) -> bool:
    quality = state.get("qualityGates", {})
    return all(lower(quality.get(gate)) in GREEN_GATE_VALUES for gate in ("typecheck", "lint", "tests", "verification"))


def format_gate_summary(state: dict[str, Any]) -> str:
    quality = state.get("qualityGates", {})
    return ", ".join(
        f"{gate}={quality.get(gate, 'pending')}"
        for gate in ("typecheck", "lint", "tests", "verification")
    )


def validate_state_transition(old_state: dict[str, Any], new_state: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    old_phase = lower(old_state.get("phase"))
    new_phase = lower(new_state.get("phase"))

    old_index = phase_index(old_phase)
    new_index = phase_index(new_phase)
    if old_index >= 0 and new_index >= 0 and new_index - old_index > 1:
        errors.append(f"phase transition cannot skip forward from {old_phase} to {new_phase}")

    if new_index >= phase_index("planning"):
        requirements_status = lower(new_state.get("requirements", {}).get("status"))
        if requirements_status not in {"clarified", "approved"}:
            errors.append("planning or later requires clarified requirements")

    if new_index >= phase_index("implementation"):
        plan_status = lower(new_state.get("plan", {}).get("status"))
        if plan_status != "approved":
            errors.append("implementation or later requires plan.status = approved")

    if new_index >= phase_index("delivery") and not all_gates_green(new_state):
        errors.append("delivery requires all quality gates and verification to be green")

    delivery_status = lower(new_state.get("delivery", {}).get("status"))
    if delivery_status == "approved" and not new_state.get("delivery", {}).get("userApproved"):
        errors.append("delivery.status = approved requires delivery.userApproved = true")

    retry_count = new_state.get("implementation", {}).get("retryCount", 0)
    blocked_items = new_state.get("implementation", {}).get("blockedItems", [])
    implementation_status = lower(new_state.get("implementation", {}).get("status"))
    if retry_count >= MAX_RETRY_COUNT and not all_gates_green(new_state):
        if implementation_status != "blocked":
            errors.append("retry budget exhaustion requires implementation.status = blocked until the item is resolved")
        if not blocked_items:
            errors.append("retry budget exhaustion requires implementation.blockedItems to record the blocker")

    return errors


def save_state(cwd: str, state: dict[str, Any]) -> tuple[dict[str, Any] | None, list[str]]:
    merged_state = merge_known_sections(deep_copy_default_state(), state)
    merged_state["lastUpdated"] = utc_timestamp()

    validation_errors = validate_state(merged_state)
    if validation_errors:
        return None, validation_errors

    path = workflow_state_path(cwd)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_suffix(".json.tmp")

    try:
        with temp_path.open("w", encoding="utf-8") as handle:
            json.dump(merged_state, handle, indent=2, sort_keys=False)
            handle.write("\n")
        temp_path.replace(path)
    except OSError as exc:
        return None, [f"failed to write workflow state: {exc}"]

    log_event(cwd, "info", "Workflow state saved", phase=merged_state.get("phase"))
    return merged_state, []


def persist_state_baseline(cwd: str, tool_use_id: str, state: dict[str, Any]) -> None:
    if not tool_use_id:
        return
    path = baseline_path(cwd, tool_use_id)
    try:
        with path.open("w", encoding="utf-8") as handle:
            json.dump(state, handle, indent=2, sort_keys=False)
            handle.write("\n")
    except OSError as exc:
        log_event(cwd, "warning", "Failed to persist workflow baseline", tool_use_id=tool_use_id, error=str(exc))


def load_state_baseline(cwd: str, tool_use_id: str) -> dict[str, Any] | None:
    if not tool_use_id:
        return None
    path = baseline_path(cwd, tool_use_id)
    if not path.exists():
        return None
    try:
        with path.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        if isinstance(data, dict):
            return merge_known_sections({}, data)
    except (OSError, json.JSONDecodeError):
        return None
    return None


def remove_state_baseline(cwd: str, tool_use_id: str) -> None:
    if not tool_use_id:
        return
    try:
        baseline_path(cwd, tool_use_id).unlink(missing_ok=True)
    except OSError:
        pass


def emit(payload: dict[str, Any]) -> int:
    print(json.dumps(payload))
    return 0


def is_edit_tool(tool_name: str) -> bool:
    return any(token in tool_name for token in ("edit", "create", "write", "rename", "move", "delete"))


def is_command_tool(tool_name: str) -> bool:
    return any(token in tool_name for token in ("terminal", "command", "bash", "powershell", "shell", "run"))


def collect_strings(value: Any) -> list[str]:
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        items: list[str] = []
        for entry in value:
            items.extend(collect_strings(entry))
        return items
    if isinstance(value, dict):
        items = []
        for key in ("path", "file", "filePath", "source", "destination", "target", "files", "paths", "command", "commands"):
            if key in value:
                items.extend(collect_strings(value[key]))
        return items
    return []


def normalize_path(path: str) -> str:
    normalized = path.replace("\\", "/")
    if normalized.startswith("./"):
        return normalized[2:]
    return normalized


def extract_paths(tool_input: dict[str, Any]) -> list[str]:
    return [normalize_path(path) for path in collect_strings(tool_input)]


def is_governance_path(path: str) -> bool:
    return path == "AGENTS.md" or path.startswith(".github/")


def is_state_path(path: str) -> bool:
    return path == STATE_FILE


def only_governance_paths(paths: list[str]) -> bool:
    return bool(paths) and all(is_governance_path(path) for path in paths)


def state_edit_context(cwd: str, tool_use_id: str, state: dict[str, Any]) -> None:
    if tool_use_id:
        persist_state_baseline(cwd, tool_use_id, state)


def session_context(event: dict[str, Any]) -> int:
    cwd = event.get("cwd", ".")
    state, errors = read_state_strict(cwd)
    active_state = state or deep_copy_default_state()
    phase = active_state.get("phase", "discovery")
    requirements_status = active_state.get("requirements", {}).get("status", "needs-clarification")
    plan_status = active_state.get("plan", {}).get("status", "not-started")
    message = (
        "Workflow state loaded: "
        f"phase={phase}, requirements={requirements_status}, plan={plan_status}, "
        f"gates=({format_gate_summary(active_state)}). "
        "Follow Discovery -> Planning -> Implementation -> Quality Gates -> Verification -> Delivery."
    )
    if errors:
        message += f" State file needs repair before risky actions: {'; '.join(errors)}."
        log_event(cwd, "warning", "Session started with invalid workflow state", errors=errors)
    return emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "SessionStart",
                "additionalContext": message,
            }
        }
    )


def workflow_guard(event: dict[str, Any]) -> int:
    cwd = event.get("cwd", ".")
    tool_name = lower(event.get("tool_name"))
    if not (is_edit_tool(tool_name) or is_command_tool(tool_name)):
        return emit({"continue": True})

    tool_input = event.get("tool_input", {})
    paths = extract_paths(tool_input)
    governance_only = only_governance_paths(paths)
    state_targeted = any(is_state_path(path) for path in paths)
    state, state_errors = read_state_strict(cwd)
    active_state = state or deep_copy_default_state()

    if state_errors and not state_targeted:
        log_event(cwd, "warning", "Blocked risky tool use because workflow state is invalid", tool=tool_name, errors=state_errors)
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "ask",
                    "permissionDecisionReason": "Workflow state is invalid. Repair .github/workflow-state.json before risky actions.",
                    "additionalContext": "; ".join(state_errors),
                }
            }
        )

    if state_targeted and is_edit_tool(tool_name):
        state_edit_context(cwd, event.get("tool_use_id", ""), active_state)
        log_event(cwd, "info", "State file edit allowed with baseline capture", tool=tool_name, tool_use_id=event.get("tool_use_id"))
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                    "additionalContext": "State file edits are allowed, but the result will be validated against the schema and transition rules after the write completes.",
                }
            }
        )

    requirements_status = lower(active_state.get("requirements", {}).get("status"))
    plan_status = lower(active_state.get("plan", {}).get("status"))
    retry_count = active_state.get("implementation", {}).get("retryCount", 0)

    if retry_count >= MAX_RETRY_COUNT and is_edit_tool(tool_name) and not governance_only:
        log_event(cwd, "warning", "Denied edit because retry budget is exhausted", tool=tool_name, retryCount=retry_count)
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": f"Retry budget exhausted ({retry_count}/{MAX_RETRY_COUNT}). Mark the work item as blocked instead of continuing to edit.",
                    "additionalContext": "Record the blocker in implementation.blockedItems and route the task back through recovery or user escalation.",
                }
            }
        )

    if not governance_only and requirements_status not in {"clarified", "approved"}:
        log_event(cwd, "info", "Asked for Discovery completion before risky edit", tool=tool_name, requirements=requirements_status)
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "ask",
                    "permissionDecisionReason": "Requirements are not clarified yet. Finish Discovery before editing implementation surfaces.",
                    "additionalContext": "Use the discovery workflow and update .github/workflow-state.json before implementation work.",
                }
            }
        )

    if is_edit_tool(tool_name) and not governance_only and plan_status != "approved":
        log_event(cwd, "info", "Asked for Planning completion before implementation edit", tool=tool_name, plan=plan_status)
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "ask",
                    "permissionDecisionReason": "Plan approval is required before non-trivial implementation changes.",
                    "additionalContext": "Move through Planning first or limit edits to workflow/governance files only.",
                }
            }
        )

    command_text = " ".join(collect_strings(tool_input)).lower()
    if any(token in command_text for token in ("git commit", "git push", "gh pr", "release")) and not all_gates_green(active_state):
        log_event(cwd, "warning", "Denied delivery action because gates are not green", tool=tool_name, gates=format_gate_summary(active_state))
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": "Delivery actions are blocked until quality gates and verification pass.",
                    "additionalContext": f"Current gate state: {format_gate_summary(active_state)}",
                }
            }
        )

    return emit({"continue": True})


def post_edit_checks(event: dict[str, Any]) -> int:
    cwd = event.get("cwd", ".")
    tool_name = lower(event.get("tool_name"))
    if not is_edit_tool(tool_name):
        return emit({"continue": True})

    paths = extract_paths(event.get("tool_input", {}))
    state_targeted = any(is_state_path(path) for path in paths)
    tool_use_id = event.get("tool_use_id", "")

    if state_targeted:
        previous_state = load_state_baseline(cwd, tool_use_id)
        current_state, errors = read_state_strict(cwd)
        if errors:
            if previous_state is not None:
                save_state(cwd, previous_state)
            remove_state_baseline(cwd, tool_use_id)
            log_event(cwd, "error", "Blocked invalid workflow state edit", tool=tool_name, errors=errors)
            return emit(
                {
                    "decision": "block",
                    "reason": "workflow-state.json became invalid and was restored to the last valid baseline.",
                    "hookSpecificOutput": {
                        "hookEventName": "PostToolUse",
                        "additionalContext": "; ".join(errors),
                    },
                }
            )

        transition_errors = validate_state(current_state or {}) if current_state else ["workflow state is missing"]
        if previous_state is not None and current_state is not None:
            transition_errors.extend(validate_state_transition(previous_state, current_state))

        if transition_errors:
            if previous_state is not None:
                save_state(cwd, previous_state)
            remove_state_baseline(cwd, tool_use_id)
            log_event(cwd, "error", "Blocked invalid workflow state transition", tool=tool_name, errors=transition_errors)
            return emit(
                {
                    "decision": "block",
                    "reason": "workflow-state.json violated the workflow schema or transition rules and was restored.",
                    "hookSpecificOutput": {
                        "hookEventName": "PostToolUse",
                        "additionalContext": "; ".join(transition_errors),
                    },
                }
            )

        remove_state_baseline(cwd, tool_use_id)
        log_event(cwd, "info", "Validated workflow state edit", tool=tool_name, phase=current_state.get("phase"))
        return emit(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": "workflow-state.json passed schema and transition validation.",
                }
            }
        )

    state = load_state(cwd)
    phase = state.get("phase", "discovery")
    message = (
        "Files changed. Update .github/workflow-state.json with touched files and phase changes. "
        f"Current phase is {phase}. Before delivery, run the applicable gates and complete verification."
    )
    log_event(cwd, "info", "Post-edit reminder issued", tool=tool_name, phase=phase)
    return emit(
        {
            "hookSpecificOutput": {
                "hookEventName": "PostToolUse",
                "additionalContext": message,
            }
        }
    )


def stop_gate(event: dict[str, Any]) -> int:
    cwd = event.get("cwd", ".")
    if event.get("stop_hook_active"):
        return emit({"continue": True})

    state = load_state(cwd)
    phase = lower(state.get("phase", "discovery"))
    implementation = state.get("implementation", {})
    touched = implementation.get("filesTouched", [])
    retry_count = implementation.get("retryCount", 0)
    blocked_items = implementation.get("blockedItems", [])

    if retry_count >= MAX_RETRY_COUNT and not blocked_items:
        reason = "Retry budget is exhausted, but no blocked item was recorded in workflow state."
        log_event(cwd, "warning", "Stop blocked because retry exhaustion was not recorded", retryCount=retry_count)
        return emit({"decision": "block", "reason": reason})

    if phase in {"implementation", "quality-gates", "verification"} or touched:
        if not all_gates_green(state):
            reason = (
                "The workflow cannot stop yet because quality gates or verification are incomplete. "
                f"Current state: {format_gate_summary(state)}."
            )
            log_event(cwd, "warning", "Stop blocked because gates are incomplete", gates=format_gate_summary(state))
            return emit({"decision": "block", "reason": reason})

    return emit({"continue": True})


def update_state_mode(cwd: str, patch: dict[str, Any]) -> int:
    current_state = load_state(cwd)
    proposed_state = merge_known_sections({}, deep_merge(current_state, patch))
    transition_errors = validate_state_transition(current_state, proposed_state)
    if transition_errors:
        log_event(cwd, "error", "Rejected workflow state update", errors=transition_errors)
        return emit({"saved": False, "errors": transition_errors})

    saved_state, save_errors = save_state(cwd, proposed_state)
    if save_errors:
        log_event(cwd, "error", "Failed to save workflow state update", errors=save_errors)
        return emit({"saved": False, "errors": save_errors})

    return emit({"saved": True, "state": saved_state})


def validate_state_mode(cwd: str) -> int:
    state, read_errors = read_state_strict(cwd)
    validation_errors = validate_state(state or {}) if state is not None else []
    errors = read_errors + validation_errors
    log_event(cwd, "info", "Validated workflow state", valid=not errors)
    return emit({"valid": not errors, "errors": errors, "state": state})


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    event = load_event()
    cwd = event.get("cwd", ".")

    if mode == "session-context":
        return session_context(event)
    if mode == "workflow-guard":
        return workflow_guard(event)
    if mode == "post-edit-checks":
        return post_edit_checks(event)
    if mode == "stop-gate":
        return stop_gate(event)
    if mode == "update-state":
        return update_state_mode(cwd, event)
    if mode == "validate-state":
        return validate_state_mode(cwd)

    return emit({"continue": True})


if __name__ == "__main__":
    raise SystemExit(main())
