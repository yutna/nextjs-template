import { describe, expect, it } from "vitest";

import { AppError } from "./app-error";

class TestError extends AppError {
  constructor() {
    super({
      code: "TEST_ERROR",
      isOperational: true,
      message: "I'm a teapot",
      statusCode: 418,
    });
  }
}

class TestInfraError extends AppError {
  constructor() {
    super({
      code: "INFRA_ERROR",
      isOperational: false,
      message: "System failure",
      statusCode: 500,
    });
  }
}

describe("AppError", () => {
  it("sets all fields from constructor options", () => {
    const err = new TestError();
    expect(err.code).toBe("TEST_ERROR");
    expect(err.statusCode).toBe(418);
    expect(err.message).toBe("I'm a teapot");
    expect(err.isOperational).toBe(true);
    expect(err.name).toBe("TestError");
  });

  it("defaults isOperational to false when not provided", () => {
    expect(new TestInfraError().isOperational).toBe(false);
  });

  it("is instanceof Error", () => {
    expect(new TestError()).toBeInstanceOf(Error);
  });

  it("toJSON returns a plain object without stack", () => {
    const json = new TestError().toJSON();
    expect(json).toMatchObject({
      code: "TEST_ERROR",
      isOperational: true,
      message: "I'm a teapot",
      name: "TestError",
      statusCode: 418,
    });
    expect(json).not.toHaveProperty("stack");
  });

  it("toJSON includes digest when set", () => {
    const err = new TestError();
    err.digest = "abc123";
    expect(err.toJSON().digest).toBe("abc123");
  });

  it("toString returns formatted string", () => {
    expect(new TestError().toString()).toBe(
      "[TestError] TEST_ERROR: I'm a teapot",
    );
  });

  it("preserves cause", () => {
    const cause = new Error("original");
    class CauseError extends AppError {
      constructor() {
        super({ cause, code: "X", message: "wrapped", statusCode: 500 });
      }
    }
    expect(new CauseError().cause).toBe(cause);
  });
});
