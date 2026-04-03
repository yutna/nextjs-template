import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CodebaseEntity {
  files: string[];
  hasHooks: boolean;
  hasRelations: boolean;
  hasSchema: boolean;
  hasScopes: boolean;
  hasTypes: boolean;
  path: string;
}

interface PatternItem {
  folder: string;
  name: string;
  path: string;
}

interface SharedService extends PatternItem {
  isAuthService: boolean;
  isEmailService: boolean;
  isRealtimeService: boolean;
}

type ModulePatterns = Record<string, PatternItem[]>;
type SharedPatterns = Record<string, PatternItem[] | SharedService[]>;
type EntityMap = Record<string, CodebaseEntity>;
type ModuleMap = Record<string, ModulePatterns>;

interface EntityAnalysis {
  entity: boolean;
  hasHooks: boolean;
  hasRelations: boolean;
  hasScopes: boolean;
  modules: Record<string, Record<string, string>>;
}

interface MissingPattern {
  pattern: string;
  reason: string;
  suggestion: string;
}

interface PatternSuggestion {
  entity: string;
  missing: MissingPattern[];
}

interface CodebaseIndex {
  analysis: Record<string, EntityAnalysis>;
  entities: EntityMap;
  generatedAt: string;
  modules: ModuleMap;
  shared: SharedPatterns;
  suggestions: PatternSuggestion[];
  summary: {
    entities: string[];
    entityCount: number;
    moduleCount: number;
    modules: string[];
  };
  version: string;
}

