import { GridReferencePatterns } from "./grid-reference-patterns";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  component: GridReferencePatterns,
  parameters: {
    layout: "fullscreen",
  },
  title: "modules/reference-patterns/components/grid-reference-patterns",
} satisfies Meta<typeof GridReferencePatterns>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description:
      "Inspect the exact route, screen, container, hook, action, schema, and i18n files used by this example.",
    heading: "Reference patterns you can inspect in code",
    items: [
      {
        codePath: "src/app/[locale]/(public)/reference-patterns/page.tsx",
        description:
          "Thin page file that unwraps locale params and hands off to a screen.",
        kind: "App Router",
        title: "Route entry",
      },
      {
        codePath:
          "src/modules/reference-patterns/containers/container-form-reference-note/container-form-reference-note.tsx",
        description:
          "Client container that binds the form presenter to a custom hook.",
        kind: "Client container + hook",
        title: "Interactive form boundary",
      },
    ],
  },
};
