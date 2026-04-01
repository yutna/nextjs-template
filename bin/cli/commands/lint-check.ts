import { Array as Arr, Effect, pipe } from "effect";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// -------------------------------------------------------------------
// Types
// -------------------------------------------------------------------

interface Violation {
  file: string;
  message: string;
  rule: string;
}

interface CheckResult {
  errors: Violation[];
  name: string;
  warnings: Violation[];
}

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

const PROJECT_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const rel = (absPath: string) => relative(PROJECT_ROOT, absPath);

function walkFiles(dir: string, ext?: string[]): string[] {
  const results: string[] = [];

  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);

      if (entry.name === "node_modules" || entry.name === ".next") continue;

      if (entry.isDirectory()) {
        results.push(...walkFiles(fullPath, ext));
      } else if (!ext || ext.some((e) => entry.name.endsWith(e))) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return results;
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function readFile(path: string): string {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return "";
  }
}

// -------------------------------------------------------------------
// Check: server-only
// -------------------------------------------------------------------

const checkServerOnly = Effect.sync((): CheckResult => {
  const appDir = join(PROJECT_ROOT, "src/app");
  const pages = walkFiles(appDir, ["page.tsx"]);
  const errors: Violation[] = [];

  for (const page of pages) {
    const content = readFile(page);
    const isRedirectOnly =
      content.includes("redirect(") && !content.includes("Screen");
    const isNotFoundOnly =
      content.includes("notFound()") && !content.includes("Screen");

    if (isRedirectOnly || isNotFoundOnly) continue;

    if (
      !content.includes('"server-only"') &&
      !content.includes("'server-only'")
    ) {
      errors.push({
        file: rel(page),
        message: 'Missing import "server-only"',
        rule: "server-only",
      });
    }
  }

  return { errors, name: "server-only", warnings: [] };
});

// -------------------------------------------------------------------
// Check: barrel-export
// -------------------------------------------------------------------

const BARREL_REQUIRED_LAYERS = [
  "actions",
  "components",
  "containers",
  "contexts",
  "hooks",
  "layouts",
  "lib",
  "providers",
  "schemas",
  "screens",
  "types",
  "utils",
];

