import { describe, expect, it } from "vitest";

import { AppError } from "@/shared/lib/errors/app-error";
import { isAppError } from "@/shared/lib/errors/helpers/is-app-error";
import { isOperationalError } from "@/shared/lib/errors/helpers/is-operational-error";

import { FetchError } from "./fetch-error";
import { HttpError } from "./http-error";

function makeResponse(status: number, statusText: string): Response {
  return new Response(null, { status, statusText });
}

describe("FetchError", () => {
  it("sets statusCode, code, url, method, and message from options", () => {
    const response = makeResponse(404, "Not Found");
    const err = new FetchError({
      url: "https://api.example.com/users/1",
      method: "GET",
      response,
    });

    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("FETCH_ERROR");
    expect(err.url).toBe("https://api.example.com/users/1");
    expect(err.method).toBe("GET");
    expect(err.response).toBe(response);
    expect(err.message).toBe(
      "GET https://api.example.com/users/1 failed with 404 Not Found",
    );
  });

  it("uses custom code when provided", () => {
    const err = new FetchError({
      url: "/items/1",
      method: "GET",
      response: makeResponse(404, "Not Found"),
      code: "ITEM_NOT_FOUND",
    });

    expect(err.code).toBe("ITEM_NOT_FOUND");
  });

  it("is operational for 4xx responses", () => {
    const err = new FetchError({
      url: "/test",
      method: "POST",
      response: makeResponse(422, "Unprocessable Entity"),
    });

    expect(err.isOperational).toBe(true);
    expect(isOperationalError(err)).toBe(true);
  });

  it("is NOT operational for 5xx responses", () => {
    const err = new FetchError({
      url: "/test",
      method: "GET",
      response: makeResponse(500, "Internal Server Error"),
    });

    expect(err.isOperational).toBe(false);
    expect(isOperationalError(err)).toBe(false);
  });

  describe("convenience getters", () => {
    it("isNotFound — true for 404", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(404, "Not Found"),
      });
      expect(err.isNotFound).toBe(true);
      expect(err.isClientError).toBe(true);
      expect(err.isServerError).toBe(false);
    });

    it("isUnauthorized — true for 401", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(401, "Unauthorized"),
      });
      expect(err.isUnauthorized).toBe(true);
    });

    it("isForbidden — true for 403", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(403, "Forbidden"),
      });
      expect(err.isForbidden).toBe(true);
    });

    it("isServerError — true for 500", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(500, "Internal Server Error"),
      });
      expect(err.isServerError).toBe(true);
      expect(err.isClientError).toBe(false);
    });
  });

  describe("AppError / HttpError integration", () => {
    it("is instanceof AppError, HttpError, and FetchError", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(400, "Bad Request"),
      });
      expect(err).toBeInstanceOf(AppError);
      expect(err).toBeInstanceOf(HttpError);
      expect(err).toBeInstanceOf(FetchError);
      expect(err).toBeInstanceOf(Error);
    });

    it("is detected by isAppError helper", () => {
      const err = new FetchError({
        url: "/x",
        method: "GET",
        response: makeResponse(400, "Bad Request"),
      });
      expect(isAppError(err)).toBe(true);
    });

    it("toJSON() returns serialized error without stack", () => {
      const err = new FetchError({
        url: "/x",
        method: "POST",
        response: makeResponse(409, "Conflict"),
      });

      const json = err.toJSON();
      expect(json).toMatchObject({
        name: "FetchError",
        code: "FETCH_ERROR",
        statusCode: 409,
        isOperational: true,
      });
      expect(json).not.toHaveProperty("stack");
    });

    it("toString() follows AppError format", () => {
      const err = new FetchError({
        url: "/x",
        method: "DELETE",
        response: makeResponse(403, "Forbidden"),
      });

      expect(err.toString()).toBe(
        "[FetchError] FETCH_ERROR: DELETE /x failed with 403 Forbidden",
      );
    });
  });
});
