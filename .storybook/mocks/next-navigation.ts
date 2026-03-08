// Minimal mock of next/navigation for Vitest story tests.
// Provides stub implementations that satisfy next-intl's import requirements.
import { vi } from "vitest";

export const useRouter = vi.fn(() => ({
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

export const usePathname = vi.fn(() => "/");
export const useSearchParams = vi.fn(() => new URLSearchParams());
export const useParams = vi.fn(() => ({}));

export const useSelectedLayoutSegment = vi.fn(() => null);
export const useSelectedLayoutSegments = vi.fn(() => []);

export const notFound = vi.fn();
export const redirect = vi.fn();
export const permanentRedirect = vi.fn();

export enum RedirectType {
  push = "push",
  replace = "replace",
}
