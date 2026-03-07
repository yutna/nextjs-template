---
name: scaffold-module
description: >-
  Scaffold the complete folder structure for a new feature module
agent: agent
tools: ['edit/editFiles']
argument-hint: '[module-name] e.g. user-profile'
---

# Scaffold feature module

Create the bare folder structure for a new feature module
under `src/modules/`.

## Input

`${input}` is the module name in **kebab-case**
(for example `user-profile`).

## Steps

1. Validate the module name is kebab-case. Reject names
   that contain uppercase letters, spaces, or special
   characters.

1. Create `src/modules/${input}/` with every subfolder
   listed below. Place a `.gitkeep` inside each one.

   - `actions/`
   - `components/`
   - `containers/`
   - `contexts/`
   - `hooks/`
   - `layouts/`
   - `lib/`
   - `providers/`
   - `schemas/`
   - `screens/`
   - `types/`
   - `utils/`

1. Do **not** create any code files. Only the directory
   structure and `.gitkeep` files should exist after this
   step.

## Validation

After creation, run a directory listing and confirm
every subfolder exists with its `.gitkeep` file.
