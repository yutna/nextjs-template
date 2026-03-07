import { describe, expect, it } from "vitest";
import { z } from "zod";

import { isOperationalError } from "@/shared/lib/errors/helpers/is-operational-error";

import { ValidationError } from "./validation-error";

describe("ValidationError", () => {
  it("builds from ZodError", () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(0),
    });
    const result = schema.safeParse({ email: "not-an-email", age: -1 });

    expect(result.success).toBe(false);
    if (!result.success) {
      const err = ValidationError.fromZodError(result.error);
      expect(err.statusCode).toBe(422);
      expect(err.fieldErrors).toHaveProperty("email");
      expect(err.fieldErrors).toHaveProperty("age");
    }
  });

  it("forField creates a single-field error", () => {
    const err = ValidationError.forField("email", "Invalid email");
    expect(err.fieldErrors).toEqual({ email: ["Invalid email"] });
    expect(err.statusCode).toBe(422);
  });

  it("is operational", () => {
    expect(isOperationalError(new ValidationError("bad input"))).toBe(true);
  });
});
