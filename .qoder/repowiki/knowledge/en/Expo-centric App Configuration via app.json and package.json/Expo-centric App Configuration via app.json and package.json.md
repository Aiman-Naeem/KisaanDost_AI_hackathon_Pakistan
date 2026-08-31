---
kind: configuration_system
name: Expo-centric App Configuration via app.json and package.json
category: configuration_system
scope:
    - '**'
source_files:
    - frontend/app.json
    - frontend/package.json
    - frontend/.expo/devices.json
    - frontend/index.ts
    - frontend/App.tsx
    - frontend/services/index.ts
---

## What system/approach is used

This Expo/React Native project uses a minimal, declarative configuration approach centered on two files:

- **`app.json`** — the canonical Expo app manifest that declares build-time and runtime metadata (app name, slug, version, orientation, platform-specific settings for iOS/Android/Web, and plugin configuration such as `expo-audio` microphone permission).
- **`package.json`** — defines the project entry point (`index.ts`), scripts (`start`, `android`, `ios`, `web`), and dependency versions pinned by Expo ecosystem conventions.

There is no custom configuration loader, no `.env` file, no runtime config module, and no feature-flag system. The app does not read environment variables at runtime (no `process.env`, `expo-constants`, or `Constants.manifest` usage was found in the codebase).

## Key files and packages

- `frontend/app.json` — Expo manifest; holds all user-facing app identity and platform capabilities.
- `frontend/package.json` — npm/Expo project manifest with scripts and dependencies.
- `frontend/.expo/devices.json` — Expo dev-session device registry (auto-generated, empty in this repo).
- `frontend/index.ts` — declared as the `main` entry point per `package.json`.
- `frontend/App.tsx` — top-level React component; contains no configuration logic beyond rendering navigation and status bar.

## Architecture and conventions

- **Declarative over imperative**: All app identity and platform behavior is expressed as static JSON in `app.json`; there is no programmatic config object loaded at startup.
- **Platform branching lives in the manifest**: iOS-only options (e.g., `supportsTablet`) and Android-only options (e.g., `adaptiveIcon`, `predictiveBackGestureEnabled`) are colocated under their respective keys rather than split across files.
- **Plugin configuration is inline**: Capabilities like microphone access are configured via the `plugins` array in `app.json` (here, `expo-audio` with a localized permission string) instead of native `Info.plist` / `AndroidManifest.xml` edits.
- **No runtime secrets or API endpoints**: The `services/index.ts` placeholder explicitly defers API/AI integration to a future implementation; currently there is no base URL, token, or environment switcher.
- **Dev vs production distinction is script-driven only**: Different targets (`--android`, `--ios`, `--web`) are selected through npm scripts in `package.json`; no runtime `__DEV__` checks or separate config files exist.

## Conventions and constraints

Observed conventions (descriptive):
- App metadata (name, slug, version) is defined once in `app.json` and referenced by assets via relative paths (e.g., `./assets/icon.png`).
- Platform-specific icons are grouped under `android.adaptiveIcon` with foreground/background/monochrome images.
- Web-specific assets (favicon) are declared under the `web` key.
- Permissions are declared alongside the plugin that consumes them (microphone permission string lives inside the `expo-audio` plugin block).

Constraints enforced by the tooling (not by custom code):
- `app.json` must conform to the Expo manifest schema; invalid entries will cause `expo start` / `expo prebuild` to fail.
- The `main` field in `package.json` (`index.ts`) is the required entry point consumed by Expo's bundler.
- Plugin names and options in `app.json.plugins` are validated against installed Expo packages at build time.

Notably absent: there is no `.env`, no `config/` directory, no runtime configuration module, and no mechanism to override settings per environment at runtime.