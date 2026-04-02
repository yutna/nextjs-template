---
name: code-conventions
description: This skill should be used when implementing code, creating files, or writing new features. Provides complete file structure, naming patterns, and import rules.
triggers:
  - implement
  - create
  - add component
  - add service
  - add repository
  - write code
  - new file
  - scaffold
---

# Code Conventions Skill

This skill provides comprehensive code structure conventions to ensure correct code generation on the first attempt.

## Naming Patterns (MUST FOLLOW)

| Folder Type | Pattern | Examples |
|-------------|---------|----------|
| Components | `<semantic-type>-<name>/` | `form-create-user/`, `modal-confirmation/`, `card-user/` |
| Containers | `container-<name>/` | `container-user-list/`, `container-checkout/` |
| Screens | `screen-<name>/` | `screen-welcome/`, `screen-user-detail/` |
| Hooks | `use-<name>/` | `use-user-form/`, `use-auth/` |
| Actions | `<name>-action/` | `create-user-action/`, `delete-post-action/` |
| API Handlers | `<name>-handler/` | `webhook-stripe-handler/`, `get-users-handler/` |
| Services | `<name>-service/` | `create-user-service/`, `checkout-service/` |
| Repositories | `<name>-repository/` | `user-repository/`, `order-repository/` |
| Jobs | `<name>-job/` | `send-welcome-email-job/`, `sync-inventory-job/` |
| Policies | `<name>-policy/` | `user-policy/`, `post-policy/` |
| Entities | `<name>/` | `user/`, `post/`, `order/` |
| Middleware | `<name>-middleware/` | `auth-middleware/`, `logging-middleware/` |

### Component Semantic Types
Use these prefixes for components: `form-`, `modal-`, `alert-`, `section-`, `menu-`, `card-`, `table-`, `list-`, `button-`, `input-`, `dialog-`, `drawer-`, `toast-`, `badge-`, `avatar-`, `icon-`

## File Structure Templates

### Frontend Folders (with tests + stories for components)

**Component:**
```
form-create-user/
├── index.ts                      # Export: FormCreateUser
├── types.ts                      # FormCreateUserProps
├── constants.ts                  # (optional) FORM_FIELDS
├── helpers.ts                    # (optional, internal) validateEmail()
├── form-create-user.tsx
├── form-create-user.test.tsx
└── form-create-user.stories.tsx  # REQUIRED for components
```

**Container:**
```
container-user-list/
├── index.ts
├── types.ts
├── helpers.ts                    # (optional, internal)
├── container-user-list.tsx
└── container-user-list.test.tsx
```

**Screen:**
```
screen-user-detail/
├── index.ts
├── types.ts
├── screen-user-detail.tsx
└── screen-user-detail.test.tsx
```

**Hook:**
```
use-user-form/
├── index.ts
├── types.ts
├── helpers.ts                    # (optional, internal)
├── use-user-form.ts
└── use-user-form.test.ts
```

### Backend Folders (with tests, Effect required)

**Service:**
```
create-user-service/
├── index.ts
├── types.ts                      # Input/output types
├── helpers.ts                    # (optional, internal)
├── create-user-service.ts        # Effect-based logic
└── create-user-service.test.ts
```

**Repository:**
```
user-repository/
├── index.ts
├── types.ts                      # Query result types
├── user-repository.ts            # Drizzle + Effect
└── user-repository.test.ts
```

**Job:**
```
send-welcome-email-job/
├── index.ts
├── types.ts                      # Payload types
├── send-welcome-email-job.ts     # Trigger.dev job
└── send-welcome-email-job.test.ts
```

**Policy:**
```
user-policy/
├── index.ts
├── types.ts
├── user-policy.ts
└── user-policy.test.ts
```

**API Handler:**
```
webhook-stripe-handler/
├── index.ts
├── types.ts
├── helpers.ts                    # (optional)
├── webhook-stripe-handler.ts     # Effect-based handler
└── webhook-stripe-handler.test.ts
```

### Shared-Only Folders

**Entity (NO tests required):**
```
shared/entities/user/
├── index.ts
├── user.ts                       # Drizzle schema
├── types.ts                      # Inferred types
└── relations.ts                  # (optional) Drizzle relations
```

**DB (flat, infrastructure):**
```
shared/db/
├── client.ts                     # Drizzle client
├── schema.ts                     # Re-exports all entities
├── types.ts
└── migrations/
```

**Queue (flat, infrastructure):**
```
shared/queue/
├── client.ts
├── types.ts
└── helpers.ts
```

**Middleware:**
```
shared/middleware/auth-middleware/
├── index.ts
├── types.ts
├── auth-middleware.ts
└── auth-middleware.test.ts
```

### Flat File Folders (no index.ts)

```
config/
├── env.ts
├── routes.ts
└── feature-flags/               # Grouping allowed
    └── production.ts            # No index.ts

constants/
├── api-endpoints.ts
├── error-codes.ts
└── ui/
    └── colors.ts

types/
├── api.ts
├── user.ts
└── common/
    └── pagination.ts
```

