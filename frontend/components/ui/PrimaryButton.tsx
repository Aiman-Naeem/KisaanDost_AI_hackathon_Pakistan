import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight } from '../../theme/typography';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  /** When true, button is disabled and shows a spinner instead of the label. */
  loading?: boolean;
  /** When true, button is disabled (no spinner). */
  disabled?: boolean;
  /** Visual variant — defaults to 'primary' (green). */
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'outline';
  /** Optional icon emoji rendered before the label. */
  icon?: string;
  /** Optional extra style for the outer container. */
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<string, { bg: string; text: string; disabledBg: string }> = {
  primary: { bg: colors.primary, text: colors.textOnColor, disabledBg: '#81c784' },
  secondary: { bg: colors.info, text: colors.textOnColor, disabledBg: '#64b5f6' },
  accent: { bg: colors.accent, text: colors.textOnColor, disabledBg: '#ffb74d' },
  danger: { bg: colors.surface, text: colors.error, disabledBg: colors.neutralLight },
  outline: { bg: colors.surface, text: colors.textPrimary, disabledBg: colors.neutralLight },
};

/**
 * Large, high-contrast action button with loading state.
 * Min 48dp touch target height (actual: 52dp).
 */
export default function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
}: PrimaryButtonProps) {
  const c = VARIANT_COLORS[variant];
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDisabled ? c.disabledBg : c.bg },
        variant === 'outline' && styles.outlineBorder,
        variant === 'danger' && styles.dangerBorder,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={c.text} />
      ) : (
        <Text style={[styles.label, { color: c.text }]}>
          {icon ? `${icon}  ${label}` : label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: colors.neutralBorder,
    elevation: 0,
  },
  dangerBorder: {
    borderWidth: 1,
    borderColor: colors.errorBorder,
  },
  label: {
    fontSize: fontSize.bodyLg,
    fontWeight: fontWeight.bold,
  },
});
