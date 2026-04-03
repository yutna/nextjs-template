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
- [ ] Data displays correctly
- [ ] Error states are handled

### Visual Tests
- [ ] Layout matches expectations
- [ ] Responsive on mobile (< 768px)
- [ ] Responsive on tablet (768px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Light mode correct
- [ ] Dark mode correct

### i18n Tests
- [ ] English text displays correctly
- [ ] Thai text displays correctly
- [ ] Locale switching works

### Edge Cases
- [ ] Empty state displays correctly
- [ ] Loading state shows
- [ ] Error state handles gracefully
- [ ] Long text doesn't break layout

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Form labels present
- [ ] No console errors
```

### 4. Execute Verification

For each checklist item:

1. Navigate to the relevant route
2. Perform the action
3. Observe the result
4. Record pass/fail status

### 5. Report Findings

Document results:

```markdown
## Verification Results

**Feature:** [Feature Name]
**Date:** [Date]
**Routes Tested:** [List of routes]

### Summary
- Total checks: X
- Passed: Y
- Failed: Z

### Passed
- [List of passed items]

### Failed
- [List of failed items with details]

### Issues Found
1. **Issue:** [Description]
   - **Location:** [Route or component]
   - **Severity:** [Critical/High/Medium/Low]
   - **Steps to reproduce:** [Steps]
   - **Expected:** [Expected behavior]
   - **Actual:** [Actual behavior]

### Recommendations
- [Any recommendations for fixes or improvements]
```

### 6. Update Workflow State

If verification passes:

```bash
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state \
  qualityGates.verification=passed
```

If verification fails:

```bash
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state \
  qualityGates.verification=failed \
  'qualityGates.lastRunSummary="[Summary of failures]"'
```

## Quick Verification Commands

### Check Console Errors

Open browser DevTools (F12) → Console tab → Look for errors

### Check Network Requests

Open browser DevTools → Network tab → Look for failed requests

### Check Accessibility

```bash
# Install axe DevTools extension and run audit
# Or use Lighthouse in DevTools
```

### Test Keyboard Navigation

1. Tab through interactive elements
2. Verify focus is visible
3. Verify Enter/Space activates buttons
4. Verify Escape closes modals

## Common Issues to Check

### Performance

- Page loads under 3 seconds
- No visible layout shifts
- Images load properly

### Security

- No sensitive data in URL
- Authentication redirects work
- Forms have CSRF protection

### Data

- Data saves correctly
- Data displays correctly
- Cache invalidates properly

## Do Not

- Skip verification for UI changes
- Mark verification passed without actually testing
- Ignore console errors or warnings
- Test only the happy path
- Forget to test both locales
