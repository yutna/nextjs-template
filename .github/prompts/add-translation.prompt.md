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

Target module or namespace, for example:
- `static-pages/components/landing-hero`
- `static-pages/hooks/use-copy-command`
- `shared/components/error`
- `common/actions`

## Required Output

### 1. Create or Update Leaf JSON Files

This repo composes messages with `index.ts` files and leaf JSON files. Do **not**
create module-level `index.json` files.

For module-specific translations, add or update leaf files like:

```txt
src/messages/en/modules/<module>/<group>/<name>.json
src/messages/th/modules/<module>/<group>/<name>.json
```

For shared/common translations, follow the same pattern under:

```txt
src/messages/<locale>/shared/<group>/<name>.json
src/messages/<locale>/common/<name>.json
```

### 2. Keep index.ts Composition in Sync

If you add a new leaf file or a new folder, update the nearest `index.ts` files in
both locales.

```typescript
// src/messages/en/modules/<module>/<group>/index.ts
import sectionList from "./section-list.json";

export const components = {
  sectionList,
};

// src/messages/en/modules/<module>/index.ts
import { components } from "./components";

export const moduleMessages = {
  components,
};
```

When adding a brand-new module, update `src/messages/en/modules/index.ts` and
`src/messages/th/modules/index.ts`.

Only touch `src/messages/<locale>/index.ts` when adding a new top-level group
alongside `common`, `modules`, or `shared`.

### 3. Translation File Structure

```json
{
  "title": "Page Title",
  "subtitle": "Supporting copy",
  "actions": {
    "primary": "Get started"
  }
}
```

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
  const t = await getTranslations('modules.staticPages.components.landingHero');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function UserForm() {
  const t = useTranslations('shared.components.error');

  return (
    <form>
      <button type="submit">{t('tryAgain')}</button>
    </form>
  );
}
```

## Do Not

- Hardcode user-facing strings
- Mix languages in the same file
- Use string concatenation for translations
- Skip Thai translations
- Forget to update the nearest `index.ts` composition file
