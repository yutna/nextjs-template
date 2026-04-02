#!/usr/bin/env node
'use strict';

/**
 * Workflow Bootstrap - Reset workflow state for a new task
 *
 * Usage:
 *   node .claude/hooks/scripts/workflow_bootstrap.cjs
 *   node .claude/hooks/scripts/workflow_bootstrap.cjs --task-id "my-task" --summary "Task description"
 */

const fs = require('node:fs');
const path = require('node:path');

const STATE_FILE = '.claude/workflow-state.json';
const SCHEMA_VERSION = '1.0';

const DEFAULT_STATE = {
  delivery: {
    notes: '',
    status: 'blocked',
    userApproved: false,
  },
  implementation: {
    blockedItems: [],
    filesTouched: [],
    retryCount: 0,
    status: 'not-started',
  },
  lastUpdated: '',
  phase: 'discovery',
  plan: {
    filesInScope: [],
    status: 'not-started',
    summary: '',
  },
  qualityGates: {
    lastRunSummary: '',
    lint: 'pending',
    tests: 'pending',
    typecheck: 'pending',
    verification: 'pending',
  },
  requirements: {
    acceptanceCriteria: [],
    constraints: [],
    openQuestions: [],
    status: 'needs-clarification',
  },
  taskId: '',
  taskSummary: '',
  version: SCHEMA_VERSION,
};

function utcTimestamp() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

function parseArgs(args) {
  const result = {
    force: false,
    summary: '',
    taskId: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--task-id' && args[i + 1]) {
      result.taskId = args[++i];
    } else if (arg === '--summary' && args[i + 1]) {
      result.summary = args[++i];
    } else if (arg === '--force' || arg === '-f') {
      result.force = true;
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
  }

  return result;
}

function printUsage() {
  console.log(`
Workflow Bootstrap - Reset workflow state for a new task

Usage:
  node .claude/hooks/scripts/workflow_bootstrap.cjs [options]

Options:
  --task-id <id>     Set initial task ID
  --summary <text>   Set initial task summary
  --force, -f        Force reset even if current task is in progress
  --help, -h         Show this help message

Examples:
  node .claude/hooks/scripts/workflow_bootstrap.cjs
  node .claude/hooks/scripts/workflow_bootstrap.cjs --task-id "feature-123" --summary "Add user authentication"
  node .claude/hooks/scripts/workflow_bootstrap.cjs --force
`);
}

function checkExistingState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { exists: false, inProgress: false };
  }

  try {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const inProgress = state.phase !== 'discovery' ||
      state.requirements?.status !== 'needs-clarification' ||
      state.implementation?.status === 'in-progress';
    return { exists: true, inProgress, state };
  } catch {
    return { corrupted: true, exists: true, inProgress: false };
  }
}

function createNewState(taskId, summary) {
  const state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  state.taskId = taskId;
  state.taskSummary = summary;
  state.lastUpdated = utcTimestamp();
  return state;
}

function saveState(state) {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  console.log('🔄 Workflow Bootstrap\n');

  // Check existing state
  const existing = checkExistingState();

  if (existing.exists && existing.inProgress && !args.force) {
    console.log('⚠️  Warning: Current task appears to be in progress.');
    console.log(`   Phase: ${existing.state?.phase || 'unknown'}`);
    console.log(`   Task: ${existing.state?.taskSummary || 'unnamed'}`);
    console.log('\nUse --force to reset anyway.');
    process.exit(1);
  }

  if (existing.corrupted) {
    console.log('⚠️  Warning: Existing state file is corrupted. Resetting...');
  }

  // Create new state
  const newState = createNewState(args.taskId, args.summary);

  // Save state
  saveState(newState);

  console.log('✅ Workflow state reset successfully');
  console.log('\nNew state:');
  console.log(`   Phase: ${newState.phase}`);
  console.log(`   Task ID: ${newState.taskId || '(not set)'}`);
  console.log(`   Summary: ${newState.taskSummary || '(not set)'}`);
  console.log(`   Requirements: ${newState.requirements.status}`);
  console.log(`   Plan: ${newState.plan.status}`);
  console.log('\nNext step: Run /discover to begin requirements clarification.');

  process.exit(0);
}

main();
