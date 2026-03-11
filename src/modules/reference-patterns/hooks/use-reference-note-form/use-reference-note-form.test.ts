import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSubmitReferenceNoteAction = vi.hoisted(() => vi.fn());

vi.mock("next-intl", () => ({
  useTranslations: () =>
    (key: string, values?: { count?: number }) => {
      if (key === "wordCount") {
        return `Word count: ${values?.count ?? 0}`;
      }

      if (key === "unexpectedError") {
        return "Something went wrong while preparing the preview.";
      }

      return key;
    },
}));
vi.mock("@/modules/reference-patterns/actions/submit-reference-note-action", () => ({
  submitReferenceNoteAction: mockSubmitReferenceNoteAction,
}));

import { useReferenceNoteForm } from "./use-reference-note-form";

describe("useReferenceNoteForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates title and message state", () => {
    const { result } = renderHook(() => useReferenceNoteForm());

    act(() => {
      result.current.handleChangeTitle("Release note");
      result.current.handleChangeMessage("Ship cleaner UI states");
    });

    expect(result.current.title).toBe("Release note");
    expect(result.current.message).toBe("Ship cleaner UI states");
  });

  it("stores submitted preview data on success", async () => {
    mockSubmitReferenceNoteAction.mockResolvedValue({
      data: {
        message: "Ship cleaner UI states",
        title: "Release note",
        wordCount: 4,
      },
    });

    const { result } = renderHook(() => useReferenceNoteForm());

    act(() => {
      result.current.handleChangeTitle("Release note");
      result.current.handleChangeMessage("Ship cleaner UI states");
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockSubmitReferenceNoteAction).toHaveBeenCalledWith({
      message: "Ship cleaner UI states",
      title: "Release note",
    });
    expect(result.current.submittedTitle).toBe("Release note");
    expect(result.current.submittedMessage).toBe("Ship cleaner UI states");
    expect(result.current.submittedWordCountLabel).toBe("Word count: 4");
    expect(result.current.title).toBe("");
    expect(result.current.message).toBe("");
  });

  it("maps validation errors into fieldErrors", async () => {
    mockSubmitReferenceNoteAction.mockResolvedValue({
      validationErrors: {
        message: { _errors: ["Message is required"] },
        title: { _errors: ["Title is required"] },
      },
    });

    const { result } = renderHook(() => useReferenceNoteForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.fieldErrors).toEqual({
      message: ["Message is required"],
      title: ["Title is required"],
    });
  });

  it("stores server errors", async () => {
    mockSubmitReferenceNoteAction.mockResolvedValue({
      serverError: "An unexpected error occurred. Please try again.",
    });

    const { result } = renderHook(() => useReferenceNoteForm());

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(result.current.serverError).toBe(
      "An unexpected error occurred. Please try again.",
    );
  });
});
