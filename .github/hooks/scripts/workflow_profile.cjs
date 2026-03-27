#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const PROFILE_VERSION = 1;
const PROFILE_FILE = path.join('.github', 'workflow-profile.json');
const REPOSITORY_ROLES = new Set(['workflow-template', 'nextjs-app', 'monorepo', 'react-app', 'generic']);
const ADOPTION_MODES = ['from-scratch', 'adopt-existing-project', 'migrate-existing-nextjs'];
const DEFAULT_GENERATED_IGNORE_PATTERNS = ['.github/hooks/*.log', '.next/', 'storybook-static/', 'coverage/', 'dist/'];
const DEFAULT_CONVENTION_TIERS = {
  model: 'contract-driven',
  principle: 'convention-over-deliberation',
  hardConventions: [
    'Respect the six-phase workflow and state contract.',
    'Preserve repository naming, route, and boundary grammar declared by the active profile.',
    'Use the repository quality-gate sequence before delivery.',
  ],
  strongDefaults: [
    'Reuse the repository module shapes, adoption defaults, and approved libraries before inventing new patterns.',
    'Prefer the smallest boundary change and the narrowest side-effect surface that solves the task.',
    'Prefer extending the existing repository grammar over reorganizing it.',
  ],
  localFreedom: [
    'Private helper extraction inside an approved boundary.',
    'Internal function decomposition and local component factoring that do not change public grammar.',
    'Implementation detail that stays inside the approved plan and validation path.',
  ],
};
const DEFAULT_COMMANDS = {
  validateState: 'node .github/hooks/scripts/workflow_hook.cjs validate-state',
  validateRepo: 'node .github/hooks/scripts/validate_repo.cjs',
  proof: 'node .github/hooks/scripts/workflow_hook_proof.cjs',
  doctor: 'node .github/hooks/scripts/workflow_doctor.cjs',
  bootstrap: 'node .github/hooks/scripts/workflow_bootstrap.cjs --force --sync-generated-ignores',
  auditStructure: 'node .github/hooks/scripts/workflow_audit_structure.cjs',
  adoptReport: 'node .github/hooks/scripts/workflow_adopt_report.cjs',
};

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort();
}

function repoPath(root, targetPath) {
  return path.relative(root, targetPath).replace(/\\/g, '/');
}

function profilePath(root) {
  return path.join(root, PROFILE_FILE);
}

