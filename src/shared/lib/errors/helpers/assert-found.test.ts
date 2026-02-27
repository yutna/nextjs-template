import { describe, expect, it } from "vitest";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";

import { assertFound } from "./assert-found";

describe("assertFound", () => {
  it("does not throw when value is defined", () => {
    expect(() => assertFound({ id: 1 }, "User")).not.toThrow();
  });

  it("does not throw for falsy but non-nullish values", () => {
    expect(() => assertFound(0, "Counter")).not.toThrow();
    expect(() => assertFound("", "Label")).not.toThrow();
    expect(() => assertFound(false, "Flag")).not.toThrow();
  });

  it("throws NotFoundError when value is null", () => {
    expect(() => assertFound(null, "User")).toThrowError(NotFoundError);
  });

  it("throws NotFoundError when value is undefined", () => {
    expect(() => assertFound(undefined, "Order")).toThrowError(NotFoundError);
  });

  it("includes resourceName and id in the error message", () => {
    expect(() => assertFound(null, "Product", 42)).toThrowError(/Product.*42/i);
  });
});
