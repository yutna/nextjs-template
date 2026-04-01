---
description: Create a new feature module with containers, screens, components, and actions
argument-hint: <module-name>
---

# /create-module

Create a new feature module with the standard directory structure.

## Behavioral Mode

You are in **Implementation** phase for module scaffolding.

## Prerequisites

- Verify plan is approved (or this is a simple module creation task)
- Check `src/modules/` for existing patterns

## Input

Module name should be provided as argument:
- Use kebab-case: `user-management`, `order-processing`
- Be specific: `auth`, `dashboard`, `settings`

## Required Output

Create the following structure:

```
src/modules/<name>/
├── actions/
│   └── index.ts           # Barrel export
├── components/
│   └── index.ts           # Barrel export
├── containers/
│   └── index.ts           # Barrel export
├── screens/
│   └── index.ts           # Barrel export
├── hooks/
│   └── index.ts           # Barrel export
└── index.ts               # Module barrel export
```

### Barrel Export Templates

```typescript
// src/modules/<name>/index.ts
export * from './screens';
export * from './containers';
export * from './components';
export * from './actions';
export * from './hooks';
```

```typescript
// src/modules/<name>/actions/index.ts
// Export server actions here
// Example: export { createUser } from './createUser';
```

```typescript
// src/modules/<name>/components/index.ts
// Export components here
// Example: export { UserCard } from './UserCard';
```

```typescript
// src/modules/<name>/containers/index.ts
// Export containers here
// Example: export { UserListContainer } from './UserListContainer';
```

```typescript
// src/modules/<name>/screens/index.ts
// Export screens here
// Example: export { UserListScreen } from './UserListScreen';
```

```typescript
// src/modules/<name>/hooks/index.ts
// Export hooks here
// Example: export { useUserFilters } from './useUserFilters';
```

## Translation Files

Also create translation files:

```
src/messages/en/modules/<name>/
└── index.json

src/messages/th/modules/<name>/
└── index.json
```

### Translation Template

```json
{
  "title": "<Module Title>",
  "description": "<Module description>"
}
```

## Update Message Barrel Exports

Update `src/messages/en/index.ts` and `src/messages/th/index.ts` to include the new module.

## Convention Checks

- Module name: kebab-case
- Follow existing module patterns in `src/modules/`
- Server-first: start with server components, add "use client" only at leaves

## Example Usage

```
/create-module users
/create-module order-management
/create-module auth
```

## Do Not

- Create modules with generic names like `utils` or `helpers`
- Skip the barrel exports
- Add "use client" to initial scaffolding
- Create duplicate modules
