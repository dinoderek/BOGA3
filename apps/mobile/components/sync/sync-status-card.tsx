import { Pressable, StyleSheet, View } from 'react-native';

import { UiText, uiBorder, uiColors, uiRadius, uiSpace, uiTypography } from '@/components/ui';
import type { SyncStatusPresentation } from '@/src/sync/status-presentation';

type SyncStatusCardProps = {
  presentation: SyncStatusPresentation;
  title?: string;
  onPress?: () => void;
  testID?: string;
};

const toneStyles = {
  success: {
    surface: uiColors.surfaceSuccess,
    border: uiColors.borderSuccess,
    badgeBackground: uiColors.surfaceDefault,
    badgeText: uiColors.textSuccess,
    badgeBorder: uiColors.borderSuccess,
  },
  neutral: {
    surface: uiColors.surfaceInfo,
    border: uiColors.actionPrimarySubtleBorder,
    badgeBackground: uiColors.surfaceDefault,
    badgeText: uiColors.textAccentStrong,
    badgeBorder: uiColors.actionPrimarySubtleBorder,
  },
  warning: {
    surface: uiColors.surfaceWarning,
    border: uiColors.borderWarning,
    badgeBackground: uiColors.surfaceDefault,
    badgeText: uiColors.textWarning,
    badgeBorder: uiColors.borderWarning,
  },
} as const;

export function SyncStatusCard({ presentation, title = 'Sync status', onPress, testID }: SyncStatusCardProps) {
  const tone = toneStyles[presentation.tone];
  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tone.surface,
          borderColor: tone.border,
        },
      ]}>
      <View style={styles.topRow}>
        <UiText style={styles.title} variant="labelStrong">
          {title}
        </UiText>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: tone.badgeBackground,
              borderColor: tone.badgeBorder,
            },
          ]}>
          <UiText
            style={[
              styles.badgeText,
              {
                color: tone.badgeText,
              },
            ]}
            variant="subtitle">
            {presentation.statusLabel}
          </UiText>
        </View>
      </View>

      <UiText style={styles.headline} variant="title">
        {presentation.headline}
      </UiText>
      <UiText selectable style={styles.detail} variant="bodyMuted">
        {presentation.detail}
      </UiText>

      {onPress ? (
        <UiText style={styles.linkHint} variant="subtitle">
          Open details
        </UiText>
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View testID={testID}>{content}</View>;
  }

  return (
    <Pressable accessibilityLabel="Open sync status" onPress={onPress} testID={testID}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: uiBorder.width,
    borderRadius: uiRadius.lg,
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: uiSpace.md,
  },
  title: {
    flex: 1,
  },
  badge: {
    borderWidth: uiBorder.width,
    borderRadius: uiRadius.full,
    paddingHorizontal: uiSpace.md,
    paddingVertical: uiSpace.xs,
  },
  badgeText: {
    fontSize: uiTypography.size.xs,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: uiTypography.size.xl,
  },
  detail: {
    color: uiColors.textAccentMuted,
  },
  linkHint: {
    marginTop: uiSpace.xs,
  },
});
