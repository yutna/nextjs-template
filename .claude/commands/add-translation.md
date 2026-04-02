---
description: Add i18n translation messages for a feature or module
argument-hint: <module-name> or <namespace>
---

# /add-translation

Add internationalization messages for a module or feature using next-intl.

## Behavioral Mode

You are in **Implementation** phase for adding translations.

## Prerequisites

- Check existing translation structure in `src/messages/`
- Verify supported locales in `.claude/workflow-profile.json`

## Supported Locales

- `en` - English (default)
- `th` - Thai

## Input

Module or namespace name:
- `users` - for user module translations
- `common` - for shared translations
- `errors` - for error messages

## Required Output

### 1. Create Translation Files

For module-specific translations:

```
src/messages/en/modules/<module>/index.json
src/messages/th/modules/<module>/index.json
```

For shared translations:

```
src/messages/en/<namespace>.json
src/messages/th/<namespace>.json
```

### 2. Translation File Structure

```json
{
  "title": "Page Title",
  "description": "Page description",
  "sections": {
    "header": {
      "title": "Section Title",
      "subtitle": "Section subtitle"
    }
  },
  "actions": {
    "create": "Create",
    "edit": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel"
  },
  "form": {
    "labels": {
      "name": "Name",
      "email": "Email"
    },
    "placeholders": {
      "name": "Enter your name",
      "email": "Enter your email"
    },
    "validation": {
      "required": "{field} is required",
      "invalid": "Invalid {field}"
    }
  },
  "messages": {
    "success": {
      "created": "{item} created successfully",
      "updated": "{item} updated successfully",
      "deleted": "{item} deleted successfully"
    },
    "error": {
      "generic": "An error occurred",
      "notFound": "{item} not found"
    }
  },
  "empty": {
    "title": "No {items} found",
    "description": "Get started by creating your first {item}"
  }
}
```

### 3. Update Barrel Exports

Update `src/messages/en/index.ts`:

```typescript
import <module> from './modules/<module>/index.json';

export default {
  // ...existing
  modules: {
    // ...existing
    <module>,
  },
} as const;
```

Update `src/messages/th/index.ts` similarly.

## Thai Translation Guidelines

When creating Thai translations:

1. Use formal language (ภาษาเขียน)
2. Keep technical terms in English when appropriate
3. Use appropriate particles and polite forms

Example:

```json
// English
{
  "title": "Users",
  "actions": {
    "create": "Create User",
    "delete": "Delete"
  },
  "messages": {
    "success": "User created successfully"
  }
}

// Thai
{
  "title": "ผู้ใช้",
  "actions": {
    "create": "สร้างผู้ใช้",
    "delete": "ลบ"
  },
  "messages": {
    "success": "สร้างผู้ใช้สำเร็จ"
  }
}
```

## Usage in Components

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export async function UserListScreen() {
  const t = await getTranslations('modules.users');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function UserForm() {
  const t = useTranslations('modules.users.form');

  return (
    <form>
      <label>{t('labels.name')}</label>
      <input placeholder={t('placeholders.name')} />
    </form>
  );
}
```

### With Variables

```tsx
// Message: "Welcome, {name}!"
t('welcome', { name: user.name })

// Message: "{count, plural, =0 {No items} one {# item} other {# items}}"
t('itemCount', { count: items.length })
```

## Common Namespaces

| Namespace | Purpose |
|-----------|---------|
| `common` | Shared UI strings (buttons, labels) |
| `errors` | Error messages |
| `validation` | Form validation messages |
| `modules.<name>` | Module-specific strings |

## Do Not

- Hardcode user-facing strings
- Mix languages in the same file
- Use string concatenation for translations
- Skip Thai translations
- Forget to update barrel exports
