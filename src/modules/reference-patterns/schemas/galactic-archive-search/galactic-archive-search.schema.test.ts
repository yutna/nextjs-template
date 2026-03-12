import { describe, expect, it } from "vitest";

import { galacticArchiveSearchSchema } from "./galactic-archive-search.schema";

describe("galacticArchiveSearchSchema", () => {
  it("accepts a query within the allowed length range", () => {
    const result = galacticArchiveSearchSchema.safeParse({ query: "Luke" });

    expect(result.success).toBe(true);
  });

  it("rejects a query shorter than 2 characters after trimming", () => {
    const result = galacticArchiveSearchSchema.safeParse({ query: "L" });

    expect(result.success).toBe(false);
  });

  it("trims whitespace before validating the length", () => {
    const result = galacticArchiveSearchSchema.safeParse({ query: "  L  " });

    expect(result.success).toBe(false);
  });
});