function pathExists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function scanApps(root, suffix) {
  const appsDir = path.join(root, 'apps');
  if (!fs.existsSync(appsDir) || !fs.statSync(appsDir).isDirectory()) {
    return [];
  }

  const matches = [];
  for (const entry of fs.readdirSync(appsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const candidate = path.join('apps', entry.name, suffix);
    if (pathExists(root, candidate)) {
      matches.push(candidate);
    }
  }
  return matches;
}

function readPackageJson(root) {
  const filePath = path.join(root, 'package.json');
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function packageDependencies(pkg) {
  if (!pkg) {
    return {};
  }
  return {
    ...(isPlainObject(pkg.dependencies) ? pkg.dependencies : {}),
    ...(isPlainObject(pkg.devDependencies) ? pkg.devDependencies : {}),
    ...(isPlainObject(pkg.peerDependencies) ? pkg.peerDependencies : {}),
  };
}

function detectPackageManager(root) {
  if (pathExists(root, 'pnpm-lock.yaml')) {
    return 'pnpm';
  }
  if (pathExists(root, 'yarn.lock')) {
    return 'yarn';
  }
  if (pathExists(root, 'bun.lockb') || pathExists(root, 'bun.lock')) {
    return 'bun';
  }
  if (pathExists(root, 'package-lock.json')) {
    return 'npm';
  }
  return 'none';
}

function detectAppRoots(root) {
  return uniqueSorted([
    ...(pathExists(root, 'src/app') ? ['src/app'] : []),
    ...scanApps(root, 'src/app'),
  ]);
}

function detectFeatureRoots(root) {
  return uniqueSorted([
    ...(pathExists(root, 'src/features') ? ['src/features'] : []),
    ...(pathExists(root, 'src/modules') ? ['src/modules'] : []),
    ...scanApps(root, 'src/features'),
    ...scanApps(root, 'src/modules'),
  ]);
}

function detectLocaleRoots(root) {
  return uniqueSorted([
    ...(pathExists(root, 'src/messages') ? ['src/messages'] : []),
    ...scanApps(root, 'src/messages'),
  ]);
}

function detectSupportedLocales(root, localeRoots) {
  const locales = [];
  for (const localeRoot of localeRoots) {
    const absoluteRoot = path.join(root, localeRoot);
    if (!fs.existsSync(absoluteRoot) || !fs.statSync(absoluteRoot).isDirectory()) {
      continue;
    }
    for (const entry of fs.readdirSync(absoluteRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(entry.name)) {
        locales.push(entry.name);
      }
    }
  }

  if (locales.length === 0) {
    return ['en', 'th'];
  }

  return uniqueSorted(locales);
}

function detectRepositoryRole(root, pkg, appRoots) {
  const dependencies = packageDependencies(pkg);
  const hasReact = typeof dependencies.react === 'string';
  const hasNext = typeof dependencies.next === 'string' || appRoots.length > 0;
  const hasWorkspaces =
    pathExists(root, 'turbo.json') ||
    pathExists(root, 'pnpm-workspace.yaml') ||
    (Array.isArray(pkg?.workspaces) && pkg.workspaces.length > 0) ||
    isPlainObject(pkg?.workspaces);
  const looksLikeWorkflowTemplate =
    pathExists(root, 'AGENTS.md') &&
    pathExists(root, '.github/prompts') &&
    pathExists(root, '.github/agents') &&
    !pkg &&
    !pathExists(root, 'src');

  if (looksLikeWorkflowTemplate) {
    return 'workflow-template';
  }
  if (hasWorkspaces) {
    return 'monorepo';
  }
  if (hasNext) {
    return 'nextjs-app';
  }
  if (hasReact) {
    return 'react-app';
  }
  return 'generic';
}

function inferQualityGates(root, pkg) {
  const packageManager = detectPackageManager(root);
  const runPrefix = packageManager === 'pnpm' ? 'pnpm' : packageManager === 'yarn' ? 'yarn' : packageManager === 'bun' ? 'bun run' : 'npm run';
  const scripts = isPlainObject(pkg?.scripts) ? pkg.scripts : {};
  const builds = [];

  if (typeof scripts.build === 'string') {
    builds.push(`${runPrefix} build`);
  }
  for (const name of ['build:example-env', 'build:storybook']) {
    if (typeof scripts[name] === 'string') {
      builds.push(`${runPrefix} ${name}`);
    }
  }

  return {
    typecheck: typeof scripts.typecheck === 'string' ? `${runPrefix} typecheck` : typeof scripts['check-types'] === 'string' ? `${runPrefix} check-types` : null,
    lint: typeof scripts.lint === 'string' ? `${runPrefix} lint` : null,
    tests: typeof scripts.test === 'string' ? `${runPrefix} test` : null,
    builds,
  };
}

function buildSuggestedProfile(root) {
  const pkg = readPackageJson(root);
  const appRoots = detectAppRoots(root);
  const featureRoots = detectFeatureRoots(root);
  const localeRoots = detectLocaleRoots(root);
  const repositoryRole = detectRepositoryRole(root, pkg, appRoots);
  const supportedLocales = detectSupportedLocales(root, localeRoots);

  return {
    version: PROFILE_VERSION,
    profileId: 'nextjs-enterprise-workflow',
    repository: {
      name: typeof pkg?.name === 'string' && pkg.name.trim() ? pkg.name.trim() : path.basename(root),
      role: repositoryRole,
      packageManager: detectPackageManager(root),
      generatedIgnorePatterns: DEFAULT_GENERATED_IGNORE_PATTERNS,
    },
    commands: {
      ...DEFAULT_COMMANDS,
      ...inferQualityGates(root, pkg),
    },
    adoption: {
      supportedModes: ADOPTION_MODES,
      defaultTaskId: 'bootstrap-workflow-adoption',
      defaultTaskSummary: 'Bootstrap workflow adoption and discovery for this repository.',
      recommendedAppRoots: ['src/app', 'apps/web/src/app'],
      recommendedFeatureRoots: ['src/features', 'apps/web/src/features'],
      recommendedLocaleRoots: ['src/messages', 'apps/web/src/messages'],
    },
    roots: {
      appRoots,
      featureRoots,
      routeRoots: appRoots,
      localeRoots,
    },
    nextjs: {
      enabled: repositoryRole === 'nextjs-app' || repositoryRole === 'monorepo',
      defaultLocale: supportedLocales.includes('en') ? 'en' : supportedLocales[0] || 'en',
      supportedLocales,
      localePrefix: true,
      visibleRouteBoundary: '[locale]',
    },
    conventions: structuredClone(DEFAULT_CONVENTION_TIERS),
    structure: {
      clientComponentSuffix: '.client.tsx',
      forbiddenLegacyDirectories: ['containers', 'screens'],
      forbiddenLegacyRoots: ['src/modules', 'apps/web/src/modules'],
      forbiddenGenericFileNames: ['utils.ts', 'utils.tsx', 'helpers.ts', 'helpers.tsx', 'common.ts', 'common.tsx'],
    },
  };
}

function loadProfile(root, options = {}) {
  const filePath = profilePath(root);
  if (!fs.existsSync(filePath)) {
    if (options.allowMissing) {
      return [null, []];
    }
    return [null, [`Missing workflow profile: ${PROFILE_FILE}.`]];
  }

  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return [null, [`${PROFILE_FILE} is not valid JSON: ${error.message}`]];
  }

  if (!isPlainObject(parsed)) {
    return [null, [`${PROFILE_FILE} must be a JSON object.`]];
  }

  return [parsed, []];
}

function validateStringArray(value, fieldName, errors) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string' || !entry.trim())) {
    errors.push(`${fieldName} must be an array of non-empty strings.`);
  }
}

