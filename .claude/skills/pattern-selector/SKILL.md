---
name: pattern-selector
description: Use this skill when planning implementation to select the correct architectural patterns. Helps decide between state machines vs hooks, presenters vs inline, form objects vs schemas, etc.
triggers:
  - which pattern
  - should I use
  - state machine or
  - presenter or
  - form object or
  - planning
  - architecture decision
  - pattern selection
---

# Pattern Selector Skill

Use this skill during planning to select the right patterns for your implementation.

## Decision Flowcharts

### 1. Data Layer Decisions

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA OPERATION?                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   Define table?         Query data?          Validate input?
        │                     │                     │
        ▼                     ▼                     ▼
   Use ENTITY            Use REPOSITORY       Use ZOD SCHEMA
   shared/entities/      modules/.../         modules/.../
                         repositories/        schemas/
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Reusable filter?    One-time filter?
                    │                   │
                    ▼                   ▼
              Use SCOPE            Inline WHERE
              scopes.ts
```

### 2. Entity Hooks vs Inline Logic

```
┌─────────────────────────────────────────────────────────────┐
│            SIDE EFFECT ON CREATE/UPDATE/DELETE?             │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              ALWAYS run?         SOMETIMES run?
                    │                   │
                    ▼                   ▼
              Use HOOKS            Inline in Service
              hooks.ts

Examples of ALWAYS (use hooks):
- Normalize email lowercase
- Set updatedAt timestamp
- Audit log every change
- Hash password on create

Examples of SOMETIMES (use inline):
- Send welcome email (only new users)
- Notify admin (only for specific changes)
- Trigger sync (only when flag is set)
```

### 3. Business Logic Layer

```
┌─────────────────────────────────────────────────────────────┐
│                  WHERE DOES LOGIC BELONG?                   │
└─────────────────────────────────────────────────────────────┘
                              │
    ┌────────────┬────────────┼────────────┬────────────┐
    ▼            ▼            ▼            ▼            ▼
 Pure DB     Business     UI-triggered  External    Long task
 access?     logic?       mutation?     consumer?   (>10s)?
    │            │            │            │            │
    ▼            ▼            ▼            ▼            ▼
REPOSITORY   SERVICE      ACTION      API ROUTE      JOB

Examples:
- REPOSITORY: findById, create, update, delete, findWithFilters
- SERVICE: createUserWithProfile, processPayment, calculatePricing
- ACTION: submitContactForm, updateUserSettings, deletePost
- API ROUTE: webhookStripe, oauthCallback, externalApiEndpoint
- JOB: sendBulkEmails, generateReports, syncInventory
```

### 4. Presenter vs Inline Transform

```
┌─────────────────────────────────────────────────────────────┐
│              RETURNING DATA TO CLIENT/API?                  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Entity data?         Primitive/config?
                    │                   │
                    ▼                   ▼
         ┌─────────┴─────────┐    Return directly
         ▼                   ▼
   Need to transform?   Same as entity?
   - Hide fields             │
   - Format dates            ▼
   - Add computed       Return directly
   - Pagination meta
         │
         ▼
   Use PRESENTER
   presenters/<name>-presenter/

Questions to ask:
□ Does entity have sensitive fields? (password, internal IDs) → Presenter
□ Need different shapes? (list vs detail view) → Presenter
□ Need computed fields? (fullName, totalPrice) → Presenter
□ Need pagination metadata? → Presenter
□ Just returning raw entity? → Direct return OK
```

### 5. Form Object vs Zod Schema Only

```
┌─────────────────────────────────────────────────────────────┐
│                    HANDLING FORM INPUT?                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         Multi-step?    Cross-field      Transform to
                        validation?      multiple entities?
              │               │               │
              ▼               ▼               ▼
         ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
         Yes  No   Yes  No        Yes  No
          │    │    │    │         │    │
          ▼    │    ▼    │         ▼    │
    FORM OBJECT│ FORM OBJ│    FORM OBJ  │
              │         │              │
              └────┬────┘──────────────┘
                   ▼
            ZOD SCHEMA ONLY

FORM OBJECT indicators:
□ Multi-step wizard
□ password === confirmPassword
□ Conditional required fields (if paymentType === "card" then cardNumber required)
□ Form creates User + Profile + Settings
□ Need async validation (check username availability)
□ Need step-by-step validation

ZOD SCHEMA ONLY:
□ Single-step form
□ Simple field validation
□ No cross-field dependencies
□ 1:1 mapping to entity
```

### 6. State Management Selection

```
┌─────────────────────────────────────────────────────────────┐
│                 COMPONENT NEEDS STATE?                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              URL-persisted?       Local state?
              (shareable)               │
                    │          ┌────────┴────────┐
                    ▼          ▼                 ▼
                  nuqs    Standard UI       Custom state
                         primitive?              │
                              │         ┌────────┴────────┐
                              ▼         ▼                 ▼
                           Zag.js   How many states?
                                         │
                         ┌───────────────┼───────────────┐
                         ▼               ▼               ▼
                       1-2            3-4             5+
                     boolean        related         states
                         │            values            │
                         ▼               │              ▼
                     useState            ▼          XState
                                    useReducer

