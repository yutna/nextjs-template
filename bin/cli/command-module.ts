export interface CliCommand {
  description: string;
  name: string;
  run: (args?: string[]) => Promise<void>;
}

export interface CliCommandModule {
  command: CliCommand;
  help?: () => void;
}

export class MalformedCommandModuleError {
  readonly _tag = "MalformedCommandModuleError";
  readonly issues: string[];
  readonly moduleId: string;

  constructor(moduleId: string, issues: string[]) {
    this.issues = issues;
    this.moduleId = moduleId;
  }

  get message(): string {
    return `Malformed command module "${this.moduleId}": ${this.issues.join("; ")}`;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isCliCommand(value: unknown): value is CliCommand {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    value.name.length > 0 &&
    typeof value.description === "string" &&
    value.description.length > 0 &&
    typeof value.run === "function"
  );
}

function isHelpFunction(value: unknown): value is () => void {
  return typeof value === "function";
}

function validateCommandExport(commandValue: unknown): string[] {
  const issues: string[] = [];

  if (!isRecord(commandValue)) {
    issues.push('"command" export must be an object');
    return issues;
  }

  if (typeof commandValue.name !== "string" || commandValue.name.length === 0) {
    issues.push('"command.name" must be a non-empty string');
  }

  if (
    typeof commandValue.description !== "string" ||
    commandValue.description.length === 0
  ) {
    issues.push('"command.description" must be a non-empty string');
  }

  if (typeof commandValue.run !== "function") {
    issues.push('"command.run" must be a function');
  }

  return issues;
}

export function validateCommandModule(
  moduleId: string,
  moduleValue: unknown,
): CliCommandModule {
  if (!isRecord(moduleValue)) {
    throw new MalformedCommandModuleError(moduleId, [
      "module exports must be an object",
    ]);
  }

  const issues: string[] = [];

  if (!("command" in moduleValue)) {
    issues.push('missing "command" export');
  }

  issues.push(...validateCommandExport(moduleValue.command));

  if ("help" in moduleValue && moduleValue.help !== undefined) {
    if (!isHelpFunction(moduleValue.help)) {
      issues.push('"help" export must be a function when provided');
    }
  }

  if (issues.length > 0) {
    throw new MalformedCommandModuleError(moduleId, issues);
  }

  const command = moduleValue.command;
  const help = moduleValue.help;

  if (!isCliCommand(command)) {
    throw new MalformedCommandModuleError(moduleId, [
      '"command" export failed validation unexpectedly',
    ]);
  }

  return {
    command,
    ...(isHelpFunction(help) ? { help } : {}),
  };
}
