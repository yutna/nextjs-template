/**
 * Storybook stories smoke test.
 *
 * Auto-discovers every *.stories.tsx file in the project, composes each
 * exported story with Storybook project annotations (providers, decorators),
 * and renders it. If a story crashes during render the test fails — preventing
 * broken stories from going unnoticed.
 *
 * This test runs in the "storybook" Vitest project which provides Vite aliases
 * for `server-only` and `next-intl/server` (same mocks Storybook uses).
 */

/// <reference types="vite/client" />

import * as previewAnnotations from "@storybook-preview";
import { composeStories, setProjectAnnotations } from "@storybook/react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

setProjectAnnotations([previewAnnotations]);

afterEach(() => {
  cleanup();
});

const storyModules = import.meta.glob("../**/*.stories.tsx", {
  eager: true,
}) as Record<string, Record<string, unknown>>;

for (const [filePath, mod] of Object.entries(storyModules)) {
  const displayPath = filePath.replace(/^\.\.\//, "src/");

  describe(displayPath, () => {
    let stories: Record<string, React.ComponentType>;
    let composeFailed = false;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- CSF module shape is dynamic
      stories = composeStories(mod as any) as unknown as Record<
        string,
        React.ComponentType
      >;
    } catch {
      composeFailed = true;
      stories = {};
    }

    if (composeFailed) {
      it("composeStories", () => {
        expect.fail(
          `composeStories() threw for ${displayPath}. ` +
            "Check that the story file has a valid default meta export.",
        );
      });
    }

    const entries = Object.entries(stories);

    if (!composeFailed && entries.length === 0) {
      it("has at least one story", () => {
        expect.fail(
          `No composed stories found in ${displayPath}. ` +
            "Ensure the file exports at least one named story.",
        );
      });
    }

    for (const [storyName, StoryFn] of entries) {
      it(`${storyName} renders without error`, () => {
        // render() throws on crashes (bad imports, missing deps, runtime errors).
        // Async server components may render empty containers in jsdom since
        // React client-side rendering does not support async components —
        // that is expected and not a story defect.
        render(<StoryFn />);
      });
    }
  });
}
