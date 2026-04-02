import { describe, expect, it } from "vitest";

import { isWhitespace, splitText } from "./helpers";

describe("splitText", () => {
  describe("characters mode", () => {
    it("splits text into individual characters", () => {
      expect(splitText("Hello", "characters")).toEqual([
        "H",
        "e",
        "l",
        "l",
        "o",
      ]);
    });

    it("preserves spaces as characters", () => {
      expect(splitText("Hi there", "characters")).toEqual([
        "H",
        "i",
        " ",
        "t",
        "h",
        "e",
        "r",
        "e",
      ]);
    });

    it("handles empty string", () => {
      expect(splitText("", "characters")).toEqual([]);
    });
  });

  describe("words mode", () => {
    it("splits text into words preserving whitespace", () => {
      expect(splitText("Hello World", "words")).toEqual([
        "Hello",
        " ",
        "World",
      ]);
    });

    it("handles multiple spaces", () => {
      expect(splitText("Hello  World", "words")).toEqual([
        "Hello",
        "  ",
        "World",
      ]);
    });

    it("handles leading and trailing spaces", () => {
      expect(splitText(" Hello ", "words")).toEqual([" ", "Hello", " "]);
    });

    it("handles single word", () => {
      expect(splitText("Hello", "words")).toEqual(["Hello"]);
    });
  });

  describe("lines mode", () => {
    it("splits text by newlines", () => {
      expect(splitText("Line 1\nLine 2\nLine 3", "lines")).toEqual([
        "Line 1",
        "Line 2",
        "Line 3",
      ]);
    });

    it("filters out empty lines", () => {
      expect(splitText("Line 1\n\nLine 3", "lines")).toEqual([
        "Line 1",
        "Line 3",
      ]);
    });

    it("handles text without newlines", () => {
      expect(splitText("Single line", "lines")).toEqual(["Single line"]);
    });
  });
});

describe("isWhitespace", () => {
  it("returns true for single space", () => {
    expect(isWhitespace(" ")).toBe(true);
  });

  it("returns true for multiple spaces", () => {
    expect(isWhitespace("   ")).toBe(true);
  });

  it("returns true for tab", () => {
    expect(isWhitespace("\t")).toBe(true);
  });

  it("returns true for newline", () => {
    expect(isWhitespace("\n")).toBe(true);
  });

  it("returns true for mixed whitespace", () => {
    expect(isWhitespace(" \t\n ")).toBe(true);
  });

  it("returns false for non-whitespace", () => {
    expect(isWhitespace("hello")).toBe(false);
  });

  it("returns false for mixed content", () => {
    expect(isWhitespace(" hello ")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isWhitespace("")).toBe(false);
  });
});
