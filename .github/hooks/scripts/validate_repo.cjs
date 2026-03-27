#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const {
  generatedIgnoreIssues,
  loadProfile,
  templateBootstrapStateIssues,
  validateProfile,
} = require('./workflow_profile.cjs');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const WORKFLOW_HOOK_SCRIPT = path.join(ROOT, '.github', 'hooks', 'scripts', 'workflow_hook.cjs');
const IGNORED_DIRECTORIES = new Set(['.git', '.next', '.turbo', 'build', 'coverage', 'dist', 'node_modules']);

const REQUIRED_AGENT_NAMES = ['Orchestrator', 'Requirements Analyst', 'Planner', 'Implementer', 'Reviewer', 'Verifier', 'Migrator'];
const ALLOWED_TOOL_ALIASES = new Set(['read', 'search', 'edit', 'execute', 'agent', 'web']);
const REQUIRED_PROMPT_FILES = [
  'discover-requirements.prompt.md',
  'plan-implementation.prompt.md',
  'implement-approved-plan.prompt.md',
  'review-work.prompt.md',
  'run-quality-gates.prompt.md',
  'verify-and-deliver.prompt.md',
  'recover-from-failure.prompt.md',
  'design-nextjs-feature.prompt.md',
  'design-nextjs-routes.prompt.md',
  'implement-nextjs-feature.prompt.md',
  'review-nextjs-boundaries.prompt.md',
  'review-nextjs-routes.prompt.md',
  'audit-nextjs-file-system.prompt.md',
  'audit-nextjs-library-decisions.prompt.md',
  'audit-nextjs-i18n.prompt.md',
  'audit-nextjs-testability.prompt.md',
  'verify-nextjs-runtime.prompt.md',
  'audit-nextjs-security.prompt.md',
  'migrate-legacy-nextjs.prompt.md',
  'design-from-figma.prompt.md',
  'verify-nextjs-browser.prompt.md',
  'sync-figma-code-connect.prompt.md',
];
const REQUIRED_INSTRUCTION_FILES = [
  'agent-skills-standard.instructions.md',
  'ai-customization.instructions.md',
  'nextjs-docs-first.instructions.md',
  'nextjs-app-router.instructions.md',
  'nextjs-app-router-specials.instructions.md',
  'nextjs-file-system.instructions.md',
  'nextjs-env.instructions.md',
  'nextjs-logging.instructions.md',
  'nextjs-client-exceptions.instructions.md',
  'nextjs-state-machines.instructions.md',
  'nextjs-functional-patterns.instructions.md',
  'nextjs-i18n.instructions.md',
  'nextjs-routing.instructions.md',
  'nextjs-route-registry.instructions.md',
  'nextjs-server-first.instructions.md',
  'nextjs-security.instructions.md',
  'nextjs-tooling.instructions.md',
  'nextjs-migration.instructions.md',
  'nextjs-mcp.instructions.md',
  'nextjs-storybook.instructions.md',
  'nextjs-testability.instructions.md',
  'nextjs-ui-runtime.instructions.md',
  'nextjs-zag-js.instructions.md',
  'quality-gates.instructions.md',
  'workflow-core.instructions.md',
];
const REQUIRED_SKILL_DIRS = [
  'nextjs-architecture',
  'nextjs-env',
  'nextjs-logging',
  'nextjs-client-exceptions',
  'nextjs-state-machines',
  'nextjs-functional-patterns',
  'nextjs-routing',
  'nextjs-feature-module',
  'nextjs-data-access',
  'nextjs-server-actions',
  'nextjs-client-boundary',
  'nextjs-runtime-debugging',
  'nextjs-security-review',
  'nextjs-migration',
  'nextjs-mcp-orchestration',
  'nextjs-route-registry',
  'nextjs-browser-qa',
  'nextjs-file-system-governance',
  'nextjs-i18n',
  'nextjs-storybook-harness',
  'nextjs-testability',
  'nextjs-ui-runtime',
  'nextjs-zag-js',
];
const REQUIRED_HOOK_CONFIG_FILES = [
  'session-context.json',
  'workflow-guard.json',
  'post-edit-checks.json',
  'stop-gate.json',
  'nextjs-session-context.json',
  'nextjs-workflow-guard.json',
  'nextjs-post-edit-checks.json',
];
const REQUIRED_HOOK_SCRIPT_FILES = [
  '.github/hooks/scripts/workflow_hook.cjs',
  '.github/hooks/scripts/nextjs_policy.cjs',
  '.github/hooks/scripts/workflow_profile.cjs',
  '.github/hooks/scripts/workflow_bootstrap.cjs',
  '.github/hooks/scripts/workflow_doctor.cjs',
  '.github/hooks/scripts/workflow_audit_structure.cjs',
  '.github/hooks/scripts/workflow_adopt_report.cjs',
];
const REQUIRED_SUPPORT_FILES = [
  'docs/agent-skills-standard.md',
  'docs/adoption/from-scratch.md',
  'docs/adoption/adopt-existing-project.md',
  'docs/adoption/migrate-existing-nextjs.md',
  'docs/nextjs-enterprise-workflow-design.md',
  'docs/nextjs-enterprise-mcp-playbook.md',
  'docs/nextjs-enterprise-file-system-playbook.md',
  'docs/nextjs-enterprise-i18n-playbook.md',
  'docs/nextjs-enterprise-testability-playbook.md',
  'docs/nextjs-enterprise-library-decisions.md',
  'docs/pre-commit-audit-policy.md',
  'docs/migrations/MIGRATION.template.md',
  '.agents/README.md',
];
const REQUIRED_CONFIG_FILES = ['.vscode/mcp.json', 'skills-lock.json', '.github/workflow-profile.json'];
const REQUIRED_MCP_SERVERS = ['ark-ui', 'chakra-ui', 'figma', 'next-devtools'];
const REQUIRED_MCP_INPUTS = [
  {
    id: 'figma-personal-access-token',
    type: 'promptString',
  },
];
const REQUIRED_EXTERNAL_SKILLS = [
  'agent-browser',
  'find-skills',
  'next-best-practices',
  'next-cache-components',
  'next-upgrade',
  'vercel-composition-patterns',
  'vercel-react-best-practices',
  'vitest',
];
const REQUIRED_VENDORED_SKILL_ROOT = '.agents/skills';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toRepoPath(filePath) {
  return path.relative(ROOT, filePath).replace(/\\/g, '/');
}

