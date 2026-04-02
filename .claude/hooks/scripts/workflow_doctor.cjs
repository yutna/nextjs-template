#!/usr/bin/env node
'use strict';

/**
 * Workflow Doctor - Health checks for workflow state and configuration
 *
 * Usage:
 *   node .claude/hooks/scripts/workflow_doctor.cjs
 *   node .claude/hooks/scripts/workflow_doctor.cjs --fix
 */

const fs = require('node:fs');
const path = require('node:path');

const STATE_FILE = '.claude/workflow-state.json';
const PROFILE_FILE = '.claude/workflow-profile.json';
const SETTINGS_FILE = '.claude/settings.json';

const REQUIRED_DIRS = [
  '.claude/commands',
  '.claude/skills',
  '.claude/hooks/scripts',
];

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function checkJsonValid(filePath) {
  if (!checkFileExists(filePath)) {
    return { error: 'File does not exist', valid: false };
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return { valid: true };
  } catch (error) {
    return { error: error.message, valid: false };
  }
}

function checkWorkflowState() {
  const result = checkJsonValid(STATE_FILE);
  if (!result.valid) {
    return { message: `Invalid workflow state: ${result.error}`, status: 'error' };
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  const issues = [];

  // Check required fields
  if (!state.version) issues.push('Missing version field');
  if (!state.phase) issues.push('Missing phase field');
  if (!state.requirements) issues.push('Missing requirements section');
  if (!state.plan) issues.push('Missing plan section');
  if (!state.implementation) issues.push('Missing implementation section');
  if (!state.qualityGates) issues.push('Missing qualityGates section');
  if (!state.delivery) issues.push('Missing delivery section');

  // Check phase validity
  const validPhases = ['discovery', 'planning', 'implementation', 'quality-gates', 'verification', 'delivery'];
  if (state.phase && !validPhases.includes(state.phase)) {
    issues.push(`Invalid phase: ${state.phase}`);
  }

  if (issues.length > 0) {
    return { message: issues.join('; '), status: 'warning' };
  }

  return { message: 'Workflow state is valid', status: 'ok' };
}

function checkProfile() {
  const result = checkJsonValid(PROFILE_FILE);
  if (!result.valid) {
    return { message: `Invalid profile: ${result.error}`, status: 'error' };
  }

  const profile = JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf8'));
  const issues = [];

  if (!profile.version) issues.push('Missing version field');
  if (!profile.profileId) issues.push('Missing profileId field');
  if (!profile.commands) issues.push('Missing commands section');
  if (!profile.conventions) issues.push('Missing conventions section');

  if (issues.length > 0) {
    return { message: issues.join('; '), status: 'warning' };
  }

  return { message: 'Profile is valid', status: 'ok' };
}

function checkSettings() {
  const result = checkJsonValid(SETTINGS_FILE);
  if (!result.valid) {
    return { message: `Invalid settings: ${result.error}`, status: 'error' };
  }

  const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
  const issues = [];

  if (!settings.hooks) {
    issues.push('Missing hooks configuration');
  } else {
    if (!settings.hooks.SessionStart) issues.push('Missing SessionStart hook');
    if (!settings.hooks.PreToolUse) issues.push('Missing PreToolUse hook');
    if (!settings.hooks.PostToolUse) issues.push('Missing PostToolUse hook');
    if (!settings.hooks.Stop) issues.push('Missing Stop hook');
  }

  if (issues.length > 0) {
    return { message: issues.join('; '), status: 'warning' };
  }

  return { message: 'Settings are valid', status: 'ok' };
}

function checkDirectoryStructure() {
  const issues = [];

  for (const dir of REQUIRED_DIRS) {
    if (!fs.existsSync(dir)) {
      issues.push(`Missing directory: ${dir}`);
    }
  }

  if (issues.length > 0) {
    return { message: issues.join('; '), status: 'error' };
  }

  return { message: 'Directory structure is correct', status: 'ok' };
}

function checkSkills() {
  const skillsDir = '.claude/skills';
  if (!fs.existsSync(skillsDir)) {
    return { message: 'Skills directory does not exist', status: 'error' };
  }

  const skills = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const issues = [];
  for (const skill of skills) {
    const skillFile = path.join(skillsDir, skill, 'SKILL.md');
    if (!fs.existsSync(skillFile)) {
      issues.push(`Missing SKILL.md in ${skill}`);
    }
  }

  if (issues.length > 0) {
    return { message: issues.join('; '), status: 'warning' };
  }

  return { message: `${skills.length} skills found and valid`, status: 'ok' };
}

function checkCommands() {
  const commandsDir = '.claude/commands';
  if (!fs.existsSync(commandsDir)) {
    return { message: 'Commands directory does not exist', status: 'error' };
  }

  const commands = fs.readdirSync(commandsDir)
    .filter(f => f.endsWith('.md'));

  if (commands.length === 0) {
    return { message: 'No commands found', status: 'warning' };
  }

  return { message: `${commands.length} commands found`, status: 'ok' };
}

function checkHookScripts() {
  const scriptsDir = '.claude/hooks/scripts';
  if (!fs.existsSync(scriptsDir)) {
    return { message: 'Hook scripts directory does not exist', status: 'error' };
  }

  const scripts = fs.readdirSync(scriptsDir)
    .filter(f => f.endsWith('.cjs') || f.endsWith('.js'));

  const requiredScripts = ['workflow_hook.cjs'];
  const missing = requiredScripts.filter(s => !scripts.includes(s));

  if (missing.length > 0) {
    return { message: `Missing required scripts: ${missing.join(', ')}`, status: 'error' };
  }

  return { message: `${scripts.length} hook scripts found`, status: 'ok' };
}

function runDiagnostics() {
  console.log('🩺 Workflow Doctor - Health Check\n');
  console.log('='.repeat(50));

  const checks = [
    { fn: checkDirectoryStructure, name: 'Directory Structure' },
    { fn: checkWorkflowState, name: 'Workflow State' },
    { fn: checkProfile, name: 'Workflow Profile' },
    { fn: checkSettings, name: 'Settings' },
    { fn: checkSkills, name: 'Skills' },
    { fn: checkCommands, name: 'Commands' },
    { fn: checkHookScripts, name: 'Hook Scripts' },
  ];

  let hasErrors = false;
  let hasWarnings = false;

  for (const check of checks) {
    const result = check.fn();
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`\n${icon} ${check.name}`);
    console.log(`   ${result.message}`);

    if (result.status === 'error') hasErrors = true;
    if (result.status === 'warning') hasWarnings = true;
  }

  console.log('\n' + '='.repeat(50));

  if (hasErrors) {
    console.log('\n❌ Health check failed - errors found');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️ Health check passed with warnings');
    process.exit(0);
  } else {
    console.log('\n✅ All health checks passed');
    process.exit(0);
  }
}

// Run diagnostics
runDiagnostics();
