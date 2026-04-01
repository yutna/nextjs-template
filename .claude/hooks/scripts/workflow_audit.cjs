#!/usr/bin/env node
'use strict';

/**
 * Workflow Audit - Validate module and shared directory structure
 *
 * Usage:
 *   node .claude/hooks/scripts/workflow_audit.cjs [path]
 *   node .claude/hooks/scripts/workflow_audit.cjs src/modules/users
 *   node .claude/hooks/scripts/workflow_audit.cjs all
 */

const fs = require('node:fs');
const path = require('node:path');

const PROFILE_FILE = '.claude/workflow-profile.json';

const DEFAULT_MODULE_SUBDIRS = [
  'actions', 'components', 'containers', 'screens', 'hooks',
  'contexts', 'lib', 'styles', 'constants',
];

const REQUIRED_MODULE_SUBDIRS = [
  'actions', 'components', 'containers', 'screens', 'hooks',
];

const DEFAULT_SHARED_SUBDIRS = [
  'lib', 'config', 'components', 'providers', 'hooks',
  'routes', 'schemas', 'types', 'utils', 'vendor',
];

const FORBIDDEN_FILES = [
  'utils.ts', 'utils.tsx',
  'helpers.ts', 'helpers.tsx',
  'common.ts', 'common.tsx',
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

function getDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
}

function getFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name);
}

function checkForForbiddenFiles(dirPath, forbiddenFiles) {
  const violations = [];

  function scanDir(currentPath) {
    const files = getFiles(currentPath);
    for (const file of files) {
      if (forbiddenFiles.includes(file)) {
        violations.push(path.join(currentPath, file));
      }
    }

    const dirs = getDirectories(currentPath);
    for (const dir of dirs) {
      if (!dir.startsWith('.') && dir !== 'node_modules') {
        scanDir(path.join(currentPath, dir));
      }
    }
  }

  scanDir(dirPath);
  return violations;
}

