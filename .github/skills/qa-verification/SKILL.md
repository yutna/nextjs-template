---
name: qa-verification
description: >
  E2E browser verification protocol for AI agents. Use after implementing a
  UI feature to verify it works correctly in a real browser. Covers visual
  checks, responsive viewports, color schemes, locale switching, console
  errors, interaction testing, and annotated screenshots. Integrates with
  agent-browser for all browser automation.
---

# QA Verification Protocol

This skill defines how to verify that a UI feature works correctly in a real
browser using `agent-browser`. Follow this protocol after implementation and
quality gates (type-check, lint, test) have passed.

## When to Run

Run this protocol when the feature includes any rendered output:

- New pages, screens, or routes
- New or modified components visible in the UI
- Layout or styling changes
- i18n message changes that affect rendered text
- Theme or color mode changes

## When to Skip

Skip this protocol when the change has no rendered output:

- Backend-only changes (schemas, lib, actions with no UI)
- Configuration or tooling changes
- Test-only changes
- Type definition changes

## Prerequisites

1. Dev server must be running (`npm run dev`)
2. `agent-browser` must be available (installed via skill)
3. Know which routes are affected by the change
4. Know what the feature should look like and behave like (requirements)

## Verification Sequence

Execute these steps for each affected route. The sequence is ordered from
fastest to slowest — fail fast on basic issues before investing in deeper
checks.

### Step 1 — Open and wait

```bash
agent-browser open http://localhost:3000/<route>
agent-browser wait --load networkidle
```

If the page fails to load or shows an error page, stop and report immediately.

### Step 2 — Console error check

```bash
agent-browser eval 'JSON.stringify(performance.getEntriesByType("resource").filter(r => r.responseStatus >= 400).map(r => ({ url: r.name, status: r.responseStatus })))'
```

Also take a snapshot to check if the page rendered:

```bash
agent-browser snapshot -i
```

Look for:

- Runtime errors or exceptions
- React hydration mismatches
- Failed network requests (4xx, 5xx)
- Missing resources (images, fonts, scripts)

If console errors are found, report them with the error message and stack
trace.

### Step 3 — Visual verification (annotated screenshot)

```bash
agent-browser screenshot --annotate
```

The annotated screenshot labels interactive elements with numbered markers.
Use this to verify:

- Layout renders correctly (no overlapping, no missing sections)
- Text content is visible and readable
- Images and icons render properly
- Interactive elements are present and labeled
- No placeholder text (lorem ipsum, TODO, [missing])
- No broken translations (keys showing instead of translated text)
- Spacing and alignment look intentional

### Step 4 — Content verification (snapshot)

```bash
agent-browser snapshot -i
```

Read the accessibility tree output and verify:

- All expected sections/components are present
- Heading hierarchy is correct (h1 → h2 → h3)
- Interactive elements have appropriate labels
- Navigation links point to correct destinations
- Form fields have labels and appropriate types

### Step 5 — Responsive viewport testing

Test three viewport sizes that align with Chakra UI breakpoints.

#### Desktop (default — 1280×800)

Already tested in Steps 1-4. Review the screenshot for desktop layout.

#### Tablet (768×1024)

```bash
agent-browser eval 'window.innerWidth + "x" + window.innerHeight'
agent-browser eval --stdin <<'EVALEOF'
(async () => {
  const cdp = await window.__playwright__?.cdpSession?.();
  // Resize via viewport override if available, otherwise report current size
  return "Current viewport: " + window.innerWidth + "x" + window.innerHeight;
})()
EVALEOF
```

For viewport testing, close and reopen with a different viewport:

```bash
agent-browser close
agent-browser open http://localhost:3000/<route>
agent-browser set viewport 768 1024
agent-browser wait --load networkidle
agent-browser screenshot --annotate
agent-browser snapshot -i
```

Verify:

- Layout adapts to tablet width (no horizontal scroll)
- Navigation transforms appropriately (hamburger menu if applicable)
- Content stacks vertically where expected
- Touch targets are adequately sized

#### Mobile (375×667)

```bash
agent-browser close
agent-browser open http://localhost:3000/<route>
agent-browser set viewport 375 667
agent-browser wait --load networkidle
agent-browser screenshot --annotate
agent-browser snapshot -i
```

Verify:

- Layout adapts to mobile width (single column where appropriate)
- Text is readable without zooming
- No content is cut off or hidden unintentionally
- Interactive elements are tap-friendly

#### Restore default viewport

```bash
agent-browser close
agent-browser open http://localhost:3000/<route>
agent-browser wait --load networkidle
```

### Step 6 — Color scheme testing

#### Dark mode

```bash
agent-browser close
agent-browser --color-scheme dark open http://localhost:3000/<route>
agent-browser wait --load networkidle
agent-browser screenshot --annotate
```

Verify:

- Background and text colors switch appropriately
- No white-on-white or black-on-black text
- Images with transparency render correctly
- Brand colors are maintained or have dark variants
- Borders and dividers are visible

#### Light mode