## Import Rules (MUST FOLLOW)

### Allowed
```typescript
// Same folder - use ./
import { UserProps } from "./types";
import { validateEmail } from "./helpers";

// Cross folder - use @/ alias
import { db } from "@/shared/db";
import { UserRepository } from "@/modules/users/repositories/user-repository";
import { users } from "@/shared/entities/user";
```

### Forbidden
```typescript
// ❌ NO relative imports beyond current folder
import { UserForm } from "../../components/user-form";
import { something } from "../../../shared/lib";

// ❌ NO barrel re-exports from grouping folders
import { Button, Card, Modal } from "@/shared/components";

// ❌ NO cross-module imports
import { something } from "@/modules/other-module/services/some-service";
```

## Required Files Checklist

| Folder Type | index.ts | types.ts | *.test.ts(x) | *.stories.tsx |
|-------------|----------|----------|--------------|---------------|
| Components | ✅ | If props | ✅ | ✅ |
| Containers | ✅ | If props | ✅ | ❌ |
| Screens | ✅ | If props | ✅ | ❌ |
| Hooks | ✅ | If types | ✅ | ❌ |
| Actions | ✅ | If types | ✅ | ❌ |
| Services | ✅ | ✅ | ✅ | ❌ |
| Repositories | ✅ | ✅ | ✅ | ❌ |
| Jobs | ✅ | ✅ | ✅ | ❌ |
| Policies | ✅ | ✅ | ✅ | ❌ |
| API Handlers | ✅ | ✅ | ✅ | ❌ |
| Entities | ✅ | ✅ | ❌ | ❌ |
| Middleware | ✅ | ✅ | ✅ | ❌ |

## Code Organization Rules

1. **No inline functions** outside main declaration → put in `helpers.ts`
2. **No inline constants** → put in `constants.ts`
3. **No inline types** → put in `types.ts`
4. **helpers.ts is internal** → NOT exported via index.ts

## Folder Placement Decision Tree

When creating new code, ask in order:

| Question | If Yes → |
|----------|----------|
| Does it render UI (JSX)? | `components/` |
| Is it a React hook? | `hooks/` |
| Is it a React context/provider? | `contexts/` or `providers/` |
| Does it wrap an external service/API? | `lib/` |
| Is it domain configuration (variants, presets, mappings)? | `lib/` |
| Is it a pure stateless utility function? | `utils/` |
| Is it a constant value (no logic)? | `constants/` (flat file) |
| Is it a TypeScript type/interface? | `types/` (flat file) |

**Key distinctions:**

- `lib/` = Has structure, may have state, wraps complexity, domain-specific
- `utils/` = Pure functions, stateless, generic, could be in any project
- `constants/` = Just values, no functions, flat files only
- `components/` = Must return JSX

## data-testid Convention (MUST FOLLOW)

All interactive UI elements MUST have a `data-testid` attribute for E2E test targeting.

### Naming Pattern

`<module>-<component>-<element>` using kebab-case.

```typescript
// Examples
<Button data-testid="auth-login-submit">Login</Button>
<Input data-testid="auth-login-email" />
<Dialog data-testid="users-delete-confirmation" />
```

### Which Elements Require data-testid

| Element Type | Required | Example |
|-------------|----------|---------|
| Buttons, links | ✅ | `auth-login-submit` |
| Form inputs | ✅ | `auth-login-email` |
| Form elements | ✅ | `auth-login-form` |
| Modals, dialogs, drawers | ✅ | `users-delete-modal` |
| Lists with dynamic items | ✅ | `users-list`, `users-list-item-{id}` |
| Purely decorative elements | ❌ | - |
| Layout wrappers | ❌ | - |

### Component Props

Interactive components SHOULD accept an optional `data-testid` prop:

```typescript
// types.ts
interface FormLoginProps {
  "data-testid"?: string;
}

// form-login.tsx
export function FormLogin({ "data-testid": testId = "auth-login-form" }: FormLoginProps) {
  return (
    <form data-testid={testId}>
      <Input data-testid={`${testId}-email`} />
      <Button data-testid={`${testId}-submit`}>Login</Button>
    </form>
  );
}
```

### Rules

- `data-testid` does NOT replace `aria-label`, `role`, etc. — both must coexist
- Use semantic defaults so E2E tests work without custom props
- For dynamic lists, append the item ID: `users-list-item-{id}`

## Common Mistakes to Avoid

1. ❌ Creating `utils.ts` or `helpers.ts` at module root
2. ❌ Using `../` imports
3. ❌ Missing test files
4. ❌ Missing stories for components
5. ❌ Putting entities in modules (must be in shared/entities/)
6. ❌ Writing backend code without Effect
7. ❌ Creating barrel exports in grouping folders
8. ❌ Cross-module imports
9. ❌ Putting presets/variants/mappings in `components/` instead of `lib/`
10. ❌ Putting domain wrappers in `utils/` instead of `lib/`
11. ❌ Missing data-testid on interactive elements
