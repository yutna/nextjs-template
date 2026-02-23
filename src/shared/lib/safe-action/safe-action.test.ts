import { createSafeActionClient } from "next-safe-action";
import { describe, expect, it, vi } from "vitest";
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

  it("returns validation errors for invalid input", async () => {
    const action = actionClient
      .inputSchema(z.object({ name: z.string().min(1) }))
      .action(async ({ parsedInput }) => {
        return { greeting: `Hello, ${parsedInput.name}` };
      });

    const result = await action({ name: "" });
    expect(result?.data).toBeUndefined();
    expect(result?.validationErrors).toBeDefined();
  });

  it("returns validation errors for missing required fields", async () => {
    const action = actionClient
      .inputSchema(z.object({ name: z.string(), age: z.number() }))
      .action(async ({ parsedInput }) => parsedInput);

    // @ts-expect-error intentionally passing invalid input
    const result = await action({});
    expect(result?.data).toBeUndefined();
    expect(result?.validationErrors).toBeDefined();
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

  it("returns validation errors for invalid input", async () => {
    const action = authActionClient
      .inputSchema(z.object({ value: z.number().positive() }))
      .action(async ({ parsedInput }) => ({ doubled: parsedInput.value * 2 }));

    const result = await action({ value: -1 });
    expect(result?.data).toBeUndefined();
    expect(result?.validationErrors).toBeDefined();
  });
});

describe("middleware", () => {
  it("executes and passes context to the action", async () => {
    const spy = vi.fn();

    const clientWithMiddleware = createSafeActionClient().use(
      async ({ next }) => {
        spy();
        return next();
      },
    );

    const action = clientWithMiddleware
      .inputSchema(z.object({ value: z.number() }))
      .action(async ({ parsedInput }) => ({ result: parsedInput.value }));

    const result = await action({ value: 42 });
    expect(result?.data).toEqual({ result: 42 });
    expect(spy).toHaveBeenCalledOnce();
  });

  it("can inject context from middleware into action", async () => {
    const callLog: string[] = [];

    const clientWithContext = createSafeActionClient().use(async ({ next }) => {
      callLog.push("middleware");
      return next({ ctx: { requestId: "abc-123" } });
    });

    const action = clientWithContext
      .inputSchema(z.object({ value: z.number() }))
      .action(async ({ parsedInput, ctx }) => {
        callLog.push("action");
        return { value: parsedInput.value, requestId: ctx.requestId };
      });

    const result = await action({ value: 7 });
    expect(result?.data).toEqual({ value: 7, requestId: "abc-123" });
    expect(callLog).toEqual(["middleware", "action"]);
  });
});
