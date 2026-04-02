---
name: add-translation
description: Add i18n translation messages for a feature or module
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
      "updated": "{item} updated successfully"
    },
    "error": {
      "generic": "An error occurred",
      "notFound": "{item} not found"
    }
  }
}
```

### 3. Update Barrel Exports

Update `src/messages/en/index.ts` and `src/messages/th/index.ts` to include the new module.

## Thai Translation Guidelines

When creating Thai translations:

1. Use formal language
2. Keep technical terms in English when appropriate
3. Use appropriate particles and polite forms

## Usage in Components

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export async function UserListScreen() {
  const t = await getTranslations('modules.users');

  return (
    <div>
      <h1>{t('title')}</h1>
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
    </form>
  );
}
```

## Do Not

- Hardcode user-facing strings
- Mix languages in the same file
- Use string concatenation for translations
- Skip Thai translations
- Forget to update barrel exports
