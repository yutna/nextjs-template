#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const workflowHook = require('./workflow_hook.cjs');
const { buildSuggestedProfile, loadProfile, normalizeIgnorePattern, profilePath, validateProfile } = require('./workflow_profile.cjs');

function parseArgs(argv) {
  const options = {
    force: false,
    syncGeneratedIgnores: false,
    templateBaseline: false,
    writeProfile: false,
    taskId: '',
    taskSummary: '',
  };

  for (const arg of argv) {
    if (arg === '--force') {
      options.force = true;
      continue;
    }
    if (arg === '--template-baseline') {
      options.templateBaseline = true;
      continue;
    }
    if (arg === '--sync-generated-ignores') {
      options.syncGeneratedIgnores = true;
      continue;
    }
    if (arg === '--write-profile') {
      options.writeProfile = true;
      continue;
    }
    const separatorIndex = arg.indexOf('=');
    if (separatorIndex > 0) {
      const key = arg.slice(0, separatorIndex);
      const value = arg.slice(separatorIndex + 1);
      if (key === 'taskId') {
        options.taskId = value;
      } else if (key === 'taskSummary') {
        options.taskSummary = value;
      }
    }
  }

  return options;
}

function loadOrCreateProfile(cwd, options) {
  const [existingProfile, loadErrors] = loadProfile(cwd, { allowMissing: true });
  if (existingProfile) {
    return [existingProfile, loadErrors, false];
  }

  const suggestedProfile = buildSuggestedProfile(cwd);
  if (options.writeProfile) {
    fs.mkdirSync(path.dirname(profilePath(cwd)), { recursive: true });
    fs.writeFileSync(profilePath(cwd), `${JSON.stringify(suggestedProfile, null, 2)}\n`, 'utf8');
  }
  return [suggestedProfile, loadErrors, options.writeProfile];
}

function syncGeneratedIgnores(cwd, profile) {
  const patterns = Array.isArray(profile?.repository?.generatedIgnorePatterns)
    ? profile.repository.generatedIgnorePatterns.filter((value) => typeof value === 'string' && value.trim())
    : [];

  if (patterns.length === 0) {
    return [];
  }

  const gitignorePath = path.join(cwd, '.gitignore');
  const currentText = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
  const currentLines = currentText.split(/\r?\n/);
  const currentSet = new Set(currentLines.map((line) => normalizeIgnorePattern(line)).filter(Boolean));
  const missing = patterns.filter((pattern) => !currentSet.has(normalizeIgnorePattern(pattern)));

  if (missing.length === 0) {
    return [];
  }

  const needsTrailingNewline = currentText.length > 0 && !currentText.endsWith('\n');
  const prefix = currentText.length === 0 ? '' : needsTrailingNewline ? '\n' : '';
  const addition = `${prefix}${missing.join('\n')}\n`;
  fs.writeFileSync(gitignorePath, `${currentText}${addition}`, 'utf8');
  return missing;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const [existingState] = workflowHook.readStateStrict(cwd);

  if (
    !options.force &&
    existingState &&
    (existingState.taskId || existingState.taskSummary || existingState.phase !== 'discovery')
  ) {
    process.stderr.write('workflow bootstrap refused to overwrite a non-bootstrap state without --force.\n');
    return 1;
  }

  const [profile, loadErrors, wroteProfile] = loadOrCreateProfile(cwd, options);
  const profileValidation = validateProfile(cwd, profile);
  if (loadErrors.length > 0 || profileValidation.errors.length > 0) {
    process.stderr.write('workflow bootstrap cannot proceed because the workflow profile is invalid.\n');
    for (const error of [...loadErrors, ...profileValidation.errors]) {
      process.stderr.write(`- ${error}\n`);
    }
    return 1;
  }

  const nextjs = profile.nextjs || {};
  const roots = profile.roots || {};
  const bootstrapState = options.templateBaseline
    ? workflowHook.deepCopyDefaultState()
    : {
        ...workflowHook.deepCopyDefaultState(),
        taskId: options.taskId || profile.adoption?.defaultTaskId || '',
        taskSummary: options.taskSummary || profile.adoption?.defaultTaskSummary || '',
        stackContext: {
          profile: profile.profileId,
          repoTopology: profile.repository?.role || '',
          appLocation: Array.isArray(roots.appRoots) ? roots.appRoots.join('|') : '',
          routeMode: nextjs.enabled ? 'app-router' : '',
          localization: nextjs.enabled
            ? {
                library: 'next-intl',
                urlStrategy: nextjs.localePrefix ? 'locale-prefix' : 'custom',
                visibleRouteBoundary: nextjs.visibleRouteBoundary || '',
                supportedLocales: Array.isArray(nextjs.supportedLocales) ? nextjs.supportedLocales : [],
                defaultLocale: nextjs.defaultLocale || '',
                hardcodedUserFacingText: 'forbidden',
              }
            : {},
        },
      };

  const [savedState, saveErrors] = workflowHook.saveState(cwd, bootstrapState);
  if (saveErrors.length > 0) {
    process.stderr.write('workflow bootstrap failed to save state.\n');
    for (const error of saveErrors) {
      process.stderr.write(`- ${error}\n`);
    }
    return 1;
  }

  const syncedGeneratedIgnores = options.syncGeneratedIgnores ? syncGeneratedIgnores(cwd, profile) : [];

  process.stdout.write(
    `${JSON.stringify(
        {
          saved: true,
          wroteProfile,
          syncedGeneratedIgnores,
          templateBaseline: options.templateBaseline,
          state: savedState,
          nextSteps: [
          profile.commands?.adoptReport,
          profile.commands?.doctor,
          'Use the discover-requirements prompt to start the first task.',
        ].filter(Boolean),
      },
      null,
      2,
    )}\n`,
  );
  return 0;
}

if (require.main === module) {
  process.exit(main());
}
