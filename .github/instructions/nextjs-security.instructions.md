---
name: Next.js Security
description: Enforce safe env access, secure Server Actions, and thin HTTP boundaries.
applyTo: "**/actions/**/*.{ts,tsx},**/route.ts,**/route.tsx,**/proxy.ts,**/middleware.ts,next.config.*"
---
# Next.js security

Rules:

- validate every Server Action input with `zod`
- authorize every mutation and privileged read on the server
- centralize env access through the validated env module
- keep Route Handlers thin and delegate to server modules
- use `server-only` for server-exclusive modules that must never leak into client bundles
- configure `serverActions.allowedOrigins` and `serverActions.bodySizeLimit` intentionally

Do not:

- access `process.env` outside the env module
- trust client-supplied identifiers or roles without server-side authorization
- expose internal actions as HTTP endpoints unless there is a real external consumer
- import server-only modules into client components