const checkBarrelExport = Effect.sync((): CheckResult => {
  const modulesDir = join(PROJECT_ROOT, "src/modules");
  const sharedDir = join(PROJECT_ROOT, "src/shared");
  const errors: Violation[] = [];

  function checkLayerDir(layerDir: string): void {
    try {
      const entries = readdirSync(layerDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const leafDir = join(layerDir, entry.name);
        const hasFiles = readdirSync(leafDir).some(
          (f) => f.endsWith(".ts") || f.endsWith(".tsx"),
        );

        if (!hasFiles) continue;

        const indexPath = join(leafDir, "index.ts");

        if (!fileExists(indexPath)) {
          errors.push({
            file: rel(leafDir),
            message: "Missing index.ts barrel export",
            rule: "barrel-export",
          });
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  // Check modules
  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (!mod.isDirectory()) continue;

      for (const layer of BARREL_REQUIRED_LAYERS) {
        checkLayerDir(join(modulesDir, mod.name, layer));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  // Check shared
  for (const layer of BARREL_REQUIRED_LAYERS) {
    checkLayerDir(join(sharedDir, layer));
  }

  return { errors, name: "barrel-export", warnings: [] };
});

// -------------------------------------------------------------------
// Check: missing-tests
// -------------------------------------------------------------------

const TEST_REQUIRED_LAYERS = [
  "actions",
  "components",
  "containers",
  "contexts",
  "hooks",
  "lib",
  "providers",
  "screens",
  "utils",
];

const SKIP_FILES = new Set([
  "index.ts",
  "index.tsx",
  "types.ts",
  "types.tsx",
  "constants.ts",
  "constants.tsx",
]);

function isImplementationFile(filename: string): boolean {
  if (SKIP_FILES.has(filename)) return false;
  if (filename.endsWith(".test.ts") || filename.endsWith(".test.tsx"))
    return false;
  if (filename.endsWith(".stories.ts") || filename.endsWith(".stories.tsx"))
    return false;
  if (filename.endsWith(".d.ts")) return false;
  if (filename.endsWith(".module.css")) return false;
  if (filename.endsWith(".json")) return false;

  return filename.endsWith(".ts") || filename.endsWith(".tsx");
}

const checkMissingTests = Effect.sync((): CheckResult => {
  const errors: Violation[] = [];

  function checkDir(baseDir: string): void {
    for (const layer of TEST_REQUIRED_LAYERS) {
      const layerDir = join(baseDir, layer);
      const files = walkFiles(layerDir, [".ts", ".tsx"]);

      for (const file of files) {
        const filename = basename(file);

        if (!isImplementationFile(filename)) continue;

        const dir = dirname(file);
        const nameWithoutExt = filename.replace(/\.tsx?$/, "");
        const testTs = join(dir, `${nameWithoutExt}.test.ts`);
        const testTsx = join(dir, `${nameWithoutExt}.test.tsx`);

        if (!fileExists(testTs) && !fileExists(testTsx)) {
          errors.push({
            file: rel(file),
            message: `Missing test file: ${nameWithoutExt}.test.ts(x)`,
            rule: "missing-tests",
          });
        }
      }
    }
  }

  const modulesDir = join(PROJECT_ROOT, "src/modules");

  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (mod.isDirectory()) {
        checkDir(join(modulesDir, mod.name));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  checkDir(join(PROJECT_ROOT, "src/shared"));

  return { errors, name: "missing-tests", warnings: [] };
});

// -------------------------------------------------------------------
// Check: forbidden-deps
// -------------------------------------------------------------------

const FORBIDDEN_PACKAGES = [
  "framer-motion",
  "classnames",
  "lodash",
  "moment",
  "axios",
];

const FORBIDDEN_LOCKFILES = [
  "yarn.lock",
  "pnpm-lock.yaml",
  "bun.lockb",
  "bun.lock",
];

const checkForbiddenDeps = Effect.sync((): CheckResult => {
  const errors: Violation[] = [];
  const pkgPath = join(PROJECT_ROOT, "package.json");
  const content = readFile(pkgPath);

  if (!content) return { errors, name: "forbidden-deps", warnings: [] };

  const pkg = JSON.parse(content) as Record<string, Record<string, string>>;
  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const forbidden of FORBIDDEN_PACKAGES) {
    if (allDeps[forbidden]) {
      errors.push({
        file: "package.json",
        message: `Forbidden dependency: "${forbidden}"`,
        rule: "forbidden-deps",
      });
    }
  }

  for (const lockfile of FORBIDDEN_LOCKFILES) {
    if (fileExists(join(PROJECT_ROOT, lockfile))) {
      errors.push({
        file: lockfile,
        message: `Forbidden lockfile detected. Use npm only.`,
        rule: "forbidden-deps",
      });
    }
  }

  return { errors, name: "forbidden-deps", warnings: [] };
});

// -------------------------------------------------------------------
// Check: section-order (soft — warnings only)
// -------------------------------------------------------------------

const SectionKind = {
  AsyncHooks: 3,
  ComputedVariables: 5,
  ConditionalRendering: 9,
  DependentVariables: 4,
  EffectHooks: 8,
  EventHandlers: 7,
  Functions: 6,
  Hooks: 2,
  InitialVariables: 1,
} as const;

const SECTION_NAMES: Record<number, string> = {
  [SectionKind.AsyncHooks]: "Async Hooks",
  [SectionKind.ComputedVariables]: "Computed Variables",
  [SectionKind.ConditionalRendering]: "Conditional Rendering",
  [SectionKind.DependentVariables]: "Dependent Variables",
  [SectionKind.EffectHooks]: "Effect Hooks",
  [SectionKind.EventHandlers]: "Event Handlers",
  [SectionKind.Functions]: "Functions",
  [SectionKind.Hooks]: "Hooks",
  [SectionKind.InitialVariables]: "Initial Variables",
};

function classifyLine(line: string): null | number {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*")) {
    return null;
  }

  if (/\buseEffect\b|\buseLayoutEffect\b/.test(trimmed)) {
    return SectionKind.EffectHooks;
  }

  const isCallbackDecl =
    /^const\s+\w+\s*=\s*useCallback\(/.test(trimmed) ||
    /^const\s+\w+\s*=\s*useCallback\s*$/.test(trimmed);

  if (isCallbackDecl) {
    if (/^const\s+handle[A-Z]|^const\s+on[A-Z]/.test(trimmed)) {
      return SectionKind.EventHandlers;
    }

    return SectionKind.Functions;
  }

  if (/\buseMemo\b/.test(trimmed)) {
    return SectionKind.ComputedVariables;
  }

  if (/\buseSWR\b|\buseQuery\b/.test(trimmed)) {
    return SectionKind.AsyncHooks;
  }

  if (/\buse[A-Z]\w*\(/.test(trimmed)) {
    return SectionKind.Hooks;
  }

  if (/^if\s*\([^)]*\)\s*(return|throw)\b/.test(trimmed)) {
    return SectionKind.ConditionalRendering;
  }

  if (/^return\s/.test(trimmed) || trimmed === "return (") {
    return SectionKind.ConditionalRendering;
  }

  if (/^const\s+\w+\s*=\s*(?!use[A-Z])/.test(trimmed)) {
    return SectionKind.DependentVariables;
  }

  return null;
}

const SECTION_ORDER_LAYERS = ["components", "containers", "hooks", "screens"];

const checkSectionOrder = Effect.sync((): CheckResult => {
  const warnings: Violation[] = [];

  function checkFile(filePath: string): void {
    const content = readFile(filePath);
    const lines = content.split("\n");

    let insideComponent = false;
    let braceDepth = 0;
    let lastSection = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (
        /^export\s+(async\s+)?function\s+[A-Z]/.test(trimmed) ||
        /^export\s+const\s+[A-Z]\w*\s*=/.test(trimmed)
      ) {
        insideComponent = true;
        braceDepth = 0;
        lastSection = 0;
      }

      if (insideComponent) {
        for (const ch of line) {
          if (ch === "{") braceDepth++;
          if (ch === "}") braceDepth--;
        }

        if (braceDepth <= 0 && insideComponent && i > 0) {
          insideComponent = false;
          continue;
        }

        if (braceDepth === 1) {
          const section = classifyLine(line);

          if (section !== null && section < lastSection) {
            warnings.push({
              file: rel(filePath),
              message: `"${SECTION_NAMES[section]}" (line ${i + 1}) appears after "${SECTION_NAMES[lastSection]}" — expected earlier`,
              rule: "section-order",
            });
          }

          if (section !== null && section > lastSection) {
            lastSection = section;
          }
        }
      }
    }
  }

  function checkDir(baseDir: string): void {
    for (const layer of SECTION_ORDER_LAYERS) {
      const layerDir = join(baseDir, layer);
      const files = walkFiles(layerDir, [".ts", ".tsx"]);

      for (const file of files) {
        const filename = basename(file);

        if (
          filename.endsWith(".test.ts") ||
          filename.endsWith(".test.tsx") ||
          filename === "index.ts" ||
          filename === "types.ts" ||
          filename === "constants.ts"
        ) {
          continue;
        }

        checkFile(file);
      }
    }
  }

  const modulesDir = join(PROJECT_ROOT, "src/modules");

  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (mod.isDirectory()) {
        checkDir(join(modulesDir, mod.name));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  checkDir(join(PROJECT_ROOT, "src/shared"));

  return { errors: [], name: "section-order", warnings };
});

// -------------------------------------------------------------------
// Check: css-variables (hardcoded hex colors in CSS modules)
// -------------------------------------------------------------------

const HEX_COLOR_PATTERN =
  /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;

const CSS_VARIABLE_SKIP_PROPERTIES = new Set([
  "background-image",
  "background",
]);

const checkCssVariables = Effect.sync((): CheckResult => {
  const warnings: Violation[] = [];
  const cssFiles = walkFiles(join(PROJECT_ROOT, "src"), [".module.css"]);

  for (const file of cssFiles) {
    const relPath = rel(file);

    if (relPath.includes("error-global")) continue;

    const content = readFile(file);
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        !line.includes("#") ||
        line.startsWith("/*") ||
        line.startsWith("//")
      ) {
        continue;
      }

      const skipProp = [...CSS_VARIABLE_SKIP_PROPERTIES].some((p) =>
        line.startsWith(`${p}:`),
      );

      if (skipProp) continue;

      HEX_COLOR_PATTERN.lastIndex = 0;
      if (HEX_COLOR_PATTERN.test(line)) {
        warnings.push({
          file: relPath,
          message: `Line ${i + 1}: hardcoded color "${line.trim()}" — prefer CSS variable`,
          rule: "css-variables",
        });
      }
    }
  }

  return { errors: [], name: "css-variables", warnings };
});

// -------------------------------------------------------------------
// Check: types-re-export
// -------------------------------------------------------------------

const checkTypesReExport = Effect.sync((): CheckResult => {
  const modulesDir = join(PROJECT_ROOT, "src/modules");
  const sharedDir = join(PROJECT_ROOT, "src/shared");
  const errors: Violation[] = [];

  function checkLayerDir(layerDir: string): void {
    try {
      const entries = readdirSync(layerDir, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const leafDir = join(layerDir, entry.name);
        const typesPath = join(leafDir, "types.ts");
        const indexPath = join(leafDir, "index.ts");

        if (!fileExists(typesPath) || !fileExists(indexPath)) continue;

        const indexContent = readFile(indexPath);

        if (!indexContent.includes("export type")) {
          errors.push({
            file: rel(indexPath),
            message:
              'types.ts exists but index.ts has no "export type" re-export',
            rule: "types-re-export",
          });
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (!mod.isDirectory()) continue;

      for (const layer of BARREL_REQUIRED_LAYERS) {
        checkLayerDir(join(modulesDir, mod.name, layer));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  for (const layer of BARREL_REQUIRED_LAYERS) {
    checkLayerDir(join(sharedDir, layer));
  }

  return { errors, name: "types-re-export", warnings: [] };
});

// -------------------------------------------------------------------
// Check: stories-placement
// -------------------------------------------------------------------

const FORBIDDEN_STORY_LAYERS = [
  "actions",
  "containers",
  "contexts",
  "hooks",
  "layouts",
  "lib",
  "providers",
  "screens",
  "utils",
];

const checkStoriesPlacement = Effect.sync((): CheckResult => {
  const errors: Violation[] = [];
  const storyFiles = walkFiles(join(PROJECT_ROOT, "src"), [
    ".stories.tsx",
    ".stories.ts",
  ]);

  for (const file of storyFiles) {
    const relPath = rel(file);

    for (const layer of FORBIDDEN_STORY_LAYERS) {
      if (relPath.includes(`/${layer}/`)) {
        errors.push({
          file: relPath,
          message: `Story files are only allowed in components/ directories (found in ${layer}/)`,
          rule: "stories-placement",
        });
        break;
      }
    }
  }

  return { errors, name: "stories-placement", warnings: [] };
});

// -------------------------------------------------------------------
// Check: screen-server-only
// -------------------------------------------------------------------

const checkScreenServerOnly = Effect.sync((): CheckResult => {
  const modulesDir = join(PROJECT_ROOT, "src/modules");
  const errors: Violation[] = [];

  function checkScreensDir(baseDir: string): void {
    const screensDir = join(baseDir, "screens");
    const screenFiles = walkFiles(screensDir, [".tsx", ".ts"]);

    for (const file of screenFiles) {
      const filename = basename(file);

      if (
        filename === "index.ts" ||
        filename === "types.ts" ||
        filename.endsWith(".test.tsx") ||
        filename.endsWith(".test.ts") ||
        filename.endsWith(".stories.tsx") ||
        filename.endsWith(".stories.ts")
      ) {
        continue;
      }

      const content = readFile(file);

      // Skip client components
      const firstLine = content.trimStart().slice(0, 20);
      if (
        firstLine.startsWith('"use client"') ||
        firstLine.startsWith("'use client'")
      ) {
        continue;
      }

      if (
        !content.includes('"server-only"') &&
        !content.includes("'server-only'")
      ) {
        errors.push({
          file: rel(file),
          message: 'Screen component missing import "server-only"',
          rule: "screen-server-only",
        });
      }
    }
  }

  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (mod.isDirectory()) {
        checkScreensDir(join(modulesDir, mod.name));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  return { errors, name: "screen-server-only", warnings: [] };
});

// -------------------------------------------------------------------
// Check: client-container-hooks
// -------------------------------------------------------------------

/**
 * Hooks that must NOT be imported directly in client containers.
 * All stateful logic must be extracted into a custom hook in hooks/.
 */
const BANNED_REACT_HOOKS = [
  "useCallback",
  "useEffect",
  "useImperativeHandle",
  "useLayoutEffect",
  "useMemo",
  "useReducer",
  "useRef",
];

const BANNED_REACT_HOOKS_REGEX = new RegExp(
  `\\{[^}]*\\b(${BANNED_REACT_HOOKS.join("|")})\\b[^}]*\\}\\s*from\\s*['"]react['"]`,
);

const BANNED_USE_IMMER_REGEX = /from\s+['"]use-immer['"]/;
const BANNED_USEHOOKS_TS_REGEX = /from\s+['"]usehooks-ts['"]/;

const checkClientContainerHooks = Effect.sync((): CheckResult => {
  const modulesDir = join(PROJECT_ROOT, "src/modules");
  const errors: Violation[] = [];

  function checkContainersDir(baseDir: string): void {
    const containersDir = join(baseDir, "containers");
    const containerFiles = walkFiles(containersDir, [".tsx", ".ts"]);

    for (const file of containerFiles) {
      const filename = basename(file);

      if (
        filename === "index.ts" ||
        filename === "types.ts" ||
        filename.endsWith(".test.tsx") ||
        filename.endsWith(".test.ts") ||
        filename.endsWith(".stories.tsx") ||
        filename.endsWith(".stories.ts")
      ) {
        continue;
      }

      const content = readFile(file);

      // Only check client containers
      const firstLine = content.trimStart().slice(0, 20);
      if (
        !firstLine.startsWith('"use client"') &&
        !firstLine.startsWith("'use client'")
      ) {
        continue;
      }

      const relPath = rel(file);

      if (BANNED_REACT_HOOKS_REGEX.test(content)) {
        const match = content.match(BANNED_REACT_HOOKS_REGEX);
        errors.push({
          file: relPath,
          message: `Client container imports React hook(s) directly: "${match?.[0]}". Move to a custom hook in hooks/.`,
          rule: "client-container-hooks",
        });
      }

      if (BANNED_USE_IMMER_REGEX.test(content)) {
        errors.push({
          file: relPath,
          message:
            "Client container imports from 'use-immer' directly. Move to a custom hook in hooks/.",
          rule: "client-container-hooks",
        });
      }

      if (BANNED_USEHOOKS_TS_REGEX.test(content)) {
        errors.push({
          file: relPath,
          message:
            "Client container imports from 'usehooks-ts' directly. Move to a custom hook in hooks/.",
          rule: "client-container-hooks",
        });
      }
    }
  }

  try {
    for (const mod of readdirSync(modulesDir, { withFileTypes: true })) {
      if (mod.isDirectory()) {
        checkContainersDir(join(modulesDir, mod.name));
      }
    }
  } catch {
    // modules dir doesn't exist
  }

  return { errors, name: "client-container-hooks", warnings: [] };
});

// -------------------------------------------------------------------
// Check: i18n-variables
// -------------------------------------------------------------------

/**
 * Validates that translation strings with ICU message format variables
 * are called with the required variables in useTranslations/getTranslations.
 *
 * Catches errors like:
 *   t("description") // where description = "Delete {name}?" - missing { name }
 */

function extractIcuVariables(str: string): string[] {
  const matches = str.match(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

function collectTranslationVariables(
  obj: Record<string, unknown>,
  prefix = ""
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === "string") {
      const variables = extractIcuVariables(value);
      if (variables.length > 0) {
        result.set(fullKey, variables);
      }
    } else if (typeof value === "object" && value !== null) {
      const nested = collectTranslationVariables(
        value as Record<string, unknown>,
        fullKey
      );
      for (const [k, v] of nested) {
        result.set(k, v);
      }
    }
  }

  return result;
}

function loadTranslationVariables(messagesDir: string): Map<string, string[]> {
  const allVariables = new Map<string, string[]>();

  function walkMessagesDir(dir: string, namespace: string) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Convert directory name to camelCase for namespace
          const dirNamespace = entry.name.replace(/-([a-z])/g, (_, c: string) =>
            c.toUpperCase()
          );
          walkMessagesDir(
            fullPath,
            namespace ? `${namespace}.${dirNamespace}` : dirNamespace
          );
        } else if (entry.name.endsWith(".json")) {
          const content = JSON.parse(readFile(fullPath));
          // Convert filename to camelCase (e.g., user-card.json -> userCard)
          const fileNamespace = entry.name
            .replace(/\.json$/, "")
            .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
          const fullNamespace = namespace
            ? `${namespace}.${fileNamespace}`
            : fileNamespace;
          const variables = collectTranslationVariables(content, fullNamespace);
          for (const [k, v] of variables) {
            allVariables.set(k, v);
          }
        }
      }
    } catch {
      // Directory doesn't exist
    }
  }

  walkMessagesDir(join(messagesDir, "en"), "");
  return allVariables;
}

function checkI18nSourceFile(
  filePath: string,
  content: string,
  translationVariables: Map<string, string[]>
): Violation[] {
  const errors: Violation[] = [];

  // Find the namespace used in useTranslations or getTranslations
  const namespaceMatch = content.match(
    /(?:useTranslations|getTranslations)\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/
  );
  if (!namespaceMatch) return errors;

  const namespace = namespaceMatch[1];

  // Find all t("key") or t('key') calls - need to check each occurrence
  const lines = content.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];

    // Match t("key") or t("key", { ... })
    const tCallMatches = [
      ...line.matchAll(/\bt\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g),
      ...line.matchAll(/\bt\s*\(\s*["'`]([^"'`]+)["'`]\s*,\s*\{([^}]*)\}\s*\)/g),
    ];

    for (const match of tCallMatches) {
      const key = match[1];
      const variablesArg = match[2];
      const fullKey = `${namespace}.${key}`;

      const requiredVariables = translationVariables.get(fullKey);
      if (!requiredVariables || requiredVariables.length === 0) continue;

      // Check if variables are provided
      if (!variablesArg) {
        errors.push({
          file: rel(filePath),
          message: `Line ${lineNum + 1}: t("${key}") requires variables: { ${requiredVariables.join(", ")} }`,
          rule: "i18n-variables",
        });
        continue;
      }

      // Check if all required variables are provided
      const providedVariables = variablesArg.match(
        /([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g
      );
      const providedSet = new Set(
        providedVariables?.map((v) => v.replace(/\s*:$/, "")) || []
      );

      const missing = requiredVariables.filter((v) => !providedSet.has(v));
      if (missing.length > 0) {
        errors.push({
          file: rel(filePath),
          message: `Line ${lineNum + 1}: t("${key}", {...}) is missing variables: { ${missing.join(", ")} }`,
          rule: "i18n-variables",
        });
      }
    }
  }

  return errors;
}

const checkI18nVariables = Effect.sync((): CheckResult => {
  const messagesDir = join(PROJECT_ROOT, "src/messages");
  const translationVariables = loadTranslationVariables(messagesDir);
  const errors: Violation[] = [];

  function checkDir(dir: string) {
    const files = walkFiles(dir, [".ts", ".tsx"]);

    for (const file of files) {
      const filename = basename(file);
      // Skip test files
      if (filename.includes(".test.")) continue;

      const content = readFile(file);
      // Only check files that use translations
      if (
        content.includes("useTranslations") ||
        content.includes("getTranslations")
      ) {
        const fileErrors = checkI18nSourceFile(file, content, translationVariables);
        errors.push(...fileErrors);
      }
    }
  }

  checkDir(join(PROJECT_ROOT, "src/modules"));
  checkDir(join(PROJECT_ROOT, "src/shared"));

  return { errors, name: "i18n-variables", warnings: [] };
});

// -------------------------------------------------------------------
// Check: action-schema
// -------------------------------------------------------------------

const checkActionSchema = Effect.sync((): CheckResult => {
  const srcDir = join(PROJECT_ROOT, "src");
  const errors: Violation[] = [];

  const actionFiles = walkFiles(srcDir, [".ts", ".tsx"]).filter((f) => {
    const name = basename(f);

    return (
      f.includes("/actions/") &&
      name !== "index.ts" &&
      name !== "types.ts" &&
      !name.endsWith(".test.ts") &&
      !name.endsWith(".test.tsx")
    );
  });

  for (const file of actionFiles) {
    const content = readFile(file);

    if (!content.includes(".inputSchema(")) {
      errors.push({
        file: rel(file),
        message:
          "Missing .inputSchema(...). Every server action must validate input with Zod via actionClient.inputSchema(schema).action(...).",
        rule: "action-schema",
      });
    }
  }

  return { errors, name: "action-schema", warnings: [] };
});

// -------------------------------------------------------------------
// Runner
// -------------------------------------------------------------------

const ALL_CHECKS = {
  "action-schema": checkActionSchema,
  "barrel-export": checkBarrelExport,
  "client-container-hooks": checkClientContainerHooks,
  "css-variables": checkCssVariables,
  "forbidden-deps": checkForbiddenDeps,
  "i18n-variables": checkI18nVariables,
  "missing-tests": checkMissingTests,
  "screen-server-only": checkScreenServerOnly,
  "section-order": checkSectionOrder,
  "server-only": checkServerOnly,
  "stories-placement": checkStoriesPlacement,
  "types-re-export": checkTypesReExport,
} as const;

type CheckName = keyof typeof ALL_CHECKS;

function parseArgs(args: string[]): { checks: CheckName[] } {
  if (args.includes("--all") || args.length === 0) {
    return { checks: Object.keys(ALL_CHECKS) as CheckName[] };
  }

  const checks: CheckName[] = [];

  for (const arg of args) {
    const name = arg.replace(/^--/, "") as CheckName;

    if (name in ALL_CHECKS) {
      checks.push(name);
    }
  }

  return {
    checks:
      checks.length > 0 ? checks : (Object.keys(ALL_CHECKS) as CheckName[]),
  };
}

function formatResults(results: CheckResult[]): string {
  const lines: string[] = [];
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    const count = result.errors.length + result.warnings.length;

    if (count === 0) {
      lines.push(`  ✓ ${result.name}`);
      continue;
    }

    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    lines.push(
      `  ✗ ${result.name} (${result.errors.length} errors, ${result.warnings.length} warnings)`,
    );

    for (const err of result.errors) {
      lines.push(`    ERROR ${err.file}: ${err.message}`);
    }

    for (const warn of result.warnings) {
      lines.push(`    WARN  ${warn.file}: ${warn.message}`);
    }
  }

  lines.push("");
  lines.push(`  Total: ${totalErrors} errors, ${totalWarnings} warnings`);

  return lines.join("\n");
}

const run = (args: string[]) =>
  Effect.gen(function* () {
    const { checks } = parseArgs(args);

    console.log("\n  lint:check\n");

    const results = yield* pipe(
      checks,
      Arr.map((name) => ALL_CHECKS[name]),
      Effect.all,
    );

    const output = formatResults(results);
    console.log(output);

    const hasErrors = results.some((r) => r.errors.length > 0);

    if (hasErrors) {
      process.exitCode = 1;
    }

    console.log("");
  });

// -------------------------------------------------------------------
// Command export
// -------------------------------------------------------------------

export const command = {
  description: "Run project-specific lint checks",
  name: "lint:check",
  run: async (args?: string[]): Promise<void> => {
    await Effect.runPromise(
      run(args ?? []).pipe(
        Effect.catchAll((err) =>
          Effect.sync(() => {
            console.error("  lint:check failed:", err);
            process.exitCode = 1;
          }),
        ),
      ),
    );
  },
};

export function help(): void {
  console.log(`  Run project-specific lint checks.

  Usage:
    ./bin/vibe lint:check [options]

  Options:
    --all                    Run all checks (default)
    --action-schema          Check action files for .inputSchema(...) usage
    --server-only            Check page.tsx files for import "server-only"
    --screen-server-only     Check screen files for import "server-only"
    --barrel-export          Check leaf folders for index.ts barrel exports
    --types-re-export        Check index.ts re-exports types from types.ts
    --missing-tests          Check implementation files for test coverage
    --forbidden-deps         Check for banned packages and lockfiles
    --stories-placement      Check story files are only in components/
    --client-container-hooks Check client containers for direct hook usage
    --i18n-variables         Check translation calls provide required ICU variables
    --section-order          Check component section structure (soft warning)
    --css-variables          Check CSS modules for hardcoded values (soft warning)

  Examples:
    ./bin/vibe lint:check
    ./bin/vibe lint:check --server-only --barrel-export
    ./bin/vibe lint:check --types-re-export --stories-placement
    ./bin/vibe lint:check --client-container-hooks
`);
}