function walkDirectory(dirPath, predicate) {
  const results = [];
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }
      results.push(...walkDirectory(fullPath, predicate));
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results.sort();
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function hashDirectory(dirPath) {
  const files = [];

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(path.relative(dirPath, fullPath).replace(/\\/g, '/'));
      }
    }
  }

  walk(dirPath);
  files.sort();

  const hash = crypto.createHash('sha256');
  for (const relativePath of files) {
    hash.update(`${relativePath}\n`);
    hash.update(fs.readFileSync(path.join(dirPath, relativePath)));
    hash.update('\n');
  }

  return {
    hash: hash.digest('hex'),
    fileCount: files.length,
  };
}

function extractFrontmatter(filePath, errors) {
  const match = readText(filePath).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    errors.push(`${toRepoPath(filePath)} is missing YAML frontmatter.`);
    return null;
  }
  return match[1];
}

function parseTopLevelFrontmatter(frontmatter) {
  const values = new Map();
  for (const line of frontmatter.split(/\r?\n/)) {
    if (!/^[A-Za-z][A-Za-z0-9_-]*:\s*/.test(line)) {
      continue;
    }
    const separatorIndex = line.indexOf(':');
    const key = line.slice(0, separatorIndex);
    const rawValue = line.slice(separatorIndex + 1).trim();
    values.set(key, rawValue);
  }
  return values;
}

function stripQuotes(value) {
  if (!value) {
    return '';
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function parseInlineStringArray(rawValue) {
  if (!rawValue) {
    return [];
  }
  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function validateFrontmatterFiles(filePaths, requiredKeys, label, errors) {
  return filePaths.map((filePath) => {
    const frontmatter = extractFrontmatter(filePath, errors);
    const topLevel = frontmatter ? parseTopLevelFrontmatter(frontmatter) : new Map();
    for (const key of requiredKeys) {
      if (!topLevel.has(key) || !stripQuotes(topLevel.get(key))) {
        errors.push(`${toRepoPath(filePath)} is missing required ${label} frontmatter key: ${key}.`);
      }
    }
    return { filePath, frontmatter: frontmatter || '', topLevel };
  });
}

function collectMarkdownLinks(filePath) {
  const links = [];
  const pattern = /\[[^\]]+\]\(([^)]+)\)/g;
  const text = readText(filePath);
  for (const match of text.matchAll(pattern)) {
    links.push(match[1]);
  }
  return links;
}

function isExternalLink(target) {
  return target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target);
}

