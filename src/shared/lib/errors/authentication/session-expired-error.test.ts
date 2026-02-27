import { describe, expect, it } from "vitest";

import { SessionExpiredError } from "./session-expired-error";

describe("SessionExpiredError", () => {
  it("has statusCode 401, SESSION_EXPIRED code, and is operational", () => {
    const err = new SessionExpiredError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("SESSION_EXPIRED");
    expect(err.message).toBe("Your session has expired. Please log in again.");
    expect(err.isOperational).toBe(true);
  });
});
