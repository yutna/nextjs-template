---
name: scaffold-module
description: >-
  Scaffold the complete folder structure for a new feature module
agent: agent
tools: ['edit/editFiles']
argument-hint: '[module-name] e.g. user-profile'
---

# Scaffold feature module

Create `src/modules/${input}/` with `.gitkeep` in each subfolder:
`actions/`, `components/`, `containers/`, `contexts/`, `hooks/`, `layouts/`,
`lib/`, `providers/`, `schemas/`, `screens/`, `types/`, `utils/`.

Validate `${input}` is kebab-case. Create only directories and `.gitkeep`
files — no code files. Verify all subfolders exist after creation.
