export type Phase =
  | "delivery"
  | "discovery"
  | "implementation"
  | "planning"
  | "quality-gates"
  | "verification";

export type RequirementsStatus =
  | "approved"
  | "clarified"
  | "needs-clarification";
export type PlanStatus = "approved" | "blocked" | "not-started" | "proposed";
export type ImplementationStatus =
  | "blocked"
  | "completed"
  | "in-progress"
  | "not-started";
export type GateStatus = "failed" | "not-applicable" | "passed" | "pending";
export type DeliveryStatus = "approved" | "blocked" | "ready-for-review";
export type HookDecision = "allow" | "ask" | "deny";
export type HookEventName =
  | "PostToolUse"
  | "PreToolUse"
  | "SessionStart"
  | "Stop"
  | "UserPromptSubmit";

export interface WorkflowRequirements {
  acceptanceCriteria: string[];
  constraints: string[];
  openQuestions: string[];
  status: RequirementsStatus;
}

export interface WorkflowPlan {
  filesInScope: string[];
  status: PlanStatus;
  summary: string;
}

export interface WorkflowImplementation {
  blockedItems: string[];
  filesTouched: string[];
  retryCount: number;
  status: ImplementationStatus;
}

export interface WorkflowQualityGates {
  lastRunSummary: string;
  lint: GateStatus;
  tests: GateStatus;
  typecheck: GateStatus;
  verification: GateStatus;
}

export interface WorkflowDelivery {
  notes: string;
  status: DeliveryStatus;
  userApproved: boolean;
}

export interface WorkflowState {
  delivery: WorkflowDelivery;
  implementation: WorkflowImplementation;
  lastUpdated: string;
  phase: Phase;
  plan: WorkflowPlan;
  qualityGates: WorkflowQualityGates;
  requirements: WorkflowRequirements;
  revision: number;
  taskId: string;
  taskSummary: string;
  version: string;
}

export interface NormalizedEvent {
  cwd: string;
  host: string;
  mode: string;
  rawEvent: RawEvent;
  stopHookActive: boolean;
  toolInput: ToolInput;
  toolName: string;
  toolUseId: string;
}

export interface RawEvent {
  [key: string]: unknown;
  cwd?: string;
  stop_hook_active?: boolean;
  stopHookActive?: boolean;
  tool_input?: ToolInput;
  tool_name?: string;
  tool_use_id?: string;
  toolArgs?: string;
  toolArgs_raw?: string;
  toolInput?: ToolInput;
  toolName?: string;
  toolUseId?: string;
}

export interface ToolInput {
  [key: string]: unknown;
  args?: unknown;
  arguments?: unknown;
  command?: unknown;
  commands?: unknown;
  destination?: string;
  file?: string;
  file_path?: string;
  filePath?: string;
  files?: unknown;
  path?: string;
  paths?: unknown;
  source?: string;
  target?: string;
}

export interface HookResponse {
  additionalContext?: string;
  continue?: boolean;
  decision?: string;
  permissionDecision?: HookDecision;
  permissionDecisionReason?: string;
  reason?: string;
}

export interface SaveStateOptions {
  expectedRevision?: null | number;
  forceWrite?: boolean;
}

export interface SyncEditResult {
  changed: boolean;
  errors: string[];
  message: string;
  state: WorkflowState;
}
