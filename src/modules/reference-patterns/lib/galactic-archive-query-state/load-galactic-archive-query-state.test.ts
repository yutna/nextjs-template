import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { loadGalacticArchiveQueryState } from "./load-galactic-archive-query-state";

describe("loadGalacticArchiveQueryState", () => {
  it("loads typed query state from incoming search params", () => {
    expect(loadGalacticArchiveQueryState({ search: "Leia", side: "dark" })).toEqual({
      search: "Leia",
      side: "dark",
    });
  });

  it("applies defaults when params are missing or invalid", () => {
    expect(loadGalacticArchiveQueryState({ side: "neutral" })).toEqual({
      search: "",
      side: null,
    });
  });
});
