#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  buildSuggestedProfile,
  loadProfile,
  profilePath,
  validateProfile,
} = require('./workflow_profile.cjs');

function parseArgs(argv) {
  return {
    json: argv.includes('--json'),
    writeProfile: argv.includes('--write-profile'),
    force: argv.includes('--force'),
  };
}

function isDeepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function compareProfiles(current, suggested, prefix = '') {
  const drifts = [];
  const keys = new Set([...Object.keys(current || {}), ...Object.keys(suggested || {})]);

  for (const key of keys) {
    const currentValue = current?.[key];
    const suggestedValue = suggested?.[key];
    const dotted = prefix ? `${prefix}.${key}` : key;

    if (
      currentValue &&
      suggestedValue &&
      typeof currentValue === 'object' &&
      typeof suggestedValue === 'object' &&
      !Array.isArray(currentValue) &&
      !Array.isArray(suggestedValue)
    ) {
      drifts.push(...compareProfiles(currentValue, suggestedValue, dotted));
      continue;
    }

    if (!isDeepEqual(currentValue, suggestedValue)) {
      drifts.push({
        field: dotted,
        current: currentValue,
        suggested: suggestedValue,
      });
    }
  }

  return drifts;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const cwd = process.cwd();
  const [currentProfile, loadErrors] = loadProfile(cwd, { allowMissing: true });
  const suggestedProfile = buildSuggestedProfile(cwd);
  const validation = currentProfile ? validateProfile(cwd, currentProfile) : { errors: [], warnings: [] };
  const drifts = currentProfile ? compareProfiles(currentProfile, suggestedProfile) : [];

  if (options.writeProfile) {
    if (currentProfile && !options.force && drifts.length === 0) {
      const payload = {
        wroteProfile: false,
        reason: 'profile-already-matches-detected-repository',
        suggestedProfile,
        drifts,
        loadErrors,
        validation,
      };
      process.stdout.write(options.json ? `${JSON.stringify(payload, null, 2)}\n` : 'workflow profile already matches the detected repository.\n');
      return 0;
    }

    fs.mkdirSync(path.dirname(profilePath(cwd)), { recursive: true });
    fs.writeFileSync(profilePath(cwd), `${JSON.stringify(suggestedProfile, null, 2)}\n`, 'utf8');
  }

  const payload = {
    wroteProfile: options.writeProfile,
    profilePath: path.relative(cwd, profilePath(cwd)).replace(/\\/g, '/'),
    loadErrors,
    validation,
    drifts,
    suggestedProfile,
  };

  if (options.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return 0;
  }

  process.stdout.write('Workflow adoption report\n');
  process.stdout.write(`- detected repository role: ${suggestedProfile.repository.role}\n`);
  process.stdout.write(`- detected package manager: ${suggestedProfile.repository.packageManager}\n`);
  process.stdout.write(`- detected app roots: ${suggestedProfile.roots.appRoots.join(', ') || '(none)'}\n`);
  process.stdout.write(`- detected feature roots: ${suggestedProfile.roots.featureRoots.join(', ') || '(none)'}\n`);
  process.stdout.write(`- detected locale roots: ${suggestedProfile.roots.localeRoots.join(', ') || '(none)'}\n`);

  if (loadErrors.length > 0) {
    process.stdout.write(`- current profile: missing or unreadable (${loadErrors.join('; ')})\n`);
  } else {
    process.stdout.write(`- current profile drifts: ${drifts.length}\n`);
    for (const drift of drifts.slice(0, 10)) {
      process.stdout.write(`  - ${drift.field}\n`);
    }
  }

  if (validation.errors.length > 0) {
    process.stdout.write('- current profile validation errors:\n');
    for (const error of validation.errors) {
      process.stdout.write(`  - ${error}\n`);
    }
  }
  if (validation.warnings.length > 0) {
    process.stdout.write('- current profile validation warnings:\n');
    for (const warning of validation.warnings) {
      process.stdout.write(`  - ${warning}\n`);
    }
  }

  if (options.writeProfile) {
    process.stdout.write(`- wrote suggested profile to ${path.relative(cwd, profilePath(cwd)).replace(/\\/g, '/')}\n`);
  } else {
    process.stdout.write('- run with --write-profile to overwrite the current profile with the detected suggestion\n');
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}
