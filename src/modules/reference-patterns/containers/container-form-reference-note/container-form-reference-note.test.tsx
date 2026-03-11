import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { ContainerFormReferenceNote } from "./container-form-reference-note";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/modules/reference-patterns/hooks/use-reference-note-form", () => ({
  useReferenceNoteForm: () => ({
    fieldErrors: {},
    handleChangeMessage: vi.fn(),
    handleChangeTitle: vi.fn(),
    handleSubmit: vi.fn(async () => undefined),
    isSubmitting: false,
    message: "",
    title: "",
  }),
}));

describe("ContainerFormReferenceNote", () => {
  it("renders translated form labels", () => {
    renderWithProviders(<ContainerFormReferenceNote />);

    expect(screen.getByLabelText("titleLabel")).toBeInTheDocument();
    expect(screen.getByLabelText("messageLabel")).toBeInTheDocument();
  });
});
