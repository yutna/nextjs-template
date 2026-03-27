---
name: nextjs-architecture
description: Design a Next.js enterprise architecture with explicit repo topology, route ownership, module boundaries, and cache model. Use this during Discovery or Planning for Next.js work.
---

# Next.js Architecture

Use this skill during Planning for the Next.js enterprise profile.

Reference:

- [AGENTS.md](../../../AGENTS.md)
- [Next.js enterprise design](../../../docs/nextjs-enterprise-workflow-design.md)
- [workflow state](../../workflow-state.json)

## Goals

- choose the app location and repo topology
- define feature ownership and shared-package boundaries
- define the canonical route shape before implementation
- define the default server, cache, and mutation model

## Process

1. Confirm whether the repo is a monorepo or single-app repo.
2. Confirm the application root.
3. Define the route taxonomy and ownership boundaries.
4. Define the canonical feature slug, feature module shape, and shared surfaces.
5. Decide the default cache and invalidation approach.
6. Decide which libraries are defaults, exceptions, or escalations for env, logging, client state, and advanced workflows.
7. Record validation and rollback points before implementation starts.

## Output checklist

- repo topology
- app root
- route map
- feature ownership
- canonical feature slugs and naming rules
- shared package boundaries
- cache and mutation model
- library decision notes
- validation plan

## Do not

- skip route design because the file system will "figure it out"
- plan around client-first assumptions by default
- extract shared packages before there is repeated demand
