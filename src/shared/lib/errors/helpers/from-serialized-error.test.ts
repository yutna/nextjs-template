import { describe, expect, it } from "vitest";

import { NotFoundError } from "@/shared/lib/errors/domain/not-found-error";

import { fromSerializedError } from "./from-serialized-error";

describe("fromSerializedError", () => {
  it("round-trips a serialized error", () => {
    const serialized = new NotFoundError("Order", "abc-123").toJSON();
    expect(fromSerializedError(serialized)).toEqual(serialized);
  });
});
