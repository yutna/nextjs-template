import "@testing-library/jest-dom";

import { vi } from "vitest";

// Suppress known React warnings when rendering async server components in jsdom.
// React client-side rendering does not support async components — these warnings
// are expected and not actual bugs in the stories.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";

  if (msg.includes("async Client Component")) return;
  if (msg.includes("not wrapped in act(")) return;
  if (msg.includes("act` call was not awaited")) return;

  originalConsoleError.call(console, ...args);
};

// jsdom does not implement IntersectionObserver.
// motion/react uses it for whileInView / viewport features.
class IntersectionObserverStub {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);

// jsdom does not implement window.matchMedia.
// next-themes calls it to detect the preferred color scheme.
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  writable: true,
});
