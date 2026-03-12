import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { loadGalacticArchiveQueryState } from "./load-galactic-archive-query-state";
import { loadGalacticArchiveQueryState as loadGalacticArchiveQueryStateFromServer } from "./server";

describe("server entrypoint", () => {
  it("re-exports loadGalacticArchiveQueryState from the implementation module", () => {
    expect(loadGalacticArchiveQueryStateFromServer).toBe(
      loadGalacticArchiveQueryState,
    );
  });
});
