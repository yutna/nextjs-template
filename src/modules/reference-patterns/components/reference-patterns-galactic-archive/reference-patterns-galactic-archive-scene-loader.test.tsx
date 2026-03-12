import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "@/test/render-with-providers";

import type { DynamicOptions, Loader } from "next/dynamic";
import type { ReferencePatternsGalacticArchiveSceneProps } from "@/modules/reference-patterns/components/reference-patterns-galactic-archive-scene";

// Capture what dynamic() receives before the module under test is evaluated.
type DynamicCallArgs = [
  Loader<ReferencePatternsGalacticArchiveSceneProps>,
  DynamicOptions<ReferencePatternsGalacticArchiveSceneProps> | undefined,
];
const capturedCall = vi.hoisted((): { args: DynamicCallArgs | null } => ({ args: null }));

vi.mock("next/dynamic", () => ({
  default: (
    loader: DynamicCallArgs[0],
    options?: DynamicCallArgs[1],
  ) => {
    capturedCall.args = [loader, options];
    return () => null;
  },
}));

// Stub the scene module so the factory resolves without three.js dependencies.
vi.mock(
  "@/modules/reference-patterns/components/reference-patterns-galactic-archive-scene",
  () => ({
    ReferencePatternsGalacticArchiveScene: function ReferencePatternsGalacticArchiveScene() {
      return null;
    },
  }),
);

// Import after mocks are established.
// eslint-disable-next-line import/first
import { ReferencePatternsGalacticArchiveSceneLoader } from "./reference-patterns-galactic-archive-scene-loader";

describe("ReferencePatternsGalacticArchiveSceneLoader", () => {
  it("is a component (dynamic() return value is consumed by the module)", () => {
    expect(typeof ReferencePatternsGalacticArchiveSceneLoader).toBe("function");
  });

  it("disables SSR", () => {
    expect(capturedCall.args).not.toBeNull();
    expect(capturedCall.args![1]?.ssr).toBe(false);
  });

  it("provides an aria-hidden div as the loading fallback", () => {
    const Loading = capturedCall.args![1]?.loading;
    expect(Loading).toBeDefined();
    const { container } = renderWithProviders(
      <>{Loading!({ pastDelay: true })}</>,
    );
    expect(container.firstChild).toHaveAttribute("aria-hidden");
  });

  it("factory resolves to ReferencePatternsGalacticArchiveScene from the scene module", async () => {
    const factory = capturedCall.args![0] as () => Promise<unknown>;
    const resolved = await factory();
    expect(typeof resolved).toBe("function");
    expect((resolved as { name: string }).name).toBe(
      "ReferencePatternsGalacticArchiveScene",
    );
  });
});
