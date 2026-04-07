---
name: nextjs-browser-qa
description: This skill should be used when performing browser testing, verifying in browser, or runtime checks. Guides browser verification patterns.
---

# Next.js Browser QA

Use this skill when verifying features in the browser during the verification phase.

## Tooling Reminder

Remember that this repo already has Next.js DevTools and Playwright MCP servers, plus
the `agent-browser` skill. Prefer Next.js DevTools for Next.js runtime diagnostics,
and use Playwright or `agent-browser` for real browser interaction, screenshots, and
flow verification. Use this skill for the verification checklist and QA strategy.

## Reference

- CLAUDE.md (Verification phase)
- .claude/workflow-state.json (verification status)

## When to Use Browser Verification

Browser verification is required when:

1. **UI changes** — layout, styling, responsive behavior
2. **Client interactivity** — forms, modals, navigation
3. **Integration points** — API calls, third-party services
4. **User flows** — multi-step processes
5. **Accessibility** — keyboard navigation, screen readers

## Verification Checklist

### Functional Verification

```markdown
## Feature: [Feature Name]

### Happy Path

- [ ] Primary action works as expected
- [ ] Data is displayed correctly
- [ ] Navigation works properly
- [ ] Form submission succeeds

### Edge Cases

- [ ] Empty states display correctly
- [ ] Loading states are shown
- [ ] Error states are handled
- [ ] Boundary conditions work (min/max values)

### User Feedback

- [ ] Success messages appear
- [ ] Error messages are clear
- [ ] Loading indicators show
- [ ] Transitions are smooth
```

### Visual Verification

```markdown
## Visual Checks

### Layout

- [ ] Components are properly aligned
- [ ] Spacing is consistent
- [ ] No layout shifts on load

### Responsive

- [ ] Mobile (< 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (> 1024px)

### Theme

- [ ] Light mode looks correct
- [ ] Dark mode looks correct
- [ ] Colors match design system
```

### Accessibility Verification

```markdown
## Accessibility Checks

### Keyboard

- [ ] All interactive elements are focusable
- [ ] Focus order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes modals

### Screen Reader

- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Error messages are announced
- [ ] Dynamic content is announced

### ARIA

- [ ] Roles are appropriate
- [ ] States are communicated
- [ ] Live regions work
```

## Browser Testing Commands

### Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### Test Different Locales

```bash
# English
http://localhost:3000/en/[route]

# Thai
http://localhost:3000/th/[route]
```

### Test Responsive Views

Use browser DevTools:

- Chrome: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
- Firefox: F12 → Responsive Design Mode (Ctrl+Shift+M)

### Test Accessibility

```bash
# Install axe DevTools browser extension
# Run accessibility audit in DevTools
```

## Common Issues to Check

### Performance

```markdown
- [ ] Page loads under 3 seconds
- [ ] No unnecessary re-renders
- [ ] Images are optimized
- [ ] No layout shifts (CLS)
```

### Security

```markdown
- [ ] No sensitive data in URL
- [ ] Auth redirects work
- [ ] CSRF protection active
- [ ] XSS vectors blocked
```

### i18n

```markdown
- [ ] All text is translated
- [ ] RTL layout works (if applicable)
- [ ] Date/number formats correct
- [ ] Locale switching works
```

## Reporting Issues

### Issue Template

```markdown
## Bug Report

**Location:** [URL or component path]
**Browser:** [Chrome/Firefox/Safari version]
**Device:** [Desktop/Mobile, OS]

**Steps to Reproduce:**

1. Navigate to...
2. Click on...
3. Enter...

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Screenshot/Video:** [Attach if helpful]

**Severity:** [Critical/High/Medium/Low]
```

### Severity Guidelines

| Level    | Definition       | Example                               |
| -------- | ---------------- | ------------------------------------- |
| Critical | App unusable     | Crash, data loss, auth bypass         |
| High     | Feature broken   | Form doesn't submit, navigation fails |
| Medium   | Feature impaired | Styling issues, minor UX problems     |
| Low      | Minor issue      | Typo, alignment off by few pixels     |

## Integration with Workflow

### Before Verification

```bash
# Ensure quality gates pass first
npm run check-types
npm run lint
npm run test
```

### Update Workflow State

```bash
# After successful verification
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state \
  qualityGates.verification=passed
```

### After Verification Fails

```bash
# Update state with failure
node --experimental-strip-types --no-warnings bin/vibe task workflow:hook -- update-state \
  qualityGates.verification=failed \
  'qualityGates.lastRunSummary="Button click does not trigger action"'
```

## Automated Browser Testing

### Playwright Setup (Optional)

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
  },
});
```

### Example E2E Test

```typescript
// e2e/user-flow.spec.ts
import { test, expect } from "@playwright/test";

test("user can create account", async ({ page }) => {
  await page.goto("/en/register");

  await page.fill('[name="email"]', "test@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/en/dashboard");
  await expect(page.getByText("Welcome")).toBeVisible();
});
```

## Do Not

- Skip browser verification for UI changes
- Mark verification as passed without actually testing
- Ignore console errors or warnings
- Test only happy paths
- Forget to test on multiple browsers/devices
