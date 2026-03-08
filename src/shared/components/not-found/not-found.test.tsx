import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import { NotFound } from "./not-found";

import type { ReactNode } from "react";

vi.mock("server-only", () => ({}));

vi.mock("next-intl/server", () => ({
  getLocale: vi.fn(() => "en"),
  getTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock("@/shared/lib/navigation", () => ({
  Link: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/shared/routes", () => ({
  routes: { root: { path: () => "/" } },
}));

vi.mock("./button-go-back-client", () => ({
  ButtonGoBackClient: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
}));

describe("NotFound", () => {
  it("renders the 404 text and translated heading", async () => {
    renderWithProviders(await NotFound());

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("heading")).toBeInTheDocument();
  });

  it("renders translated description and action buttons", async () => {
    renderWithProviders(await NotFound());

    expect(screen.getByText("description")).toBeInTheDocument();
    expect(screen.getByText("goBack")).toBeInTheDocument();
    expect(screen.getByText("goHome")).toBeInTheDocument();
  });

  it("renders a home link pointing to the root path", async () => {
    renderWithProviders(await NotFound());

    const link = screen.getByText("goHome").closest("a");
    expect(link).toHaveAttribute("href", "/");
  });
});