```bash
agent-browser close
agent-browser --color-scheme light open http://localhost:3000/<route>
agent-browser wait --load networkidle
agent-browser screenshot --annotate
```

Verify the same concerns as dark mode, ensuring light mode also renders
correctly.

### Step 7 — Locale testing

Test both supported locales.

#### English (en)

```bash
agent-browser open http://localhost:3000/en/<route-without-locale>
agent-browser wait --load networkidle
agent-browser snapshot -i
```

Verify:

- All text renders in English
- No translation keys showing (e.g., `modules.staticPages.components.sectionHero.heading`)
- Date and number formatting follows English conventions
- Layout accommodates English text length

#### Thai (th)

```bash
agent-browser open http://localhost:3000/th/<route-without-locale>
agent-browser wait --load networkidle
agent-browser snapshot -i
agent-browser screenshot --annotate
```

Verify:

- All text renders in Thai
- Thai font renders correctly (Noto Sans Thai)
- No broken characters or tofu (□□□)
- Layout accommodates Thai text (may be longer or shorter than English)
- No translation keys showing

### Step 8 — Interaction testing (when applicable)

For features with interactive elements (forms, modals, navigation, toggles):

#### Links and navigation

```bash
agent-browser snapshot -i
# Identify link elements from snapshot
agent-browser click @e<ref>
agent-browser wait --load networkidle
agent-browser get url
# Verify navigated to expected URL
agent-browser eval 'document.title'
```

#### Form interaction

```bash
agent-browser snapshot -i
# Identify form elements from snapshot
agent-browser fill @e<ref> "test input"
agent-browser click @e<submit-ref>
agent-browser wait --load networkidle
agent-browser snapshot -i
# Verify form submission result
```

#### Modal/dialog interaction

```bash
agent-browser snapshot -i
# Click trigger element
agent-browser click @e<trigger-ref>
agent-browser wait @e<dialog-ref>
agent-browser snapshot -i
# Verify dialog content
# Close dialog
agent-browser press Escape
agent-browser snapshot -i
# Verify dialog closed
```

#### State transitions

```bash
# Capture before state
agent-browser snapshot -i > /tmp/before-state.txt
# Perform action
agent-browser click @e<ref>
agent-browser wait 1000
# Compare after state
agent-browser diff snapshot --baseline /tmp/before-state.txt
```

## Report Format

After completing verification, report results in this structure:

```
## QA Verification Report

**Route:** /path/to/page
**Status:** ✅ PASS | ❌ FAIL | ⚠️ PARTIAL

### Checks

| Check | Status | Notes |
|-------|--------|-------|
| Page loads | ✅ | Loaded in Xs |
| Console errors | ✅ | No errors |
| Visual layout | ✅ | All sections render correctly |
| Content | ✅ | All text present, no placeholders |
| Responsive (tablet) | ✅ | Layout adapts correctly |
| Responsive (mobile) | ✅ | Single column, readable |
| Dark mode | ✅ | Colors switch correctly |
| Light mode | ✅ | Default theme renders |
| Locale (en) | ✅ | English text correct |
| Locale (th) | ✅ | Thai text correct |
| Interactions | ✅ | Links/forms work |

### Issues Found

(List any issues with description, screenshot reference, and suggested fix)

### Screenshots

- Desktop: [screenshot path]
- Tablet: [screenshot path]
- Mobile: [screenshot path]
- Dark mode: [screenshot path]
```

## Failure Handling

When verification finds issues:

1. **Report the issue clearly** — describe what's wrong, include the
   screenshot or snapshot output, and note the expected vs actual behavior
2. **Categorize severity:**
   - **Critical** — page doesn't load, runtime errors, data loss
   - **Major** — visual layout broken, text not visible, interaction fails
   - **Minor** — spacing off, color slightly wrong, edge case display issue
3. **Suggest a fix** when possible — reference the likely source file and
   what might need to change
4. **Return to orchestrator** — the QA agent reports back; the orchestrator
   decides whether to self-heal (spawn a general-purpose agent to fix) or
   mark as blocked

## Quick Reference

```
VERIFICATION ORDER (per route)
══════════════════════════════
1. Open + wait for network idle
2. Console error check
3. Annotated screenshot (visual)
4. Snapshot (content/accessibility)
5. Responsive: tablet (768×1024)
6. Responsive: mobile (375×667)
7. Dark mode
8. Light mode
9. Locale: en
10. Locale: th
11. Interactions (if applicable)

VIEWPORT SIZES
══════════════
Desktop:  1280×800  (default)
Tablet:   768×1024
Mobile:   375×667

ESSENTIAL COMMANDS
══════════════════
agent-browser open <url>
agent-browser wait --load networkidle
agent-browser screenshot --annotate
agent-browser snapshot -i
agent-browser close
agent-browser set viewport <W> <H>
agent-browser --color-scheme dark open <url>
agent-browser eval '<js>'
agent-browser click @e<ref>
agent-browser fill @e<ref> "text"
agent-browser diff snapshot --baseline <file>
```
