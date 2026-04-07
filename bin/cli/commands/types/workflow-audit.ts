export type AuditStatus = "compliant" | "non-compliant" | "violations";

export interface AuditIssue {
  message: string;
  severity: "error" | "info" | "warning";
  type: string;
}

export interface AuditResult {
  issues: AuditIssue[];
  name: string;
  path: string;
  status: AuditStatus;
}
