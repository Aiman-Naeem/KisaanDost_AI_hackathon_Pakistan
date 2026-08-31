---
kind: build_system
name: Expo-based React Native Build & Dev Workflow
category: build_system
scope:
    - '**'
source_files:
    - frontend/package.json
    - frontend/app.json
    - frontend/tsconfig.json
    - frontend/index.ts
    - frontend/.gitignore
---

## Build System Overview

This project is a **pure Expo/React Native** mobile application with no custom build scripts, Makefiles, Dockerfiles, or CI pipelines. The entire build and development workflow is delegated to the Expo CLI and its managed workflow.

## What System Is Used

- **Framework**: Expo SDK ~57.0.18 with React Native 0.86.3 (managed workflow).
- **Language**: TypeScript (strict mode enabled), compiled via `expo` which invokes the underlying Metro bundler and Expo toolchain.
- **Dependency management**: npm (`package.json` + `package-lock.json`).
- **App metadata & platform config**: `app.json` under the `expo` key — this is the single source of truth for app name, slug, version, icons, permissions, and per-platform settings.

## Key Files

- `frontend/package.json` — declares dependencies, devDependencies, and the four entry scripts: `start`, `android`, `ios`, `web`. All are thin wrappers around `expo start --<platform>`.
- `frontend/app.json` — Expo config: app name `KisaanDost`, slug `kisaandost`, version `1.0.0`, orientation, icons, Android adaptive icon assets, iOS tablet support, web favicon, and the `expo-audio` plugin with microphone permission string.
- `frontend/tsconfig.json` — extends `expo/tsconfig.base` and enables strict TypeScript compilation.
- `frontend/index.ts` — Expo entry point that bootstraps the app for both Expo Go and native builds.
- `frontend/.gitignore` — ignores `node_modules`, `web-build/`, `*.tsbuildinfo`, `.expo/`, etc., following standard Expo conventions.

## Architecture & Conventions

- **No custom build pipeline**: There are no `Makefile`, `build.sh`, `Dockerfile`, GitHub Actions, or release scripts in the repository. Development and building are done exclusively through `npm run <script>` which calls `expo start`.
- **Multi-target from one codebase**: The same source tree produces Android, iOS, and web outputs via the `--android`, `--ios`, and `--web` flags passed to `expo start`.
- **Versioning**: App version lives in two places — `package.json#version` (`1.0.0`) and `app.json#expo.version` (`1.0.0`). They must be kept in sync manually; there is no automated version bump script.
- **Plugin-driven configuration**: Platform-specific behavior (e.g., microphone access) is declared via the `plugins` array in `app.json` rather than edited native files, keeping the project in Expo's managed workflow.
- **TypeScript strictness**: Enforced via `"strict": true` extending Expo's base tsconfig.

## Conventions & Constraints

- **Development**: Run `npm start` (or `npx expo start`) to launch the Expo dev server; use `npm run android` / `npm run ios` / `npm run web` to target a specific platform.
- **Build artifacts**: Generated output goes to `web-build/` (for web) and Expo's internal build caches under `.expo/`; these are gitignored and not committed.
- **No pre/post-install hooks**: No `preinstall`, `postinstall`, or similar scripts exist in `package.json`.
- **No CI/release automation**: There is no GitHub Actions workflow, Fastlane configuration, EAS Build profile, or publish script in the repo. Distribution (EAS Build, Expo Publish, store submission) would need to be set up externally.
- **Platform capabilities**: Android uses adaptive icons defined in `assets/` (foreground/background/monochrome); iOS supports tablets; web uses the provided favicon. These are all configured declaratively in `app.json`.