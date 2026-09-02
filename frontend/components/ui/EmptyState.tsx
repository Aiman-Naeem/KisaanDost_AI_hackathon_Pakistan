import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontSize, fontWeight, lineHeight, getFontFamily } from '../../theme/typography';

export interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  /** Optional action button at the bottom. */
  actionLabel?: string;
  onAction?: () => void;
  /** Language code for font selection and text alignment. Defaults to 'ur'. */
  language?: 'ur' | 'en';
}

/**
 * Empty-state placeholder used for empty lists, no-results, idle screens.
 * Centred layout with icon, title, optional description and action.
 */
export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  language = 'ur',
}: EmptyStateProps) {
  const textAlign = language === 'ur' ? 'right' : 'center';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, { fontFamily: getFontFamily(language), textAlign }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.description, { fontFamily: getFontFamily(language), textAlign }]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.7}>
          <Text style={[styles.buttonText, { fontFamily: getFontFamily(language) }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.heading,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: lineHeight.normal,
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 10,
    elevation: 2,
  },
  buttonText: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    color: colors.textOnColor,
  },
});
