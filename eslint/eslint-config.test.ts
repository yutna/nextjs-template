import { ESLint } from "eslint";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PROJECT_ROOT = resolve(import.meta.dirname, "..");

async function lintText(code: string, filePath: string, fix = false) {
  const eslint = new ESLint({
    cwd: PROJECT_ROOT,
    fix,
  });

  const [result] = await eslint.lintText(code, {
    filePath,
  });

  return result;
}

describe("eslint config", () => {
  it("keeps internal CSS side effects with the @/ import group", async () => {
    const result = await lintText(
      [
        'import "@/shared/styles/scrollbar.css";',
        'import { Box } from "@chakra-ui/react";',
        'import "server-only";',
        'import "@testing-library/jest-dom";',
        'import { jetBrainsMono } from "@/shared/config/fonts";',
        'import type { ReactNode } from "react";',
        "",
        "export function Example({ children }: { children: ReactNode }) {",
        '  return <Box className={jetBrainsMono.className}>{children}</Box>;',
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/shared/components/example/example.tsx"),
      true,
    );

    expect(result.output?.trim()).toBe(
      [
        'import "server-only";',
        "",
        'import { Box } from "@chakra-ui/react";',
        'import "@testing-library/jest-dom";',
        "",
        'import { jetBrainsMono } from "@/shared/config/fonts";',
        'import "@/shared/styles/scrollbar.css";',
        "",
        'import type { ReactNode } from "react";',
        "",
        "export function Example({ children }: { children: ReactNode }) {",
        '  return <Box className={jetBrainsMono.className}>{children}</Box>;',
        "}",
      ].join("\n"),
    );
  });

  it("reports inline styles in global-error without the documented exception comment", async () => {
    const result = await lintText(
      [
        '"use client";',
        "",
        "export default function GlobalError() {",
        "  return (",
        '    <html lang="en">',
        "      <body style={{ margin: 0 }} />",
        "    </html>",
        "  );",
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/app/global-error.tsx"),
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "project/no-inline-style",
        }),
      ]),
    );
  });

  it("allows the documented inline-style exception comment in global-error", async () => {
    const result = await lintText(
      [
        '"use client";',
        "",
        "export default function GlobalError() {",
        "  return (",
        '    <html lang="en">',
        "      {/* eslint-disable-next-line project/no-inline-style -- global-error renders outside all providers; inline style is the only way to reset body margin */}",
        "      <body style={{ margin: 0 }} />",
        "    </html>",
        "  );",
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/app/global-error.tsx"),
    );

    expect(
      result.messages.filter(({ ruleId }) => ruleId === "project/no-inline-style"),
    ).toHaveLength(0);
  });
});
