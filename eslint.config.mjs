import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import perfectionist from "eslint-plugin-perfectionist";
import simpleImportSort from "eslint-plugin-simple-import-sort";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // --------------------------------------------------
  // Project rules — enforce AGENTS.md conventions
  // --------------------------------------------------
  {
    plugins: {
      perfectionist,
      "simple-import-sort": simpleImportSort,
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
      // Groups: 1) side-effect  2) external  3) @/ internal  4) ./ local  5) import type
      // Longest regex match wins; ^.+\\u0000$ matches the full string so type imports always win
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            ["^\\u0000"],
            ["^node:", "^@(?!/)\\w", "^\\w"],
            ["^@/"],
            ["^\\."],
            ["^.+\\u0000$"],
          ],
        },
      ],

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
      "no-restricted-syntax": [
        "error",
        {
          message:
            "Direct process.env access is banned. Import from '@/shared/config/env' instead.",
          selector: "MemberExpression[object.name='process'][property.name='env']",
        },
      ],

      // Prefer project logger over console (Logging)
      "no-console": "warn",

      // ------------------------------------------------
      // Sorting — enforce consistent key/prop ordering
      // ------------------------------------------------

      // Disable perfectionist import/export rules (simple-import-sort handles these)
      "perfectionist/sort-exports": "off",
      "perfectionist/sort-imports": "off",
      "perfectionist/sort-named-exports": "off",
      "perfectionist/sort-named-imports": "off",

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
  // Middleware — allow default export
  // --------------------------------------------------
  {
    files: ["src/middleware.ts", "src/proxy.ts"],
    rules: {
      "import/no-default-export": "off",
    },
  },
]);

export default eslintConfig;
