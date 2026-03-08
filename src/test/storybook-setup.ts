import "@testing-library/jest-dom";

import { vi } from "vitest";

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