function validateProfile(root, profile) {
  const errors = [];
  const warnings = [];
  const pkg = readPackageJson(root);
  const expectedRepositoryName = typeof pkg?.name === 'string' && pkg.name.trim() ? pkg.name.trim() : path.basename(root);

  if (!isPlainObject(profile)) {
    return { errors: ['workflow profile must be a JSON object.'], warnings };
  }

  if (profile.version !== PROFILE_VERSION) {
    errors.push(`${PROFILE_FILE} must declare version: ${PROFILE_VERSION}.`);
  }
  if (typeof profile.profileId !== 'string' || !profile.profileId.trim()) {
    errors.push(`${PROFILE_FILE} must define a non-empty profileId.`);
  }

  const repository = profile.repository;
  if (!isPlainObject(repository)) {
    errors.push(`${PROFILE_FILE} must define a repository object.`);
  } else {
    if (typeof repository.name !== 'string' || !repository.name.trim()) {
      errors.push(`${PROFILE_FILE} repository.name must be a non-empty string.`);
    } else if (repository.name !== expectedRepositoryName) {
      warnings.push(
        `${PROFILE_FILE} repository.name is "${repository.name}" but the detected repository name is "${expectedRepositoryName}".`,
      );
    }

    if (!REPOSITORY_ROLES.has(repository.role)) {
      errors.push(`${PROFILE_FILE} repository.role must be one of: ${Array.from(REPOSITORY_ROLES).join(', ')}.`);
    }
    if (typeof repository.packageManager !== 'string' || !repository.packageManager.trim()) {
      errors.push(`${PROFILE_FILE} repository.packageManager must be a non-empty string.`);
    }
    validateStringArray(repository.generatedIgnorePatterns, `${PROFILE_FILE} repository.generatedIgnorePatterns`, errors);
  }

  const commands = profile.commands;
  if (!isPlainObject(commands)) {
    errors.push(`${PROFILE_FILE} must define a commands object.`);
  } else {
    for (const key of Object.keys(DEFAULT_COMMANDS)) {
      if (typeof commands[key] !== 'string' || !commands[key].trim()) {
        errors.push(`${PROFILE_FILE} commands.${key} must be a non-empty string.`);
      }
    }
    for (const key of ['typecheck', 'lint', 'tests']) {
      if (commands[key] !== null && typeof commands[key] !== 'string') {
        errors.push(`${PROFILE_FILE} commands.${key} must be either null or a string.`);
      }
    }
    if (commands.builds !== undefined) {
      validateStringArray(commands.builds, `${PROFILE_FILE} commands.builds`, errors);
    }
  }

  const adoption = profile.adoption;
  if (!isPlainObject(adoption)) {
    errors.push(`${PROFILE_FILE} must define an adoption object.`);
  } else {
    validateStringArray(adoption.supportedModes, `${PROFILE_FILE} adoption.supportedModes`, errors);
    for (const mode of ADOPTION_MODES) {
      if (!Array.isArray(adoption.supportedModes) || !adoption.supportedModes.includes(mode)) {
        errors.push(`${PROFILE_FILE} adoption.supportedModes must include "${mode}".`);
      }
    }
    for (const key of ['defaultTaskId', 'defaultTaskSummary']) {
      if (typeof adoption[key] !== 'string' || !adoption[key].trim()) {
        errors.push(`${PROFILE_FILE} adoption.${key} must be a non-empty string.`);
      }
    }
    for (const key of ['recommendedAppRoots', 'recommendedFeatureRoots', 'recommendedLocaleRoots']) {
      validateStringArray(adoption[key], `${PROFILE_FILE} adoption.${key}`, errors);
    }
  }

  const roots = profile.roots;
  if (!isPlainObject(roots)) {
    errors.push(`${PROFILE_FILE} must define a roots object.`);
  } else {
    for (const key of ['appRoots', 'featureRoots', 'routeRoots', 'localeRoots']) {
      validateStringArray(roots[key], `${PROFILE_FILE} roots.${key}`, errors);
    }
  }

  const nextjs = profile.nextjs;
  if (!isPlainObject(nextjs)) {
    errors.push(`${PROFILE_FILE} must define a nextjs object.`);
  } else {
    if (typeof nextjs.enabled !== 'boolean') {
      errors.push(`${PROFILE_FILE} nextjs.enabled must be a boolean.`);
    }
    if (typeof nextjs.defaultLocale !== 'string' || !nextjs.defaultLocale.trim()) {
      errors.push(`${PROFILE_FILE} nextjs.defaultLocale must be a non-empty string.`);
    }
    validateStringArray(nextjs.supportedLocales, `${PROFILE_FILE} nextjs.supportedLocales`, errors);
    if (typeof nextjs.localePrefix !== 'boolean') {
      errors.push(`${PROFILE_FILE} nextjs.localePrefix must be a boolean.`);
    }
    if (typeof nextjs.visibleRouteBoundary !== 'string' || !nextjs.visibleRouteBoundary.trim()) {
      errors.push(`${PROFILE_FILE} nextjs.visibleRouteBoundary must be a non-empty string.`);
    }
  }

  const conventions = profile.conventions;
  if (!isPlainObject(conventions)) {
    errors.push(`${PROFILE_FILE} must define a conventions object.`);
  } else {
    if (typeof conventions.model !== 'string' || !conventions.model.trim()) {
      errors.push(`${PROFILE_FILE} conventions.model must be a non-empty string.`);
    } else if (conventions.model !== DEFAULT_CONVENTION_TIERS.model) {
      errors.push(`${PROFILE_FILE} conventions.model must be "${DEFAULT_CONVENTION_TIERS.model}".`);
    }
    if (typeof conventions.principle !== 'string' || !conventions.principle.trim()) {
      errors.push(`${PROFILE_FILE} conventions.principle must be a non-empty string.`);
    } else if (conventions.principle !== DEFAULT_CONVENTION_TIERS.principle) {
      errors.push(`${PROFILE_FILE} conventions.principle must be "${DEFAULT_CONVENTION_TIERS.principle}".`);
    }
    for (const key of ['hardConventions', 'strongDefaults', 'localFreedom']) {
      validateStringArray(conventions[key], `${PROFILE_FILE} conventions.${key}`, errors);
    }
  }

  const structure = profile.structure;
  if (!isPlainObject(structure)) {
    errors.push(`${PROFILE_FILE} must define a structure object.`);
  } else {
    if (typeof structure.clientComponentSuffix !== 'string' || !structure.clientComponentSuffix.trim()) {
      errors.push(`${PROFILE_FILE} structure.clientComponentSuffix must be a non-empty string.`);
    }
    for (const key of ['forbiddenLegacyDirectories', 'forbiddenLegacyRoots', 'forbiddenGenericFileNames']) {
      validateStringArray(structure[key], `${PROFILE_FILE} structure.${key}`, errors);
    }
  }

  if (repository?.role === 'workflow-template') {
    const rootsValue = profile.roots || {};
    if ([...(rootsValue.appRoots || []), ...(rootsValue.featureRoots || []), ...(rootsValue.routeRoots || []), ...(rootsValue.localeRoots || [])].length > 0) {
      warnings.push('workflow-template profiles should usually keep roots arrays empty and rely on adoption defaults for target repositories.');
    }
  }

  if (repository?.role !== 'workflow-template' && nextjs?.enabled) {
    if (!Array.isArray(profile.roots?.appRoots) || profile.roots.appRoots.length === 0) {
      warnings.push('Next.js-enabled profiles should usually declare at least one app root.');
    }
    if (!Array.isArray(profile.roots?.featureRoots) || profile.roots.featureRoots.length === 0) {
      warnings.push('Next.js-enabled profiles should usually declare at least one feature root.');
    }
  }

  return { errors, warnings };
}