function validateMarkdownLinks(filePaths, errors) {
  let checkedLinks = 0;
  for (const filePath of filePaths) {
    for (const target of collectMarkdownLinks(filePath)) {
      if (isExternalLink(target)) {
        continue;
      }
      const normalizedTarget = decodeURIComponent(target.split('#')[0]);
      if (!normalizedTarget) {
        continue;
      }
      checkedLinks += 1;
      const resolvedPath = path.resolve(path.dirname(filePath), normalizedTarget);
      if (!fs.existsSync(resolvedPath)) {
        errors.push(`${toRepoPath(filePath)} links to missing path: ${target}.`);
      }
    }
  }
  return checkedLinks;
}

function validateWorkflowState(errors) {
  const result = spawnSync('node', [WORKFLOW_HOOK_SCRIPT, 'validate-state'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 5000,
  });

  if (result.error) {
    errors.push(`workflow state validation failed to execute: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    errors.push(`workflow state validation exited with status ${result.status}.`);
    return;
  }

  let payload;
  try {
    payload = JSON.parse(result.stdout);
  } catch (error) {
    errors.push(`workflow state validation returned invalid JSON: ${error.message}`);
    return;
  }

  if (!payload.valid) {
    const details = Array.isArray(payload.errors) ? payload.errors.join('; ') : 'unknown workflow-state validation error';
    errors.push(`workflow-state.json is invalid: ${details}`);
  }

  return payload;
}

function extractHookCommandPaths(command) {
  const matches = [];
  const nodeCommandMatch = command.match(/^node\s+([^\s]+)/);
  if (nodeCommandMatch) {
    matches.push(nodeCommandMatch[1]);
  }
  for (const match of command.matchAll(/(?:^|\s)(\.github\/[^\s'"`]+)/g)) {
    matches.push(match[1]);
  }
  return Array.from(new Set(matches));
}

function walkCommands(value, callback) {
  if (Array.isArray(value)) {
    for (const entry of value) {
      walkCommands(entry, callback);
    }
    return;
  }
  if (!isPlainObject(value)) {
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (['command', 'bash', 'powershell', 'windows'].includes(key) && typeof child === 'string') {
      callback(child);
    } else {
      walkCommands(child, callback);
    }
  }
}

function validateHookConfigs(errors) {
  const hookConfigPaths = walkDirectory(path.join(ROOT, '.github', 'hooks'), (filePath) => filePath.endsWith('.json'));
  for (const filePath of hookConfigPaths) {
    let parsed;
    try {
      parsed = JSON.parse(readText(filePath));
    } catch (error) {
      errors.push(`${toRepoPath(filePath)} is not valid JSON: ${error.message}`);
      continue;
    }

    if (parsed.version !== 1) {
      errors.push(`${toRepoPath(filePath)} must declare version: 1 for Copilot CLI compatibility.`);
    }
    if (!isPlainObject(parsed.hooks)) {
      errors.push(`${toRepoPath(filePath)} must contain a hooks object.`);
      continue;
    }

    walkCommands(parsed, (command) => {
      for (const commandPath of extractHookCommandPaths(command)) {
        const resolvedPath = path.resolve(ROOT, commandPath);
        if (!fs.existsSync(resolvedPath)) {
          errors.push(`${toRepoPath(filePath)} references missing command path: ${commandPath}.`);
        }
      }
    });
  }

  return hookConfigPaths;
}

