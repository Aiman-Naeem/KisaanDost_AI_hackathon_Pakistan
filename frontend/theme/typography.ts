/**
 * KisaanDost Typography Scale
 *
 * Legibility-first sizing: minimum 16sp for body text, 20sp+ for headings.
 * Designed for low-literacy users who need clear, large text.
 */
export const fontSize = {
  /** Small helper text, badges — use sparingly */
  sm: 14,
  /** Body text — minimum readable size */
  body: 16,
  /** Emphasised body text */
  bodyLg: 17,
  /** Section labels, sub-headings */
  heading: 20,
  /** Screen titles */
  title: 24,
  /** Hero / large display */
  hero: 28,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const lineHeight = {
  /** Tight — single-line labels */
  tight: 20,
  /** Normal body text */
  normal: 24,
  /** Relaxed — multi-paragraph */
  relaxed: 28,
} as const;

// ── Font Families ──────────────────────────────────────────────────────────

/**
 * Return the appropriate font family name for the given language.
 *
 * - Urdu (`ur`) → **NotoNastaliqUrdu** — loaded at startup via `expo-font`.
 * - English / other → system default (`undefined` so React Native uses its
 *   built-in font).
 *
 * Usage:
 * ```tsx
 * <Text style={{ fontFamily: getFontFamily(language) }}>…</Text>
 * ```
 */
export function getFontFamily(language: 'ur' | 'en'): string | undefined {
  if (language === 'ur') {
    return 'NotoNastaliqUrdu';
  }
  return undefined; // fall back to system default
}