function readGitignoreLines(root) {
  const filePath = path.join(root, '.gitignore');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeIgnorePattern(pattern) {
  return String(pattern || '')
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function generatedIgnoreIssues(root, profile) {
  const lines = new Set(readGitignoreLines(root).map(normalizeIgnorePattern));
  const patterns = Array.isArray(profile?.repository?.generatedIgnorePatterns) ? profile.repository.generatedIgnorePatterns : [];
  return patterns
    .filter((pattern) => !lines.has(normalizeIgnorePattern(pattern)))
    .map((pattern) => `Missing .gitignore entry for generated artifact pattern: ${pattern}.`);
}

function templateBootstrapStateIssues(state, profile) {
  const issues = [];
  if (profile?.repository?.role !== 'workflow-template') {
    return issues;
  }

  const looksBootstrapped =
    state &&
    state.phase === 'discovery' &&
    !state.taskId &&
    !state.taskSummary &&
    state.requirements?.status === 'needs-clarification' &&
    state.plan?.status === 'not-started' &&
    state.implementation?.status === 'not-started' &&
    state.delivery?.status === 'blocked';

  if (!looksBootstrapped) {
    issues.push('workflow-template repositories must ship .github/workflow-state.json as a discovery-phase bootstrap baseline.');
  }

  return issues;
}

module.exports = {
  ADOPTION_MODES,
  DEFAULT_COMMANDS,
  DEFAULT_CONVENTION_TIERS,
  DEFAULT_GENERATED_IGNORE_PATTERNS,
  PROFILE_FILE,
  PROFILE_VERSION,
  buildSuggestedProfile,
  detectAppRoots,
  detectFeatureRoots,
  detectLocaleRoots,
  detectPackageManager,
  generatedIgnoreIssues,
  loadProfile,
  normalizeIgnorePattern,
  profilePath,
  readPackageJson,
  repoPath,
  templateBootstrapStateIssues,
  validateProfile,
};
