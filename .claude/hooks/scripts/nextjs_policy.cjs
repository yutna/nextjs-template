#!/usr/bin/env node
'use strict';

/**
 * Next.js Policy Hook - Convention enforcement for Next.js projects
 *
 * This hook runs as PostToolUse to check file edits against Next.js conventions.
 *
 * Usage (as hook):
 *   Receives JSON event on stdin, outputs JSON result on stdout
 *
 * Usage (standalone):
 *   node .claude/hooks/scripts/nextjs_policy.cjs check <file-path>
 */

const fs = require('node:fs');
const path = require('node:path');

const PROFILE_FILE = '.claude/workflow-profile.json';

// Default forbidden patterns if profile is not available
const DEFAULT_FORBIDDEN_FILES = [
  'utils.ts', 'utils.tsx',
  'helpers.ts', 'helpers.tsx',
  'common.ts', 'common.tsx',
];

const MODULE_SUBDIRS = [
  'actions', 'components', 'containers', 'screens',
  'hooks', 'contexts', 'lib', 'styles', 'constants',
];

function loadProfile() {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8'));
    }
  } catch {
    // Fall back to defaults
  }
  return null;
}

function getForbiddenFiles(profile) {
  return profile?.structure?.forbiddenGenericFiles || DEFAULT_FORBIDDEN_FILES;
}

function getModuleSubdirs(profile) {
  return profile?.structure?.moduleSubdirs || MODULE_SUBDIRS;
}

function isModulePath(filePath) {
  return filePath.includes('/modules/') || filePath.includes('\\modules\\');
}

function isScreenPath(filePath) {
  return filePath.includes('/screens/') || filePath.includes('\\screens\\');
}

function isContainerPath(filePath) {
  return filePath.includes('/containers/') || filePath.includes('\\containers\\');
}

function isComponentPath(filePath) {
  return filePath.includes('/components/') || filePath.includes('\\components\\');
}

function getFileName(filePath) {
  return path.basename(filePath);
}

function checkForbiddenFile(filePath, forbiddenFiles) {
  const fileName = getFileName(filePath);
  if (forbiddenFiles.includes(fileName)) {
    return {
      message: `Avoid generic file "${fileName}". Use specific named modules instead.`,
      severity: 'warning',
      suggestion: 'Rename to a more specific name that describes the content.',
      violation: true,
    };
  }
  return null;
}

function checkModuleStructure(filePath, moduleSubdirs) {
  if (!isModulePath(filePath)) {
    return null;
  }

  // Extract module path parts
  const parts = filePath.split(/[/\\]/);
  const modulesIndex = parts.indexOf('modules');
  if (modulesIndex === -1 || modulesIndex >= parts.length - 2) {
    return null;
  }

  const subdir = parts[modulesIndex + 2];
  if (subdir && !moduleSubdirs.includes(subdir) && !subdir.includes('.')) {
    return {
      message: `Non-standard module subdirectory: "${subdir}".`,
      severity: 'warning',
      suggestion: `Use one of: ${moduleSubdirs.join(', ')}`,
      violation: true,
    };
  }

  return null;
}

function checkUseClientInScreens(filePath, content) {
  if (!isScreenPath(filePath)) {
    return null;
  }

  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return null;
  }

  // Check if file has "use client" directive
  const lines = content.split('\n').slice(0, 5); // Check first 5 lines
  const hasUseClient = lines.some(line =>
    line.trim().startsWith("'use client'") ||
    line.trim().startsWith('"use client"')
  );

  if (hasUseClient) {
    return {
      message: 'Screens should be Server Components. Found "use client" directive.',
      severity: 'warning',
      suggestion: 'Move client-side logic to containers/ or hooks/.',
      violation: true,
    };
  }

  return null;
}

function checkFileContent(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  const violations = [];
  const profile = loadProfile();
  const forbiddenFiles = getForbiddenFiles(profile);
  const moduleSubdirs = getModuleSubdirs(profile);

  // Check forbidden file names
  const forbiddenCheck = checkForbiddenFile(filePath, forbiddenFiles);
  if (forbiddenCheck) {
    violations.push(forbiddenCheck);
  }

  // Check module structure
  const structureCheck = checkModuleStructure(filePath, moduleSubdirs);
  if (structureCheck) {
    violations.push(structureCheck);
  }

  // Check file content if it's a TypeScript/TSX file
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for "use client" in screens
      const useClientCheck = checkUseClientInScreens(filePath, content);
      if (useClientCheck) {
        violations.push(useClientCheck);
      }
    } catch {
      // Skip content checks if file can't be read
    }
  }

  return violations;
}

function formatViolations(violations, filePath) {
  if (violations.length === 0) {
    return null;
  }

  const messages = violations.map(v => {
    const prefix = v.severity === 'error' ? '❌' : '⚠️';
    return `${prefix} ${v.message}\n   💡 ${v.suggestion}`;
  });

  return `Next.js policy check for ${filePath}:\n${messages.join('\n')}`;
}

function handleHookEvent() {
  let rawEvent = '';

  if (!process.stdin.isTTY) {
    try {
      rawEvent = fs.readFileSync(0, 'utf8').trim();
    } catch {
      rawEvent = '';
    }
  }

  if (!rawEvent) {
    // No event data, nothing to check
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    return;
  }

  let event;
  try {
    event = JSON.parse(rawEvent);
  } catch {
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    return;
  }

  // Extract file path from tool input
  const toolInput = event.tool_input || event.toolInput || {};
  const filePath = toolInput.file_path || toolInput.filePath || toolInput.path || '';

  if (!filePath) {
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
    return;
  }

  const violations = checkFileContent(filePath);
  const message = formatViolations(violations, filePath);

  if (message) {
    process.stdout.write(JSON.stringify({
      additionalContext: message,
      continue: true,
    }) + '\n');
  } else {
    process.stdout.write(JSON.stringify({ continue: true }) + '\n');
  }
}

function handleStandaloneCheck(filePath) {
  console.log(`\n🔍 Checking: ${filePath}\n`);

  const violations = checkFileContent(filePath);

  if (violations.length === 0) {
    console.log('✅ No policy violations found.');
    process.exit(0);
  }

  console.log(`Found ${violations.length} violation(s):\n`);
  for (const v of violations) {
    const prefix = v.severity === 'error' ? '❌' : '⚠️';
    console.log(`${prefix} ${v.message}`);
    console.log(`   💡 ${v.suggestion}\n`);
  }

  const hasErrors = violations.some(v => v.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);

  if (args[0] === 'check' && args[1]) {
    handleStandaloneCheck(args[1]);
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
Next.js Policy Check

Usage:
  As hook (receives stdin):
    echo '{"tool_input":{"file_path":"src/test.ts"}}' | node nextjs_policy.cjs

  Standalone:
    node nextjs_policy.cjs check <file-path>

Checks:
  - Forbidden generic files (utils.ts, helpers.ts, common.ts)
  - Module structure conventions
  - "use client" in screens (should be Server Components)
`);
  } else {
    handleHookEvent();
  }
}

main();