URL STATE (nuqs):
- Search/filter params
- Pagination (page, pageSize)
- Sort order
- Active tab (if shareable)
- Modal with deep link

STANDARD PRIMITIVES (Zag.js):
- Menu, Dropdown
- Dialog, Modal
- Tooltip, Popover
- Accordion, Tabs
- Checkbox, Radio, Switch
- Slider, Rating

XSTATE indicators:
□ More than 4 distinct states
□ States have guards (can only go A→B if condition)
□ Need to prevent invalid transitions
□ Parallel states (loading AND editing)
□ Delayed/timed transitions
□ Need state history
□ Complex async (retry with backoff)
```

### 7. Communication Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                  REAL-TIME UPDATES NEEDED?                  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                   No                  Yes
                    │                   │
                    ▼                   ▼
            On-demand fetch    ┌────────┴────────┐
            (SWR/fetch)        ▼                 ▼
                          Server→Client     Bi-directional?
                          only?             Presence?
                              │             Private channels?
                              ▼                   │
                             SSE                  ▼
                                              Pusher/Ably

SSE use cases:
- Notifications (one-way)
- Live feed updates
- Progress indicators
- Simple dashboard updates

PUSHER use cases:
- Chat/messaging
- Collaborative editing
- Live cursors
- Presence (who's online)
- Private user channels
- Room-based features
```

### 8. Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI COMPONENT TYPE?                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   Page-level            Data binding          Pure rendering
   composition?          + interactivity?      (props only)?
        │                     │                     │
        ▼                     ▼                     ▼
     SCREEN              CONTAINER             COMPONENT
   (server)              (client)              (server)
   screens/              containers/           components/

SCREEN:
- One per route
- Fetches data
- Composes containers/components
- Server component

CONTAINER:
- "use client"
- Connects to hooks/actions
- Manages local state
- Binds events

COMPONENT:
- Pure props → UI
- No hooks (except UI primitives)
- Server component default
- Has stories

┌─────────────────────────────────────────────────────────────┐
│                  WHERE DOES COMPONENT LIVE?                 │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Used by 2+ modules?   Used by 1 module?
                    │                   │
                    ▼                   ▼
            shared/components/    modules/<name>/
                                  components/
```

### 9. Server Action vs API Route

```
┌─────────────────────────────────────────────────────────────┐
│                    MUTATION ENDPOINT?                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Called from           Called from
            Next.js UI?           external source?
                    │                   │
                    ▼                   ▼
            SERVER ACTION          API ROUTE
            actions/               api/

SERVER ACTION:
- Form submissions
- Button click mutations
- Optimistic updates
- Progressive enhancement

API ROUTE:
- Webhooks (Stripe, GitHub)
- OAuth callbacks
- Mobile app endpoints
- Third-party integrations
- File uploads (large)
- Streaming responses
```

### 10. Testing Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                    CREATING TEST DATA?                      │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            Full entity?          Simple value?
            With relations?       Edge case?
                    │                   │
                    ▼                   ▼
               FACTORY             Inline data
            shared/factories/

FACTORY use cases:
- Need realistic fake data
- Override specific fields
- Create related entities
- Generate lists

INLINE use cases:
- Testing specific edge case
- Single primitive value
- Exact value matters
```

## Quick Reference Card

| Situation | Pattern | Location |
|-----------|---------|----------|
| DB table | Entity | `shared/entities/` |
| Validate input | Zod Schema | `schemas/` |
| DB operations | Repository | `repositories/` |
| Business logic | Service | `services/` |
| UI mutation | Server Action | `actions/` |
| External endpoint | API Route | `api/` |
| Background task | Job | `jobs/` |
| Authorization | Policy | `policies/` |
| API response | Presenter | `presenters/` |
| Complex form | Form Object | `forms/` |
| Lifecycle callbacks | Entity Hooks | `hooks.ts` |
| Reusable filters | Query Scopes | `scopes.ts` |
| Email templates | Email Service | `shared/services/email/` |
| Real-time | Realtime Service | `shared/services/realtime/` |

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Inline entity transformation in API route | Use Presenter |
| Complex validation in action | Use Form Object |
| useState for 5+ states | Use XState |
| Direct DB in action | Use Repository via Service |
| Business logic in repository | Move to Service |
| Copy-paste WHERE clauses | Extract to Scope |
| Inline hook logic for every save | Use Entity Hooks |
| API route for UI form | Use Server Action |
| Polling for notifications | Use SSE or Pusher |