function validateSupportConfigs(errors) {
  const validatedPaths = [];

  for (const filePath of REQUIRED_CONFIG_FILES) {
    const resolvedPath = path.join(ROOT, filePath);
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`Missing required support config: ${filePath}.`);
      continue;
    }

    validatedPaths.push(resolvedPath);

    let parsed;
    try {
      parsed = JSON.parse(readText(resolvedPath));
    } catch (error) {
      errors.push(`${filePath} is not valid JSON: ${error.message}`);
      continue;
    }

    if (filePath === '.vscode/mcp.json') {
      const inputs = Array.isArray(parsed.inputs) ? parsed.inputs : [];
      if (!isPlainObject(parsed.servers)) {
        errors.push('.vscode/mcp.json must contain a servers object.');
      } else {
        for (const serverName of REQUIRED_MCP_SERVERS) {
          if (!isPlainObject(parsed.servers[serverName])) {
            errors.push(`.vscode/mcp.json is missing the required MCP server: ${serverName}.`);
          }
        }

        const figmaServer = parsed.servers.figma;
        if (isPlainObject(figmaServer)) {
          if (!isPlainObject(figmaServer.headers)) {
            errors.push('.vscode/mcp.json must provide figma authentication headers via an input-backed Authorization header.');
          } else if (figmaServer.headers.Authorization !== 'Bearer ${input:figma-personal-access-token}') {
            errors.push(
              '.vscode/mcp.json must set figma Authorization to "Bearer ${input:figma-personal-access-token}".',
            );
          }
        }
      }

      for (const requiredInput of REQUIRED_MCP_INPUTS) {
        const matchingInput = inputs.find(
          (value) => isPlainObject(value) && value.id === requiredInput.id && value.type === requiredInput.type,
        );
        if (!matchingInput) {
          errors.push(
            `.vscode/mcp.json is missing the required MCP input ${requiredInput.id} of type ${requiredInput.type}.`,
          );
        }
      }
    }

    if (filePath === 'skills-lock.json') {
      if (parsed.version !== 1) {
        errors.push('skills-lock.json must declare version: 1.');
      }
      if (!isPlainObject(parsed.skills)) {
        errors.push('skills-lock.json must contain a skills object.');
      } else {
        for (const skillName of REQUIRED_EXTERNAL_SKILLS) {
          const entry = parsed.skills[skillName];
          if (!isPlainObject(entry)) {
            errors.push(`skills-lock.json is missing the required upstream skill entry: ${skillName}.`);
            continue;
          }

          for (const field of ['source', 'sourceType', 'path', 'ref', 'vendoredAs', 'computedHash']) {
            if (typeof entry[field] !== 'string' || !entry[field].trim()) {
              errors.push(`skills-lock.json entry ${skillName} is missing required field: ${field}.`);
            }
          }

          const vendoredName = typeof entry.vendoredAs === 'string' && entry.vendoredAs.trim() ? entry.vendoredAs : skillName;
          const vendoredDir = path.join(ROOT, REQUIRED_VENDORED_SKILL_ROOT, vendoredName);
          const vendoredSkillPath = path.join(vendoredDir, 'SKILL.md');

          if (!fs.existsSync(vendoredDir) || !fs.statSync(vendoredDir).isDirectory()) {
            errors.push(`Vendored upstream skill directory is missing: ${toRepoPath(vendoredDir)}.`);
            continue;
          }

          if (!fs.existsSync(vendoredSkillPath)) {
            errors.push(`Vendored upstream skill is missing SKILL.md: ${toRepoPath(vendoredSkillPath)}.`);
            continue;
          }

          const { hash } = hashDirectory(vendoredDir);
          if (typeof entry.computedHash === 'string' && entry.computedHash !== hash) {
            errors.push(
              `Vendored upstream skill hash mismatch for ${skillName}: skills-lock.json has ${entry.computedHash} but ${vendoredName} hashes to ${hash}.`,
            );
          }
        }
      }
    }

    if (filePath === '.github/workflow-profile.json') {
      const validation = validateProfile(ROOT, parsed);
      errors.push(...validation.errors);

      for (const issue of generatedIgnoreIssues(ROOT, parsed)) {
        errors.push(issue);
      }

      const commandEntries = Object.entries(isPlainObject(parsed.commands) ? parsed.commands : {});
      for (const [, command] of commandEntries) {
        if (typeof command !== 'string') {
          continue;
        }
        for (const commandPath of extractHookCommandPaths(command)) {
          const resolvedPath = path.resolve(ROOT, commandPath);
          if (!fs.existsSync(resolvedPath)) {
            errors.push(`${filePath} references missing command path: ${commandPath}.`);
          }
        }
      }
    }
  }

  return validatedPaths;
}

