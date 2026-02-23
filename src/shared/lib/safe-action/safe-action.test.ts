import { describe, expect, it } from "vitest";
import { z } from "zod";
import { actionClient, authActionClient } from "./safe-action";

describe("actionClient", () => {
  it("is defined", () => {
    expect(actionClient).toBeDefined();
  });

  it("exposes inputSchema method", () => {
    expect(typeof actionClient.inputSchema).toBe("function");
  });

  it("executes a simple action and returns data", async () => {
    const action = actionClient
      .inputSchema(z.object({ name: z.string() }))
      .action(async ({ parsedInput }) => {
        return { greeting: `Hello, ${parsedInput.name}` };
      });

    const result = await action({ name: "World" });
    expect(result?.data).toEqual({ greeting: "Hello, World" });
  });
});

describe("authActionClient", () => {
  it("is defined", () => {
    expect(authActionClient).toBeDefined();
  });

  it("exposes inputSchema method", () => {
    expect(typeof authActionClient.inputSchema).toBe("function");
  });

  it("passes through middleware and executes action", async () => {
    const action = authActionClient
      .inputSchema(z.object({ value: z.number() }))
      .action(async ({ parsedInput }) => {
        return { doubled: parsedInput.value * 2 };
      });

    const result = await action({ value: 5 });
    expect(result?.data).toEqual({ doubled: 10 });
  });
});
