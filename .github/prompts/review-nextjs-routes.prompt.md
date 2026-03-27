---
name: review-nextjs-routes
description: Audit a Next.js route tree for URL semantics, layout boundaries, and misuse of advanced routing features.
agent: "Reviewer"
argument-hint: "[route area or feature summary]"
---
Review the route design and route-level implementation.

Follow:

- [AGENTS.md](../../AGENTS.md)
- [Next.js routing skill](../skills/nextjs-routing/SKILL.md)
- [Next.js file-system governance skill](../skills/nextjs-file-system-governance/SKILL.md)

Required output:

1. Findings ordered by severity
2. URL and layout issues
3. Route segment naming or route-registry consistency issues
4. Dynamic segment or `searchParams` misuse
5. Whether the route tree can proceed to verification

Rules:

- findings come first
- flag route groups, dynamic segments, special files, and route segment names that do not match the intended UX or naming contract
- require explicit justification for parallel or intercepting routes
