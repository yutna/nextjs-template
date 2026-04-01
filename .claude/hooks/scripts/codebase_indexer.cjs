#!/usr/bin/env node
/**
 * Codebase Indexer
 *
 * Scans the codebase and generates an index of existing patterns.
 * This helps Claude understand what already exists before implementing new features.
 *
 * Usage:
 *   node .claude/hooks/scripts/codebase_indexer.cjs [--output <path>] [--format <json|markdown>]
 *
 * Output: .claude/generated/codebase-index.json (default)
 */

const fs = require("fs");
const path = require("path");

// ─────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const MODULES_DIR = path.join(SRC_DIR, "modules");
const SHARED_DIR = path.join(SRC_DIR, "shared");
const OUTPUT_DIR = path.join(ROOT, ".claude", "generated");
const DEFAULT_OUTPUT = path.join(OUTPUT_DIR, "codebase-index.json");

// Pattern folders to scan in modules
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

// Pattern folders to scan in shared
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

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function dirExists(dir) {
  try {
    return fs.statSync(dir).isDirectory();
  } catch {
    return false;
  }
}

function listDirs(dir) {
  if (!dirExists(dir)) return [];
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((name) => !name.startsWith("."));
  } catch {
    return [];
  }
}

function listFiles(dir) {
  if (!dirExists(dir)) return [];
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function extractPatternName(folderName, patternType) {
  // Extract the core name from pattern folder names
  // e.g., "user-repository" -> "user"
  // e.g., "create-user-action" -> "create-user"
  // e.g., "container-user-list" -> "user-list"
  const suffixes = {
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
    // Prefix pattern (container-, screen-, use-)
    return folderName.startsWith(suffix)
      ? folderName.slice(suffix.length)
      : folderName;
  } else {
    // Suffix pattern (-action, -service, etc.)
    return folderName.endsWith(suffix)
      ? folderName.slice(0, -suffix.length)
      : folderName;
  }
}

// ─────────────────────────────────────────────────────────────
// Entity Scanner
// ─────────────────────────────────────────────────────────────

function scanEntities() {
  const entitiesDir = path.join(SHARED_DIR, "entities");
  const entities = {};

  for (const entityName of listDirs(entitiesDir)) {
    const entityDir = path.join(entitiesDir, entityName);
    const files = listFiles(entityDir);

    entities[entityName] = {
      files: files,
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

// ─────────────────────────────────────────────────────────────
// Module Scanner
// ─────────────────────────────────────────────────────────────

function scanModule(moduleName) {
  const moduleDir = path.join(MODULES_DIR, moduleName);
  const patterns = {};

  for (const patternType of MODULE_PATTERNS) {
    const patternDir = path.join(moduleDir, patternType);
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

function scanModules() {
  const modules = {};

  for (const moduleName of listDirs(MODULES_DIR)) {
    const patterns = scanModule(moduleName);
    if (Object.keys(patterns).length > 0) {
      modules[moduleName] = patterns;
    }
  }

  return modules;
}

// ─────────────────────────────────────────────────────────────
// Shared Scanner
// ─────────────────────────────────────────────────────────────

function scanShared() {
  const shared = {};

  for (const patternType of SHARED_PATTERNS) {
    if (patternType === "entities") continue; // Handled separately

    const patternDir = path.join(SHARED_DIR, patternType);
    const items = listDirs(patternDir);

    if (items.length > 0) {
      shared[patternType] = items.map((folderName) => ({
        folder: folderName,
        name: extractPatternName(folderName, patternType),
        path: `shared/${patternType}/${folderName}/`,
      }));
    }
  }

  // Check for shared services specifically
  const servicesDir = path.join(SHARED_DIR, "services");
  if (dirExists(servicesDir)) {
    const services = listDirs(servicesDir);
    shared.services = services.map((name) => ({
      folder: name,
      name,
      path: `shared/services/${name}/`,
      // Check for known service types
      isAuthService: name === "auth",
      isEmailService: name === "email",
      isRealtimeService: name === "realtime",
    }));
  }

  return shared;
}

// ─────────────────────────────────────────────────────────────
// Pattern Analysis
// ─────────────────────────────────────────────────────────────

function analyzePatterns(entities, modules) {
  const analysis = {};

  // For each entity, check what patterns exist
  for (const entityName of Object.keys(entities)) {
    analysis[entityName] = {
      entity: true,
      hasHooks: entities[entityName].hasHooks,
      hasRelations: entities[entityName].hasRelations,
      hasScopes: entities[entityName].hasScopes,
      modules: {},
    };

    // Check each module for patterns related to this entity
    for (const [moduleName, patterns] of Object.entries(modules)) {
      const modulePatterns = {};

      for (const [patternType, items] of Object.entries(patterns)) {
        const match = items.find(
          (item) =>
            item.name === entityName ||
            item.name.includes(entityName) ||
            item.folder.includes(entityName)
        );
        if (match) {
          modulePatterns[patternType] = match.path;
        }
      }

      if (Object.keys(modulePatterns).length > 0) {
        analysis[entityName].modules[moduleName] = modulePatterns;
      }
    }
  }

  return analysis;
}

// ─────────────────────────────────────────────────────────────
// Suggestions Generator
// ─────────────────────────────────────────────────────────────

function generateSuggestions(entities, modules, analysis) {
  const suggestions = [];

  for (const [entityName, entityData] of Object.entries(analysis)) {
    const entity = entities[entityName];
    const missingPatterns = [];

    // Check for commonly missing patterns
    if (!entity.hasHooks) {
      missingPatterns.push({
        pattern: "entity-hooks",
        reason: "No lifecycle hooks defined",
        suggestion: `Add hooks.ts to shared/entities/${entityName}/`,
      });
    }

    if (!entity.hasScopes && entity.hasSchema) {
      missingPatterns.push({
        pattern: "query-scopes",
        reason: "No reusable query scopes defined",
        suggestion: `Add scopes.ts to shared/entities/${entityName}/`,
      });
    }

    // Check if entity has repository but no presenter
    for (const [moduleName, modulePatterns] of Object.entries(
      entityData.modules
    )) {
      if (modulePatterns.repositories && !modulePatterns.presenters) {
        missingPatterns.push({
          pattern: "presenter",
          reason: `Repository exists but no presenter for API responses`,
          suggestion: `Create modules/${moduleName}/presenters/${entityName}-presenter/`,
        });
      }

      if (modulePatterns.services && !modulePatterns.policies) {
        missingPatterns.push({
          pattern: "policy",
          reason: `Service exists but no authorization policy`,
          suggestion: `Consider adding modules/${moduleName}/policies/${entityName}-policy/`,
        });
      }
    }

    if (missingPatterns.length > 0) {
      suggestions.push({
        entity: entityName,
        missing: missingPatterns,
      });
    }
  }

  return suggestions;
}

// ─────────────────────────────────────────────────────────────
// Output Generators
// ─────────────────────────────────────────────────────────────

function generateIndex() {
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

function generateMarkdown(index) {
  let md = `# Codebase Index\n\n`;
  md += `Generated: ${index.generatedAt}\n\n`;

  // Summary
  md += `## Summary\n\n`;
  md += `- **Entities:** ${index.summary.entityCount} (${index.summary.entities.join(", ") || "none"})\n`;
  md += `- **Modules:** ${index.summary.moduleCount} (${index.summary.modules.join(", ") || "none"})\n\n`;

  // Entities
  md += `## Entities\n\n`;
  for (const [name, entity] of Object.entries(index.entities)) {
    md += `### ${name}\n\n`;
    md += `- Path: \`${entity.path}\`\n`;
    md += `- Hooks: ${entity.hasHooks ? "Yes" : "No"}\n`;
    md += `- Scopes: ${entity.hasScopes ? "Yes" : "No"}\n`;
    md += `- Relations: ${entity.hasRelations ? "Yes" : "No"}\n\n`;
  }

  // Modules
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

  // Suggestions
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

// ─────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    format: "json",
    output: DEFAULT_OUTPUT,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--output" && args[i + 1]) {
      options.output = args[++i];
    } else if (args[i] === "--format" && args[i + 1]) {
      options.format = args[++i];
    } else if (args[i] === "--help") {
      console.log(`
Codebase Indexer - Generate pattern index for Claude

Usage:
  node codebase_indexer.cjs [options]

Options:
  --output <path>    Output file path (default: .claude/generated/codebase-index.json)
  --format <format>  Output format: json or markdown (default: json)
  --help             Show this help message
`);
      process.exit(0);
    }
  }

  return options;
}

function main() {
  const options = parseArgs();

  // Ensure output directory exists
  const outputDir = path.dirname(options.output);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Generate index
  const index = generateIndex();

  // Write output
  if (options.format === "markdown") {
    const md = generateMarkdown(index);
    fs.writeFileSync(options.output, md);
  } else {
    fs.writeFileSync(options.output, JSON.stringify(index, null, 2));
  }

  console.log(`Codebase index generated: ${options.output}`);
  console.log(`  Entities: ${index.summary.entityCount}`);
  console.log(`  Modules: ${index.summary.moduleCount}`);
  if (index.suggestions.length > 0) {
    console.log(`  Suggestions: ${index.suggestions.length}`);
  }

  return index;
}

// Run if executed directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = { generateIndex, generateMarkdown };
