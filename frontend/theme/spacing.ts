/**
 * KisaanDost Spacing Scale
 *
 * Consistent spacing tokens based on a 4px base unit.
 * Use these instead of raw numbers to maintain visual rhythm.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingName = keyof typeof spacing;

/**
 * Border radius scale — matches spacing for consistency.
 */
export const radius = {
  sm: 8,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export type RadiusName = keyof typeof radius;
