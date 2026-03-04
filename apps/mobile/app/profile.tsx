import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { UiButton, UiSurface, UiText, uiBorder, uiColors, uiRadius, uiSpace, uiTypography } from '@/components/ui';
import { useAuth } from '@/src/auth';

const EMPTY_FORM_ERROR = 'Enter your email and password to continue.';
const INVALID_EMAIL_ERROR = 'Enter a valid email address.';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileScreen() {
  const { clearAuthError, disabledReason, isConfigured, lastError, signInWithPassword, signOut, status, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const inlineError = signOutError ?? formError ?? lastError ?? null;
  const authDisabledMessage = !isConfigured ? disabledReason ?? 'Supabase mobile auth is not configured.' : null;
  const isAuthRestoring = status === 'restoring';
  const isBusy = isSubmitting || isSigningOut || isAuthRestoring;
  const userEmail = user?.email?.trim() || 'Email unavailable';

  useEffect(() => {
    if (!user) {
      return;
    }

    setPassword('');
    setFormError(null);
    setSignOutError(null);
  }, [user]);

  const resetInlineErrors = () => {
    setFormError(null);
    setSignOutError(null);
    clearAuthError();
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    resetInlineErrors();
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    resetInlineErrors();
  };

  const handleSignIn = async () => {
    if (isBusy) {
      return;
    }

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setFormError(EMPTY_FORM_ERROR);
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFormError(INVALID_EMAIL_ERROR);
      return;
    }

    resetInlineErrors();
    setIsSubmitting(true);

    try {
      await signInWithPassword({
        email: trimmedEmail,
        password,
      });
      setEmail(trimmedEmail);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    if (isBusy) {
      return;
    }

    resetInlineErrors();
    setIsSigningOut(true);

    try {
      await signOut();
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : 'Unable to sign out right now.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
      testID="profile-screen">
      {status === 'restoring' ? (
        <UiSurface style={styles.infoCard} testID="profile-restoring-state">
          <UiText selectable variant="label">
            Restoring account session...
          </UiText>
          <UiText selectable variant="bodyMuted">
            The profile route will switch to the correct signed-in state as soon as auth bootstrap completes.
          </UiText>
        </UiSurface>
      ) : null}

      {authDisabledMessage ? (
        <UiSurface style={styles.warningCard} testID="profile-auth-disabled-card" variant="panelMuted">
          <UiText selectable variant="label">
            Auth setup required
          </UiText>
          <UiText selectable style={styles.warningText} variant="body">
            {authDisabledMessage}
          </UiText>
        </UiSurface>
      ) : null}

      {!user ? (
        <UiSurface style={styles.card} testID="profile-signed-out-card">
          <View style={styles.sectionHeader}>
            <UiText selectable variant="labelStrong">
              Sign in
            </UiText>
            <UiText selectable variant="bodyMuted">
              Use your provisioned email and password to unlock account management without affecting local-only tracker flows.
            </UiText>
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                Email
              </UiText>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={handleEmailChange}
                placeholder="you@example.com"
                placeholderTextColor={uiColors.textDisabled}
                style={styles.input}
                testID="profile-email-input"
                textContentType="emailAddress"
                value={email}
              />
            </View>

            <View style={styles.fieldBlock}>
              <UiText selectable variant="subtitle">
                Password
              </UiText>
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handlePasswordChange}
                placeholder="Enter password"
                placeholderTextColor={uiColors.textDisabled}
                secureTextEntry
                style={styles.input}
                testID="profile-password-input"
                textContentType="password"
                value={password}
              />
            </View>
          </View>

          {inlineError ? (
            <UiSurface style={styles.errorCard} testID="profile-inline-error">
              <UiText selectable style={styles.errorText} variant="body">
                {inlineError}
              </UiText>
            </UiSurface>
          ) : null}

          <UiButton
            accessibilityLabel="Sign in to profile"
            disabled={!isConfigured || isBusy}
            label={isSubmitting ? 'Signing In...' : 'Sign In'}
            onPress={() => {
              void handleSignIn();
            }}
            testID="profile-sign-in-button"
          />
        </UiSurface>
      ) : (
        <View style={styles.signedInStack}>
          <UiSurface style={styles.card} testID="profile-signed-in-card">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Account summary
              </UiText>
              <UiText selectable variant="bodyMuted">
                The current account email comes from Supabase Auth. Profile edits land in the next M11 task.
              </UiText>
            </View>

            <View style={styles.readOnlyRow}>
              <UiText selectable variant="subtitle">
                Signed-in email
              </UiText>
              <UiText selectable style={styles.readOnlyValue} variant="label">
                {userEmail}
              </UiText>
            </View>
          </UiSurface>

          <UiSurface style={styles.card} testID="profile-management-placeholder" variant="panelMuted">
            <View style={styles.sectionHeader}>
              <UiText selectable variant="labelStrong">
                Profile management
              </UiText>
              <UiText selectable variant="bodyMuted">
                Username, email, and password editing are intentionally staged behind the next M11 profile task.
              </UiText>
            </View>

            <UiText selectable variant="bodyMuted">
              This screen already handles auth-aware routing, account summary display, and explicit sign-out.
            </UiText>
          </UiSurface>

          {inlineError ? (
            <UiSurface style={styles.errorCard} testID="profile-inline-error">
              <UiText selectable style={styles.errorText} variant="body">
                {inlineError}
              </UiText>
            </UiSurface>
          ) : null}

          <UiButton
            accessibilityLabel="Sign out of profile"
            disabled={isBusy}
            label={isSigningOut ? 'Signing Out...' : 'Sign Out'}
            onPress={() => {
              void handleSignOut();
            }}
            testID="profile-sign-out-button"
            variant="secondary"
          />
        </View>
      )}
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
  card: {
    padding: uiSpace.xxl,
    gap: uiSpace.xxl,
  },
  signedInStack: {
    gap: uiSpace.xxl,
  },
  infoCard: {
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
    backgroundColor: uiColors.surfaceInfo,
    borderColor: uiColors.actionPrimarySubtleBorder,
  },
  warningCard: {
    padding: uiSpace.xxl,
    gap: uiSpace.sm,
    borderColor: uiColors.borderWarning,
    backgroundColor: uiColors.surfaceWarning,
  },
  warningText: {
    color: uiColors.textWarning,
  },
  sectionHeader: {
    gap: uiSpace.sm,
  },
  fieldGroup: {
    gap: uiSpace.xl,
  },
  fieldBlock: {
    gap: uiSpace.sm,
  },
  input: {
    borderWidth: uiBorder.width,
    borderColor: uiColors.borderInputStrong,
    borderRadius: uiRadius.md,
    backgroundColor: uiColors.surfaceDefault,
    color: uiColors.textPrimary,
    minHeight: 48,
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.lg,
    fontSize: uiTypography.size.base,
  },
  errorCard: {
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.xl,
    borderColor: uiColors.actionDangerSubtleBorder,
    backgroundColor: uiColors.actionDangerSubtleBg,
  },
  errorText: {
    color: uiColors.actionDangerText,
  },
  readOnlyRow: {
    gap: uiSpace.sm,
    borderWidth: uiBorder.width,
    borderColor: uiColors.borderMuted,
    borderRadius: uiRadius.md,
    backgroundColor: uiColors.surfaceReadOnly,
    paddingHorizontal: uiSpace.xxl,
    paddingVertical: uiSpace.xl,
  },
  readOnlyValue: {
    color: uiColors.textAccentStrong,
  },
});
