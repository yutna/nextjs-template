import { describe, expect, it } from "vitest";

import { galacticArchiveQueryParsers } from "./galactic-archive-query-state";

describe("galacticArchiveQueryParsers", () => {
  it("defaults the search query to an empty string", () => {
    expect(galacticArchiveQueryParsers.search.parseServerSide(undefined)).toBe("");
  });

  it("parses allowed side values and rejects unknown ones", () => {
    expect(galacticArchiveQueryParsers.side.parseServerSide("dark")).toBe("dark");
    expect(galacticArchiveQueryParsers.side.parseServerSide("neutral")).toBeNull();
  });
});
