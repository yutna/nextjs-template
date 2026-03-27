---
name: Convention Tiering
description: Classify architecture and convention decisions into hard conventions, strong defaults, and local freedom before planning or review.
applyTo: "**"
---
# Convention tiering

Treat the repository workflow as a contract-driven grammar.

Rules:

- do not use sample repositories, prior generated output, or familiar framework habits as the reason a structure is correct
- preserve hard conventions automatically
- reuse strong defaults unless the plan records a justified deviation
- allow local-freedom variation only inside stable boundaries that do not change the public grammar of the repository

Review severity:

- hard-convention violations are blocking by default
- unjustified strong-default drift is a finding
- local-freedom variation is acceptable unless it harms correctness, testability, or future consistency

When planning:

- state which strong defaults you are following
- state any justified deviations from strong defaults
- state any requested hard-convention changes explicitly instead of smuggling them into implementation
