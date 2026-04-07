import { Effect } from "effect";
import { readdirSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import {
  MalformedCommandModuleError,
  validateCommandModule,
} from "./command-module.ts";

import type { CliCommand } from "./command-module.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS_DIR = resolve(__dirname, "commands");
const SAFE_COMMAND_NAME_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*(?::[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

class CommandNotFoundError {
  readonly _tag = "CommandNotFoundError";
  readonly commandName: string;
  constructor(commandName: string) {
    this.commandName = commandName;
  }
}

class CommandModuleImportError {
  readonly _tag = "CommandModuleImportError";
  readonly cause: string;
  readonly moduleId: string;

  constructor(moduleId: string, cause: string) {
    this.cause = cause;
    this.moduleId = moduleId;
  }
}

function commandModuleFileName(commandName: string): string {
  if (!SAFE_COMMAND_NAME_PATTERN.test(commandName)) {
    throw new CommandNotFoundError(commandName);
  }

  return `${commandName.replaceAll(":", "-")}.ts`;
}

function commandModuleIdForError(commandName: string): string {
  if (SAFE_COMMAND_NAME_PATTERN.test(commandName)) {
    return `${commandName.replaceAll(":", "-")}.ts`;
  }

  return `${commandName}.ts`;
}

function resolveCommandModulePath(moduleId: string): string {
  const commandPath = resolve(COMMANDS_DIR, moduleId);
  const commandRelativePath = relative(COMMANDS_DIR, commandPath);

  if (
    isAbsolute(commandRelativePath) ||
    commandRelativePath === ".." ||
    commandRelativePath.startsWith(`..${sep}`)
  ) {
    throw new Error(`Command module path escapes commands directory: ${moduleId}`);
  }

  return commandPath;
}

function formatUnknownError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return String(error);
}

function isModuleNotFoundError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return "code" in error && error.code === "ERR_MODULE_NOT_FOUND";
}

async function importValidatedCommandModule(moduleId: string) {
  const commandPath = resolveCommandModulePath(moduleId);
  const importedModule: unknown = await import(commandPath);

  return validateCommandModule(moduleId, importedModule);
}

const loadCommandModule = (name: string) =>
  Effect.tryPromise({
    catch: (error) => {
      const moduleId = commandModuleIdForError(name);

      if (error instanceof MalformedCommandModuleError) {
        return error;
      }

      if (error instanceof CommandNotFoundError) {
        return error;
      }

      if (isModuleNotFoundError(error)) {
        return new CommandNotFoundError(name);
      }

      return new CommandModuleImportError(moduleId, formatUnknownError(error));
    },
    try: async () => {
      return importValidatedCommandModule(commandModuleFileName(name));
    },
  });

const listCommands = Effect.gen(function* () {
  const files = yield* Effect.try(() =>
    readdirSync(COMMANDS_DIR).filter((f) => f.endsWith(".ts")),
  );

  const commands: CliCommand[] = [];

  for (const file of files) {
    const commandModule = yield* Effect.tryPromise({
      catch: (error) => {
        if (error instanceof MalformedCommandModuleError) {
          return error;
        }

        return new CommandModuleImportError(file, formatUnknownError(error));
      },
      try: async () => importValidatedCommandModule(file),
    });

    commands.push(commandModule.command);
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name));
});

function printHelp(commands: CliCommand[]): void {
  const bin = "bin/vibe";

  console.log(`
  Usage: ./${bin} <command> [options]

  Commands:
`);

  const maxLen = Math.max(...commands.map((c) => c.name.length));

  for (const cmd of commands) {
    console.log(`    ${cmd.name.padEnd(maxLen + 2)} ${cmd.description}`);
  }

  console.log(`
  Options:

    --help    Show help for a command or this overview

  Examples:

    ./${bin} hooks:format --help
    ./${bin} hooks:lint
`);
}

export async function main(args: string[]): Promise<void> {
  const commandName = args[0];

  const program = Effect.gen(function* () {
    if (!commandName || commandName === "--help" || commandName === "-h") {
      const commands = yield* listCommands;
      yield* Effect.sync(() => {
        printHelp(commands);
      });
      return;
    }

    const { command, help: helpFn } = yield* loadCommandModule(commandName);
    const rest = args.slice(1);

    if (rest.includes("--help") || rest.includes("-h")) {
      console.log(`\n  ${command.name} — ${command.description}\n`);

      if (helpFn) {
        helpFn();
      }

      return;
    }

    yield* Effect.tryPromise(() => command.run(rest));
  });

  await Effect.runPromise(
    program.pipe(
      Effect.catchTag("CommandNotFoundError", (err) =>
        Effect.sync(() => {
          console.error(`  Unknown command: ${err.commandName}\n`);
          console.error(`  Run ./bin/vibe --help to see available commands.\n`);
          process.exitCode = 1;
        }),
      ),
      Effect.catchTag("MalformedCommandModuleError", (err) =>
        Effect.sync(() => {
          console.error(`  ${err.message}\n`);
          process.exitCode = 1;
        }),
      ),
      Effect.catchTag("CommandModuleImportError", (err) =>
        Effect.sync(() => {
          console.error(`  Failed to load command module "${err.moduleId}".\n`);
          console.error(`  ${err.cause}\n`);
          process.exitCode = 1;
        }),
      ),
    ),
  );
}
