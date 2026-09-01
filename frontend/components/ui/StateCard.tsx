import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';
import { fontSize, fontWeight, lineHeight } from '../../theme/typography';

export type StateCardVariant = 'success' | 'error' | 'info' | 'neutral';

export interface StateCardProps {
  variant: StateCardVariant;
  icon: string;
  title: string;
  description?: string;
  /** Optional action button rendered below the description. */
  actionLabel?: string;
  onAction?: () => void;
}

const VARIANT_STYLES: Record<
  StateCardVariant,
  { bg: string; border: string; titleColor: string; textColor: string }
> = {
  success: {
    bg: colors.successLight,
    border: colors.successLight,
    titleColor: colors.successDark,
    textColor: colors.successDark,
  },
  error: {
    bg: colors.errorLight,
    border: colors.errorBorder,
    titleColor: colors.error,
    textColor: colors.errorDark,
  },
  info: {
    bg: colors.infoLight,
    border: colors.infoBorder,
    titleColor: colors.info,
    textColor: colors.infoDark,
  },
  neutral: {
    bg: colors.surface,
    border: colors.neutralBorder,
    titleColor: colors.textPrimary,
    textColor: colors.textSecondary,
  },
};

/**
 * Shared state card for error, info, empty, and not-found states.
 * Replaces all inline bespoke error/empty/info cards across screens.
 */
export default function StateCard({
  variant,
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: StateCardProps) {
  const v = VARIANT_STYLES[variant];

  return (
    <View style={[styles.card, { backgroundColor: v.bg, borderColor: v.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { color: v.titleColor }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: v.textColor }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.body,
    textAlign: 'center',
    lineHeight: lineHeight.normal,
    marginBottom: spacing.base,
  },
  actionButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutralBorder,
    minWidth: 180,
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
});
