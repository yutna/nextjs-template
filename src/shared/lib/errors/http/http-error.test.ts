import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";
import { isAppError } from "@/shared/lib/errors/helpers/is-app-error";

import { HttpError } from "./http-error";
import { FetchError } from "./fetch-error";

// HttpError is abstract — test through FetchError as a concrete subclass
function makeFetchError(status: number): FetchError {
  return new FetchError({
    url: "/test",
    method: "GET",
    response: new Response(null, { status, statusText: "Test" }),
  });
}

describe("HttpError", () => {
  it("is instanceof AppError", () => {
    expect(makeFetchError(400)).toBeInstanceOf(AppError);
  });

  it("is instanceof HttpError", () => {
    expect(makeFetchError(400)).toBeInstanceOf(HttpError);
  });

  it("is instanceof Error", () => {
    expect(makeFetchError(400)).toBeInstanceOf(Error);
  });

  it("is detected by isAppError helper", () => {
    expect(isAppError(makeFetchError(400))).toBe(true);
  });

  it("allows variable statusCode — not locked to 500", () => {
    expect(makeFetchError(404).statusCode).toBe(404);
    expect(makeFetchError(401).statusCode).toBe(401);
    expect(makeFetchError(500).statusCode).toBe(500);
  });

  it("allows variable isOperational — not locked to false", () => {
    expect(makeFetchError(400).isOperational).toBe(true);
    expect(makeFetchError(500).isOperational).toBe(false);
  });
});
