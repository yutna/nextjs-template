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
        "  return <Box className={jetBrainsMono.className}>{children}</Box>;",
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
        "  return <Box className={jetBrainsMono.className}>{children}</Box>;",
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
      result.messages.filter(
        ({ ruleId }) => ruleId === "project/no-inline-style",
      ),
    ).toHaveLength(0);
  });

  it("reports inline parameter type literals in implementation files", async () => {
    const result = await lintText(
      [
        'import type { ReactNode } from "react";',
        "",
        "export function CardExample({ children }: { children: ReactNode }) {",
        "  return <div>{children}</div>;",
        "}",
      ].join("\n"),
      resolve(
        PROJECT_ROOT,
        "src/shared/components/card-example/card-example.tsx",
      ),
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "project/no-inline-param-type-literals",
        }),
      ]),
    );
  });

  it("reports inline parameter type literals in staged shared lib implementation files", async () => {
    const result = await lintText(
      [
        "export function run(options: { readonly count: number }) {",
        "  return options.count;",
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/shared/lib/example/example.ts"),
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "project/no-inline-param-type-literals",
        }),
      ]),
    );
  });

  it("allows inline parameter type literals in test files during staged rollout", async () => {
    const result = await lintText(
      [
        'import type { ReactNode } from "react";',
        "",
        "export function CardExample({ children }: { children: ReactNode }) {",
        "  return <div>{children}</div>;",
        "}",
      ].join("\n"),
      resolve(
        PROJECT_ROOT,
        "src/shared/components/card-example/card-example.test.tsx",
      ),
    );

    expect(
      result.messages.filter(
        ({ ruleId }) => ruleId === "project/no-inline-param-type-literals",
      ),
    ).toHaveLength(0);
  });

  it("reports local type declarations in staged shared lib implementation files", async () => {
    const result = await lintText(
      [
        "type ExampleInput = { readonly count: number };",
        "",
        "export function run(input: ExampleInput) {",
        "  return input.count;",
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/shared/lib/example/example.ts"),
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "project/no-local-type-declarations",
        }),
      ]),
    );
  });

  it("allows local type declarations in types.ts files", async () => {
    const result = await lintText(
      [
        "export type ExampleInput = { readonly count: number };",
        "",
        "export interface ExampleOutput {",
        "  readonly count: number;",
        "}",
      ].join("\n"),
      resolve(PROJECT_ROOT, "src/shared/lib/example/types.ts"),
    );

    expect(
      result.messages.filter(
        ({ ruleId }) => ruleId === "project/no-local-type-declarations",
      ),
    ).toHaveLength(0);
  });

  it("reports root-level grab-bag helper files at module root", async () => {
    const result = await lintText(
      ["export function helper() {", '  return "ok";', "}"].join("\n"),
      resolve(PROJECT_ROOT, "src/modules/example/helpers.ts"),
    );

    expect(result.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ruleId: "project/no-root-grab-bag-files",
        }),
      ]),
    );
  });

  it("allows scoped helper files inside domain folders", async () => {
    const result = await lintText(
      ["export function helper() {", '  return "ok";', "}"].join("\n"),
      resolve(
        PROJECT_ROOT,
        "src/modules/example/services/create-example-service/helpers.ts",
      ),
    );

    expect(
      result.messages.filter(
        ({ ruleId }) => ruleId === "project/no-root-grab-bag-files",
      ),
    ).toHaveLength(0);
  });
});