function ensureExpectedArtifacts(agentInfos, promptInfos, instructionInfos, skillInfos, hookConfigPaths, errors) {
  const agentNames = new Set(agentInfos.map((info) => stripQuotes(info.topLevel.get('name'))).filter(Boolean));
  const promptFiles = new Set(promptInfos.map((info) => path.basename(info.filePath)));
  const instructionFiles = new Set(instructionInfos.map((info) => path.basename(info.filePath)));
  const skillDirs = new Set(skillInfos.map((info) => path.basename(path.dirname(info.filePath))));
  const hookConfigFiles = new Set(hookConfigPaths.map((filePath) => path.basename(filePath)));

  for (const name of REQUIRED_AGENT_NAMES) {
    if (!agentNames.has(name)) {
      errors.push(`Missing required agent definition for: ${name}.`);
    }
  }

  for (const fileName of REQUIRED_PROMPT_FILES) {
    if (!promptFiles.has(fileName)) {
      errors.push(`Missing required prompt entrypoint: .github/prompts/${fileName}.`);
    }
  }

  for (const fileName of REQUIRED_INSTRUCTION_FILES) {
    if (!instructionFiles.has(fileName)) {
      errors.push(`Missing required instruction overlay: .github/instructions/${fileName}.`);
    }
  }

  for (const dirName of REQUIRED_SKILL_DIRS) {
    if (!skillDirs.has(dirName)) {
      errors.push(`Missing required skill directory: .github/skills/${dirName}/SKILL.md.`);
    }
  }

  for (const fileName of REQUIRED_HOOK_CONFIG_FILES) {
    if (!hookConfigFiles.has(fileName)) {
      errors.push(`Missing required hook config: .github/hooks/${fileName}.`);
    }
  }

  for (const filePath of REQUIRED_HOOK_SCRIPT_FILES) {
    const resolvedPath = path.join(ROOT, filePath);
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`Missing required hook script: ${filePath}.`);
    }
  }

  for (const filePath of REQUIRED_SUPPORT_FILES) {
    const resolvedPath = path.join(ROOT, filePath);
    if (!fs.existsSync(resolvedPath)) {
      errors.push(`Missing required supporting file: ${filePath}.`);
    }
  }

  for (const promptInfo of promptInfos) {
    const agentName = stripQuotes(promptInfo.topLevel.get('agent'));
    if (agentName && !agentNames.has(agentName)) {
      errors.push(`${toRepoPath(promptInfo.filePath)} references unknown agent: ${agentName}.`);
    }
  }

  for (const agentInfo of agentInfos) {
    const declaredTools = parseInlineStringArray(agentInfo.topLevel.get('tools'));
    for (const toolName of declaredTools) {
      if (!ALLOWED_TOOL_ALIASES.has(toolName)) {
        errors.push(`${toRepoPath(agentInfo.filePath)} uses unsupported tool alias: ${toolName}.`);
      }
    }

    const delegatedAgents = parseInlineStringArray(agentInfo.topLevel.get('agents'));
    for (const delegatedAgent of delegatedAgents) {
      if (!agentNames.has(delegatedAgent)) {
        errors.push(`${toRepoPath(agentInfo.filePath)} references unknown delegated agent: ${delegatedAgent}.`);
      }
    }

    for (const match of agentInfo.frontmatter.matchAll(/^\s+agent:\s*"?([^"\n]+)"?\s*$/gm)) {
      const handoffAgent = match[1].trim();
      if (handoffAgent && !agentNames.has(handoffAgent)) {
        errors.push(`${toRepoPath(agentInfo.filePath)} references unknown handoff agent: ${handoffAgent}.`);
      }
    }
  }
}

function extractMarkdownBody(filePath) {
  const text = readText(filePath);
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  return (match ? text.slice(match[0].length) : text).trim();
}

