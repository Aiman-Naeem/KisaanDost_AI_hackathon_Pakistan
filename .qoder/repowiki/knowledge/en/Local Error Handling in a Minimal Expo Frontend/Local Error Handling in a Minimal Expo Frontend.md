---
kind: error_handling
name: Local Error Handling in a Minimal Expo Frontend
category: error_handling
scope:
    - '**'
source_files:
    - frontend/components/VoiceRecorder.tsx
    - frontend/services/index.ts
    - frontend/App.tsx
    - frontend/navigation/AppNavigator.tsx
---

This repository is a small Expo/React Native frontend prototype. It does not implement a centralized error-handling system (no custom error types, no global error boundary, no API client with typed errors, no middleware). Error handling is ad hoc and confined to the single feature that currently has runtime risk: the voice recorder component.

**What is used**
- `try` / `catch` blocks around async calls to `expo-audio` (`prepareToRecordAsync`, `stop`) in `components/VoiceRecorder.tsx`. Errors are logged via `console.warn` and do not propagate upward; the UI continues rendering.
- A permission-denied branch rendered conditionally when `AudioModule.requestRecordingPermissionsAsync()` returns `{ granted: false }`. This produces a user-facing screen with an icon, title, and message explaining how to re-enable microphone access.
- No `throw` statements, no custom `Error` subclasses, no sentinel values, no `panic`/`recover` equivalent, and no global unhandled-rejection or unhandled-error handlers in `App.tsx` or elsewhere.

**Key files**
- `frontend/components/VoiceRecorder.tsx` — only file with error-handling logic. Contains two `try/catch` blocks (start recording, stop recording) plus a permission-denied conditional render.
- `frontend/services/index.ts` — placeholder file (`export {};`) reserved for future API/AI integration; currently contains no error handling.
- `frontend/App.tsx` — root component wraps everything in `NavigationContainer`; no global error boundary or fallback UI.
- `frontend/navigation/AppNavigator.tsx` — tab navigation setup; no route-level error guards.

**Architecture and conventions**
- Errors are handled at the point of failure (component level), not propagated to a central handler. Each failing async operation logs a warning and swallows the exception so the app stays responsive.
- User-visible failures are represented as UI states rather than thrown exceptions: `permissionGranted === false` switches the entire component into a dedicated “Microphone Access Denied” view with styled text and emoji icon.
- There is no shared error type, error code enum, or error-response mapper because there are no network calls yet. The `services/` directory is explicitly marked as a placeholder for future API work.

**Conventions and constraints observed**
- Async side effects in components wrap their risky calls in `try/catch` and log with `console.warn` rather than surfacing errors to callers.
- Permission-related failures are treated as recoverable user-flow states (show a friendly message prompting device settings changes) instead of fatal errors.
- No global error boundaries, no `ErrorBoundary` from React Navigation or Expo, and no `unhandledrejection` listeners were found — unhandled promise rejections outside these `try/catch` blocks would crash the JS thread per default React Native behavior.