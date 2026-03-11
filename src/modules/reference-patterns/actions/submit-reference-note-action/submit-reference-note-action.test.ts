import { describe, expect, it } from "vitest";

import { submitReferenceNoteAction } from "./submit-reference-note-action";

describe("submitReferenceNoteAction", () => {
  it("returns trimmed preview data", async () => {
    const result = await submitReferenceNoteAction({
      message: "  Ship cleaner UI states  ",
      title: "  Release note  ",
    });

    expect(result?.data).toEqual({
      message: "Ship cleaner UI states",
      title: "Release note",
      wordCount: 4,
    });
  });

  it("returns validation errors for blank values", async () => {
    const result = await submitReferenceNoteAction({
      message: "",
      title: "",
    });

    expect(result?.validationErrors).toBeDefined();
    expect(result?.data).toBeUndefined();
  });
});
