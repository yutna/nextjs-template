import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import checkFile from "eslint-plugin-check-file";
import importPlugin from "eslint-plugin-import";
import jsonc from "eslint-plugin-jsonc";
import perfectionist from "eslint-plugin-perfectionist";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";

import localPlugin from "./eslint/local-plugin.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
  // --------------------------------------------------
  // Project rules — enforce AGENTS.md conventions
  // --------------------------------------------------
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    plugins: {
      "check-file": checkFile,
      import: importPlugin,
      perfectionist,
      "project": localPlugin,
    },
    rules: {
      // Import type enforcement (Common Style Guide §3)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          disallowTypeAnnotations: false,
          fixStyle: "separate-type-imports",
          prefer: "type-imports",
        },
      ],

      // Import sorting — 5-group order (Common Style Guide §3)
      // 1) import "server-only"
      // 2) external value imports and package side-effect imports
      // 3) @/ internal value imports and internal side-effect imports
      // 4) ./ local value imports and local side-effect imports
      // 5) import type statements (sorted external → @/ → ./)
      "project/sort-imports": "error",

      // Ban parent directory imports (Common Style Guide §3)
      // Ban useState — use useImmer (Hooks §State)
      // Ban framer-motion — use motion/react (Styles §Animation)
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              importNames: ["useState"],
              message:
                "useState is banned. Use useImmer from 'use-immer' instead.",
              name: "react",
            },
            {
              message:
                "framer-motion is renamed. Import from 'motion/react' instead.",
              name: "framer-motion",
            },
          ],
          patterns: [
            {
              group: ["../*"],
              message:
                "Parent imports (../) are banned. Use @/ alias for cross-directory imports.",
            },
          ],
        },
      ],

      // Named exports by default (Common Style Guide §4)
      "import/no-default-export": "error",

      // Ban ad hoc process.env reads (Common Style Guide §9)
      // Ban React namespace access — use named/type imports instead
      "no-restricted-syntax": [
        "error",
        {
          message:
            "Direct process.env access is banned. Import from '@/shared/config/env' instead.",
          selector:
            "MemberExpression[object.name='process'][property.name='env']",
        },
        {
          message:
            "React namespace access is banned. Use named imports instead: import type { CSSProperties } from 'react'.",
          selector: "MemberExpression[object.name='React']",
        },
      ],

      // Prefer project logger over console (Logging)
      "no-console": "warn",

      // ------------------------------------------------
      // Type safety
      // ------------------------------------------------

      // Ban explicit any (Common Style Guide §1)
      "@typescript-eslint/no-explicit-any": "error",

      // ------------------------------------------------
      // Project-specific rules (eslint/local-plugin.mjs)
      // ------------------------------------------------

      // Enforce on* prefix for event callback props in *Props interfaces (Event naming)
      "project/enforce-event-prop-naming": "error",

      // Enforce handle* prefix for handler identifiers in on* JSX props (Event naming)
      "project/enforce-handler-naming": "error",

      // Forbid imports between feature modules (Architecture)
      "project/no-cross-module-import": "error",

      // Enforce layer boundary: components cannot import from containers,
      // screens, hooks, actions, contexts, or providers (Architecture)
      "project/no-upward-layer-import": "error",

      // Forbid spreading hook return values in JSX (Props)
      "project/no-hook-spread": "error",

      // Forbid inline style attribute in JSX (Styles)
      "project/no-inline-style": "error",

      // Enforce naming patterns for files in specific folders (Architecture)
      "project/enforce-file-naming-pattern": "error",

      // ------------------------------------------------
      // File and directory naming (Common Style Guide §2)
      // ------------------------------------------------

      "check-file/filename-naming-convention": [
        "error",
        { "**/*.{ts,tsx,js,jsx,mjs,cjs}": "KEBAB_CASE" },
        { ignoreMiddleExtensions: true },
      ],
      "check-file/folder-naming-convention": [
        "error",
        {
          "bin/**/": "KEBAB_CASE",
          "eslint/**/": "KEBAB_CASE",
          "src/messages/**/": "KEBAB_CASE",
          "src/modules/**/": "KEBAB_CASE",
          "src/shared/**/": "KEBAB_CASE",
          "src/test/**/": "KEBAB_CASE",
        },
      ],

      // ------------------------------------------------
      // Sorting — enforce consistent key/prop ordering
      // ------------------------------------------------

      // Disable perfectionist import rules (project/sort-imports handles declaration order)
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-exports": "off",
      "perfectionist/sort-named-imports": "off",

      // Export sorting — value exports first, type exports last
      // perfectionist/sort-exports enforces type-after-value grouping
      "perfectionist/sort-exports": [
        "error",
        {
          groups: ["value-export", "type-export"],
          newlinesBetween: 1,
          order: "asc",
          type: "natural",
        },
      ],

      // Object keys + destructuring (natural alphabetical)
      "perfectionist/sort-objects": [
        "error",
        {
          order: "asc",
          partitionByComment: true,
          partitionByNewLine: true,
          type: "natural",
        },
      ],

      // JSX props
      "perfectionist/sort-jsx-props": [
        "error",
        {
          order: "asc",
          type: "natural",
        },
      ],

      // TypeScript interfaces
      "perfectionist/sort-interfaces": [
        "error",
        {
          order: "asc",
          partitionByNewLine: true,
          type: "natural",
        },
      ],

      // TypeScript object types
      "perfectionist/sort-object-types": [
        "error",
        {
          order: "asc",
          partitionByNewLine: true,
          type: "natural",
        },
      ],

      // TypeScript union types
      "perfectionist/sort-union-types": [
        "error",
        {
          order: "asc",
          type: "natural",
        },
      ],

      // TypeScript intersection types
      "perfectionist/sort-intersection-types": [
        "error",
        {
          order: "asc",
          type: "natural",
        },
      ],

      // TypeScript enums
      "perfectionist/sort-enums": [
        "error",
        {
          order: "asc",
          type: "natural",
        },
      ],
    },
  },
  // --------------------------------------------------
  // Next.js convention files — allow default exports
  // --------------------------------------------------
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/layout.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/error.tsx",
      "src/app/**/global-error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/template.tsx",
      "src/app/**/default.tsx",
      "src/app/**/route.ts",
      "src/app/**/opengraph-image.tsx",
      "src/app/**/icon.tsx",
      "src/app/**/apple-icon.tsx",
      "src/app/**/sitemap.ts",
      "src/app/**/robots.ts",
      "src/app/**/manifest.ts",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // --------------------------------------------------
  // Config files — allow process.env and default exports
  // --------------------------------------------------
  {
    files: [
      "src/shared/config/**",
      "next.config.ts",
      "vitest.config.mts",
      "eslint.config.mjs",
      "stylelint.config.mjs",
      "src/shared/vendor/**",
    ],
    rules: {
      "import/no-default-export": "off",
      "no-restricted-syntax": "off",
    },
  },
  // --------------------------------------------------
  // Vendor files — third-party integration wrappers
  // --------------------------------------------------
  {
    files: ["src/shared/vendor/**"],
    rules: {
      "no-restricted-imports": "off",
      "perfectionist/sort-jsx-props": "off",
      "perfectionist/sort-objects": "off",
      "project/enforce-event-prop-naming": "off",
      "project/enforce-handler-naming": "off",
      "project/no-hook-spread": "off",
      "project/no-inline-style": "off",
    },
  },
  // --------------------------------------------------
  // Error boundary components — must call reportErrorAction directly
  // because Next.js error boundaries have no parent container layer.
  // --------------------------------------------------
  {
    files: [
      "src/shared/components/error-global/**",
      "src/shared/components/error-app-boundary/**",
    ],
    rules: {
      "project/no-upward-layer-import": "off",
    },
  },
  // --------------------------------------------------
  // Motion components — require inline style for MotionValue objects
  // (motion library design: animated values must be passed via style prop)
  // --------------------------------------------------
  {
    files: [
      "src/shared/components/motion-*/**",
      "src/shared/lib/motion/**",
    ],
    rules: {
      "project/no-inline-style": "off",
    },
  },
  // --------------------------------------------------
  // Infrastructure — allow process.env in bootstrap code
  // --------------------------------------------------
  {
    files: ["src/shared/lib/logger/**"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // --------------------------------------------------
  // Test files — allow console and relaxed restrictions
  // --------------------------------------------------
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**"],
    rules: {
      "no-console": "off",
    },
  },
  // --------------------------------------------------
  // CLI scripts — allow console and process.env
  // --------------------------------------------------
  {
    files: ["bin/**"],
    rules: {
      "no-console": "off",
      "no-restricted-syntax": "off",
    },
  },
  // --------------------------------------------------
  // Claude hooks — CommonJS scripts allow require and console
  // --------------------------------------------------
  {
    files: [".claude/hooks/scripts/**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "off",
    },
  },
  // --------------------------------------------------
  // Local ESLint plugin — requires default export
  // --------------------------------------------------
  {
    files: ["eslint/**"],
    rules: {
      "import/no-anonymous-default-export": "off",
      "import/no-default-export": "off",
    },
  },
  // --------------------------------------------------
  // TypeScript declaration files — allow default exports in module
  // declarations (used to type-declare Vite alias modules)
  // --------------------------------------------------
  {
    files: ["**/*.d.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // --------------------------------------------------
  // Middleware — allow default export
  // --------------------------------------------------
  {
    files: ["src/middleware.ts", "src/proxy.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // --------------------------------------------------
  // JSON files — enforce sorted keys in message files
  // --------------------------------------------------
  {
    files: ["src/messages/**/*.json"],
    language: "jsonc/x",
    plugins: {
      jsonc,
    },
    rules: {
      "jsonc/sort-keys": [
        "error",
        {
          order: { type: "asc" },
          pathPattern: ".*",
        },
      ],
    },
  },
  ...storybook.configs["flat/recommended"],
  // --------------------------------------------------
  // Story files — allow Storybook CSF default export
  // --------------------------------------------------
  {
    files: ["**/*.stories.{ts,tsx,js,jsx,mjs}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // --------------------------------------------------
  // Storybook config — allow relative parent imports
  // --------------------------------------------------
  {
    files: [".storybook/**"],
    rules: {
      "import/no-default-export": "off",
      "no-restricted-imports": "off",
      "no-restricted-syntax": "off",
    },
  },
]);

export default eslintConfig;