function checkForUseClientInScreens(modulePath) {
  const screensPath = path.join(modulePath, 'screens');
  if (!fs.existsSync(screensPath)) {
    return [];
  }

  const violations = [];
  const files = getFiles(screensPath)
    .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

  for (const file of files) {
    const filePath = path.join(screensPath, file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(0, 5);
      const hasUseClient = lines.some(line =>
        line.trim().startsWith("'use client'") ||
        line.trim().startsWith('"use client"')
      );
      if (hasUseClient) {
        violations.push(filePath);
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return violations;
}

function auditModule(modulePath, moduleName) {
  const result = {
    issues: [],
    name: moduleName,
    path: modulePath,
    status: 'compliant',
  };

  // Check required subdirectories
  const existingDirs = getDirectories(modulePath);
  const missingRequired = REQUIRED_MODULE_SUBDIRS.filter(d => !existingDirs.includes(d));

  if (missingRequired.length > 0) {
    result.status = 'non-compliant';
    result.issues.push({
      message: `Missing required directories: ${missingRequired.join(', ')}`,
      severity: 'error',
      type: 'missing-directory',
    });
  }

  // Check for index.ts barrel export
  const hasBarrel = fs.existsSync(path.join(modulePath, 'index.ts')) ||
                    fs.existsSync(path.join(modulePath, 'index.tsx'));
  if (!hasBarrel) {
    result.status = result.status === 'compliant' ? 'violations' : result.status;
    result.issues.push({
      message: 'Missing index.ts barrel export',
      severity: 'warning',
      type: 'missing-barrel',
    });
  }

  // Check for forbidden files
  const forbiddenFound = checkForForbiddenFiles(modulePath, FORBIDDEN_FILES);
  if (forbiddenFound.length > 0) {
    result.status = result.status === 'compliant' ? 'violations' : result.status;
    for (const file of forbiddenFound) {
      result.issues.push({
        message: `Forbidden generic file: ${path.relative(modulePath, file)}`,
        severity: 'warning',
        type: 'forbidden-file',
      });
    }
  }

  // Check for "use client" in screens
  const useClientInScreens = checkForUseClientInScreens(modulePath);
  if (useClientInScreens.length > 0) {
    result.status = result.status === 'compliant' ? 'violations' : result.status;
    for (const file of useClientInScreens) {
      result.issues.push({
        message: `"use client" in screen: ${path.relative(modulePath, file)}`,
        severity: 'warning',
        type: 'use-client-in-screen',
      });
    }
  }

  // Check for non-standard subdirectories
  const nonStandard = existingDirs.filter(d =>
    !DEFAULT_MODULE_SUBDIRS.includes(d) && !d.startsWith('.')
  );
  if (nonStandard.length > 0) {
    result.issues.push({
      message: `Non-standard directories: ${nonStandard.join(', ')}`,
      severity: 'info',
      type: 'non-standard-directory',
    });
  }

  return result;
}

function auditShared(sharedPath) {
  const result = {
    issues: [],
    name: 'shared',
    path: sharedPath,
    status: 'compliant',
  };

  if (!fs.existsSync(sharedPath)) {
    result.status = 'non-compliant';
    result.issues.push({
      message: 'shared directory does not exist',
      severity: 'error',
      type: 'missing-directory',
    });
    return result;
  }

  // Check for required shared directories
  const existingDirs = getDirectories(sharedPath);
  const requiredShared = ['lib', 'config', 'components', 'providers'];
  const missingRequired = requiredShared.filter(d => !existingDirs.includes(d));

  if (missingRequired.length > 0) {
    result.status = 'violations';
    result.issues.push({
      message: `Missing recommended directories: ${missingRequired.join(', ')}`,
      severity: 'warning',
      type: 'missing-directory',
    });
  }

  // Check for forbidden files
  const forbiddenFound = checkForForbiddenFiles(sharedPath, FORBIDDEN_FILES);
  if (forbiddenFound.length > 0) {
    result.status = result.status === 'compliant' ? 'violations' : result.status;
    for (const file of forbiddenFound) {
      result.issues.push({
        message: `Forbidden generic file: ${path.relative(sharedPath, file)}`,
        severity: 'warning',
        type: 'forbidden-file',
      });
    }
  }

  return result;
}

function auditModules(modulesPath) {
  const results = [];

  if (!fs.existsSync(modulesPath)) {
    return results;
  }

  const modules = getDirectories(modulesPath);
  for (const moduleName of modules) {
    if (!moduleName.startsWith('.')) {
      const modulePath = path.join(modulesPath, moduleName);
      results.push(auditModule(modulePath, moduleName));
    }
  }

  return results;
}

function printReport(moduleResults, sharedResult) {
  console.log('\n📋 Structure Audit Report\n');
  console.log('='.repeat(60));

  // Summary
  const totalModules = moduleResults.length;
  const compliant = moduleResults.filter(r => r.status === 'compliant').length;
  const violations = moduleResults.filter(r => r.status === 'violations').length;
  const nonCompliant = moduleResults.filter(r => r.status === 'non-compliant').length;

  console.log('\n📊 Summary');
  console.log(`   Modules audited: ${totalModules}`);
  console.log(`   ✅ Compliant: ${compliant}`);
  console.log(`   ⚠️  Violations: ${violations}`);
  console.log(`   ❌ Non-compliant: ${nonCompliant}`);

  // Module details
  console.log('\n📦 Modules');
  console.log('-'.repeat(60));

  for (const result of moduleResults) {
    const icon = result.status === 'compliant' ? '✅' :
                 result.status === 'violations' ? '⚠️' : '❌';
    console.log(`\n${icon} ${result.name}`);

    if (result.issues.length === 0) {
      console.log('   All conventions followed.');
    } else {
      for (const issue of result.issues) {
        const issueIcon = issue.severity === 'error' ? '❌' :
                         issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${issueIcon} ${issue.message}`);
      }
    }
  }

  // Shared details
  if (sharedResult) {
    console.log('\n📁 Shared');
    console.log('-'.repeat(60));

    const icon = sharedResult.status === 'compliant' ? '✅' :
                 sharedResult.status === 'violations' ? '⚠️' : '❌';
    console.log(`\n${icon} ${sharedResult.name}`);

    if (sharedResult.issues.length === 0) {
      console.log('   All conventions followed.');
    } else {
      for (const issue of sharedResult.issues) {
        const issueIcon = issue.severity === 'error' ? '❌' :
                         issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`   ${issueIcon} ${issue.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));

  // Exit code
  const hasErrors = moduleResults.some(r => r.status === 'non-compliant') ||
                    (sharedResult && sharedResult.status === 'non-compliant');
  const hasWarnings = moduleResults.some(r => r.status === 'violations') ||
                      (sharedResult && sharedResult.status === 'violations');

  if (hasErrors) {
    console.log('\n❌ Audit failed - critical violations found');
    return 1;
  } else if (hasWarnings) {
    console.log('\n⚠️  Audit passed with warnings');
    return 0;
  } else {
    console.log('\n✅ All structure conventions followed');
    return 0;
  }
}

function main() {
  const args = process.argv.slice(2);
  const targetPath = args[0] || 'all';

  console.log('🔍 Workflow Structure Audit');

  const profile = loadProfile();

  if (targetPath === 'all' || targetPath === '') {
    // Audit everything
    const modulesPath = 'src/modules';
    const sharedPath = 'src/shared';

    const moduleResults = auditModules(modulesPath);
    const sharedResult = auditShared(sharedPath);

    const exitCode = printReport(moduleResults, sharedResult);
    process.exit(exitCode);
  } else if (targetPath.includes('modules/')) {
    // Audit specific module
    const moduleName = path.basename(targetPath);
    const result = auditModule(targetPath, moduleName);
    const exitCode = printReport([result], null);
    process.exit(exitCode);
  } else if (targetPath.includes('shared')) {
    // Audit shared only
    const result = auditShared(targetPath);
    const exitCode = printReport([], result);
    process.exit(exitCode);
  } else {
    console.log(`\nUsage: node workflow_audit.cjs [path]`);
    console.log(`\nExamples:`);
    console.log(`  node workflow_audit.cjs              # Audit all`);
    console.log(`  node workflow_audit.cjs all          # Audit all`);
    console.log(`  node workflow_audit.cjs src/modules/users`);
    console.log(`  node workflow_audit.cjs src/shared`);
    process.exit(0);
  }
}

main();
