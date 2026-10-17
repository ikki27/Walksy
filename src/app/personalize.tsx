import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '../components/Checkbox';
import { FormField } from '../components/FormField';
import { NeedsGrid } from '../components/NeedsGrid';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_COMPANION_NAME, MAX_COMPANION_NAME_LENGTH } from '../data/accessibilityNeeds';
import { usePersonalizeForm } from '../hooks/usePersonalizeForm';
import { ApiError } from '../services/apiClient';

export default function PersonalizeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, updateProfile } = useAuth();
  const form = usePersonalizeForm(user ?? undefined);
  const [submitting, setSubmitting] = useState(false);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // opened from the profile ("Customize Walksy") instead of during onboarding
  const editing = useLocalSearchParams<{ mode?: string }>().mode === 'edit';

  const goNext = () => {
    if (editing) router.back();
    // replace (not push): onboarding is finished, so "back" shouldn't return here
    else router.replace('/home');
  };

  const handleLetsGo = async () => {
    if (submitting || !form.validate()) return;

    setSubmitting(true);
    setErrorCode(null);
    try {
      await updateProfile(form.getValues());
      goNext();
    } catch (error) {
      setErrorCode(error instanceof ApiError ? error.code : 'unavailable');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{t('personalize.title')}</Text>
          <Text style={styles.subtitle}>{t('personalize.subtitle')}</Text>

          <FormField
            label={t('personalize.companionName')}
            placeholder={DEFAULT_COMPANION_NAME}
            value={form.companionName}
            onChangeText={form.setCompanionName}
            maxLength={MAX_COMPANION_NAME_LENGTH}
            autoCorrect={false}
            returnKeyType="done"
          />

          <Text style={styles.sectionTitle}>{t('personalize.needsTitle')}</Text>
          <Text style={styles.sectionHint}>{t('personalize.needsHint')}</Text>
          <NeedsGrid selected={form.needs} onToggle={form.toggle} />

          {/* accessibility needs are health data (GDPR): only stored with consent */}
          {form.needsConsent && (
            <View style={styles.consent}>
              <Checkbox
                checked={form.consent}
                onChange={form.setConsent}
                label={t('personalize.consent')}
                error={form.consentError ? t('personalize.consentRequired') : undefined}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {errorCode && (
            <Text style={styles.error} accessibilityRole="alert">
              {t(errorCode === 'network' ? 'auth.errors.network' : 'auth.errors.unknown')}
            </Text>
          )}
          <PrimaryButton label={t(editing ? 'personalize.save' : 'personalize.letsGo')} onPress={handleLetsGo} />
          <Pressable
            accessibilityRole="button"
            onPress={goNext}
            style={styles.skipButton}
            hitSlop={8}
          >
            <Text style={styles.skipText}>{t(editing ? 'personalize.cancel' : 'personalize.skip')}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { ...typography.subTitleFirst, color: colors.brand },
  subtitle: {
    ...typography.subTitleSecondary,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg + 4,
  },
  sectionTitle: { ...typography.label, color: colors.textPrimary, marginTop: spacing.md },
  sectionHint: {
    ...typography.subTitleSecondary,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  consent: { marginTop: spacing.lg },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  error: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
  skipButton: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  skipText: { ...typography.body, color: colors.textSecondary },
});
