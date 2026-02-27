import { describe, expect, it } from "vitest";
import { z } from "zod";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";

import { authActionClient } from "./auth-action-client";

describe("authActionClient", () => {
  it("passes through and returns data on successful action", async () => {
    const action = authActionClient
      .inputSchema(z.object({ id: z.number() }))
      .action(async ({ parsedInput }) => ({ id: parsedInput.id }));

    const result = await action({ id: 1 });
    expect(result?.data).toEqual({ id: 1 });
  });

  it("applies handleServerError from base actionClient", async () => {
    const action = authActionClient
      .inputSchema(z.object({}))
      .action(async () => {
        throw new NotFoundError("Item");
      });

    const result = await action({});
    expect(result?.serverError).toBe("Item not found");
  });

  it("returns validationErrors when input is invalid", async () => {
    const action = authActionClient
      .inputSchema(z.object({ id: z.number() }))
      .action(async ({ parsedInput }) => parsedInput);

    // @ts-expect-error intentionally passing wrong input type
    const result = await action({ id: "not-a-number" });
    expect(result?.validationErrors).toBeDefined();
    expect(result?.data).toBeUndefined();
  });
});
