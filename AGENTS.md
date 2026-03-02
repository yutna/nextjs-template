# Project Guidelines

## Code Style

- **TypeScript strict mode** — path alias `@/*` → `src/*`
- **React Compiler enabled** — avoid manual `useMemo`/`useCallback`; let the compiler optimize
- **Server Components by default** — add `"use client"` only when using hooks/browser APIs; mark server-only files with `import "server-only"`
- **Kebab-case** for all file and folder names (e.g., `error-boundary.tsx`, `report-error-action.ts`)
- **Barrel exports at the leaf level only** — each individual component/screen/action folder has `index.ts` re-exporting its public API, but parent grouping folders (`components/`, `screens/`, `utils/`, `constants/`, `config/`) do **not** have `index.ts`
- **Component folder structure**: `component-name/component-name.tsx` + `index.ts` + optional `types.ts`, `component-name.test.tsx`
- **Standalone files** for constants and config (e.g., `locale.ts`, `timezone.ts`, `env.ts`, `fonts.ts`) — no barrel index
- Formatting: Prettier (`npm run format`), Linting: ESLint 9 flat config (`npm run lint`)

## Architecture

```txt
src/
├── app/                    # Next.js 16 App Router (routes only, minimal logic)
│   └── [locale]/           # i18n routing via next-intl
│       ├── (private)/      # Auth-protected routes (empty, ready for use)
│       └── (public)/       # Public routes (empty, ready for use)
├── modules/                # Feature modules (same subfolders as shared/ — components/, screens/, actions/, lib/, schemas/, etc.)
│   └── {module}/           # e.g. static-pages/ currently has components/ + screens/
├── shared/                 # Cross-cutting code
│   ├── actions/            # Server actions via next-safe-action
│   ├── components/         # Reusable UI components
│   ├── config/             # env (t3-env), fonts, i18n
│   ├── constants/          # Locale, timezone constants
│   ├── lib/                # Utilities: errors, fetcher, logger, navigation, safe-action
│   ├── providers/          # Client providers (Chakra, next-intl, nuqs)
│   ├── routes/             # Route path definitions (root, private, public)
│   ├── schemas/            # Zod validation schemas
│   └── vendor/             # Chakra UI system/provider/toaster customization
├── messages/               # i18n JSON files: {locale}/{namespace}/*.json
├── proxy.ts                # Next.js middleware (next-intl locale routing)
└── test/                   # Test helpers: setup.ts, renderWithProviders
```

## Build and Test

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server (Webpack) |
| `npm run build` | Production build |
| `npm run check-types` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:coverage` | Coverage (v8) — thresholds: 80% statements/functions/lines, 75% branches |

Node version: **24.13.1** (managed via `mise.toml`)

## Project Conventions

### i18n (next-intl)

- **Default locale: Thai (`th`)** — Thai locale is the type-safety source of truth in `src/global.d.ts`
- Locales: `["th", "en"]` — defined in `src/shared/constants/locale.ts`
- Timezone: `Asia/Bangkok` — used globally including dayjs (with Buddhist Era plugin)
- Message files: `src/messages/{locale}/{namespace}/*.json` — add translations in **both** locales
- Use `@/shared/lib/navigation` (`Link`, `redirect`, `useRouter`, `usePathname`) instead of `next/link` or `next/navigation` for locale-aware routing
- Middleware at `src/proxy.ts` handles locale detection and routing
- Rich text defaults (`<b>`, `<i>`, `<br>`) configured in `src/shared/config/i18n/request.tsx`

### Error Handling

- Use the `AppError` hierarchy from `@/shared/lib/errors`:
  - **Domain errors** (operational, user-facing): `NotFoundError`, `ValidationError`, `BusinessRuleError`, `ConflictError`, `AuthorizationError`
  - **Auth errors**: `AuthenticationError`, `SessionExpiredError`
  - **Infrastructure errors** (unexpected, status 500): `DatabaseError`, `ExternalServiceError`, `UnknownError`
  - **HTTP errors**: `FetchError` (wraps fetch failures with url/method/response)
- Error codes use `SCREAMING_SNAKE_CASE` (e.g., `NOT_FOUND`, `VALIDATION_ERROR`)
- Server actions use `next-safe-action` — see `@/shared/lib/safe-action` for `actionClient` / `authActionClient`

### Data Fetching

- `fetchClient<T>` from `@/shared/lib/fetcher` — retry logic, auth token support, structured error wrapping
- Client-side: SWR with `swrFetcher` from same module
- URL state: `nuqs` for type-safe search params

### UI

- **Chakra UI v3** with custom system at `@/shared/vendor/chakra-ui/system`
- Dark mode via `next-themes` (see `@/shared/vendor/chakra-ui/color-mode`)
- Fonts: Noto Sans Thai (body/heading) + JetBrains Mono (mono) — loaded in `@/shared/config/fonts`
- Animation: `motion` (Framer Motion 12.x)

### Testing

- **Vitest + Testing Library** (jsdom) with globals enabled (no `import { describe, it }`)
- Use `renderWithProviders` from `@/test/render-with-providers` to wrap components in Chakra provider
- Server components: test by calling the async function directly and awaiting the result
- Mock `"server-only"` as `vi.mock("server-only", () => ({}))` in server-side tests
- Use `vi.hoisted()` for mock function declarations, `vi.mock()` for module mocks
- Schemas validated with Zod — test both valid and invalid inputs

### Environment Variables

- Validated at build time via `@t3-oss/env-nextjs` in `src/shared/config/env.ts`
- Server: `NODE_ENV` — Client: `NEXT_PUBLIC_API_URL`
- Add new env vars to both the schema and `.env*` files

## Security

- `"server-only"` import guards server code from client bundles
- `authActionClient` middleware in `@/shared/lib/safe-action` — extend for session/token validation
- Environment secrets validated via t3-env (never expose server vars with `NEXT_PUBLIC_` prefix)
- `fetchClient` includes auth token header support — configure via `getAuthToken` option
