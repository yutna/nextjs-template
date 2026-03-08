import { describe, expect, it } from "vitest";

import { NotFoundError } from "./not-found-error";

describe("NotFoundError", () => {
  it("has correct statusCode and code", () => {
    const err = new NotFoundError("User", 42);
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe('User with id "42" not found');
    expect(err.isOperational).toBe(true);
  });

  it("accepts a custom code", () => {
    expect(new NotFoundError("User", 1, "USER_NOT_FOUND").code).toBe(
      "USER_NOT_FOUND",
    );
  });

  it("works without an id", () => {
    expect(new NotFoundError("Order").message).toBe("Order not found");
  });

  it("serializes cleanly", () => {
    const json = new NotFoundError("Order", "abc-123").toJSON();
    expect(json).toMatchObject({
      isOperational: true,
      name: "NotFoundError",
      statusCode: 404,
    });
    expect(json).not.toHaveProperty("stack");
  });
});
