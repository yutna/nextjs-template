import { describe, expect, it, vi } from "vitest";

// next-intl/navigation depends on Next.js runtime internals unavailable in
// jsdom. Mock createNavigation to return predictable, testable functions.
vi.mock("next-intl/navigation", () => ({
  createNavigation: () => ({
    // Minimal React component stand-in
    Link: (props: Record<string, unknown>) => props,
    // Pure function: resolve href to a plain pathname string
    getPathname: ({ href }: { href: string | { pathname: string } }): string =>
      typeof href === "string" ? href : href.pathname,
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
  }),
}));

import {
  getPathname,
  Link,
  redirect,
  usePathname,
  useRouter,
} from "./navigation";

describe("navigation", () => {
  describe("exports", () => {
    it("exports Link component", () => {
      expect(Link).toBeDefined();
      expect(typeof Link).toBe("function");
    });

    it("exports getPathname function", () => {
      expect(getPathname).toBeDefined();
      expect(typeof getPathname).toBe("function");
    });

    it("exports redirect function", () => {
      expect(redirect).toBeDefined();
      expect(typeof redirect).toBe("function");
    });

    it("exports usePathname hook", () => {
      expect(usePathname).toBeDefined();
      expect(typeof usePathname).toBe("function");
    });

    it("exports useRouter hook", () => {
      expect(useRouter).toBeDefined();
      expect(typeof useRouter).toBe("function");
    });
  });

  describe("getPathname", () => {
    it("returns the pathname for 'en' locale", () => {
      const result = getPathname({ href: "/about", locale: "en" });
      expect(result).toBe("/about");
    });

    it("returns the pathname for 'th' locale", () => {
      const result = getPathname({ href: "/about", locale: "th" });
      expect(result).toBe("/about");
    });

    it("handles root path", () => {
      const result = getPathname({ href: "/", locale: "en" });
      expect(result).toBe("/");
    });

    it("handles nested path", () => {
      const result = getPathname({
        href: "/dashboard/settings",
        locale: "en",
      });
      expect(result).toBe("/dashboard/settings");
    });

    it("handles href as object with pathname", () => {
      const result = getPathname({
        href: { pathname: "/profile" },
        locale: "en",
      });
      expect(result).toBe("/profile");
    });
  });
});
