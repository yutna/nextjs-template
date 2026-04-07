import { describe, expect, it } from "vitest";

import {
  MalformedCommandModuleError,
  validateCommandModule,
} from "./command-module.ts";
import {
  command as hooksBuilderCommand,
  help as hooksBuilderHelp,
} from "./commands/hooks-build.ts";

describe("validateCommandModule", () => {
  it("rejects malformed command-module exports with deterministic details", () => {
    expect.assertions(3);

    try {
      validateCommandModule("hooks-build.ts", {
        command: "hooks:build",
        help: "Builder help text",
      });
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(MalformedCommandModuleError);

      if (error instanceof MalformedCommandModuleError) {
        expect(error.moduleId).toBe("hooks-build.ts");
        expect(error.issues).toEqual([
          '"command" export must be an object',
          '"help" export must be a function when provided',
        ]);
      }
    }
  });

  it("accepts the hooks-build command-module shape", () => {
    const commandModule = validateCommandModule("hooks-build.ts", {
      command: hooksBuilderCommand,
      help: hooksBuilderHelp,
    });

    expect(commandModule.command.name).toBe("hooks:build");
    expect(commandModule.command.description).toBe(
      "Generate hook configurations from single source",
    );
    expect(commandModule.help).toBe(hooksBuilderHelp);
  });
});
