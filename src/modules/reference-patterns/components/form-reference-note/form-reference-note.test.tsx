import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { FormReferenceNote } from "./form-reference-note";

function createProps() {
  return {
    description:
      "Submit a short note to see the container → hook → action → schema flow with a minimal client boundary.",
    emptyPreviewDescription:
      "Submit the form to see the validated payload come back from the server.",
    emptyPreviewTitle: "No preview yet",
    fieldErrors: {},
    heading: "Interactive example: action-backed note preview",
    helperText:
      "This form uses a client container plus hook and submits to a server action validated by Zod.",
    isSubmitting: false,
    message: "",
    messageLabel: "Message",
    messagePlaceholder: "Describe what changed and why it matters",
    onMessageChange: vi.fn(),
    onSubmit: vi.fn(async () => undefined),
    onTitleChange: vi.fn(),
    previewDescription:
      "The box below renders the normalized data returned from the server action.",
    previewHeading: "Last submitted preview",
    submitLabel: "Generate preview",
    submittingLabel: "Generating preview...",
    title: "",
    titleLabel: "Title",
    titlePlaceholder: "Summarize the change in one line",
  };
}

describe("FormReferenceNote", () => {
  it("renders the form labels and submit button", () => {
    renderWithProviders(<FormReferenceNote {...createProps()} />);

    expect(screen.getByLabelText("Title")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate preview" }),
    ).toBeInTheDocument();
  });

  it("calls change and submit handlers", () => {
    const props = createProps();

    renderWithProviders(<FormReferenceNote {...props} />);

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Release note" },
    });
    fireEvent.change(screen.getByLabelText("Message"), {
      target: { value: "Ship cleaner UI states" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Generate preview" }));

    expect(props.onTitleChange).toHaveBeenCalledWith("Release note");
    expect(props.onMessageChange).toHaveBeenCalledWith(
      "Ship cleaner UI states",
    );
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });

  it("renders field errors and submitted preview data", () => {
    renderWithProviders(
      <FormReferenceNote
        {...createProps()}
        fieldErrors={{
          message: ["Message is required"],
          title: ["Title is required"],
        }}
        serverError="An unexpected error occurred. Please try again."
        submittedMessage="Ship cleaner UI states"
        submittedTitle="Release note"
        submittedWordCountLabel="Word count: 4"
      />,
    );

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(screen.getByText("Message is required")).toBeInTheDocument();
    expect(
      screen.getByText("An unexpected error occurred. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByText("Release note")).toBeInTheDocument();
    expect(screen.getByText("Word count: 4")).toBeInTheDocument();
  });
});
