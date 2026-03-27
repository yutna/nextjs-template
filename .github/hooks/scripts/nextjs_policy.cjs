#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const workflowHook = require('./workflow_hook.cjs');

const TECHNICAL_ROUTE_GROUP_NAMES = new Set([
  'client',
  'clients',
  'common',
  'component',
  'components',
  'data',
  'feature',
  'features',
  'helpers',
  'hook',
  'hooks',
  'lib',
  'platform',
  'server',
  'service',
  'services',
  'shared',
  'team',
  'teams',
  'type',
  'types',
  'util',
  'utils',
]);

const TRANSLATABLE_PROP_NAMES = [
  'alt',
  'aria-label',
  'ariaLabel',
  'caption',
  'description',
  'emptyMessage',
  'emptyState',
  'emptyText',
  'heading',
  'helperText',
  'label',
  'message',
  'placeholder',
  'subheading',
  'subtitle',
  'text',
  'title',
];

const TRANSLATABLE_OBJECT_KEYS = [
  'alt',
  'caption',
  'description',
  'emptyMessage',
  'emptyText',
  'heading',
  'helperText',
  'label',
  'message',
  'placeholder',
  'subtitle',
  'text',
  'title',
];

const FEATURE_TOP_LEVEL_DIRECTORY_NAMES = new Set([
  'actions',
  'components',
  'constants',
  'contracts',
  'data',
  'policies',
  'schemas',
  'tests',
]);

const GENERIC_PRODUCT_NAME_TOKENS = new Set([
  'common',
  'helper',
  'helpers',
  'lib',
  'misc',
  'new',
  'temp',
  'tmp',
  'type',
  'types',
  'util',
  'utils',
]);

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function lower(value) {
  return String(value || '').toLowerCase();
}

function isKebabCaseSegment(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value || ''));
}

