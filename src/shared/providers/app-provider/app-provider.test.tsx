import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { AppProvider } from "./app-provider";

const mockNextIntlClientProvider = vi.hoisted(() =>
  vi.fn(({ children }: { children: unknown }) => children),
);

vi.mock("next-intl", () => ({
  NextIntlClientProvider: mockNextIntlClientProvider,
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock("nuqs/adapters/next/app", () => ({
  NuqsAdapter: ({ children }: { children: unknown }) => children,
}));

vi.mock("@/shared/vendor/chakra-ui/provider", () => ({
  Provider: ({ children }: { children: unknown }) => children,
}));

vi.mock("@/shared/vendor/chakra-ui/toaster", () => ({
  Toaster: () => null,
}));

const defaultProps = {
  locale: "en",
  messages: { hello: "world" },
  now: new Date("2024-01-01T00:00:00Z"),
  timeZone: "UTC",
};

describe("AppProvider", () => {
  it("renders children", () => {
    const { getByText } = renderWithProviders(
      <AppProvider {...defaultProps}>
        <span>Test Child</span>
      </AppProvider>,
    );

    expect(getByText("Test Child")).toBeInTheDocument();
  });

  it("passes locale and messages to NextIntlClientProvider", () => {
    renderWithProviders(
      <AppProvider {...defaultProps}>
        <span>Child</span>
      </AppProvider>,
    );

    expect(mockNextIntlClientProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        locale: "en",
        messages: { hello: "world" },
      }),
      undefined,
    );
  });
});
