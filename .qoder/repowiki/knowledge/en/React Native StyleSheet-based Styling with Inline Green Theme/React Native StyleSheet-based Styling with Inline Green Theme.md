---
kind: frontend_style
name: React Native StyleSheet-based Styling with Inline Green Theme
category: frontend_style
scope:
    - '**'
source_files:
    - frontend/package.json
    - frontend/App.tsx
    - frontend/navigation/AppNavigator.tsx
    - frontend/screens/ListingsScreen.tsx
    - frontend/components/VoiceRecorder.tsx
---

## What system/approach is used

The app uses **React Native's built-in `StyleSheet` API** for all styling. There are no external CSS frameworks, CSS-in-JS libraries (e.g. styled-components, Emotion), preprocessors (SCSS/SASS), or design-token systems in use. Styling is co-located with each component/screen as a `StyleSheet.create({...})` block at the bottom of the file.

The only theming mechanism is a set of **hardcoded color literals** — primarily a green palette (`#2e7d32`, `#c62828`) used consistently for primary actions, headers, and tab active states, plus neutral grays (`#555`, `#888`, `#999`, `#f5f5f5`) and accent blue (`#1565c0`, `#0d47a1`).

## Key files and packages

- `frontend/package.json` — confirms no styling dependencies beyond React Native core; no Tailwind, no UI kit, no theme package.
- `frontend/App.tsx` — root entry; sets `StatusBar style="auto"` and wraps navigation.
- `frontend/navigation/AppNavigator.tsx` — centralizes tab-bar and header colors: `tabBarActiveTintColor: '#2e7d32'`, `headerStyle: { backgroundColor: '#2e7d32' }`, `headerTintColor: '#fff'`.
- `frontend/screens/ListingsScreen.tsx` — example screen using inline `StyleSheet.create` with green title/button colors.
- `frontend/components/VoiceRecorder.tsx` — largest styled component; defines its own `wrapper`, `recordButton`, `playButton`, `recordingIndicator`, and error-state styles.

## Architecture and conventions

- **Per-file `StyleSheet.create` blocks**: Each component/screen exports a local `styles` object created via `StyleSheet.create(...)`. Styles are not shared across components.
- **No design tokens / constants file**: Colors, font sizes, spacing values are repeated as raw literals across files (e.g. `#2e7d32` appears in both `AppNavigator.tsx` and `ListingsScreen.tsx`; `#555` appears in multiple screens).
- **Inline style objects for conditional styling**: Conditional visual states use array-style style composition, e.g. `style={[styles.recordButton, recorderState.isRecording && styles.recordButtonActive]}` in `VoiceRecorder.tsx`.
- **Navigation-level theming**: Global appearance (tab bar tint, header background) is configured once in `AppNavigator.tsx` via `screenOptions` on the `Tab.Navigator`.
- **Emoji-based icons**: Tab icons and status indicators use emoji characters (`🎙️`, `🛒`, `🔇`, `▶️`, `⏹`) rather than icon libraries.
- **Responsive strategy**: No media queries or platform-specific style branches are used; layout relies on Flexbox (`flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`) to fill available space.

## Conventions and constraints

Observed patterns (descriptive):
- Primary brand color is `#2e7d32` (green), applied to headers, active tabs, primary buttons, and titles.
- Text color defaults to `#555` for body copy and `#fff` for text on colored backgrounds.
- Buttons use `borderRadius: 10–12`, horizontal padding ~28–32px, vertical padding ~14–16px, and `elevation: 3` for Android shadow.
- Active/pressed states are expressed by swapping to darker variants (e.g. `#c62828` for recording-active button, `#0d47a1` for playing state).
- Font weights follow Material-like scale: `600` for labels/buttons, `700` for titles/headings.

Enforced rules:
- None are enforced by tooling: there is no lint rule, style guide, or CI check visible in this repository that mandates a particular styling approach. The absence of any styling-related devDependencies means the only constraint is what React Native itself provides.

Limitations observed:
- No centralized theme or token registry, so adding new colors requires manual updates across every file that references the old value.
- No responsive breakpoints; layout adapts only through Flexbox.
- No accessibility-focused style attributes (e.g. `accessibilityLabel` on styled elements) are present in the examined files.