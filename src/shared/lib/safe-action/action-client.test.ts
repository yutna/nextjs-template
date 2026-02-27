import { describe, expect, it } from "vitest";
import { z } from "zod";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";
import { DatabaseError } from "@/shared/lib/errors/infrastructure/database-error";

import { actionClient } from "./action-client";

describe("actionClient", () => {
  it("returns data on successful action", async () => {
    const action = actionClient
      .inputSchema(z.object({ name: z.string() }))
      .action(async ({ parsedInput }) => ({
        greeting: `Hello ${parsedInput.name}`,
      }));

    const result = await action({ name: "World" });
    expect(result?.data).toEqual({ greeting: "Hello World" });
  });

  it("returns validationErrors when input is invalid", async () => {
    const action = actionClient
      .inputSchema(z.object({ name: z.string() }))
      .action(async ({ parsedInput }) => parsedInput);

    // @ts-expect-error intentionally passing wrong input type
    const result = await action({ name: 42 });
    expect(result?.validationErrors).toBeDefined();
    expect(result?.data).toBeUndefined();
  });

  it("returns operational error message for operational AppError", async () => {
    const action = actionClient.inputSchema(z.object({})).action(async () => {
      throw new NotFoundError("Record");
    });

    const result = await action({});
    expect(result?.serverError).toBe("Record not found");
    expect(result?.data).toBeUndefined();
  });

  it("returns generic message for non-operational AppError", async () => {
    const action = actionClient.inputSchema(z.object({})).action(async () => {
      throw new DatabaseError("findUser", new Error("connection refused"));
    });

    const result = await action({});
    expect(result?.serverError).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });

  it("returns generic message for plain Error", async () => {
    const action = actionClient.inputSchema(z.object({})).action(async () => {
      throw new Error("unexpected crash");
    });

    const result = await action({});
    expect(result?.serverError).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
