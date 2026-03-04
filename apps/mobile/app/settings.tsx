import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { UiSurface, UiText, uiBorder, uiColors, uiRadius, uiSpace } from '@/components/ui';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
      testID="settings-screen">
      <Pressable
        accessibilityHint="Opens your profile account screen"
        accessibilityLabel="Open Account Profile"
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [styles.cardPressable, pressed ? styles.cardPressed : null]}
        testID="settings-profile-row">
        <UiSurface style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.iconBadge}>
              <UiText selectable={false} style={styles.iconGlyph} variant="labelStrong">
                👤
              </UiText>
            </View>
            <View style={styles.profileCopy}>
              <UiText selectable variant="labelStrong">
                Profile
              </UiText>
              <UiText selectable variant="bodyMuted">
                Sign in, review your account email, and sign out.
              </UiText>
            </View>
          </View>
        </UiSurface>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: uiColors.surfacePage,
  },
  content: {
    padding: uiSpace.screen,
    gap: uiSpace.xxl,
  },
  cardPressable: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.94,
  },
  profileCard: {
    padding: uiSpace.xxl,
    gap: uiSpace.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: uiSpace.lg,
  },
  iconBadge: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: uiBorder.width,
    borderColor: uiColors.actionPrimarySubtleBorder,
    borderRadius: uiRadius.full,
    backgroundColor: uiColors.surfaceInfo,
  },
  iconGlyph: {
    fontSize: 20,
    lineHeight: 20,
  },
  profileCopy: {
    flex: 1,
    gap: uiSpace.sm,
  },
});
