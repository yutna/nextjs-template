import { readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Effect } from "effect";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const COMMANDS_DIR = resolve(__dirname, "commands");

interface Command {
  description: string;
  name: string;
  run: (args?: string[]) => Promise<void>;
}

interface CommandModule {
  command: Command;
  help?: () => void;
}

class CommandNotFoundError {
  readonly _tag = "CommandNotFoundError";
  readonly commandName: string;
  constructor(commandName: string) {
    this.commandName = commandName;
  }
}

const loadCommandModule = (name: string) =>
  Effect.tryPromise({
    catch: () => new CommandNotFoundError(name),
    try: async () => {
      const normalized = name.replace(":", "-");
      const commandPath = resolve(COMMANDS_DIR, `${normalized}.ts`);
      const mod = await import(commandPath);

      if (!mod.command) {
        throw new Error(`No command export in ${normalized}.ts`);
      }

      const result: CommandModule = {
        command: mod.command as Command,
      };

      if (typeof mod.help === "function") {
        result.help = mod.help as () => void;
      }

      return result;
    },
  });

const listCommands = Effect.gen(function* () {
  const files = yield* Effect.try(() =>
    readdirSync(COMMANDS_DIR).filter((f) => f.endsWith(".ts")),
  );

  const commands: Command[] = [];

  for (const file of files) {
    const mod = yield* Effect.tryPromise(() =>
      import(resolve(COMMANDS_DIR, file)),
    );

    if (mod.command) {
      commands.push(mod.command as Command);
    }
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name));
});

function printHelp(commands: Command[]): void {
  const bin = "bin/tmpl";

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

  if (!commandName || commandName === "--help" || commandName === "-h") {
    const commands = await Effect.runPromise(listCommands);
    printHelp(commands);
    return;
  }

  const program = Effect.gen(function* () {
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
          console.error(
            `  Run ./bin/tmpl --help to see available commands.\n`,
          );
          process.exitCode = 1;
        }),
      ),
    ),
  );
}
