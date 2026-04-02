---
applyTo: "src/app/**"
---
# App Router Conventions

## Structure

```
src/app/
├── [locale]/           # Locale prefix (en, th)
│   ├── layout.tsx      # Root layout with providers
│   ├── page.tsx        # Home page
│   ├── error.tsx       # Error boundary
│   ├── loading.tsx     # Loading state
│   ├── not-found.tsx   # 404 page
│   └── (routes)/       # Route groups
│       └── users/
│           ├── page.tsx
│           └── [id]/
│               └── page.tsx
└── api/                # API routes (external only)
```

## Page Rules

Pages should be thin composition shells:

```tsx
// src/app/[locale]/users/page.tsx
import { UserListScreen } from '@/modules/users/screens/screen-user-list';

export default function UsersPage() {
  return <UserListScreen />;
}
```

## Layout Rules

- Root layout handles providers
- Nested layouts for route-specific providers
- Keep layouts minimal

## Route Groups

Use `(group)` syntax for:
- Organizing related routes
- Different layouts for route sets
- Not affecting URL structure

## API Routes

- Only for external consumers (webhooks, mobile apps)
- Internal mutations use Server Actions
- Always use Effect for handlers

## Internationalization

- All routes under `[locale]/`
- Support en and th locales
- Use next-intl for translations
