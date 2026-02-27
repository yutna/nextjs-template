import { describe, expect, it } from "vitest";

import { delay, isNetworkError } from "./helpers";

describe("isNetworkError", () => {
  it("returns true for TypeError with 'Failed to fetch' message", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
  });

  it("returns false for TypeError with a different message", () => {
    expect(
      isNetworkError(new TypeError("Cannot read properties of null")),
    ).toBe(false);
  });

  it("returns false for a regular Error", () => {
    expect(isNetworkError(new Error("Failed to fetch"))).toBe(false);
  });

  it("returns false for a string", () => {
    expect(isNetworkError("Failed to fetch")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNetworkError(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isNetworkError(undefined)).toBe(false);
  });
});

describe("delay", () => {
  it("resolves after the specified number of milliseconds", async () => {
    const start = Date.now();
    await delay(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it("resolves immediately for 0ms", async () => {
    await expect(delay(0)).resolves.toBeUndefined();
  });

  it("returns a Promise", () => {
    const result = delay(0);
    expect(result).toBeInstanceOf(Promise);
  });
});