function loadEvent() {
  if (process.stdin.isTTY) {
    return {};
  }
  const raw = fs.readFileSync(0, 'utf8').trim();
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseStructuredValue(value) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeEvent(mode, rawEvent) {
  const toolInput =
    rawEvent?.tool_input ??
    parseStructuredValue(rawEvent?.toolArgs ?? rawEvent?.tool_args) ??
    {};

  return {
    mode,
    cwd: rawEvent?.cwd ?? '.',
    rawEvent,
    toolName: lower(rawEvent?.tool_name ?? rawEvent?.toolName),
    toolInput,
  };
}

function emit(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
  return 0;
}

function emitHookPayload(hookEventName, response = {}) {
  const payload = {};

  if ('continue' in response) {
    payload.continue = response.continue;
  }
  if ('decision' in response) {
    payload.decision = response.decision;
  }
  if ('reason' in response) {
    payload.reason = response.reason;
  }
  if ('permissionDecision' in response) {
    payload.permissionDecision = response.permissionDecision;
  }
  if ('permissionDecisionReason' in response) {
    payload.permissionDecisionReason = response.permissionDecisionReason;
  }
  if ('additionalContext' in response && response.additionalContext) {
    payload.additionalContext = response.additionalContext;
  }

  payload.hookSpecificOutput = { hookEventName };
  if ('permissionDecision' in response) {
    payload.hookSpecificOutput.permissionDecision = response.permissionDecision;
  }
  if ('permissionDecisionReason' in response && response.permissionDecisionReason) {
    payload.hookSpecificOutput.permissionDecisionReason = response.permissionDecisionReason;
  }
  if ('additionalContext' in response && response.additionalContext) {
    payload.hookSpecificOutput.additionalContext = response.additionalContext;
  }

  return emit(payload);
}

function emitContinue(hookEventName, additionalContext = '') {
  return emitHookPayload(hookEventName, {
    continue: true,
    additionalContext,
  });
}

function emitPreToolDecision(decision, permissionDecisionReason = '', additionalContext = '') {
  const response = {
    permissionDecision: decision,
    additionalContext,
  };
  if (permissionDecisionReason) {
    response.permissionDecisionReason = permissionDecisionReason;
  }
  if (decision === 'allow') {
    response.continue = true;
  }
  return emitHookPayload('PreToolUse', response);
}

function emitPostToolBlock(reason, additionalContext = '') {
  return emitHookPayload('PostToolUse', {
    decision: 'block',
    reason,
    additionalContext,
  });
}

function emitSessionContext(additionalContext = '') {
  return emitHookPayload('SessionStart', { additionalContext });
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function repoRelative(cwd, filePath) {
  return path.relative(cwd, filePath).replace(/\\/g, '/');
}

function pathExists(filePath) {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function loadState(cwd) {
  return workflowHook.loadState(cwd);
}

function findProjectLayout(cwd) {
  const appRoots = unique(
    [
      path.join(cwd, 'apps', 'web', 'src', 'app'),
      path.join(cwd, 'src', 'app'),
      path.join(cwd, 'app'),
    ].filter(pathExists),
  );

  const pagesRoots = unique(
    [
      path.join(cwd, 'apps', 'web', 'src', 'pages'),
      path.join(cwd, 'src', 'pages'),
      path.join(cwd, 'pages'),
    ].filter(pathExists),
  );

  const packageJsonPath = path.join(cwd, 'package.json');
  const hasPackageJson = pathExists(packageJsonPath);
  let isNextProject = appRoots.length > 0 || pagesRoots.length > 0;
  if (hasPackageJson) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      if (typeof deps.next === 'string') {
        isNextProject = true;
      }
    } catch {
      // Ignore malformed package.json here; this policy is advisory unless explicit file violations exist.
    }
  }

  return {
    appRoots,
    pagesRoots,
    hasAppRouter: appRoots.length > 0,
    hasPagesRouter: pagesRoots.length > 0,
    isNextProject,
  };
}

function collectApprovalText(state) {
  const values = [];
  if (!isPlainObject(state)) {
    return '';
  }

  for (const key of ['taskId', 'taskSummary']) {
    if (typeof state[key] === 'string') {
      values.push(state[key]);
    }
  }

  if (isPlainObject(state.requirements)) {
    values.push(...(state.requirements.acceptanceCriteria || []));
    values.push(...(state.requirements.constraints || []));
    values.push(...(state.requirements.openQuestions || []));
  }
  if (isPlainObject(state.plan)) {
    if (typeof state.plan.summary === 'string') {
      values.push(state.plan.summary);
    }
  }
  if (isPlainObject(state.delivery) && typeof state.delivery.notes === 'string') {
    values.push(state.delivery.notes);
  }
  if (isPlainObject(state.stackContext)) {
    if (typeof state.stackContext.profile === 'string') {
      values.push(state.stackContext.profile);
    }
    if (isPlainObject(state.stackContext.routeDesign)) {
      values.push(...(state.stackContext.routeDesign.canonicalAreas || []));
      values.push(...(state.stackContext.routeDesign.dynamicSegments || []));
      values.push(...(state.stackContext.routeDesign.specialRoutingFeatures || []));
    }
    if (isPlainObject(state.stackContext.migration) && typeof state.stackContext.migration.mode === 'string') {
      values.push(state.stackContext.migration.mode);
    }
  }

  return values.join(' ').toLowerCase();
}

function isMigrationTask(state) {
  const text = collectApprovalText(state);
  return text.includes('migration') || text.includes('legacy') || text.includes('pages router');
}

function hasApprovedFeature(state, featurePatterns) {
  const text = collectApprovalText(state);
  return featurePatterns.some((pattern) => text.includes(pattern));
}

function getPotentialPaths(toolInput) {
  const values = [];
  if (!isPlainObject(toolInput)) {
    return values;
  }

  const directFields = ['filePath', 'path', 'targetPath', 'newPath'];
  for (const field of directFields) {
    if (typeof toolInput[field] === 'string') {
      values.push(toolInput[field]);
    }
  }

  if (Array.isArray(toolInput.files)) {
    for (const value of toolInput.files) {
      if (typeof value === 'string') {
        values.push(value);
      } else if (isPlainObject(value)) {
        for (const field of directFields) {
          if (typeof value[field] === 'string') {
            values.push(value[field]);
          }
        }
      }
    }
  }

  return unique(values);
}

function resolveTargetPaths(cwd, toolInput) {
  return unique(
    getPotentialPaths(toolInput).map((candidate) =>
      path.isAbsolute(candidate) ? path.normalize(candidate) : path.resolve(cwd, candidate),
    ),
  );
}

function extractCommandText(toolInput) {
  if (!isPlainObject(toolInput)) {
    return '';
  }
  for (const key of ['command', 'bash', 'powershell', 'windows']) {
    if (typeof toolInput[key] === 'string') {
      return toolInput[key];
    }
  }
  return '';
}

function isEditTool(toolName) {
  return ['edit', 'editfiles', 'multiedit'].includes(toolName);
}

function isCommandTool(toolName) {
  return ['runterminalcommand', 'bash', 'execute', 'exec', 'command'].includes(toolName);
}

function routeGroupNames(relPath) {
  return Array.from(relPath.matchAll(/(?:^|\/)\(([^/]+)\)(?=\/|$)/g)).map((match) => lower(match[1]));
}

function advancedRoutingKinds(relPath) {
  const kinds = [];
  if (/(?:^|\/)@[^/]+(?=\/|$)/.test(relPath)) {
    kinds.push('parallel');
  }
  if (/(?:^|\/)\((?:\.|\.\.|\.{3}|\.\.\.\.)\)(?=\/|$)/.test(relPath)) {
    kinds.push('intercepting');
  }
  return kinds;
}

function isTechnicalRouteGroup(relPath) {
  return routeGroupNames(relPath).some((name) => TECHNICAL_ROUTE_GROUP_NAMES.has(name));
}

function isGreenfieldAppRouterProject(layout, state) {
  return layout.hasAppRouter && !layout.hasPagesRouter && !isMigrationTask(state);
}

function touchesPagesRouter(relPath) {
  return /(?:^|\/)pages\//.test(relPath);
}

function referencesPagesInCommand(commandText) {
  return /(?:^|\s)(?:apps\/web\/src\/pages|src\/pages|pages)\//.test(commandText);
}

function isEnvModule(relPath) {
  return /(?:^|\/)env(?:\/|\.|$)/.test(relPath);
}

function isLoggerModule(relPath) {
  return /(?:^|\/)(?:logger|logging)(?:\/|\.|$)/.test(relPath);
}

function isAppSourceFile(relPath) {
  return /^(?:apps\/web\/src|src)\//.test(relPath) && /\.(?:ts|tsx|js|jsx)$/.test(relPath);
}

function isClientFile(relPath, text) {
  return /^\s*['"]use client['"]\s*;?/m.test(text) || /\.client\.[jt]sx?$/.test(relPath);
}

function isApprovedClientLocation(relPath) {
  return (
    /\/components\/client\//.test(relPath) ||
    /\.client\.[jt]sx?$/.test(relPath) ||
    /(?:^|\/)(error|global-error)\.tsx$/.test(relPath)
  );
}

function isPageFile(relPath) {
  return /(?:^|\/)page\.tsx$/.test(relPath);
}

function isRouteRegistryFile(relPath) {
  return /^(?:apps\/web\/src|src)\/shared\/routes\//.test(relPath);
}

function firstVisibleAppSegment(relPath) {
  const info = appRoutePathInfo(relPath);
  if (!info) {
    return '';
  }
  for (const segment of info.parts.slice(0, -1)) {
    if (segment.startsWith('(') && segment.endsWith(')')) {
      continue;
    }
    return segment;
  }
  return '';
}

function appRouteNeedsLocaleBoundary(relPath) {
  const info = appRoutePathInfo(relPath);
  if (!info) {
    return false;
  }
  if (!isRouteShell(relPath)) {
    return false;
  }
  if (info.parts.length <= 1) {
    return false;
  }

  const visibleSegment = firstVisibleAppSegment(relPath);
  if (!visibleSegment) {
    return true;
  }
  return visibleSegment !== '[locale]' && visibleSegment !== 'api';
}

function featureModulePathInfo(relPath) {
  const match = relPath.match(/^(?:apps\/web\/src|src)\/features\/([^/]+)(?:\/(.+))?$/);
  if (!match) {
    return null;
  }
  return {
    featureSlug: match[1],
    parts: match[2] ? match[2].split('/') : [],
  };
}

function routeRegistryPathInfo(relPath) {
  const match = relPath.match(/^(?:apps\/web\/src|src)\/shared\/routes\/(.+)$/);
  if (!match) {
    return null;
  }
  return {
    parts: match[1].split('/'),
  };
}

function appRoutePathInfo(relPath) {
  const match = relPath.match(/^(?:(?:apps\/web\/src|src)\/app|app)\/(.+)$/);
  if (!match) {
    return null;
  }
  return {
    parts: match[1].split('/'),
  };
}

function structuredFileNameTokens(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .split('.')
    .filter(Boolean);
}

function isGenericProductName(token) {
  return GENERIC_PRODUCT_NAME_TOKENS.has(lower(token));
}

function featureModulePathViolations(relPath) {
  const info = featureModulePathInfo(relPath);
  if (!info) {
    return [];
  }

  const violations = [];
  if (!isKebabCaseSegment(info.featureSlug) || isGenericProductName(info.featureSlug)) {
    violations.push(`${relPath}: feature folder names must use canonical lowercase kebab-case slugs.`);
  }

  if (info.parts.length === 0) {
    return violations;
  }

  const fileName = info.parts[info.parts.length - 1];
  const directoryParts = info.parts.slice(0, -1);

  if (directoryParts.length > 0 && !FEATURE_TOP_LEVEL_DIRECTORY_NAMES.has(directoryParts[0])) {
    violations.push(
      `${relPath}: feature modules may only use these top-level folders: ${Array.from(FEATURE_TOP_LEVEL_DIRECTORY_NAMES).join(
        ', ',
      )}.`,
    );
  }

  for (const dirName of directoryParts) {
    if (!isKebabCaseSegment(dirName)) {
      violations.push(`${relPath}: feature directory names must use lowercase kebab-case.`);
      break;
    }
    if (dirName !== 'client' && isGenericProductName(dirName)) {
      violations.push(`${relPath}: generic feature directories such as ${dirName} are not allowed.`);
      break;
    }
  }

  if (fileName === 'index.ts' && directoryParts.length > 0) {
    violations.push(`${relPath}: nested index.ts barrels are not allowed inside feature modules.`);
  } else if (fileName !== 'index.ts') {
    const tokens = structuredFileNameTokens(fileName);
    if (tokens.length === 0 || !tokens.every((token) => isKebabCaseSegment(token))) {
      violations.push(
        `${relPath}: feature file names must use lowercase kebab-case with optional dotted suffixes such as .client, .action, .query, .schema, or .test.`,
      );
    }
    if (tokens.length > 0 && isGenericProductName(tokens[0])) {
      violations.push(`${relPath}: generic file names such as ${tokens[0]} are not allowed inside feature modules.`);
    }
  }

  return unique(violations);
}

function routeRegistryPathViolations(relPath) {
  const info = routeRegistryPathInfo(relPath);
  if (!info) {
    return [];
  }

  const violations = [];
  const fileName = info.parts[info.parts.length - 1];
  const directoryParts = info.parts.slice(0, -1);

  for (const dirName of directoryParts) {
    if (!isKebabCaseSegment(dirName)) {
      violations.push(`${relPath}: shared route helper directories must use lowercase kebab-case.`);
      break;
    }
    if (isGenericProductName(dirName)) {
      violations.push(`${relPath}: shared route helper families must use canonical route names, not generic folders like ${dirName}.`);
      break;
    }
  }

  if (fileName !== 'index.ts') {
    const tokens = structuredFileNameTokens(fileName);
    if (tokens.length === 0 || !tokens.every((token) => isKebabCaseSegment(token))) {
      violations.push(`${relPath}: shared route helper file names must use lowercase kebab-case.`);
    }
    if (tokens.length > 0 && isGenericProductName(tokens[0])) {
      violations.push(`${relPath}: shared route helper file names must use route-family names, not generic names like ${tokens[0]}.`);
    }
  }

  return unique(violations);
}

function isDynamicRouteSegment(segment) {
  return /^\[.*\]$/.test(segment);
}

function isInterceptingSegment(segment) {
  return /^\((?:\.|\.\.|\.{3}|\.\.\.\.)\).+$/.test(segment);
}

function appRouteSegmentNamingViolations(relPath) {
  const info = appRoutePathInfo(relPath);
  if (!info || info.parts.length <= 1) {
    return [];
  }

  const violations = [];
  for (const segment of info.parts.slice(0, -1)) {
    if (!segment) {
      continue;
    }
    if (segment.startsWith('@')) {
      if (!isKebabCaseSegment(segment.slice(1))) {
        violations.push(`${relPath}: parallel route slot names must use lowercase kebab-case after @.`);
      }
      continue;
    }
    if (segment.startsWith('(') && segment.endsWith(')')) {
      const name = segment.slice(1, -1);
      if (!isKebabCaseSegment(name)) {
        violations.push(`${relPath}: route group names must use lowercase kebab-case inside parentheses.`);
      }
      continue;
    }
    if (isInterceptingSegment(segment)) {
      const descriptivePart = segment.replace(/^\((?:\.|\.\.|\.{3}|\.\.\.\.)\)/, '');
      if (!isKebabCaseSegment(descriptivePart)) {
        violations.push(`${relPath}: intercepting route names must use lowercase kebab-case after the intercept marker.`);
      }
      continue;
    }
    if (isDynamicRouteSegment(segment)) {
      continue;
    }
    if (!isKebabCaseSegment(segment)) {
      violations.push(`${relPath}: user-facing route segment names must use lowercase kebab-case.`);
    }
  }

  return unique(violations);
}

function isNonProductUiFile(relPath) {
  return (
    /(?:^|\/)__tests__\//.test(relPath) ||
    /(?:^|\/)(?:test|tests|fixtures|mocks|__mocks__)\//.test(relPath) ||
    /\.(?:test|spec|stories)\.[jt]sx?$/.test(relPath) ||
    /(?:^|\/)\.storybook\//.test(relPath) ||
    /(?:^|\/)(?:docs|\.github)\//.test(relPath) ||
    /(?:^|\/)(?:messages|translations)\//.test(relPath)
  );
}

function isTranslatableSourceFile(relPath) {
  return /\.(?:ts|tsx|js|jsx)$/.test(relPath) && !isNonProductUiFile(relPath);
}

function isRouteShell(relPath) {
  return /(?:^|\/)(page|layout|loading|error|not-found|template|default)\.tsx$/.test(relPath);
}

function clientImportsForbiddenServerSurface(text) {
  return [
    /from\s+['"]server-only['"]/,
    /from\s+['"]next\/headers['"]/,
    /from\s+['"]next\/server['"]/,
    /from\s+['"]node:/,
    /from\s+['"](?:fs|path|crypto)['"]/,
    /from\s+['"][^'"]*(?:\/data\/|\/server\/|\/actions\/)[^'"]*['"]/,
  ].some((pattern) => pattern.test(text));
}

function routeShellImportsLowLevelData(text) {
  return /from\s+['"][^'"]*(?:\/data\/|\/server\/|\/db\b|\/repositories\b|\/integrations\b)[^'"]*['"]/.test(text);
}

function routeRegistryLeaksInternalSyntax(text) {
  return [
    /['"`][^'"`]*(?:\([^'"`/]+\)|@[^'"`/]+)[^'"`]*['"`]/,
    /['"`][^'"`]*\(\.(?:\.|\.\.)?\)[^'"`]*['"`]/,
  ].some((pattern) => pattern.test(text));
}

function importsClientOnlyRuntimeLibrary(text) {
  return [
    /from\s+['"]swr['"]/,
    /from\s+['"]motion(?:\/[^'"]*)?['"]/,
    /from\s+['"]next-themes['"]/,
    /from\s+['"]@xstate\/react['"]/,
    /from\s+['"]use-immer['"]/,
    /from\s+['"]usehooks-ts['"]/,
    /from\s+['"]nuqs(?:\/(?!server)[^'"]*)?['"]/,
  ].some((pattern) => pattern.test(text));
}

function importsXState(text) {
  return /from\s+['"]xstate['"]/.test(text);
}

function isApprovedMachineLocation(relPath) {
  return (
    /\.machine\.[jt]sx?$/.test(relPath) ||
    /\/components\/client\//.test(relPath) ||
    /\/policies\//.test(relPath) ||
    /(?:^|\/)__tests__\//.test(relPath) ||
    /\.(?:test|spec)\.[jt]sx?$/.test(relPath)
  );
}

function importsEffect(text) {
  return /from\s+['"]effect['"]/.test(text);
}

function importsRootReactIcons(text) {
  return /from\s+['"]react-icons['"]/.test(text);
}

function importsSharp(text) {
  return /from\s+['"]sharp['"]/.test(text);
}

function importsEnvLibrary(text) {
  return /from\s+['"]@t3-oss\/env-nextjs['"]/.test(text);
}

function importsPino(text) {
  return /from\s+['"]pino(?:-pretty)?['"]/.test(text) || /require\(['"]pino(?:-pretty)?['"]\)/.test(text);
}

function containsUserFacingCharacters(value) {
  return /[A-Za-z\u0E00-\u0E7F]/.test(value);
}

function looksLikeTranslationKey(value) {
  return /^[a-z0-9]+(?:\.[a-z0-9_-]+)+$/i.test(value.trim());
}

function looksLikeMachineValue(value) {
  const trimmed = value.trim();
  return (
    trimmed === 'en' ||
    trimmed === 'th' ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  );
}

function isHardcodedUserFacingText(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }
  if (!containsUserFacingCharacters(trimmed)) {
    return false;
  }
  if (looksLikeTranslationKey(trimmed) || looksLikeMachineValue(trimmed)) {
    return false;
  }
  return true;
}

function collectHardcodedTextSamples(text, pattern, valueIndex) {
  const samples = [];
  for (const match of text.matchAll(pattern)) {
    const candidate = (match[valueIndex] || '').replace(/\s+/g, ' ').trim();
    if (isHardcodedUserFacingText(candidate)) {
      samples.push(candidate);
    }
  }
  return samples;
}

function collectHardcodedUiText(relPath, text) {
  if (!isTranslatableSourceFile(relPath)) {
    return [];
  }

  const samples = [];

  if (/\.(?:tsx|jsx)$/.test(relPath)) {
    samples.push(...collectHardcodedTextSamples(text, />\s*([^<>{}\n][^<>{}]*)\s*</g, 1));
    samples.push(...collectHardcodedTextSamples(text, /\{\s*(["'`])([^"'`]+)\1\s*\}/g, 2));
    samples.push(
      ...collectHardcodedTextSamples(
        text,
        new RegExp(`\\b(?:${TRANSLATABLE_PROP_NAMES.join('|')})\\s*=\\s*([\"'\`])([^\"'\`]+)\\1`, 'g'),
        2,
      ),
    );
  }

  samples.push(
    ...collectHardcodedTextSamples(
      text,
      new RegExp(`\\b(?:${TRANSLATABLE_OBJECT_KEYS.join('|')})\\s*:\\s*([\"'\`])([^\"'\`]+)\\1`, 'g'),
      2,
    ),
  );

  return unique(samples);
}

function parallelSlotRoot(relPath) {
  const segments = relPath.split('/');
  const slotIndex = segments.findIndex((segment) => segment.startsWith('@'));
  if (slotIndex === -1) {
    return '';
  }
  return segments.slice(0, slotIndex + 1).join('/');
}

function hasParallelSlotDefault(cwd, relPath) {
  const slotRoot = parallelSlotRoot(relPath);
  if (!slotRoot) {
    return true;
  }
  return ['default.tsx', 'default.ts', 'default.jsx', 'default.js'].some((fileName) =>
    pathExists(path.resolve(cwd, slotRoot, fileName)),
  );
}

function approvedAdvancedRouting(state, kind) {
  if (kind === 'parallel') {
    return hasApprovedFeature(state, ['parallel route', 'parallel-route', 'parallel routes']);
  }
  if (kind === 'intercepting') {
    return hasApprovedFeature(state, ['intercepting route', 'intercepting-route', 'modal route', 'modal overlay']);
  }
  return false;
}

function sessionContext(event) {
  const state = loadState(event.cwd);
  const layout = findProjectLayout(event.cwd);
  const lines = [];

  if (!layout.isNextProject) {
    lines.push('Next.js profile: no Next.js application root detected yet.');
    lines.push('If you are bootstrapping, prefer apps/web/src/app for monorepos or src/app for single-app repos.');
    return emitSessionContext(lines.join(' '));
  }

  lines.push('Next.js profile active: App Router, thin route shells, and server-first boundaries.');
  if (layout.appRoots.length > 0) {
    lines.push(`App roots: ${layout.appRoots.map((root) => repoRelative(event.cwd, root)).join(', ')}.`);
  }
  if (isGreenfieldAppRouterProject(layout, state)) {
    lines.push('Greenfield App Router mode is active, so new pages/ router files are blocked.');
  }
  lines.push('Enterprise i18n is required: use next-intl, support en/th, default locale en, keep user-facing text out of product code, and make visible URLs resolve through /en/... and /th/....');
  lines.push('Advanced routing such as parallel or intercepting routes requires an explicit planning note.');
  lines.push('Keep reusable user-facing URLs in shared route helpers instead of duplicating path literals.');
  lines.push('Use canonical feature slugs, fixed feature top-level folders, and lowercase kebab-case product file names.');
  lines.push('When design or runtime evidence is available, use the MCP playbook with Figma MCP or Next DevTools MCP.');
  lines.push('Prefer Server Actions for first-party UI mutations and keep route handlers for real HTTP boundaries.');
  lines.push('Keep env validation in one @t3-oss/env-nextjs boundary, use pino through a shared logger, and treat SWR, nuqs, XState, motion, next-themes, and similar browser libraries as explicit client-side exceptions.');
  lines.push('Keep changed behavior behind narrow seams with isolated side effects so automated tests stay practical.');

  return emitSessionContext(lines.join(' '));
}

function workflowGuard(event) {
  const state = loadState(event.cwd);
  const layout = findProjectLayout(event.cwd);

  if (!layout.isNextProject) {
    return emitContinue('PreToolUse');
  }

  const targetPaths = resolveTargetPaths(event.cwd, event.toolInput);
  const relTargets = targetPaths.map((filePath) => repoRelative(event.cwd, filePath));
  const commandText = extractCommandText(event.toolInput);

  if (isGreenfieldAppRouterProject(layout, state)) {
    if (relTargets.some(touchesPagesRouter) || (commandText && referencesPagesInCommand(commandText))) {
      return emitPreToolDecision(
        'deny',
        'Greenfield Next.js enterprise work uses the App Router. Do not create pages/ router files.',
        'Use app/ route segments instead of pages/ for new work.',
      );
    }
  }

  for (const relPath of relTargets) {
    const pathViolations = [
      ...featureModulePathViolations(relPath),
      ...routeRegistryPathViolations(relPath),
      ...appRouteSegmentNamingViolations(relPath),
    ];
    if (pathViolations.length > 0) {
      return emitPreToolDecision('deny', pathViolations[0], pathViolations.join(' '));
    }

    if (appRouteNeedsLocaleBoundary(relPath)) {
      return emitPreToolDecision(
        'deny',
        `${relPath}: visible application route shells must live under a [locale] boundary.`,
        'Place visible app routes under app/[locale]/... so canonical URLs resolve as /en/... and /th/....',
      );
    }

    if (isTechnicalRouteGroup(relPath)) {
      return emitPreToolDecision(
        'deny',
        `Technical route group names are not allowed: ${relPath}`,
        'Use route groups for product areas or shell boundaries, not technical folders.',
      );
    }

    for (const kind of advancedRoutingKinds(relPath)) {
      if (!approvedAdvancedRouting(state, kind)) {
        return emitPreToolDecision(
          'ask',
          `${kind} routing requires an explicit planning note before implementation.`,
          'Record the route design rationale in the plan before editing these segments.',
        );
      }
    }
  }

  if (isCommandTool(event.toolName) && commandText && isGreenfieldAppRouterProject(layout, state) && referencesPagesInCommand(commandText)) {
    return emitPreToolDecision(
      'deny',
      'Command references pages/ in a greenfield App Router project.',
      'Use app/ route segments instead.',
    );
  }

  if (isEditTool(event.toolName) || isCommandTool(event.toolName)) {
    return emitContinue('PreToolUse', 'Next.js policy pre-checks passed.');
  }

  return emitContinue('PreToolUse');
}

function postEditChecks(event) {
  const state = loadState(event.cwd);
  const layout = findProjectLayout(event.cwd);

  if (!layout.isNextProject) {
    return emitContinue('PostToolUse');
  }

  const violations = [];
  const relTargets = resolveTargetPaths(event.cwd, event.toolInput)
    .filter((filePath) => pathExists(filePath) && fs.statSync(filePath).isFile())
    .map((filePath) => repoRelative(event.cwd, filePath));

  for (const relPath of relTargets) {
    const absPath = path.resolve(event.cwd, relPath);
    const text = fs.readFileSync(absPath, 'utf8');

    if (isGreenfieldAppRouterProject(layout, state) && touchesPagesRouter(relPath)) {
      violations.push(`${relPath}: greenfield App Router work may not add pages/ router files.`);
    }

    if (isTechnicalRouteGroup(relPath)) {
      violations.push(`${relPath}: technical route group names are not allowed.`);
    }

    violations.push(...featureModulePathViolations(relPath));
    violations.push(...routeRegistryPathViolations(relPath));
    violations.push(...appRouteSegmentNamingViolations(relPath));

    if (appRouteNeedsLocaleBoundary(relPath)) {
      violations.push(`${relPath}: visible application route shells must live under a [locale] boundary so URLs resolve as /en/... and /th/....`);
    }

    for (const kind of advancedRoutingKinds(relPath)) {
      if (!approvedAdvancedRouting(state, kind)) {
        violations.push(`${relPath}: ${kind} routing requires an explicit planning note before implementation.`);
      }
    }

    if (!isEnvModule(relPath) && /\bprocess\.env\b/.test(text)) {
      violations.push(`${relPath}: direct process.env access is only allowed inside env modules.`);
    }

    if (isAppSourceFile(relPath) && !isEnvModule(relPath) && importsEnvLibrary(text)) {
      violations.push(`${relPath}: @t3-oss/env-nextjs should only be used inside dedicated env modules.`);
    }

    if (isPageFile(relPath) && isClientFile(relPath, text)) {
      violations.push(`${relPath}: page.tsx files must remain server-first; move client logic into a narrower client leaf.`);
    }

    if (isClientFile(relPath, text) && !isApprovedClientLocation(relPath)) {
      violations.push(`${relPath}: client files must stay in approved client locations or use a .client.tsx suffix.`);
    }

    if (isClientFile(relPath, text) && clientImportsForbiddenServerSurface(text)) {
      violations.push(`${relPath}: client code may not import server-only, node, or low-level data surfaces.`);
    }

    if (isAppSourceFile(relPath) && !isClientFile(relPath, text) && importsClientOnlyRuntimeLibrary(text)) {
      violations.push(
        `${relPath}: SWR, nuqs, motion, next-themes, @xstate/react, use-immer, and similar browser-only libraries must stay inside approved client files.`,
      );
    }

    if (isAppSourceFile(relPath) && importsXState(text) && !isApprovedMachineLocation(relPath)) {
      violations.push(`${relPath}: xstate usage must live in dedicated *.machine.* files, policies, or approved client leaves.`);
    }

    if ((isClientFile(relPath, text) || isRouteShell(relPath)) && importsEffect(text)) {
      violations.push(`${relPath}: effect should stay out of route shells and client leaves unless a higher-level plan explicitly justifies it.`);
    }

    if (isAppSourceFile(relPath) && importsPino(text) && !isLoggerModule(relPath)) {
      violations.push(`${relPath}: direct pino usage belongs in dedicated logger modules, not feature or route files.`);
    }

    if (importsRootReactIcons(text)) {
      violations.push(`${relPath}: import react-icons from explicit subpackages instead of the package root.`);
    }

    if ((isClientFile(relPath, text) || isRouteShell(relPath)) && importsSharp(text)) {
      violations.push(`${relPath}: sharp belongs in server or build-time image workflows, not route shells or client files.`);
    }

    if (isRouteShell(relPath) && routeShellImportsLowLevelData(text)) {
      violations.push(`${relPath}: route shells must call feature presenters or loaders instead of low-level data modules.`);
    }

    if (isRouteRegistryFile(relPath) && routeRegistryLeaksInternalSyntax(text)) {
      violations.push(`${relPath}: shared route helpers may not leak route-group, slot, or intercepting syntax.`);
    }

    const hardcodedUiSamples = collectHardcodedUiText(relPath, text);
    if (hardcodedUiSamples.length > 0) {
      violations.push(
        `${relPath}: hardcoded user-facing text is not allowed; move copy into translations. Examples: ${hardcodedUiSamples
          .slice(0, 3)
          .join(', ')}.`,
      );
    }

    const slotRoot = parallelSlotRoot(relPath);
    if (slotRoot && !hasParallelSlotDefault(event.cwd, relPath)) {
      violations.push(`${slotRoot}/default.tsx is required for a parallel route slot fallback.`);
    }
  }

  if (violations.length > 0) {
    return emitPostToolBlock('Next.js enterprise policy checks failed.', violations.join(' '));
  }

  if (relTargets.length > 0) {
    return emitContinue('PostToolUse', `Next.js policy checks passed for ${relTargets.join(', ')}.`);
  }

  return emitContinue('PostToolUse');
}

function main() {
  const mode = process.argv[2] || '';
  const rawEvent = loadEvent();
  const event = normalizeEvent(mode, rawEvent);

  if (mode === 'session-context') {
    return sessionContext(event);
  }
  if (mode === 'workflow-guard') {
    return workflowGuard(event);
  }
  if (mode === 'post-edit-checks') {
    return postEditChecks(event);
  }

  return emitContinue('');
}

module.exports = {
  advancedRoutingKinds,
  appRouteSegmentNamingViolations,
  approvedAdvancedRouting,
  collectApprovalText,
  findProjectLayout,
  firstVisibleAppSegment,
  featureModulePathViolations,
  appRouteNeedsLocaleBoundary,
  isApprovedClientLocation,
  isClientFile,
  collectHardcodedUiText,
  isGreenfieldAppRouterProject,
  isTechnicalRouteGroup,
  main,
  normalizeEvent,
  routeGroupNames,
  routeRegistryPathViolations,
  routeRegistryLeaksInternalSyntax,
  routeShellImportsLowLevelData,
  parallelSlotRoot,
  touchesPagesRouter,
};

if (require.main === module) {
  process.exit(main());
}
