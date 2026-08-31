---
kind: dependency_management
name: NPM/Expo Dependency Management via package.json and Lockfile
category: dependency_management
scope:
    - '**'
source_files:
    - frontend/package.json
    - frontend/package-lock.json
    - frontend/.gitignore
---

## What system/approach is used

The project uses **npm** as the package manager for an Expo-based React Native application. Dependencies are declared in `frontend/package.json` and resolved into a flat `frontend/node_modules` tree, with a `package-lock.json` lockfile present at the same level to pin exact transitive dependency versions.

## Key files and packages

- `frontend/package.json` — single source of truth for runtime dependencies (`expo`, `react-native`, `@react-navigation/*`, `expo-audio`, `expo-status-bar`, `react-native-safe-area-context`, `react-native-screens`) and dev dependencies (`typescript`, `@types/react`).
- `frontend/package-lock.json` — npm lockfile that pins every installed package version for reproducible installs.
- `frontend/node_modules/` — fully materialized dependency tree (no vendoring or sub-package structure; all third-party code lives here).
- `frontend/.gitignore` — standard exclusion of `node_modules` from version control.

## Architecture and conventions

- **Single workspace**: The entire app lives under `frontend/`; there is no monorepo, workspaces, or nested `package.json` per feature.
- **Versioning style**: Runtime dependencies use caret (`^`) ranges for minor/patch flexibility (e.g. `@react-navigation/bottom-tabs: ^7.18.18`), while Expo SDK packages use tilde (`~`) ranges to stay within the same major Expo release (e.g. `expo: ~57.0.18`, `expo-audio: ~57.0.4`, `expo-status-bar: ~57.0.1`). This keeps the core platform aligned while allowing small updates elsewhere.
- **Lockfile-first installs**: Because `package-lock.json` exists alongside `package.json`, deterministic installs are expected — CI or collaborators should run `npm ci` / `npm install` against this lockfile rather than regenerating it.
- **No private registry configuration**: There is no `.npmrc`, `pnpm-workspace.yaml`, `yarn.lock`, or custom registry scoped to the repo; packages are resolved from the default public npm registry.
- **No vendoring**: All third-party code is pulled into `node_modules` at install time; nothing is committed under a `vendor/` or `third_party/` directory.
- **Scripts**: Standard Expo CLI scripts (`start`, `android`, `ios`, `web`) are defined in `package.json` under `scripts`, tying the dependency graph to the build/dev workflow.

## Conventions and constraints

- Dependencies are added exclusively through npm and recorded in `package.json`; there is no ad-hoc script-based fetching of libraries.
- The `private: true` field prevents accidental publishing of the app package to the npm registry.
- TypeScript types are managed as separate devDependencies (`@types/react`, `typescript`) rather than bundled with runtime packages, keeping production bundles minimal.
- No repository-level tooling (e.g. Dependabot, Renovate, npm audit automation) was detected in the visible tree; updates appear to be performed manually by editing `package.json` and re-running the installer.