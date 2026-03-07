---
name: add-i18n
description: >-
  Add i18n message files for a component following
  the owning-layer path convention
agent: agent
tools: ['edit/editFiles', 'search/codebase']
argument-hint: >-
  [component-path]
  e.g. modules/profile/components/form-profile
---

# Add i18n messages

Create internationalisation message files for a component
using the owning-layer namespace convention.

## Input

`${input}` is the component path relative to `src/`,
for example `modules/profile/components/form-profile`.

## Namespace convention

Convert the component path to a dot-separated namespace
using **camelCase** segments:

```text
modules/profile/components/form-profile
->
modules.profile.components.formProfile
```

The component retrieves translations with:

```typescript
const t = await getTranslations({
  locale,
  namespace: "modules.profile.components.formProfile",
});
```

## Steps

1. Discover all locales by listing directories inside
   `src/messages/`. Currently the project has `en` and
   `th`.

1. For each locale create or update the JSON file that
   matches the namespace path. Place it at:

   ```text
   src/messages/{locale}/modules/profile/components/form-profile.json
   ```

   Use a **flat key structure** inside each file:

   ```json
   {
     "title": "Profile",
     "description": "Manage your profile settings"
   }
   ```

1. Register the new file in the parent `index.ts` barrel
   if the message directory uses barrel re-exports.
   Check existing files in `src/messages/` to match the
   current pattern.

1. Add placeholder values for every locale. Use the
   English value as the starting point and note that
   non-English locales need human translation.

## Conventions

- One JSON file per component namespace
- Flat keys inside each JSON file (no nesting)
- File path mirrors the namespace path
- Every locale gets the same set of keys
- Use `getTranslations` (server) or `useTranslations`
  (client) from `next-intl`
