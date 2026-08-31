---
kind: external_dependency
name: Expo SDK 57 (managed workflow) with expo-audio replacing deprecated expo-av
slug: expo
category: external_dependency
category_hints:
    - migration_status
    - client_constraint
scope:
    - '**'
---


Key integration points:
- `frontend/package.json` declares `expo`, `expo-audio`, `expo-status-bar`, and React Navigation v7 packages.
- `frontend/app.json` holds the `expo-audio` plugin config (microphone permission message).

Verify exact API/params against the official docs at https://docs.expo.dev/versions/latest/sdk/audio/.