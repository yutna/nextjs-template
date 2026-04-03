import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuditStatus = "compliant" | "non-compliant" | "violations";

interface AuditIssue {
  message: string;
  severity: "error" | "info" | "warning";
  type: string;
}

interface AuditResult {
  issues: AuditIssue[];
  name: string;
  path: string;
  status: AuditStatus;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_MODULE_SUBDIRS = [
  "actions",
  "components",
  "containers",
  "screens",
  "hooks",
  "contexts",
  "lib",
  "styles",
  "constants",
];

const REQUIRED_MODULE_SUBDIRS = [
  "components",
  "containers",
  "screens",
  "hooks",
];

const FORBIDDEN_FILES = [
  "utils.ts",
  "utils.tsx",
  "helpers.ts",
  "helpers.tsx",
  "common.ts",
  "common.tsx",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDirectories(dirPath: string): string[] {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function getFiles(dirPath: string): string[] {
  if (!existsSync(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name);
}

function checkForForbiddenFiles(
  dirPath: string,
  forbiddenFiles: string[],
): string[] {
  const violations: string[] = [];

  function isScopedHelperFile(filePath: string): boolean {
    const relPath = relative(dirPath, filePath);
    const parts = relPath.split("/");
    // Allow helpers.ts only when scoped inside a concrete subfolder.
    return parts.length >= 3;
  }

  function scanDir(currentPath: string): void {
    for (const file of getFiles(currentPath)) {
      if (forbiddenFiles.includes(file)) {
        const filePath = join(currentPath, file);
        if (
          (file === "helpers.ts" || file === "helpers.tsx") &&
          isScopedHelperFile(filePath)
        ) {
          continue;
        }
        violations.push(filePath);
      }
    }
    for (const dir of getDirectories(currentPath)) {
      if (!dir.startsWith(".") && dir !== "node_modules") {
        scanDir(join(currentPath, dir));
      }
    }
  }

  scanDir(dirPath);
  return violations;
}

function checkForUseClientInScreens(modulePath: string): string[] {
  const screensPath = join(modulePath, "screens");
  if (!existsSync(screensPath)) return [];

  const violations: string[] = [];
  const files = getFiles(screensPath).filter(
    (f) => f.endsWith(".tsx") || f.endsWith(".ts"),
  );

  for (const file of files) {
    const filePath = join(screensPath, file);
    try {
      const content = readFileSync(filePath, "utf8");
      const lines = content.split("\n").slice(0, 5);
      const hasUseClient = lines.some(
        (line) =>
          line.trim().startsWith("'use client'") ||
          line.trim().startsWith('"use client"'),
      );
      if (hasUseClient) violations.push(filePath);
    } catch {
      // skip unreadable files
    }
  }

  return violations;
}

// ─── Auditors ─────────────────────────────────────────────────────────────────

function auditModule(modulePath: string, moduleName: string): AuditResult {
  const result: AuditResult = {
    issues: [],
    name: moduleName,
    path: modulePath,
    status: "compliant",
  };

  const existingDirs = getDirectories(modulePath);
  const missingRequired = REQUIRED_MODULE_SUBDIRS.filter(
    (d) => !existingDirs.includes(d),
  );

  if (missingRequired.length > 0) {
    result.status = "non-compliant";
    result.issues.push({
      message: `Missing required directories: ${missingRequired.join(", ")}`,
      severity: "error",
      type: "missing-directory",
    });
  }

  for (const file of checkForForbiddenFiles(modulePath, FORBIDDEN_FILES)) {
    if (result.status === "compliant") result.status = "violations";
    result.issues.push({
      message: `Forbidden generic file: ${relative(modulePath, file)}`,
      severity: "warning",
      type: "forbidden-file",
    });
  }

  for (const file of checkForUseClientInScreens(modulePath)) {
    if (result.status === "compliant") result.status = "violations";
    result.issues.push({
      message: `"use client" in screen: ${relative(modulePath, file)}`,
      severity: "warning",
      type: "use-client-in-screen",
    });
  }

  const nonStandard = existingDirs.filter(
    (d) => !DEFAULT_MODULE_SUBDIRS.includes(d) && !d.startsWith("."),
  );
  if (nonStandard.length > 0) {
    result.issues.push({
      message: `Non-standard directories: ${nonStandard.join(", ")}`,
      severity: "info",
      type: "non-standard-directory",
    });
  }

  return result;
}

function auditShared(sharedPath: string): AuditResult {
  const result: AuditResult = {
    issues: [],
    name: "shared",
    path: sharedPath,
    status: "compliant",
  };

  if (!existsSync(sharedPath)) {
    result.status = "non-compliant";
    result.issues.push({
      message: "shared directory does not exist",
      severity: "error",
      type: "missing-directory",
    });
    return result;
  }

  const existingDirs = getDirectories(sharedPath);
  const requiredShared = ["lib", "config", "components", "providers"];
  const missingRequired = requiredShared.filter(
    (d) => !existingDirs.includes(d),
  );

  if (missingRequired.length > 0) {
    result.status = "violations";
    result.issues.push({
      message: `Missing recommended directories: ${missingRequired.join(", ")}`,
      severity: "warning",
      type: "missing-directory",
    });
  }

  for (const file of checkForForbiddenFiles(sharedPath, FORBIDDEN_FILES)) {
    if (result.status === "compliant") result.status = "violations";
    result.issues.push({
      message: `Forbidden generic file: ${relative(sharedPath, file)}`,
      severity: "warning",
      type: "forbidden-file",
    });
  }

  return result;
}

function auditModules(modulesPath: string): AuditResult[] {
  if (!existsSync(modulesPath)) return [];

  return getDirectories(modulesPath)
    .filter((name) => !name.startsWith("."))
    .map((moduleName) =>
      auditModule(join(modulesPath, moduleName), moduleName),
    );
}

// ─── Report ───────────────────────────────────────────────────────────────────

function printReport(
  moduleResults: AuditResult[],
  sharedResult: AuditResult | null,
): number {
  console.log("\n📋 Structure Audit Report\n");
  console.log("=".repeat(60));

  const compliant = moduleResults.filter(
    (r) => r.status === "compliant",
  ).length;
  const violations = moduleResults.filter(
    (r) => r.status === "violations",
  ).length;
  const nonCompliant = moduleResults.filter(
    (r) => r.status === "non-compliant",
  ).length;

  console.log("\n📊 Summary");
  console.log(`   Modules audited: ${moduleResults.length}`);
  console.log(`   ✅ Compliant: ${compliant}`);
  console.log(`   ⚠️  Violations: ${violations}`);
  console.log(`   ❌ Non-compliant: ${nonCompliant}`);

  console.log("\n📦 Modules");
  console.log("-".repeat(60));

  for (const result of moduleResults) {
    const icon =
      result.status === "compliant"
        ? "✅"
        : result.status === "violations"
          ? "⚠️"
          : "❌";
    console.log(`\n${icon} ${result.name}`);

    if (result.issues.length === 0) {
      console.log("   All conventions followed.");
    } else {
      for (const issue of result.issues) {
        const issueIcon =
          issue.severity === "error"
            ? "❌"
            : issue.severity === "warning"
              ? "⚠️"
              : "ℹ️";
        console.log(`   ${issueIcon} ${issue.message}`);
      }
    }
  }

  if (sharedResult) {
    console.log("\n📁 Shared");
    console.log("-".repeat(60));

    const icon =
      sharedResult.status === "compliant"
        ? "✅"
        : sharedResult.status === "violations"
          ? "⚠️"
          : "❌";
    console.log(`\n${icon} ${sharedResult.name}`);

    if (sharedResult.issues.length === 0) {
      console.log("   All conventions followed.");
    } else {
      for (const issue of sharedResult.issues) {
        const issueIcon =
          issue.severity === "error"
            ? "❌"
            : issue.severity === "warning"
              ? "⚠️"
              : "ℹ️";
        console.log(`   ${issueIcon} ${issue.message}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));

  const hasErrors =
    moduleResults.some((r) => r.status === "non-compliant") ||
    (sharedResult !== null && sharedResult.status === "non-compliant");
  const hasWarnings =
    moduleResults.some((r) => r.status === "violations") ||
    (sharedResult !== null && sharedResult.status === "violations");

  if (hasErrors) {
    console.log("\n❌ Audit failed - critical violations found");
    return 1;
  } else if (hasWarnings) {
    console.log("\n⚠️  Audit passed with warnings");
    return 0;
  } else {
    console.log("\n✅ All structure conventions followed");
    return 0;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function runWorkflowAudit(args: string[]): void {
  const targetPath = args[0] ?? "all";

  console.log("🔍 Workflow Structure Audit");

  if (targetPath === "all" || targetPath === "") {
    const moduleResults = auditModules("src/modules");
    const sharedResult = auditShared("src/shared");
    const exitCode = printReport(moduleResults, sharedResult);
    if (exitCode !== 0) process.exit(exitCode);
    return;
  }

  if (targetPath.includes("modules/")) {
    const moduleName = basename(targetPath);
    const result = auditModule(targetPath, moduleName);
    const exitCode = printReport([result], null);
    if (exitCode !== 0) process.exit(exitCode);
    return;
  }

  if (targetPath.includes("shared")) {
    const result = auditShared(targetPath);
    const exitCode = printReport([], result);
    if (exitCode !== 0) process.exit(exitCode);
    return;
  }

  console.log("\nUsage: ./bin/vibe workflow-audit [path]");
  console.log("\nExamples:");
  console.log("  ./bin/vibe workflow-audit              # Audit all");
  console.log("  ./bin/vibe workflow-audit src/modules/users");
  console.log("  ./bin/vibe workflow-audit src/shared");
}

async function run(args?: string[]): Promise<void> {
  runWorkflowAudit(args ?? []);
}

export const command = {
  description: "Audit module and shared directory structure",
  name: "workflow-audit",
  run,
};

export function help(): void {
  console.log(`  Validate module and shared directory structure conventions.

  Usage:
    ./bin/vibe workflow-audit [path]

  Examples:
    ./bin/vibe workflow-audit
    ./bin/vibe workflow-audit src/modules/users
    ./bin/vibe workflow-audit src/shared
`);
}
