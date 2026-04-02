---
name: verify-runtime
description: Verify feature works correctly in the browser during verification phase
---

# /verify-runtime

Perform browser verification for a feature or route.

## Behavioral Mode

You are in **Verification** phase. Run checks and report findings honestly.

## Prerequisites

- Implementation is complete
- Quality gates have passed (typecheck, lint, tests)
- Development server is running or can be started

## Process

### 1. Start Development Server

```bash
npm run dev
```

### 2. Identify Test Routes

Based on the feature, identify all routes that need verification:
- Primary feature route
- Related routes that might be affected
- Both locales (`/en/...` and `/th/...`)

### 3. Verification Checklist

Generate a checklist based on the feature:

```markdown
## Feature: [Feature Name]

### Functional Tests
- [ ] Primary functionality works
- [ ] Form submissions succeed
- [ ] Navigation works correctly
- [ ] Error states are handled

### Visual Tests
- [ ] Layout matches expectations
- [ ] Responsive on mobile/tablet/desktop
- [ ] Light/dark mode correct

### i18n Tests
- [ ] English text displays correctly
- [ ] Thai text displays correctly
- [ ] Locale switching works

### Edge Cases
- [ ] Empty state displays correctly
- [ ] Loading state shows
- [ ] Error state handles gracefully
```

### 4. Execute Verification

For each checklist item:
1. Navigate to the relevant route
2. Perform the action
3. Observe the result
4. Record pass/fail status

### 5. Report Findings

```markdown
## Verification Results

**Feature:** [Feature Name]
**Routes Tested:** [List of routes]

### Summary
- Total checks: X
- Passed: Y
- Failed: Z

### Issues Found
1. **Issue:** [Description]
   - **Severity:** [Critical/High/Medium/Low]
   - **Steps to reproduce:** [Steps]
```

### 6. Update Workflow State

If verification passes:
```bash
node .claude/hooks/scripts/workflow_hook.cjs update-state qualityGates.verification=passed
```

## Common Issues to Check

- Page loads under 3 seconds
- No console errors
- Forms validate correctly
- Data saves and displays correctly
- Authentication redirects work

## Do Not

- Skip verification for UI changes
- Mark verification passed without actually testing
- Ignore console errors or warnings
- Test only the happy path
- Forget to test both locales
