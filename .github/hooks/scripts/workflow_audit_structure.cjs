#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const { loadProfile, validateProfile } = require('./workflow_profile.cjs');

const FRAMEWORK_ROUTE_FILES = new Set(['page.tsx', 'page.ts', 'layout.tsx', 'layout.ts', 'error.tsx', 'error.ts', 'loading.tsx', 'loading.ts', 'template.tsx', 'template.ts', 'default.tsx', 'default.ts']);
const SKIPPED_DIRECTORIES = new Set(['.git', '.next', 'node_modules', 'coverage', 'dist', 'storybook-static']);

function walkFiles(root, predicate) {
  const files = [];

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        if (SKIPPED_DIRECTORIES.has(entry.name)) {
          continue;
        }
        walk(fullPath);
      } else if (predicate(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  if (fs.existsSync(root)) {
    walk(root);
  }

  return files.sort();
}

function rel(root, filePath) {
  return path.relative(root, filePath).replace(/\\/g, '/');
}

function hasUseClientDirective(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  return /^\s*["']use client["'];/m.test(text);
}

function isApprovedClientLocation(relativePath) {
  return (
    /\/components\/client\//.test(relativePath) ||
    /\.client\.[jt]sx?$/.test(relativePath) ||
    /(?:^|\/)(error|global-error)\.tsx$/.test(relativePath)
  );
}

function collectFindings(root, profile) {
  const findings = [];
  const roots = profile.roots || {};
  const structure = profile.structure || {};
  const forbiddenLegacyDirectories = new Set(structure.forbiddenLegacyDirectories || []);
  const forbiddenLegacyRoots = new Set(structure.forbiddenLegacyRoots || []);
  const forbiddenGenericFileNames = new Set(structure.forbiddenGenericFileNames || []);
  const routeRoots = Array.isArray(roots.routeRoots) ? roots.routeRoots : [];
  const featureRoots = Array.isArray(roots.featureRoots) ? roots.featureRoots : [];
  const visibleRouteBoundary = profile.nextjs?.visibleRouteBoundary || '[locale]';

  for (const legacyRoot of forbiddenLegacyRoots) {
    if (fs.existsSync(path.join(root, legacyRoot))) {
      findings.push(`Legacy feature root detected: ${legacyRoot}`);
    }
  }

  for (const featureRoot of featureRoots) {
    const absoluteRoot = path.join(root, featureRoot);
    for (const filePath of walkFiles(absoluteRoot, () => true)) {
      const relativePath = rel(root, filePath);
      const parts = relativePath.split('/');

      for (const segment of parts.slice(0, -1)) {
        if (forbiddenLegacyDirectories.has(segment)) {
          findings.push(`Legacy directory detected in feature tree: ${relativePath}`);
          break;
        }
      }

      if (forbiddenGenericFileNames.has(path.basename(filePath))) {
        findings.push(`Generic file name detected in feature tree: ${relativePath}`);
      }

      if (!/\.(t|j)sx?$/.test(filePath)) {
        continue;
      }

      if (hasUseClientDirective(filePath)) {
        const baseName = path.basename(filePath);
        const isFrameworkRoute = FRAMEWORK_ROUTE_FILES.has(baseName);
        if (!isFrameworkRoute && !isApprovedClientLocation(relativePath)) {
          findings.push(`Client file must stay under components/client/ or use a .client.* suffix: ${relativePath}`);
        }
      }
    }
  }

  for (const routeRoot of routeRoots) {
    const absoluteRoot = path.join(root, routeRoot);
    for (const filePath of walkFiles(absoluteRoot, (value) => FRAMEWORK_ROUTE_FILES.has(path.basename(value)))) {
      const relativeFromRouteRoot = rel(absoluteRoot, filePath).split('/');
      const containsLocaleBoundary = relativeFromRouteRoot.includes(visibleRouteBoundary);
      const isRootShell = relativeFromRouteRoot.length === 1;

      if (!isRootShell && !containsLocaleBoundary) {
        findings.push(`Visible route shell is outside ${visibleRouteBoundary}: ${rel(root, filePath)}`);
      }
    }
  }

  return findings;
}

function main() {
  const cwd = process.cwd();
  const json = process.argv.includes('--json');
  const [profile, loadErrors] = loadProfile(cwd);
  const validation = profile ? validateProfile(cwd, profile) : { errors: [], warnings: [] };

  if (loadErrors.length > 0 || validation.errors.length > 0) {
    const errors = [...loadErrors, ...validation.errors];
    if (json) {
      process.stdout.write(`${JSON.stringify({ status: 'error', errors }, null, 2)}\n`);
    } else {
      process.stderr.write('workflow structure audit could not start because the workflow profile is invalid.\n');
      for (const error of errors) {
        process.stderr.write(`- ${error}\n`);
      }
    }
    return 1;
  }

  if (profile.repository?.role === 'workflow-template') {
    const payload = {
      status: 'not-applicable',
      findings: [],
      warnings: ['workflow-template profiles do not audit product structure because this repository ships the workflow itself.'],
    };
    process.stdout.write(json ? `${JSON.stringify(payload, null, 2)}\n` : 'workflow structure audit: not applicable for workflow-template repositories.\n');
    return 0;
  }

  const findings = collectFindings(cwd, profile);
  const payload = {
    status: findings.length > 0 ? 'failed' : 'passed',
    findings,
    warnings: validation.warnings,
  };

  if (json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  } else if (findings.length === 0) {
    process.stdout.write('workflow structure audit passed.\n');
  } else {
    process.stderr.write('workflow structure audit failed.\n');
    for (const finding of findings) {
      process.stderr.write(`- ${finding}\n`);
    }
  }

  return findings.length === 0 ? 0 : 1;
}

if (require.main === module) {
  process.exit(main());
}
