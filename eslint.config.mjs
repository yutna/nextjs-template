import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
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
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Import type enforcement (Common Style Guide §3)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],

      // Import sorting — 5-group order (Common Style Guide §3)
      // Groups: 1) side-effect  2) external  3) @/ internal  4) ./ local  5) import type
      // Longest regex match wins; ^.+\\u0000$ matches the full string so type imports always win
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
      "simple-import-sort/exports": "error",

      // Ban parent directory imports (Common Style Guide §3)
      // Ban useState — use useImmer (Hooks §State)
      // Ban framer-motion — use motion/react (Styles §Animation)
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Parent imports (../) are banned. Use @/ alias for cross-directory imports.",
            },
          ],
          paths: [
            {
              name: "react",
              importNames: ["useState"],
              message:
                "useState is banned. Use useImmer from 'use-immer' instead.",
            },
            {
              name: "framer-motion",
              message:
                "framer-motion is renamed. Import from 'motion/react' instead.",
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
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "Direct process.env access is banned. Import from '@/shared/config/env' instead.",
        },
      ],

      // Prefer project logger over console (Logging)
      "no-console": "warn",
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
      "no-restricted-syntax": "off",
      "import/no-default-export": "off",
    },
  },

  // --------------------------------------------------
  // Vendor files — third-party integration wrappers
  // --------------------------------------------------
  {
    files: ["src/shared/vendor/**"],
    rules: {
      "no-restricted-imports": "off",
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
