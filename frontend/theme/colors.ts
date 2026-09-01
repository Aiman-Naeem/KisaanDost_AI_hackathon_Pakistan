/**
 * KisaanDost Color Palette
 *
 * Centralised color tokens used across all screens and shared components.
 * Semantic naming makes it easy to maintain visual consistency and
 * swap shades without hunting through inline hex values.
 */
export const colors = {
  // ── Brand ────────────────────────────────────────────────────────────
  primary: '#2e7d32',       // Agri green — headers, primary actions
  primaryLight: '#e8f5e9',  // Light green — badges, backgrounds
  primaryDark: '#1b5e20',   // Dark green — text on light backgrounds

  // ── Accent (warm) ───────────────────────────────────────────────────
  accent: '#f57c00',        // Orange — thinking/sending state
  accentLight: '#fff3e0',   // Light orange background
  accentDark: '#e65100',    // Dark orange text

  // ── Semantic ────────────────────────────────────────────────────────
  success: '#2e7d32',
  successLight: '#e8f5e9',
  successDark: '#1b5e20',

  error: '#c62828',
  errorLight: '#ffebee',
  errorDark: '#b71c1c',
  errorBorder: '#ef9a9a',

  info: '#1565c0',
  infoLight: '#e3f2fd',
  infoDark: '#1976d2',
  infoBorder: '#90caf9',

  neutral: '#757575',
  neutralLight: '#f5f5f5',
  neutralBorder: '#e0e0e0',

  // ── Text ────────────────────────────────────────────────────────────
  textPrimary: '#333',
  textSecondary: '#666',
  textMuted: '#888',
  textOnColor: '#fff',

  // ── Surfaces ────────────────────────────────────────────────────────
  background: '#f5f5f5',
  surface: '#fff',
  border: '#ddd',
  divider: '#eee',
} as const;

export type ColorName = keyof typeof colors;