interface IndexerOptions {
  format: "json" | "markdown";
  output: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const SRC_DIR = join(ROOT, "src");
const MODULES_DIR = join(SRC_DIR, "modules");
const SHARED_DIR = join(SRC_DIR, "shared");
const OUTPUT_DIR = join(ROOT, ".claude", "generated");
const DEFAULT_OUTPUT = join(OUTPUT_DIR, "codebase-index.json");

const MODULE_PATTERNS = [
  "actions",
  "api",
  "components",
  "containers",
  "forms",
  "hooks",
  "jobs",
  "policies",
  "presenters",
  "repositories",
  "schemas",
  "screens",
  "services",
];

const SHARED_PATTERNS = [
  "entities",
  "factories",
  "services",
  "policies",
  "presenters",
  "middleware",
  "hooks",
  "components",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function extractPatternName(folderName: string, patternType: string): string {
  const suffixes: Record<string, string> = {
    actions: "-action",
    api: "-handler",
    containers: "container-",
    factories: "-factory",
    forms: "-form",
    hooks: "use-",
    jobs: "-job",
    policies: "-policy",
    presenters: "-presenter",
    repositories: "-repository",
    schemas: "-schema",
    screens: "screen-",
    services: "-service",
  };

  const suffix = suffixes[patternType];
  if (!suffix) return folderName;

  if (suffix.endsWith("-")) {
    return folderName.startsWith(suffix)
      ? folderName.slice(suffix.length)
      : folderName;
  }
  return folderName.endsWith(suffix)
    ? folderName.slice(0, -suffix.length)
    : folderName;
}

// ─── Scanners ─────────────────────────────────────────────────────────────────

function scanEntities(): EntityMap {
  const entitiesDir = join(SHARED_DIR, "entities");
  const entities: EntityMap = {};

  for (const entityName of listDirs(entitiesDir)) {
    const entityDir = join(entitiesDir, entityName);
    const files = listFiles(entityDir);

    entities[entityName] = {
      files,
      hasHooks: files.includes("hooks.ts"),
      hasRelations: files.includes("relations.ts"),
      hasSchema: files.some((f) => f === `${entityName}.ts`),
      hasScopes: files.includes("scopes.ts"),
      hasTypes: files.includes("types.ts"),
      path: `shared/entities/${entityName}/`,
    };
  }

  return entities;
}

function scanModule(moduleName: string): ModulePatterns {
  const moduleDir = join(MODULES_DIR, moduleName);
  const patterns: ModulePatterns = {};

  for (const patternType of MODULE_PATTERNS) {
    const patternDir = join(moduleDir, patternType);
    const items = listDirs(patternDir);

    if (items.length > 0) {
      patterns[patternType] = items.map((folderName) => ({
        folder: folderName,
        name: extractPatternName(folderName, patternType),
        path: `modules/${moduleName}/${patternType}/${folderName}/`,
      }));
    }
  }

  return patterns;
}

function scanModules(): ModuleMap {
  const modules: ModuleMap = {};

  for (const moduleName of listDirs(MODULES_DIR)) {
    const patterns = scanModule(moduleName);
    if (Object.keys(patterns).length > 0) {
      modules[moduleName] = patterns;
    }
  }

  return modules;
}

function scanShared(): SharedPatterns {
  const shared: SharedPatterns = {};

  for (const patternType of SHARED_PATTERNS) {
    if (patternType === "entities") continue;

    const patternDir = join(SHARED_DIR, patternType);
    const items = listDirs(patternDir);

    if (items.length > 0) {
      shared[patternType] = items.map((folderName) => ({
        folder: folderName,
        name: extractPatternName(folderName, patternType),
        path: `shared/${patternType}/${folderName}/`,
      }));
    }
  }

  const servicesDir = join(SHARED_DIR, "services");
  if (existsSync(servicesDir)) {
    shared["services"] = listDirs(servicesDir).map((name) => ({
      folder: name,
      isAuthService: name === "auth",
      isEmailService: name === "email",
      isRealtimeService: name === "realtime",
      name,
      path: `shared/services/${name}/`,
    }));
  }

  return shared;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

function analyzePatterns(
  entities: EntityMap,
  modules: ModuleMap,
): Record<string, EntityAnalysis> {
  const analysis: Record<string, EntityAnalysis> = {};

  for (const entityName of Object.keys(entities)) {
    const entityData: EntityAnalysis = {
      entity: true,
      hasHooks: entities[entityName]?.hasHooks ?? false,
      hasRelations: entities[entityName]?.hasRelations ?? false,
      hasScopes: entities[entityName]?.hasScopes ?? false,
      modules: {},
    };

    for (const [moduleName, patterns] of Object.entries(modules)) {
      const modulePatterns: Record<string, string> = {};

      for (const [patternType, items] of Object.entries(patterns)) {
        const match = items.find(
          (item) =>
            item.name === entityName ||
            item.name.includes(entityName) ||
            item.folder.includes(entityName),
        );
        if (match) {
          modulePatterns[patternType] = match.path;
        }
      }

      if (Object.keys(modulePatterns).length > 0) {
        entityData.modules[moduleName] = modulePatterns;
      }
    }

    analysis[entityName] = entityData;
  }

  return analysis;
}

function generateSuggestions(
  entities: EntityMap,
  modules: ModuleMap,
  analysis: Record<string, EntityAnalysis>,
): PatternSuggestion[] {
  const suggestions: PatternSuggestion[] = [];

  for (const [entityName, entityData] of Object.entries(analysis)) {
    const entity = entities[entityName];
    const missingPatterns: MissingPattern[] = [];

    if (!entity?.hasHooks) {
      missingPatterns.push({
        pattern: "entity-hooks",
        reason: "No lifecycle hooks defined",
        suggestion: `Add hooks.ts to shared/entities/${entityName}/`,
      });
    }

    if (!entity?.hasScopes && entity?.hasSchema) {
      missingPatterns.push({
        pattern: "query-scopes",
        reason: "No reusable query scopes defined",
        suggestion: `Add scopes.ts to shared/entities/${entityName}/`,
      });
    }

    for (const [moduleName, modulePatterns] of Object.entries(
      entityData.modules,
    )) {
      if (modulePatterns["repositories"] && !modulePatterns["presenters"]) {
        missingPatterns.push({
          pattern: "presenter",
          reason: "Repository exists but no presenter for API responses",
          suggestion: `Create modules/${moduleName}/presenters/${entityName}-presenter/`,
        });
      }

      if (modulePatterns["services"] && !modulePatterns["policies"]) {
        missingPatterns.push({
          pattern: "policy",
          reason: "Service exists but no authorization policy",
          suggestion: `Consider adding modules/${moduleName}/policies/${entityName}-policy/`,
        });
      }
    }

    if (missingPatterns.length > 0) {
      suggestions.push({ entity: entityName, missing: missingPatterns });
    }
  }

  return suggestions;
}

// ─── Output ───────────────────────────────────────────────────────────────────

export function generateIndex(): CodebaseIndex {
  const entities = scanEntities();
  const modules = scanModules();
  const shared = scanShared();
  const analysis = analyzePatterns(entities, modules);
  const suggestions = generateSuggestions(entities, modules, analysis);

  return {
    analysis,
    entities,
    generatedAt: new Date().toISOString(),
    modules,
    shared,
    suggestions,
    summary: {
      entities: Object.keys(entities),
      entityCount: Object.keys(entities).length,
      moduleCount: Object.keys(modules).length,
      modules: Object.keys(modules),
    },
    version: "1.0",
  };
}

export function generateMarkdown(index: CodebaseIndex): string {
  let md = `# Codebase Index\n\nGenerated: ${index.generatedAt}\n\n`;

  md += `## Summary\n\n`;
  md += `- **Entities:** ${index.summary.entityCount} (${index.summary.entities.join(", ") || "none"})\n`;
  md += `- **Modules:** ${index.summary.moduleCount} (${index.summary.modules.join(", ") || "none"})\n\n`;

  md += `## Entities\n\n`;
  for (const [name, entity] of Object.entries(index.entities)) {
    md += `### ${name}\n\n`;
    md += `- Path: \`${entity.path}\`\n`;
    md += `- Hooks: ${entity.hasHooks ? "Yes" : "No"}\n`;
    md += `- Scopes: ${entity.hasScopes ? "Yes" : "No"}\n`;
    md += `- Relations: ${entity.hasRelations ? "Yes" : "No"}\n\n`;
  }

  md += `## Modules\n\n`;
  for (const [moduleName, patterns] of Object.entries(index.modules)) {
    md += `### ${moduleName}\n\n`;
    for (const [patternType, items] of Object.entries(patterns)) {
      md += `**${patternType}:**\n`;
      for (const item of items) {
        md += `- ${item.name} (\`${item.path}\`)\n`;
      }
      md += `\n`;
    }
  }

  if (index.suggestions.length > 0) {
    md += `## Suggestions\n\n`;
    for (const suggestion of index.suggestions) {
      md += `### ${suggestion.entity}\n\n`;
      for (const missing of suggestion.missing) {
        md += `- **${missing.pattern}**: ${missing.reason}\n`;
        md += `  - ${missing.suggestion}\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function parseOptions(args: string[]): IndexerOptions {
  const options: IndexerOptions = { format: "json", output: DEFAULT_OUTPUT };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) {
      options.output = args[++i] ?? DEFAULT_OUTPUT;
    } else if (args[i] === "--format" && args[i + 1]) {
      const fmt = args[++i];
      if (fmt === "markdown" || fmt === "json") {
        options.format = fmt;
      }
    }
  }

  return options;
}

export function runCodebaseIndex(args: string[]): void {
  const options = parseOptions(args);

  const outputDir = options.output.split("/").slice(0, -1).join("/");
  if (outputDir && !existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const index = generateIndex();

  if (options.format === "markdown") {
    writeFileSync(options.output, generateMarkdown(index));
  } else {
    writeFileSync(options.output, JSON.stringify(index, null, 2));
  }

  console.log(`Codebase index generated: ${options.output}`);
  console.log(`  Entities: ${index.summary.entityCount}`);
  console.log(`  Modules: ${index.summary.moduleCount}`);
  if (index.suggestions.length > 0) {
    console.log(`  Suggestions: ${index.suggestions.length}`);
  }
}

async function run(args?: string[]): Promise<void> {
  runCodebaseIndex(args ?? []);
}

export const command = {
  description: "Scan codebase and generate pattern index for AI context",
  name: "codebase-index",
  run,
};

export function help(): void {
  console.log(`  Generate codebase index.

  Usage:
    ./bin/vibe codebase-index [options]

  Options:
    --output <path>    Output file (default: .claude/generated/codebase-index.json)
    --format <format>  json or markdown (default: json)
`);
}