function validateSkillStandards(skillInfos, errors) {
  const namePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  for (const skillInfo of skillInfos) {
    const filePath = skillInfo.filePath;
    const dirName = path.basename(path.dirname(filePath));
    const name = stripQuotes(skillInfo.topLevel.get('name'));
    const description = stripQuotes(skillInfo.topLevel.get('description'));
    const body = extractMarkdownBody(filePath);

    if (name && dirName !== name) {
      errors.push(`${toRepoPath(filePath)} must use a directory name that matches skill frontmatter name: ${name}.`);
    }
    if (name && !namePattern.test(name)) {
      errors.push(`${toRepoPath(filePath)} must use a lowercase kebab-case skill name for Agent Skills compatibility.`);
    }
    if (description && description.length > 1024) {
      errors.push(`${toRepoPath(filePath)} description must stay within 1024 characters for Agent Skills compatibility.`);
    }
    if (description && (!/\buse\b/i.test(description) || !/\b(when|during|after|before)\b/i.test(description))) {
      errors.push(
        `${toRepoPath(filePath)} description should explain both capability and trigger condition, for example "Use this when..." or "Use this during...".`,
      );
    }
    if (!/^#\s+\S/m.test(body)) {
      errors.push(`${toRepoPath(filePath)} should start its Markdown body with a top-level heading.`);
    }
  }
}

function main() {
  const errors = [];
  const warnings = [];

  const markdownFiles = walkDirectory(ROOT, (filePath) => filePath.endsWith('.md'));
  const instructionFiles = walkDirectory(path.join(ROOT, '.github', 'instructions'), (filePath) => filePath.endsWith('.instructions.md'));
  const promptFiles = walkDirectory(path.join(ROOT, '.github', 'prompts'), (filePath) => filePath.endsWith('.prompt.md'));
  const agentFiles = walkDirectory(path.join(ROOT, '.github', 'agents'), (filePath) => filePath.endsWith('.agent.md'));
  const skillFiles = walkDirectory(path.join(ROOT, '.github', 'skills'), (filePath) => path.basename(filePath) === 'SKILL.md');
  const copilotInstructionFiles = [path.join(ROOT, '.github', 'copilot-instructions.md')];

  const workflowStatePayload = validateWorkflowState(errors);
  const hookConfigPaths = validateHookConfigs(errors);
  const supportConfigPaths = validateSupportConfigs(errors);
  const [workflowProfile, workflowProfileLoadErrors] = loadProfile(ROOT);
  errors.push(...workflowProfileLoadErrors);

  if (workflowProfile) {
    const profileValidation = validateProfile(ROOT, workflowProfile);
    warnings.push(...profileValidation.warnings);
    errors.push(...templateBootstrapStateIssues(workflowStatePayload?.state, workflowProfile));
  }

  validateFrontmatterFiles(copilotInstructionFiles, ['applyTo'], 'copilot instruction', errors);
  const instructionInfos = validateFrontmatterFiles(instructionFiles, ['name', 'description', 'applyTo'], 'instruction', errors);
  const promptInfos = validateFrontmatterFiles(promptFiles, ['name', 'description', 'agent'], 'prompt', errors);
  const agentInfos = validateFrontmatterFiles(agentFiles, ['name', 'description'], 'agent', errors);
  const skillInfos = validateFrontmatterFiles(skillFiles, ['name', 'description'], 'skill', errors);

  ensureExpectedArtifacts(agentInfos, promptInfos, instructionInfos, skillInfos, hookConfigPaths, errors);
  validateSkillStandards(skillInfos, errors);
  const checkedLinks = validateMarkdownLinks(markdownFiles, errors);

  if (errors.length > 0) {
    process.stderr.write('Repository validation failed.\n');
    for (const error of errors) {
      process.stderr.write(`- ${error}\n`);
    }
    if (warnings.length > 0) {
      process.stderr.write('Warnings:\n');
      for (const warning of warnings) {
        process.stderr.write(`- ${warning}\n`);
      }
    }
    return 1;
  }

  const checkedArtifactCount =
    copilotInstructionFiles.length + instructionInfos.length + promptInfos.length + agentInfos.length + skillInfos.length;
  process.stdout.write(
    `Repository validation passed: ${checkedArtifactCount} artifact files, ${hookConfigPaths.length} hook configs, ${supportConfigPaths.length} support configs, and ${checkedLinks} markdown links checked.\n`,
  );
  if (warnings.length > 0) {
    process.stdout.write('Warnings:\n');
    for (const warning of warnings) {
      process.stdout.write(`- ${warning}\n`);
    }
  }
  return 0;
}

if (require.main === module) {
  process.exit(main());
}
