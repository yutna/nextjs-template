# Next.js Enterprise MCP Playbook

This playbook defines how the Next.js enterprise workflow should use MCP in
real projects.

## Goals

- treat design and runtime MCP tools as evidence sources
- improve AI accuracy for routing, component usage, and verification
- keep MCP usage additive to the workflow core instead of replacing it

## Recommended MCP servers

| Server | Primary use | Why it matters |
| --- | --- | --- |
| `ark-ui` | headless component anatomy and composition reference | helps AI use Ark-backed component structure correctly when Chakra or custom wrappers expose Ark patterns |
| `chakra-ui` | component API, composition rules, and design-system usage | keeps generated UI aligned with the profile's Chakra-based design-system baseline |
| `figma` | design truth, frame inspection, component usage, Code Connect context | prevents AI from inventing layout and component details |
| `next-devtools` | runtime debugging, route behavior, caching, Server Action inspection | gives route and rendering evidence beyond static reasoning |

The baseline expectation for this profile is the following MCP set:

- `ark-ui`
- `chakra-ui`
- `next-devtools`

On top of that, this workflow treats `figma` as part of the practical default
stack for design-to-code teams.

The workspace sample config lives in [`.vscode/mcp.json`](../.vscode/mcp.json).
It uses a workspace input prompt named `figma-personal-access-token` so the
Figma Personal Access Token is requested at startup instead of hardcoded in the
repository.

## VS Code and CLI adoption model

- GitHub Copilot in VS Code can use workspace MCP configuration from
  `.vscode/mcp.json`
- the workspace sample config expects VS Code to prompt for
  `figma-personal-access-token` and stores that credential through VS Code's
  secure input handling
- CLI-based agents should register the same servers in the user's CLI or
  global MCP configuration because a workspace file alone is not enough for
  every host
- when configuring CLI MCP for Figma, mirror the same Bearer-token approach
  rather than committing headers or tokens into project files
- if a host session exposes no MCP tooling, the workflow must fall back to
  local docs, screenshots, and runtime commands instead of blocking the task

## Figma MCP rules

Use Figma MCP when:

- the request starts from a design file or frame
- the task changes visible layout, component choice, spacing, typography, or
  interaction flows
- reviewers need to verify design parity

Preferred flow:

1. open the relevant file or frame in Figma MCP
2. identify the exact frame, component, or variant driving the task
3. check whether Code Connect mappings exist for the used components
4. convert the MCP evidence into route, feature-module, and acceptance
   criteria decisions
5. record any missing Code Connect mappings as follow-up backlog items

If Code Connect is available, prefer mapped components over inferred ones.
Always provide the Figma token through the configured MCP input or external
host-secret mechanism, never by committing it into workspace configuration.

## UI-system MCP rules

Use `chakra-ui` and `ark-ui` MCP when:

- implementing or reviewing design-system-backed UI
- mapping Figma components to code components
- deciding between Chakra-provided composition and custom wrappers
- reviewing whether generated client islands follow the intended UI API

Preferred flow:

1. inspect the intended component API in Chakra or Ark MCP
2. confirm whether the design maps to an existing component or composition pattern
3. only then decide whether new wrappers, variants, or custom components are justified

## Next DevTools MCP rules

Use Next DevTools MCP when:

- a route has rendering, loading, error, or cache behavior to verify
- a Server Action is failing or revalidation seems wrong
- runtime evidence is needed during Verification
- debugging route transitions, dynamic params, or search-param behavior

Preferred flow:

1. start the local development server
2. reproduce the route or mutation flow
3. inspect route rendering, network/runtime signals, and cache behavior
4. map findings back to the responsible route segment, feature module, or
   Server Action

## Evidence contract

Whenever MCP is used, the plan or verification notes should capture:

- which MCP server was consulted
- which file, frame, route, or component it referred to
- what concrete decision came from MCP evidence
- what remained governed by local repository conventions

## Recommended automation pairings

- Figma MCP + route-registry skill when new flows or information architecture
  are being designed
- Figma MCP + Storybook harness when building client exceptions or shared UI
- Next DevTools MCP + browser QA skill during Verification
- Next DevTools MCP + runtime debugging skill when route behavior disagrees
  with static expectations
