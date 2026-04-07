---
applyTo: "src/**/*.ts,src/**/*.tsx,e2e/**/*.ts"
---

# E2E Testing And Selector Conventions

## data-testid Convention

All interactive UI elements must expose a `data-testid` attribute for stable E2E
targeting.

### Naming Pattern

Use `<module>-<component>-<element>` in kebab-case.

Examples:

- `auth-login-submit`
- `auth-login-email`
- `users-delete-confirmation`

### Which Elements Require data-testid

| Element Type | Required | Example |
| --- | --- | --- |
| Buttons and links | Yes | `auth-login-submit` |
| Form inputs | Yes | `auth-login-email` |
| Form wrappers | Yes | `auth-login-form` |
| Modals, dialogs, drawers | Yes | `users-delete-modal` |
| Lists with dynamic items | Yes | `users-list`, `users-list-item-{id}` |
| Purely decorative elements | No | - |
| Layout wrappers | No | - |

### Component Prop Convention

Interactive components should accept an optional `data-testid` prop and provide a
semantic default when one is not supplied.

Examples:

- form root: `auth-login-form`
- derived input: `${testId}-email`
- derived button: `${testId}-submit`

### Rules

- `data-testid` does not replace `aria-label`, `role`, or other accessibility
  semantics; both must coexist.
- Use semantic default IDs so E2E tests work without custom props.
- For dynamic lists, append the item identifier: `users-list-item-{id}`.
