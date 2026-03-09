// Minimal mock of next-intl/navigation for Vitest story tests.
// Provides stub `createNavigation` that returns no-op navigation helpers.
import { vi } from "vitest";

export function createNavigation() {
  return {
    getPathname: vi.fn(() => "/"),
    Link: vi.fn(({ children }: { children: React.ReactNode }) => children),
    redirect: vi.fn(),
    usePathname: vi.fn(() => "/"),
    useRouter: vi.fn(() => ({
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    })),
  };
}
