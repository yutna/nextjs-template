import "@testing-library/jest-dom";

import { vi } from "vitest";

// jsdom does not implement IntersectionObserver.
// motion/react (framer-motion) uses it for whileInView / viewport features.
// Provide a no-op stub so component tests that render motion elements don't throw.
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

// ---------------------------------------------------------------------------
// Fail tests that produce unexpected console.error or console.warn (stderr).
// Tests that intentionally trigger warnings must mock the method first:
//   vi.spyOn(console, "error").mockImplementation(() => {})
// ---------------------------------------------------------------------------
const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

beforeEach(() => {
  console.error = (...args: Parameters<typeof console.error>) => {
    originalError(...args);
    throw new Error(
      [
        "Unexpected console.error in test.",
        "Mock it if intentional: vi.spyOn(console, \"error\").mockImplementation(() => {})",
        "",
        String(args[0]),
      ].join("\n"),
    );
  };

  console.warn = (...args: Parameters<typeof console.warn>) => {
    originalWarn(...args);
    throw new Error(
      [
        "Unexpected console.warn in test.",
        "Mock it if intentional: vi.spyOn(console, \"warn\").mockImplementation(() => {})",
        "",
        String(args[0]),
      ].join("\n"),
    );
  };
});
